/*
 * @Author: cumany cuman@qq.com
 * @Date: 2023-07-18 23:44:50
 * @LastEditors: cumany cuman@qq.com
 * @LastEditTime: 2023-08-03 11:17:59
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
    isInstalled: boolean | null;
    isOutdated: boolean | null;
    __entity: string| null;
}

