const BASE_API_URL = 'https://api.pkmer.cn/api/v1/plugins';

export interface ObsidianPluginInfo {
    id: string;
    name: string;
    description: string;
    repo: string;
    author: string;
    version: string;
    downloadCount: number;
    isDesktopOnly: boolean;
    updatedTime: string;
    pluginUpdatedTime: string;
    banner: string | null;
    category: string | null;
    score: number | null;

}

export class PkmerApi {
    token: string
    constructor(token: string) {
        this.token = token;
    }

    private fetchWithToken(url: string, options?: RequestInit): Promise<Response> {
        return fetch(url, {
            ...options,
            headers: {
                "Authorization": 'Bearer ' + this.token,
            }
        })
    }

    async isUserLogin(): Promise<boolean> {
        return !!this.token
    }

    async getDownloadUrl(id: string): Promise<string> {
        const response = await this.fetchWithToken(BASE_API_URL + '/getDownloadUrl/' + id, {
            method: 'GET',
        })
        return await response.text() as string;
    }

    async getDownloadCount(): Promise<number> {
        const response = await this.fetchWithToken(BASE_API_URL + '/getDownloadCount')
        return await response.text() as unknown as number;
    }

    async getTop20Plugins(): Promise<ObsidianPluginInfo[]> {
        const response = await this.fetchWithToken(BASE_API_URL + '/getTop20Plugins')
        return await response.json() as ObsidianPluginInfo[];
    }

    async searchPlugins(keyword: string): Promise<ObsidianPluginInfo[]> {
        const response = await this.fetchWithToken(BASE_API_URL + '/search' + '?keyword=' + keyword + '&limit=10', {
            method: 'GET',
        })
        return await response.json() as ObsidianPluginInfo[];
    }

    async getPluginList(): Promise<ObsidianPluginInfo[]> {
        const response = await this.fetchWithToken(BASE_API_URL + '/get', {
            method: 'GET',
        })
        return await response.json() as ObsidianPluginInfo[];
    }

    async getPluginInfo(id: string): Promise<ObsidianPluginInfo> {
        const response = await this.fetchWithToken(BASE_API_URL + '/getPluginInfo/' + id, {
            method: 'GET',
        })
        return await response.json() as ObsidianPluginInfo;
    }

}