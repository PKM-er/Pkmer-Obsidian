import { Notice, Platform, requestUrl } from "obsidian"

import type PkmerPlugin from "@/main"
import { PKMER_SECRET_KEYS, type PKMerUserInfo } from "@/auth/types"

const VERIFY_ENDPOINT = "https://api.pkmer.cn/api/v1/download/obsidian/getPluginDownloadCount"
const USER_INFO_ENDPOINT = "https://api.pkmer.cn/api/v1/auth/me"
const LOGIN_URL = "https://pkmer.cn/products/signIn/"
const AUTH_CACHE_MS = 5 * 60 * 1000
const TOKEN_EXPIRY_BUFFER = 30 * 1000

type SecretStorageLike = {
    getSecret?: (key: string) => string | Promise<string | null> | null;
    setSecret?: (key: string, value: string) => void | Promise<void>;
}

type ElectronRemoteLike = {
    getCurrentWindow: () => unknown;
    BrowserWindow: new (options: Record<string, unknown>) => {
        once: (event: string, callback: () => void) => void;
        on: (event: string, callback: () => void) => void;
        loadURL: (url: string) => Promise<void>;
        setTitle: (title: string) => void;
        setMenu: (menu: null) => void;
        show: () => void;
        close: () => void;
        isDestroyed?: () => boolean;
        webContents: {
            on: (event: string, callback: () => void) => void;
            executeJavaScript: (code: string) => Promise<string | null>;
        };
    };
}

export default class PKMerAuthService {
    private plugin: PkmerPlugin
    private memAccessToken: string | null = null
    private lastVerifiedAt = 0

    constructor(plugin: PkmerPlugin) {
        this.plugin = plugin
    }

    private get secrets(): SecretStorageLike | undefined {
        return (this.plugin.app as unknown as { secretStorage?: SecretStorageLike }).secretStorage
    }

    private get supportsSecretStorage(): boolean {
        return !!this.secrets
            && typeof this.secrets.getSecret === "function"
            && typeof this.secrets.setSecret === "function"
    }

    get accessToken(): string {
        return this.memAccessToken ?? ""
    }

    get hasToken(): boolean {
        return !!this.memAccessToken
    }

    async initialize(): Promise<void> {
        await this.loadStoredTokens()
        await this.migrateLegacyToken()

        if (!this.memAccessToken) {
            return
        }

        const verified = await this.verify(true)
        if (!verified) {
            await this.clearAuthorization(false)
            return
        }

        if (!this.plugin.settings.auth.userInfo) {
            await this.fetchUserInfo()
        }
    }

    async getAccessToken(): Promise<string> {
        const verified = await this.verify()
        return verified ? this.accessToken : ""
    }

    async setLegacyToken(token: string): Promise<void> {
        const normalizedToken = token.trim()

        if (!normalizedToken) {
            await this.clearAuthorization(false)
            return
        }

        this.memAccessToken = normalizedToken
        this.lastVerifiedAt = 0

        if (this.supportsSecretStorage) {
            await this.writeSecret(PKMER_SECRET_KEYS.accessToken, normalizedToken)
            await this.writeSecret(PKMER_SECRET_KEYS.refreshToken, "")
            this.plugin.settings.token = ""
        } else {
            this.plugin.settings.token = normalizedToken
        }

        this.plugin.settings.refreshToken = ""
        this.plugin.settings.auth = {
            ...this.plugin.settings.auth,
            tokenExpiresAt: this.getJwtExpiry(normalizedToken) ?? 0,
        }
        await this.plugin.saveSettings()
    }

