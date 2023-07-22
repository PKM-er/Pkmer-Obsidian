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

// axios.interceptors.request.use((config: InternalAxiosRequestConfig<any>) => {
//     config.headers['Authorization'] = 'Bearer ' + PkmerPlugin.getToken();
//     config.method = 'GET'
//     return config;
// });

// function fetchWithToken(url: string, options?: RequestInit): Promise<Response> {
//     const token = PkmerPlugin.getToken();
//     if (!token) {
//         throw new Error('Token is not set');
//     }
//     return fetch(url, {
//         ...options,
//         headers: {
//             Authorization: 'Bearer ' + token,
//         },
//     });
// }

// //获取插件下载链接
// export async function getDownloadUrl(id: string): Promise<string> {
//     const response = await axios.get(BASE_API_URL + '/getDownloadUrl/' + id, {
//         method: 'GET',
//     })
//     return response.data as string;
// }

// //获取插件下载次数
// export async function getDownloadCount(): Promise<number> {
//     const response = await axios.get(BASE_API_URL + '/getDownloadCount')
//     return response.data as number;
// }

// //获取下载量前20的插件
// export async function getTop20Plugins(): Promise<ObsidianPluginInfo[]> {
//     const response = await axios.get(BASE_API_URL + '/getTop20Plugins')
//     return response.data as ObsidianPluginInfo[];
// }

// //模糊搜索插件，根据插件名、描述、作者
// export async function searchPlugins(keyword: string): Promise<ObsidianPluginInfo[]> {
//     const response = await axios.get(BASE_API_URL + '/search', {
//         params: {
//             keyword: keyword,
//             limit: 20,
//         }
//     })
//     return response.data as ObsidianPluginInfo[];
// }

// //获取插件列表
// export async function getPluginList(page: number, limit: number): Promise<ObsidianPluginInfo[]> {
//     const response = await axios.get(BASE_API_URL + '/getPluginList', {
//         params: {
//             page: page,
//             limit: limit,
//         }
//     })
//     const data = response.data;
//     console.log(data)
//     return data;
// }

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

    async getPluginList(page: number, limit: number): Promise<ObsidianPluginInfo[]> {
        const response = await this.fetchWithToken(BASE_API_URL + '/getPluginList' + '?page=' + page + '&limit=' + limit, {
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