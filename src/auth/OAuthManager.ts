import { Notice, Platform } from 'obsidian';
import type { IncomingMessage, ServerResponse } from 'http';
import type PkmerPlugin from '@/main';
import {
  PKMER_OAUTH_CONFIG,
  type PKMerPendingOAuthSession,
} from './types';

type HttpModule = typeof import('http');

const PENDING_OAUTH_TTL_MS = 10 * 60 * 1000;

function getWebCrypto(): Crypto {
  if (!globalThis.crypto) {
    throw new Error('当前环境不支持 Web Crypto，无法完成 OAuth 登录');
  }

  return globalThis.crypto;
}

function getRandomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  getWebCrypto().getRandomValues(bytes);
  return bytes;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function sha256ToBase64Url(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await getWebCrypto().subtle.digest('SHA-256', data);
  return bytesToBase64Url(new Uint8Array(digest));
}

export interface OAuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
}

export interface OAuthUserInfo {
  sub: string;
  name?: string;
  email?: string;
  picture?: string;
  supporter?: boolean;
  thino?: boolean;
  thinoWebExpir?: string | null;
  thino_devices?: number;
  pkmer_token?: string;
}

export class OAuthManager {
  private pendingState: string | null = null;
  private pendingVerifier: string | null = null;
  private callbackServer: any = null;

  constructor(private plugin: PkmerPlugin) {}

  private generateCodeVerifier(): string {
    return bytesToBase64Url(getRandomBytes(32));
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    return sha256ToBase64Url(verifier);
  }

  private generateState(): string {
    return bytesToHex(getRandomBytes(16));
  }

  private getHttpModule(): HttpModule {
    const requireFn = (window as any).require ?? (globalThis as any).require;

    if (typeof requireFn !== 'function') {
      throw new Error('桌面端缺少 Node 运行时，无法启动 OAuth 回调服务');
    }

    return requireFn('http') as HttpModule;
  }

  private getDefaultRedirectUri(): string {
    return Platform.isDesktopApp
      ? PKMER_OAUTH_CONFIG.desktopRedirectUri
      : PKMER_OAUTH_CONFIG.mobileRedirectUri;
  }

  private getStoredPendingSession(): PKMerPendingOAuthSession | null {
    const session = this.plugin.settings.auth.pendingOAuthSession;
    if (!session?.state || !session.verifier || !session.redirectUri || !session.createdAt) {
      return null;
    }

    if (Date.now() - session.createdAt > PENDING_OAUTH_TTL_MS) {
      return null;
    }

    return session;
  }

  private async savePendingSession(session: PKMerPendingOAuthSession | null): Promise<void> {
    this.plugin.settings.auth = {
      ...this.plugin.settings.auth,
      pendingOAuthSession: session,
    };

    await this.plugin.saveSettings();
  }

  private async persistPendingSession(
    state: string,
    verifier: string,
    redirectUri: string,
  ): Promise<void> {
    this.pendingState = state;
    this.pendingVerifier = verifier;

    await this.savePendingSession({
      state,
      verifier,
      redirectUri,
      createdAt: Date.now(),
    });
  }

  private async clearPendingSession(): Promise<void> {
    this.pendingState = null;
    this.pendingVerifier = null;

    if (!this.plugin.settings.auth.pendingOAuthSession) {
      return;
    }

    await this.savePendingSession(null);
  }

  private async ensurePendingSession(): Promise<PKMerPendingOAuthSession> {
    if (this.pendingState && this.pendingVerifier) {
      return {
        state: this.pendingState,
        verifier: this.pendingVerifier,
        redirectUri: this.plugin.settings.auth.pendingOAuthSession?.redirectUri ?? this.getDefaultRedirectUri(),
        createdAt: this.plugin.settings.auth.pendingOAuthSession?.createdAt ?? Date.now(),
      };
    }

    const session = this.getStoredPendingSession();
    if (!session) {
      await this.clearPendingSession();
      throw new Error('登录会话已失效，请重新发起授权');
    }

    this.pendingState = session.state;
    this.pendingVerifier = session.verifier;
    return session;
  }

  private async startCallbackServer(): Promise<void> {
    const { createServer } = this.getHttpModule();

    return new Promise((resolve, reject) => {
      this.callbackServer = createServer((req: IncomingMessage, res: ServerResponse) => {
        const url = new URL(req.url ?? '', `http://localhost:${PKMER_OAUTH_CONFIG.callbackPort}`);

        if (url.pathname === PKMER_OAUTH_CONFIG.callbackPath) {
          void this.handleCallback(url.searchParams, res);
        } else {
          res.writeHead(404);
          res.end('Not Found');
        }
      });

      this.callbackServer.listen(PKMER_OAUTH_CONFIG.callbackPort, 'localhost', () => {
        console.log(`OAuth callback server started on port ${PKMER_OAUTH_CONFIG.callbackPort}`);
        resolve();
      });

      this.callbackServer.on('error', (err: Error) => {
        console.error('Failed to start callback server:', err);
        reject(err);
      });
    });
  }

  private stopCallbackServer(): void {
    if (this.callbackServer) {
      this.callbackServer.close();
      this.callbackServer = null;
    }
  }

