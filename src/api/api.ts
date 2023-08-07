/*
 * @Author: cumany cuman@qq.com
 * @Date: 2023-07-25 23:58:28
 * @LastEditors: cumany cuman@qq.com
 * @LastEditTime: 2023-08-03 11:18:19
 * @Description: 
 */
import { requestUrl } from "obsidian";
import type { ThemeInfo } from "@/types/theme"

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

// export interface ObsidianThemeInfo {
//     id: string;
//     name: string;
//     repo: string;
//     author: string;
//     authorAvatar: string | null;
//     banner: string | null;
//     modes: string;
//     tags: string | null;
//     score: number | null;
//     description: string;
//     chineseDescription: string | null;
//     version: string;
//     updatedTime: string;
//     downloadCount: number;
//     pkmerDownloadCount: number;
//     downloadUrl: string;
//     source: string | null;
//     contentUrl: string | null;
//     isInstalled: boolean | null;
//     isOutdated: boolean | null;
//     __entity: string | null;
// }

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

    // async isUserLogin(): Promise<boolean> {

    //     return !!this.token
    // }
    isTokenExpired(token: any): boolean {
        const currentTimestamp = Math.floor(Date.now() / 1000); // 当前时间的时间戳
        return currentTimestamp > token.exp;
    }

    async isUserLogin(): Promise<boolean> {
        const token = this.token;
        if (token) {
            const strings = token.split(".");
            const decryptedToken = JSON.parse(decodeURIComponent(escape(window.atob(strings[1].replace(/-/g, "+").replace(/_/g, "/")))));
            if (this.isTokenExpired(decryptedToken)) {
                // JWT 已过期，重新登录获取新的 token
                console.log("Pkmer Token has expired. Please log in again to get a new token.");
                return false;
            } else {
                // JWT 未过期，可以继续进行其他操作
                // console.log("Token is valid. Proceed with the operation.");
                return true;
            }
        } else
            return false;
    };

    async getPkmerDocs(): Promise<(string | undefined)[]> {
        const response = await requestUrl("https://pkmer.cn/getPost.json")
        const pkmerDocsInfo = JSON.parse(response.text) as PkmerDocsInfo[];
        return pkmerDocsInfo.map((item) => {
            return item.slug.split('/').pop()
        })
    }

    async getDownloadUrl(pluginId: string, version: string): Promise<string> {
        const response = await this.fetchWithToken(BASE_API_URL + '/getPluginDownloadUrl/' + pluginId + '/' + version, {
            method: 'GET',
        })
        return await response.text() as string;
    }

    async getDownloadCount(): Promise<number> {
        const response = await this.fetchWithToken(BASE_API_URL + '/getPluginDownloadCount')
        return parseInt(await response.text()) + 1 as unknown as number;
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

    async getTop20Themes(): Promise<ThemeInfo[]> {
        const response = await this.fetchWithToken(BASE_API_URL + '/getTop20Themes')
        return await response.json() as ThemeInfo[];
    }
    async getThemeList(): Promise<ThemeInfo[]> {
        const response = await this.fetchWithToken(BASE_API_URL + '/getAllThemes', {
            method: 'GET',
        })
        return await response.json() as ThemeInfo[];
    }

    async getThemeDownloadUrl(themeName: string, version: string): Promise<string> {
        const response = await this.fetchWithToken(BASE_API_URL + '/getThemeDownloadUrl/' + themeName + '/' + version, {
            method: 'GET',
        })
        return await response.text() as string;
    }

    // async getPluginInfo(id: string): Promise<ObsidianPluginInfo> {
    //     const response = await this.fetchWithToken(BASE_API_URL + '/getPluginInfo/' + id, {
    //         method: 'GET',
    //     })
    //     return await response.json() as ObsidianPluginInfo;
    // }

}