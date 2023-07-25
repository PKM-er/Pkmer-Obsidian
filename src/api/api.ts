import { requestUrl } from "obsidian";

const BASE_API_URL = 'https://api.pkmer.cn/api/v1/download/obsidian';

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

export interface PkmerDocsInfo {
    id: string;
    slug: string;
    uid: number;
    title: string;
    description: string,
    author: string;
    type: string;
    tags: string[];
    modified: number;
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

    async getPkmerDocs(): Promise<(string | undefined)[]> {
        const response = await requestUrl("https://pkmer.cn/getPost.json")
        const pkmerDocsInfo = JSON.parse(response.text) as PkmerDocsInfo[];
        return pkmerDocsInfo.map((item) => {
            return item.slug.split('/').pop()
        })
    }

    async getDownloadUrl(pluginId: string, version: string): Promise<string> {
        const response = await this.fetchWithToken(BASE_API_URL + '/getPluginDownloadUrl/' + pluginId +'/'+ version, {
            method: 'GET',
        })
        return await response.text() as string;
    }

    async getDownloadCount(): Promise<number> {
        const response = await this.fetchWithToken(BASE_API_URL + '/gePlugintDownloadCount')
        return await response.text() as unknown as number;
    }

    async getTop20Plugins(): Promise<ObsidianPluginInfo[]> {
        const response = await this.fetchWithToken(BASE_API_URL + '/getTop20Plugins')
        return await response.json() as ObsidianPluginInfo[];
    }

    async searchPlugins(keyword: string): Promise<ObsidianPluginInfo[]> {
        const response = await this.fetchWithToken(BASE_API_URL + '/searchPlugins' + '?keyword=' + keyword + '&limit=10', {
            method: 'GET',
        })
        return await response.json() as ObsidianPluginInfo[];
    }

    async getPluginList(): Promise<ObsidianPluginInfo[]> {
        const response = await this.fetchWithToken(BASE_API_URL + '/getAllPlugins', {
            method: 'GET',
        })
        return await response.json() as ObsidianPluginInfo[];
    }

    // async getPluginInfo(id: string): Promise<ObsidianPluginInfo> {
    //     const response = await this.fetchWithToken(BASE_API_URL + '/getPluginInfo/' + id, {
    //         method: 'GET',
    //     })
    //     return await response.json() as ObsidianPluginInfo;
    // }

}