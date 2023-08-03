/*
 * @Author: cumany cuman@qq.com
 * @Date: 2023-07-18 23:44:50
 * @LastEditors: cumany cuman@qq.com
 * @LastEditTime: 2023-08-03 16:16:05
 * @Description: 
 */
export interface PluginInfo {
    id: string;
    name: string;
    repo: string;
    author: string;
    authorAvatar: string | null;
    banner: string | null;
    tags: string | null;
    score: number | null;
    description: string;
    chineseDescription: string | null;
    version: string;
    isDesktopOnly: boolean;
    pluginUpdatedTime: string;
    updatedTime: string;
    downloadCount: number;
    pkmerDownloadCount: number;
    downloadUrl: string;
    contentUrl: string | null;
    readme_zh: string | null;
    isInstalled: boolean | undefined;
    isOutdated: boolean | undefined;
    __entity: string;
}

export interface PluginList {
    data: PluginInfo[];
    hasNextPage: boolean;
}