    async verify(force = false): Promise<boolean> {
        if (!this.memAccessToken) {
            return false
        }

        const expiresAt = this.getJwtExpiry(this.memAccessToken) ?? this.plugin.settings.auth.tokenExpiresAt ?? 0
        if (expiresAt && expiresAt <= Date.now() + TOKEN_EXPIRY_BUFFER) {
            return false
        }

        if (!force && this.lastVerifiedAt && Date.now() - this.lastVerifiedAt < AUTH_CACHE_MS) {
            return true
        }

        const verified = await this.probeAccessToken()
        if (!verified) {
            return false
        }

        this.lastVerifiedAt = Date.now()

        const nextExpiresAt = this.getJwtExpiry(this.memAccessToken) ?? this.plugin.settings.auth.tokenExpiresAt ?? 0
        if (nextExpiresAt !== this.plugin.settings.auth.tokenExpiresAt) {
            this.plugin.settings.auth = {
                ...this.plugin.settings.auth,
                tokenExpiresAt: nextExpiresAt,
            }
            await this.plugin.saveSettings()
        }

        return true
    }

    async login(): Promise<boolean> {
        if (!Platform.isDesktopApp) {
            new Notice("移动端暂不支持内嵌网页登录，请使用手动 Token 方式。", 6000)
            return false
        }

        const token = await this.openLoginWindowAndCaptureToken()
        if (!token) {
            new Notice("未获取到 PKMer Token，请确认已经在弹出的窗口中完成登录。", 6000)
            return false
        }

        await this.setLegacyToken(token)

        const verified = await this.verify(true)
        if (!verified) {
            await this.clearAuthorization(false)
            new Notice("已获取 Token，但当前市场接口不接受该令牌，请重试登录。", 6000)
            return false
        }

        await this.fetchUserInfo()
        dispatchEvent(new Event("reload-statusbar"))
        new Notice("PKMer 登录成功。", 4000)
        return true
    }

    async logout(): Promise<void> {
        await this.clearAuthorization(true)
        new Notice("已退出 PKMer 登录。", 4000)
    }

    onunload(): void {
        return
    }

    private async loadStoredTokens(): Promise<void> {
        if (this.supportsSecretStorage) {
            this.memAccessToken = await this.readSecret(PKMER_SECRET_KEYS.accessToken)
            return
        }

        this.memAccessToken = this.plugin.settings.token.trim() || null
    }

    private async migrateLegacyToken(): Promise<void> {
        if (this.memAccessToken) {
            return
        }

        const legacyToken = this.plugin.settings.token.trim()
        if (!legacyToken) {
            return
        }

        this.memAccessToken = legacyToken

        if (this.supportsSecretStorage) {
            await this.writeSecret(PKMER_SECRET_KEYS.accessToken, legacyToken)
            this.plugin.settings.token = ""
        }

        this.plugin.settings.auth = {
            ...this.plugin.settings.auth,
            tokenExpiresAt: this.getJwtExpiry(legacyToken) ?? this.plugin.settings.auth.tokenExpiresAt,
        }
        await this.plugin.saveSettings()
    }

    private async probeAccessToken(): Promise<boolean> {
        try {
            await requestUrl({
                url: VERIFY_ENDPOINT,
                method: "GET",
                headers: {
                    Authorization: `Bearer ${this.memAccessToken}`,
                },
            })

            return true
        } catch (error) {
            console.warn("PKMer market token probe failed:", error)
            return false
        }
    }

    private async fetchUserInfo(): Promise<PKMerUserInfo | null> {
        if (!this.memAccessToken) {
            return null
        }

        try {
            const response = await requestUrl({
                url: USER_INFO_ENDPOINT,
                method: "GET",
                headers: {
                    Authorization: `Bearer ${this.memAccessToken}`,
                },
            })

            const data = response.json
            const userInfo: PKMerUserInfo = {
                sub: String(data.id || data.sub || ""),
                name: data.nickName || data.name || data.username || undefined,
                email: data.email || undefined,
                avatar: data.avatar || data.picture || undefined,
            }

            this.plugin.settings.auth = {
                ...this.plugin.settings.auth,
                userInfo,
            }
            await this.plugin.saveSettings()

            return userInfo
        } catch (error) {
            console.warn("Failed to fetch PKMer user info:", error)
            return null
        }
    }

