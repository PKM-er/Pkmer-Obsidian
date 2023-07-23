/*
 * @Author: cumany cuman@qq.com
 * @Date: 2023-07-18 23:44:50
 * @LastEditors: cumany cuman@qq.com
 * @LastEditTime: 2023-07-20 00:16:48
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
    downloadUrl: string;
    contentUrl: string | null;
    isInstalled: boolean | undefined;
    isOutdated: boolean | undefined;
    __entity: string;
}

export interface PluginList {
    data: PluginInfo[];
    hasNextPage: boolean;
}