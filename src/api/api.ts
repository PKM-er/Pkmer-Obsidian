/*
 * @Author: cumany cuman@qq.com
 * @Date: 2023-07-25 23:58:28
 * @LastEditors: cumany cuman@qq.com
 * @LastEditTime: 2024-05-30 12:28:18
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
    isInstalled: boolean;
    isOutdated: boolean;

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
    authorAvatar: string;
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
        if (!token) {
            // No token present
            return false;
        }
        try {
            const parts = token.split(".");
            // A valid JWT must have 3 parts, but we are interested in the payload (second part)
            if (parts.length < 2 || !parts[1]) {
                console.error("Pkmer Token is malformed: does not contain enough parts.");
                return false; // Not a valid JWT structure
            }
            const payloadBase64Url = parts[1];
            // Replace Base64 URL specific characters
            const payloadBase64 = payloadBase64Url.replace(/-/g, "+").replace(/_/g, "/");
            
            // Pad with '=' if necessary for atob
            const decodedPayloadJson = window.atob(payloadBase64);
            if (!decodedPayloadJson) {
                console.error("Pkmer Token is malformed: payload could not be base64 decoded.");
                return false;
            }
            
            const decryptedToken = JSON.parse(decodeURIComponent(escape(decodedPayloadJson)));
            if (this.isTokenExpired(decryptedToken)) {
                console.log("Pkmer Token has expired. Please log in again to get a new token.");
                return false;
            } else {
                // Token is present, appears structurally valid, and is not expired
                return true;
            }
        } catch (error) {
            // This will catch errors from:
            // - window.atob if payloadBase64 is not valid base64
            // - JSON.parse if decodedPayloadJson is not valid JSON
            // - Other unexpected errors during the process
            console.error("Error processing Pkmer Token (likely malformed or corrupted):", error);
            return false; // Treat any error during parsing/decoding as not logged in
        }
    }
    async getPkmerDocs(): Promise<({ slug: string, uid: number,authorAvatar:string,description:string,tags:string })[]> {
        const response = await requestUrl("https://pkmer.cn/getPost.json")
     
        const pkmerDocsInfo = JSON.parse(response.text) as PkmerDocsInfo[];

        return pkmerDocsInfo.map((item) => {
            return {
                slug: item.slug.split('/').pop() as string,
                uid: item.uid,
                authorAvatar: item.authorAvatar,
                description: item.description,
                tags: Array.isArray(item.tags) ? item.tags.join(', ') : item.tags
            };
        });
    }



    async getDownloadUrl(pluginId: string, version: string): Promise<string> {
        if (pluginId == "obsidian-pkmer") return 'https://pkmer.cn/_release/obsidian-pkmer.zip' + `?v=${version}`;
        const response = await this.fetchWithToken(BASE_API_URL + '/getPluginDownloadUrl/' + pluginId + '/' + version, {
            method: 'GET',
        })
        return await response.text() as string;
    }



    async getDownloadUrlByVersion(pluginId: string, version: string): Promise<string> {
        if (pluginId == "obsidian-pkmer") return 'https://pkmer.cn/_release/obsidian-pkmer.zip' + `?v=${version}`;
        try {
            const response = await this.fetchWithToken(
                BASE_API_URL + `/getPluginDownloadUrl/${pluginId}/${version}?useVersion=true`
            );
          
            return response.text() ;
        } catch (error) {
            console.error(`Failed to fetch download URL for plugin ${pluginId} version ${version}:`, error);
            throw error; // 或者根据需求返回空字符串：return '';
        }
    };
    
    async getPluginVersions(pluginId: string): Promise<string[]> {
        try {
            // 使用 fetchWithToken 获取响应
            const response = await this.fetchWithToken(`https://api.pkmer.cn/api/v1/download/${pluginId}/versions`);
            // 检查响应是否成功
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            // 解析响应为 JSON
            const jsonResponse = await response.json();
       
            // 假设 response 的结构是 { data: string[], meta: { page: number, limit: number, total: number, totalPages: number } }
            const urls = jsonResponse.data || jsonResponse; // 如果没有 data 字段，直接使用 jsonResponse
           
            // 从 URL 中提取版本号
            const versions = urls
                .map((url: string) => {
                    return url
                        .replace(`https://download.pkmer.cn/obsidian-plugins/${pluginId}-`, '')
                        .replace('.zip', '');
                })
                .filter((version: string) => version !== ''); // 过滤掉无法解析的版本号
            return versions;
        } catch (error) {
            console.error(`Failed to fetch versions for plugin ${pluginId}:`, error);
            throw error; // 或者根据需求返回空数组：return [];
        }
    }

    async getThemeDownloadUrlByVersion (themeId: string, version: string): Promise<string>  {
        try {
            const response = await this.fetchWithToken(
                BASE_API_URL + `/getThemeDownloadUrl/${themeId}/${version}?useVersion=true`
            );
           
            return response.text() ;
        } catch (error) {
            console.error(`Failed to fetch download URL for theme ${themeId} version ${version}:`, error);
            throw error; // 或者根据需求返回空字符串：return '';
        }
      };
      
      async  getThemeVersions(themeId: string): Promise<string[]>  {
        try {
            const response = await this.fetchWithToken(`https://api.pkmer.cn/api/v1/download/${themeId}/themeversions`);
            // 假设 response 的结构是 { data: string[], meta: { page: number, limit: number, total: number, totalPages: number } }
            const jsonResponse = await response.json();
            const urls = jsonResponse.data || jsonResponse; // 如果没有 data 字段，直接使用 jsonResponse
            // 从 URL 中提取版本号
            const versions = urls
                .map((url: string) => {
                    return url
                        .replace(`https://download.pkmer.cn/obsidian-themes/${themeId}-`, '')
                        .replace('.zip', '');
                })
                .filter((version: string) => version !== ''); // 过滤掉无法解析的版本号
            return versions;
        } catch (error) {
            console.error(`Failed to fetch versions for theme ${themeId}:`, error);
            throw error; // 或者根据需求返回空数组：return [];
        }
      };
    async getDownloadCount(): Promise<number> {
        const response = await this.fetchWithToken(BASE_API_URL + '/getPluginDownloadCount')
        return parseInt(await response.text()) + 1 as unknown as number;
    }

    async getTop20Plugins(): Promise<ObsidianPluginInfo[]> {
        const cachedData = localStorage.getItem('top20Plugins');
        const cachedExpiry = localStorage.getItem('top20PluginsExpiry');
        const currentTime = new Date().getTime();

        if (cachedData && cachedExpiry && currentTime < +cachedExpiry) {
            return JSON.parse(cachedData) as ObsidianPluginInfo[];
        } else {
            const response = await this.fetchWithToken(BASE_API_URL + '/getTop20Plugins');
            const data = await response.json() as ObsidianPluginInfo[];

            localStorage.setItem('top20Plugins', JSON.stringify(data));
            localStorage.setItem('top20PluginsExpiry', String(currentTime + 8 * 60 * 60 * 1000));

            return data;
        }
    }
    async searchPlugins(keyword: string): Promise<ObsidianPluginInfo[]> {
        const response = await this.fetchWithToken(BASE_API_URL + '/searchPlugins' + '?keyword=' + keyword + '&limit=10', {
            method: 'GET',
        })
        return await response.json() as ObsidianPluginInfo[];
    }

    // async getPluginList(cacheExpiryTimeInMs: number = 1 * 60 * 60 * 1000): Promise<ObsidianPluginInfo[]> {
    //     const cachedData = localStorage.getItem('pluginList');
    //     const cachedExpiry = localStorage.getItem('pluginListExpiry');
    //     const currentTime = new Date().getTime();

    //     if (cachedData && cachedExpiry) {
    //         const expiryTime = parseInt(cachedExpiry);
    //         if (currentTime < expiryTime) {
    //             return JSON.parse(cachedData) as ObsidianPluginInfo[];
    //         }
    //     }

    //     try {
    //         const response = await this.fetchWithToken(BASE_API_URL + '/getAllPlugins', {
    //             method: 'GET',
    //         });
    //         const data = await response.json() as ObsidianPluginInfo[];

    //         localStorage.setItem('pluginList', JSON.stringify(data));
    //         localStorage.setItem('pluginListExpiry', String(currentTime + cacheExpiryTimeInMs));

    //         return data;
    //     } catch (error) {
    //         console.error('Error fetching plugin list:', error);
    //         throw error;
    //     }
    // }

    // 新增分页获取插件方法
    async getPluginListPaginated(page: number = 1, pageSize: number = 24, sortBy: string = "downloadCount", sortOrder: string = "DESC"): Promise<{plugins: ObsidianPluginInfo[], total: number, totalPages: number}> {
        try {
            const response = await this.fetchWithToken(`${BASE_API_URL}/getPluginsPaginated?page=${page}&limit=${pageSize}&sortBy=${sortBy}&sortOrder=${sortOrder}`, {
                method: 'GET',
            });
            const result = await response.json();
            return {
                plugins: result.data,
                total: result.meta.total,
                totalPages: result.meta.totalPages
            };
        } catch (error) {
            console.error('Error fetching paginated plugin list:', error);
            throw error;
        }
    }

    // 新增搜索带分页功能的方法
    async searchPluginsPaginated(searchText: string, page: number = 1, pageSize: number = 24, sortBy: string = "downloadCount", sortOrder: string = "DESC"): Promise<{plugins: ObsidianPluginInfo[], total: number, totalPages: number}> {
        try {
            const response = await this.fetchWithToken(`${BASE_API_URL}/searchPluginsPaginated?searchText=${encodeURIComponent(searchText)}&page=${page}&limit=${pageSize}&sortBy=${sortBy}&sortOrder=${sortOrder}`, {
                method: 'GET',
            });
            const result = await response.json();
            return {
                plugins: result.data,
                total: result.meta.total,
                totalPages: result.meta.totalPages
            };
        } catch (error) {
            console.error('Error searching plugins with pagination:', error);
            throw error;
        }
    }

    async getTop20Themes(): Promise<ThemeInfo[]> {
        const cachedData = localStorage.getItem('top20Themes');
        const cachedExpiry = localStorage.getItem('top20ThemesExpiry');
        const currentTime = new Date().getTime();

        if (cachedData && cachedExpiry && currentTime < +cachedExpiry) {
            return JSON.parse(cachedData) as ThemeInfo[];
        } else {
            const response = await this.fetchWithToken(BASE_API_URL + '/getTop20Themes');
            const data = await response.json() as ThemeInfo[];

            localStorage.setItem('top20Themes', JSON.stringify(data));
            localStorage.setItem('top20ThemesExpiry', String(currentTime + 8 * 60 * 60 * 1000)); // Set the expiry time according to your requirements

            return data;
        }
    }

    async getThemeList(cacheExpiryTimeInMs: number = 1 * 60 * 60 * 1000): Promise<ThemeInfo[]> {
        const cachedData = localStorage.getItem('themeList');
        const cachedExpiry = localStorage.getItem('themeListExpiry');
        const currentTime = new Date().getTime();

        if (cachedData && cachedExpiry && currentTime < +cachedExpiry) {
            return JSON.parse(cachedData) as ThemeInfo[];
        } else {
            try {
                const response = await this.fetchWithToken(BASE_API_URL + '/getAllThemes', {
                    method: 'GET',
                });
                const data = await response.json() as ThemeInfo[];

                localStorage.setItem('themeList', JSON.stringify(data));
                localStorage.setItem('themeListExpiry', String(currentTime + cacheExpiryTimeInMs));

                return data;
            } catch (error) {
                console.error('Error fetching theme list:', error);
                throw error;
            }
        }
    }

    // 新增分页获取主题方法
    async getThemeListPaginated(page: number = 1, pageSize: number = 24, sortBy: string = "downloadCount", sortOrder: string = "DESC"): Promise<{themes: ThemeInfo[], total: number, totalPages: number}> {
        try {
            const response = await this.fetchWithToken(`${BASE_API_URL}/getThemesPaginated?page=${page}&limit=${pageSize}&sortBy=${sortBy}&sortOrder=${sortOrder}`, {
                method: 'GET',
            });
            const result = await response.json();
            return {
                themes: result.data,
                total: result.meta.total,
                totalPages: result.meta.totalPages
            };
        } catch (error) {
            console.error('Error fetching paginated theme list:', error);
            throw error;
        }
    }

    // 新增搜索主题带分页功能的方法
    async searchThemesPaginated(searchText: string, page: number = 1, pageSize: number = 24, sortBy: string = "downloadCount", sortOrder: string = "DESC"): Promise<{themes: ThemeInfo[], total: number, totalPages: number}> {
        try {
            const response = await this.fetchWithToken(`${BASE_API_URL}/searchThemesPaginated?searchText=${encodeURIComponent(searchText)}&page=${page}&limit=${pageSize}&sortBy=${sortBy}&sortOrder=${sortOrder}`, {
                method: 'GET',
            });
            const result = await response.json();
            return {
                themes: result.data,
                total: result.meta.total,
                totalPages: result.meta.totalPages
            };
        } catch (error) {
            console.error('Error searching themes with pagination:', error);
            throw error;
        }
    }

    async getThemeDownloadUrl(themeName: string, version: string): Promise<string> {
        const response = await this.fetchWithToken(BASE_API_URL + '/getThemeDownloadUrl/' + themeName + '/' + version, {
            method: 'GET',
        })
        return await response.text() as string;
    }
    async getPkmerVersion(): Promise<(string | undefined)[]> {
        const randomParam = Math.random();
        const response = await requestUrl("https://pkmer.cn/_release/manifest.json" + `?_=${randomParam}`)
        const mainfestInfo = JSON.parse(response.text);
        return mainfestInfo.version;
    }
    // async getPluginInfo(id: string): Promise<ObsidianPluginInfo> {
    //     const response = await this.fetchWithToken(BASE_API_URL + '/getPluginInfo/' + id, {
    //         method: 'GET',
    //     })
    //     return await response.json() as ObsidianPluginInfo;
    // }

    // 新增获取插件标签的方法
    async getPluginTags(): Promise<{tag: string, count: number}[]> {
        try {
            const response = await this.fetchWithToken(`${BASE_API_URL}/getPluginTags`, {
                method: 'GET',
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching plugin tags:', error);
            return [];
        }
    }

    // 新增获取已安装插件的方法
    async getInstalledPluginsPaginated(
        pluginIds: string[],
        page: number = 1,
        pageSize: number = 24,
        sortBy: string = "downloadCount",
        sortOrder: string = "DESC"
    ): Promise<{plugins: ObsidianPluginInfo[], total: number, totalPages: number}> {
        if (!pluginIds?.length) {
            throw new Error("插件ID列表不能为空");
        }
        try {
            const response = await this.fetchWithToken(
                `${BASE_API_URL}/getInstalledPluginsPaginated?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ pluginIds })
                }
            );
            const result = await response.json();
             
            if (!response.ok) {
                throw new Error(result.message || '请求失败');
            }
            return {
                plugins: result?.data,
                total: result.meta?.total||0,
                totalPages: result.meta?.totalPages||1
            };
        } catch (error) {
            console.error('Error fetching installed plugins:', error);
            throw error;
        }
    }

}