    private async clearAuthorization(showStatusBarRefresh: boolean): Promise<void> {
        this.memAccessToken = null
        this.lastVerifiedAt = 0

        if (this.supportsSecretStorage) {
            await this.writeSecret(PKMER_SECRET_KEYS.accessToken, "")
            await this.writeSecret(PKMER_SECRET_KEYS.refreshToken, "")
        }

        this.plugin.settings.token = ""
        this.plugin.settings.refreshToken = ""
        this.plugin.settings.auth = {
            tokenExpiresAt: 0,
            userInfo: null,
        }
        await this.plugin.saveSettings()

        if (showStatusBarRefresh) {
            dispatchEvent(new Event("reload-statusbar"))
        }
    }

    private async openLoginWindowAndCaptureToken(): Promise<string | null> {
        try {
            const requireFn = (window as Window & {
                require?: (moduleName: string) => { remote?: ElectronRemoteLike };
            }).require

            if (!requireFn) {
                new Notice("当前环境不支持内嵌登录窗口，请使用手动 Token 方式。", 6000)
                return null
            }

            const electronModule = requireFn("electron")
            const remote = electronModule.remote

            if (!remote) {
                new Notice("当前环境不支持内嵌登录窗口，请使用手动 Token 方式。", 6000)
                return null
            }

            return await new Promise<string | null>((resolve) => {
                const modal = new remote.BrowserWindow({
                    parent: remote.getCurrentWindow(),
                    width: 630,
                    height: 840,
                    show: false,
                })

                let settled = false
                let pollHandle: number | null = null

                const finalize = (token: string | null) => {
                    if (settled) {
                        return
                    }

                    settled = true
                    if (pollHandle !== null) {
                        window.clearInterval(pollHandle)
                    }

                    try {
                        if (!modal.isDestroyed?.()) {
                            modal.close()
                        }
                    } catch {
                        // ignore
                    }

                    resolve(token?.trim() || null)
                }

                const checkToken = async () => {
                    try {
                        const token = await modal.webContents.executeJavaScript("localStorage.getItem('pkmer-token')")
                        if (typeof token === "string" && token.trim()) {
                            finalize(token)
                        }
                    } catch {
                        // ignore cross-page timing issues
                    }
                }

                modal.once("ready-to-show", () => {
                    modal.setTitle("登录 PKMer")
                    modal.setMenu(null)
                    modal.show()
                })

                modal.webContents.on("did-navigate", () => {
                    void checkToken()
                })

                modal.webContents.on("did-frame-finish-load", () => {
                    void checkToken()
                })

                modal.on("closed", () => {
                    finalize(null)
                })

                pollHandle = window.setInterval(() => {
                    void checkToken()
                }, 1200)

                window.setTimeout(() => {
                    finalize(null)
                }, 5 * 60 * 1000)

                void modal.loadURL(LOGIN_URL).catch((error: unknown) => {
                    console.error("Failed to open PKMer login window:", error)
                    finalize(null)
                })
            })
        } catch (error) {
            console.error("Failed to open PKMer login window:", error)
            return null
        }
    }

    private getJwtExpiry(token: string): number | null {
        try {
            const parts = token.split(".")
            if (parts.length < 2) {
                return null
            }

            const payload = parts[1]
                .replace(/-/g, "+")
                .replace(/_/g, "/")
                .padEnd(Math.ceil(parts[1].length / 4) * 4, "=")
            const decoded = atob(payload)
            const parsed = JSON.parse(decoded) as { exp?: number }

            return parsed.exp ? parsed.exp * 1000 : null
        } catch {
            return null
        }
    }

    private async readSecret(key: string): Promise<string | null> {
        if (!this.supportsSecretStorage || !this.secrets?.getSecret) {
            return null
        }

        const value = await Promise.resolve(this.secrets.getSecret(key))
        if (!value) {
            return null
        }

        return value.trim() || null
    }

    private async writeSecret(key: string, value: string): Promise<void> {
        if (!this.supportsSecretStorage || !this.secrets?.setSecret) {
            return
        }

        await Promise.resolve(this.secrets.setSecret(key, value))
    }
}
