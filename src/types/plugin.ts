/*
 * @Author: cumany cuman@qq.com
 * @Date: 2023-07-18 23:44:50
 * @LastEditors: cumany cuman@qq.com
 * @LastEditTime: 2024-02-18 10:20:59
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
    source: 'official' | 'community';
    __entity: string;
}

export interface PluginList {
    data: PluginInfo[];
    hasNextPage: boolean;
}