  async startLogin(): Promise<boolean> {
    try {
      if (Platform.isDesktopApp) {
        await this.startCallbackServer();
      }

      const verifier = this.generateCodeVerifier();
      const challenge = await this.generateCodeChallenge(verifier);
      const state = this.generateState();
      const redirectUri = this.getDefaultRedirectUri();

      await this.persistPendingSession(state, verifier, redirectUri);

      const params = new URLSearchParams({
        client_id: PKMER_OAUTH_CONFIG.clientId,
        response_type: 'code',
        redirect_uri: redirectUri,
        scope: PKMER_OAUTH_CONFIG.scopes,
        state,
        code_challenge: challenge,
        code_challenge_method: 'S256',
      });

      const authUrl = `${PKMER_OAUTH_CONFIG.authorizationUrl}?${params.toString()}`;

      if (Platform.isDesktopApp) {
        try {
          const { shell } = (window as any).require('electron');
          await shell.openExternal(authUrl);
        } catch {
          window.open(authUrl);
        }
      } else {
        window.open(authUrl);
      }

      const loginMessage = Platform.isMobileApp
        ? '已打开浏览器，请完成登录授权。若未自动返回 Obsidian，请改用系统浏览器重试。'
        : '已打开浏览器，请在网页中完成登录授权';
      new Notice(loginMessage, 8000);
      return true;
    } catch (error) {
      console.error('Failed to start OAuth login:', error);
      new Notice(`启动登录失败: ${(error as Error).message || error}`);
      this.stopCallbackServer();
      await this.clearPendingSession();
      return false;
    }
  }

  private async handleCallback(params: URLSearchParams, res?: ServerResponse): Promise<void> {
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');

    if (res) {
      if (error || !code || !state) {
        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <html>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 50px;">
              <h2>❌ 授权失败</h2>
              <p>${error ? `错误: ${params.get('error_description') || error}` : '回调参数缺失'}</p>
              <p>请关闭此窗口并重试</p>
            </body>
          </html>
        `);
        return;
      }

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <html>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 50px;">
            <h2>✅ 授权成功</h2>
            <p>正在处理登录信息...</p>
            <p>请关闭此窗口返回 Obsidian</p>
            <script>setTimeout(() => window.close(), 2000);</script>
          </body>
        </html>
      `);
    }

    try {
      await this.processAuthorizationCode(code!, state!);
    } catch (err) {
      console.error('OAuth callback processing failed:', err);
      new Notice(`登录处理失败: ${(err as Error).message || err}`);
    } finally {
      this.stopCallbackServer();
    }
  }

  async handleObsidianCallback(params: URLSearchParams): Promise<boolean> {
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');

    if (error) {
      new Notice(`授权失败: ${params.get('error_description') || error}`);
      return false;
    }

    if (!code || !state) {
      new Notice('回调参数缺失');
      return false;
    }

    try {
      await this.processAuthorizationCode(code, state);
      return true;
    } catch (err) {
      console.error('OAuth callback processing failed:', err);
      new Notice(`登录处理失败: ${(err as Error).message || err}`);
      return false;
    }
  }

  private async processAuthorizationCode(code: string, state: string): Promise<void> {
    const session = await this.ensurePendingSession();

    if (state !== session.state) {
      throw new Error('安全验证失败，请重新登录');
    }

    const tokens = await this.exchangeCodeForToken(code, session);
    const userInfo = await this.fetchUserInfo(tokens.access_token);

    await this.saveAuthData(tokens, userInfo);
    await this.clearPendingSession();

    new Notice(`登录成功！欢迎 ${userInfo.name || userInfo.email || 'PKMer 用户'}`);
    dispatchEvent(new Event('reload-statusbar'));
  }

  private async exchangeCodeForToken(
    code: string,
    session: PKMerPendingOAuthSession,
  ): Promise<OAuthTokens> {
    const response = await fetch(PKMER_OAUTH_CONFIG.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: session.redirectUri,
        client_id: PKMER_OAUTH_CONFIG.clientId,
        code_verifier: session.verifier,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({} as Record<string, string>));
      throw new Error(errorData.error_description || errorData.error || '换取 Token 失败');
    }

    return response.json() as Promise<OAuthTokens>;
  }

  private async fetchUserInfo(accessToken: string): Promise<OAuthUserInfo> {
    const response = await fetch(PKMER_OAUTH_CONFIG.userinfoUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error('获取用户信息失败');
    }

    return response.json() as Promise<OAuthUserInfo>;
  }

  private async saveAuthData(tokens: OAuthTokens, userInfo: OAuthUserInfo): Promise<void> {
    const pkmerToken = userInfo.pkmer_token || tokens.access_token;

    await this.plugin.authService.setLegacyToken(pkmerToken);

    this.plugin.settings.auth = {
      ...this.plugin.settings.auth,
      userInfo: {
        sub: userInfo.sub,
        name: userInfo.name,
        email: userInfo.email,
        avatar: userInfo.picture,
      },
    };

    await this.plugin.saveSettings();
  }

  async refreshToken(): Promise<boolean> {
    return false;
  }

  async logout(): Promise<void> {
    await this.plugin.authService.logout();
    await this.clearPendingSession();
    this.stopCallbackServer();
  }
}
