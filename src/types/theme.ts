/*
 * @Author: cumany cuman@qq.com
 * @Date: 2023-07-18 23:44:50
 * @LastEditors: cumany cuman@qq.com
 * @LastEditTime: 2024-03-27 09:17:04
 * @Description: 
 */
export interface ThemeInfo {
    id: string;
    name: string;
    repo: string;
    author: string;
    authorAvatar: string | null;
    banner: string | null;
    modes: string;
    tags: string | null;
    score: number | null;
    description: string;
    chineseDescription: string | null;
    version: string;
    updatedTime: string;
    downloadCount: number;
    pkmerDownloadCount: number;
    downloadUrl: string;
    source: string | null;
    contentUrl: string | null;
    isInstalled: boolean | undefined;
    isOutdated: boolean | undefined;
    __entity: string| null;
}

