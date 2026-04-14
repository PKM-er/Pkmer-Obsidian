export interface PKMerUserInfo {
    sub: string;
    name?: string;
    email?: string;
    avatar?: string;
}

export interface PKMerAuthSettings {
    tokenExpiresAt: number;
    userInfo: PKMerUserInfo | null;
}

export const DEFAULT_PKMER_AUTH_SETTINGS: PKMerAuthSettings = {
    tokenExpiresAt: 0,
    userInfo: null,
};

export const PKMER_SECRET_KEYS = {
    accessToken: "pkmer-access-token",
    refreshToken: "pkmer-refresh-token",
} as const;

export const PKMER_OAUTH_CONFIG = {
    authorizationUrl: "https://api.pkmer.cn/api/v1/oauth/authorize",
    tokenUrl: "https://api.pkmer.cn/api/v1/oauth/token",
    userinfoUrl: "https://api.pkmer.cn/api/v1/oauth/userinfo",
    clientId: "pkmer_3edf34684baca778e8d3ffd900a684e8",
    scopes: "openid profile email",
    desktopRedirectUri: "http://localhost:10892/pkmer-obsidian/callback",
    callbackPort: 10892,
    callbackPath: "/pkmer-obsidian/callback",
} as const;
