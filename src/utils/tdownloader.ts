import { App, Notice, normalizePath, requestUrl } from 'obsidian';
import * as JSZip from 'jszip';
import { PkmerApi } from '../api/api';
import { PkmerSettings } from '../main';
export default class ThemeProcessor {
    settings: PkmerSettings
    app: App
    api: PkmerApi
    constructor(app: App, settings: PkmerSettings) {
        this.app = app
        this.settings = settings
        this.api = new PkmerApi(settings.token)
    }




    private async getThemeUrl(themeName: string, themeVersion: string) {
        const currentTime = Date.now();
        const cachedThemeUrl = localStorage.getItem('themeUrl');
        // 如果有缓存的地址，并且主题名称和版本号都与缓存一致
        if (cachedThemeUrl) {
            const cachedInfo = JSON.parse(cachedThemeUrl);

            if (
                cachedInfo.name === themeName &&
                cachedInfo.version === themeVersion &&
                currentTime < cachedInfo.expiryTime
            ) {
                // 返回缓存的地址
                return cachedInfo.url;
            }
        }

        // 调用后端接口获取新的地址
        const newThemeUrl = await this.getThemeDownloadUrl(themeName, themeVersion)

        // 保存新的地址到 localStorage，并记录有效期为 15 分钟
        const expiryTime = currentTime + 15 * 60 * 1000;
        const cacheInfo = {
            name: themeName,
            version: themeVersion,
            url: newThemeUrl,
            expiryTime: expiryTime,
        };
        localStorage.setItem('themeUrl', JSON.stringify(cacheInfo));

        // 返回新的地址
        return newThemeUrl;
    }

    private async getThemeDownloadUrl(themeName: string, version: string): Promise<string> {
        const downloadUrl = await this.api.getThemeDownloadUrl(themeName, version)
        if (downloadUrl.startsWith('http')) {
            return downloadUrl
        } else {
            new Notice(`${JSON.parse(downloadUrl).message}`)
            throw new Error(`${JSON.parse(downloadUrl).message}`)
        }

    }





    async downloadThemeToThemeFolder(themeName: string, version: string): Promise<boolean> {
        const downloadUrl = await this.getThemeUrl(themeName, version)

        if (!downloadUrl) {
            new Notice(`获取${themeName}主题下载地址失败！`)
            return false
        }

        //@ts-ignore
        if (app.customCss.themes[themeName]) {
            new Notice(`主题${themeName}已经安装，无需重复安装！`)
            return false
        }

        try {
            const response = await requestUrl({
                url: downloadUrl,
                method: 'GET'
            })

            const themeTargetFolderPath = normalizePath(app.vault.configDir + "/themes/" + themeName) + "/";
            const adapter = this.app.vault.adapter
            const zip = await JSZip.loadAsync(response.arrayBuffer);


            if (await adapter.exists(themeTargetFolderPath) === false ||
                !(await adapter.exists(themeTargetFolderPath + "manifest.json"))) {
                await adapter.mkdir(themeTargetFolderPath);
            }
            try {
                zip.forEach(async (relativePath: string, file: any) => {
                    const absolutePath = themeTargetFolderPath + relativePath;
                    const content = await file.async('string');
                    await adapter.write(absolutePath, content)
                })
            } catch (e) {
                new Notice(`主题${themeName}解压失败！得手动清除残留文件！`, 5000)
                adapter.rmdir(themeTargetFolderPath, true)
                throw Error(`主题${themeName}解压失败！`)
            }

            new Notice(`主题${themeName}安装并启用成功！\n`, 5000)
            //@ts-ignore
            await app.customCss.setTheme(themeName);
            return true
        } catch (error) {
            console.log(error)
            new Notice(`主题${themeName}安装失败！${error}`, 5000)
            return false
        }
    }

    async updateThemeToExistThemeFolder(themeName: string, version: string): Promise<boolean> {
        const downloadUrl = await this.getThemeDownloadUrl(themeName, version)

        if (!downloadUrl) {
            new Notice(`获取${themeName}主题下载地址失败！`)
            throw new Error(`获取${themeName}主题下载地址失败！`)
        }


        //@ts-ignore
        if (!app.customCss.themes[themeName]) {
            new Notice(`主题${themeName}未安装！`)
            return false
        }

        try {
            const themeTargetFolderPath = normalizePath(app.vault.configDir + "/themes/" + themeName) + "/";
            const adapter = this.app.vault.adapter

            if (await adapter.exists(themeTargetFolderPath) === false && !(await adapter.exists(themeTargetFolderPath + "manifest.json"))) {
                throw new Error(`主题${themeName}未安装！`)
            }

            const response = await requestUrl({
                url: downloadUrl,
                method: 'GET'
            })

            const zip = await JSZip.loadAsync(response.arrayBuffer);

            try {
                zip.forEach(async (relativePath: string, file: any) => {
                    const absolutePath = themeTargetFolderPath + relativePath;
                    const content = await file.async('string');
                    await adapter.write(absolutePath, content)
                })
            } catch (e) {
                new Notice(`主题${themeName}解压失败！得手动清除残留文件！`)
                throw Error(`主题${themeName}解压失败！`)
            }

            new Notice(`主题${themeName}更新成功！\n 新主题已生效`)
            //@ts-ignore
            await app.customCss.setTheme(themeName);
            return true
        } catch (error) {
            new Notice(`主题${themeName}更新失败！${error}`)
            return false
        }
    }

}