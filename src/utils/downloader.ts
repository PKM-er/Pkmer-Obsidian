import { App, Notice, normalizePath, requestUrl } from 'obsidian';
import * as JSZip from 'jszip';
import { PkmerApi } from '../api/api';
import { PkmerSettings } from '../main';
export default class PluginProcessor {
    settings: PkmerSettings
    app: App
    api: PkmerApi
    constructor(app: App, settings: PkmerSettings) {
        this.app = app
        this.settings = settings
        this.api = new PkmerApi(settings.token)
    }




    private async getPluginUrl(pluginName: string, pluginVersion: string) {
        const currentTime = Date.now();
        const cachedPluginUrl = localStorage.getItem('pluginUrl');
        // 如果有缓存的地址，并且插件名称和版本号都与缓存一致
        if (cachedPluginUrl) {
            const cachedInfo = JSON.parse(cachedPluginUrl);

            if (
                cachedInfo.name === pluginName &&
                cachedInfo.version === pluginVersion &&
                currentTime < cachedInfo.expiryTime
            ) {
                // 返回缓存的地址
                return cachedInfo.url;
            }
        }

        // 调用后端接口获取新的地址
        const newPluginUrl = await this.getPluginDownloadUrl(pluginName, pluginVersion)

        // 保存新的地址到 localStorage，并记录有效期为 15 分钟
        const expiryTime = currentTime + 15 * 60 * 1000;
        const cacheInfo = {
            name: pluginName,
            version: pluginVersion,
            url: newPluginUrl,
            expiryTime: expiryTime,
        };
        localStorage.setItem('pluginUrl', JSON.stringify(cacheInfo));

        // 返回新的地址
        return newPluginUrl;
    }

    private async getPluginDownloadUrl(pluginId: string, version: string): Promise<string> {
        const downloadUrl = await this.api.getDownloadUrl(pluginId, version)
        if (downloadUrl.startsWith('http')) {
            return downloadUrl
        } else {
            new Notice(`${JSON.parse(downloadUrl).message}`)
            throw new Error(`${JSON.parse(downloadUrl).message}`)
        }

    }

    async downloadPluginToPluginFolder(pluginId: string, version: string): Promise<boolean> {
        const downloadUrl = await this.getPluginUrl(pluginId, version)

        if (!downloadUrl) {
            new Notice(`获取${pluginId}插件下载地址失败！`)
            return false
        }

        //@ts-ignore
        if (app.plugins.manifests[pluginId]) {
            new Notice(`插件${pluginId}已经安装，无需重复安装！`)
            return false
        }

        try {
            const response = await requestUrl({
                url: downloadUrl,
                method: 'GET'
            })

            const pluginTargetFolderPath = normalizePath(app.vault.configDir + "/plugins/" + pluginId) + "/";
            const adapter = this.app.vault.adapter
            const zip = await JSZip.loadAsync(response.arrayBuffer);


            if (await adapter.exists(pluginTargetFolderPath) === false ||
                !(await adapter.exists(pluginTargetFolderPath + "manifest.json"))) {
                await adapter.mkdir(pluginTargetFolderPath);
            }
            try {
                zip.forEach(async (relativePath: string, file: any) => {
                    const absolutePath = pluginTargetFolderPath + relativePath;
                    const content = await file.async('nodebuffer');
                    await adapter.write(absolutePath, content)
                })
            } catch (e) {
                new Notice(`插件${pluginId}解压失败！得手动清除残留文件！`, 5000)
                throw Error(`插件${pluginId}解压失败！`)
            }

            new Notice(`插件${pluginId}安装成功！\n请在插件列表中启用`, 5000)
            //@ts-ignore
            await app.plugins.loadManifests();
            return true
        } catch (error) {
            console.log(error)
            new Notice(`插件${pluginId}安装失败！${error}`, 5000)
            return false
        }
    }

    async updatePluginToExistPluginFolder(pluginId: string, version: string): Promise<boolean> {
        const downloadUrl = await this.getPluginDownloadUrl(pluginId, version)

        if (!downloadUrl) {
            new Notice(`获取${pluginId}插件下载地址失败！`)
            throw new Error(`获取${pluginId}插件下载地址失败！`)
        }


        //@ts-ignore
        if (!app.plugins.manifests[pluginId]) {
            new Notice(`插件${pluginId}未安装！`)
            return false
        }

        try {
            const pluginTargetFolderPath = normalizePath(app.vault.configDir + "/plugins/" + pluginId) + "/";
            const adapter = this.app.vault.adapter

            if (await adapter.exists(pluginTargetFolderPath) === false && !(await adapter.exists(pluginTargetFolderPath + "manifest.json"))) {
                throw new Error(`插件${pluginId}未安装！`)
            }

            const response = await requestUrl({
                url: downloadUrl,
                method: 'GET'
            })

            const zip = await JSZip.loadAsync(response.arrayBuffer);

            try {
                zip.forEach(async (relativePath: string, file: any) => {
                    const absolutePath = pluginTargetFolderPath + relativePath;
                    const content = await file.async('nodebuffer');
                    await adapter.write(absolutePath, content)
                })
            } catch (e) {
                new Notice(`插件${pluginId}解压失败！得手动清除残留文件！`)
                throw Error(`插件${pluginId}解压失败！`)
            }

            new Notice(`插件${pluginId}更新成功！\n 请在插件列表中重新启用`)
            return true
        } catch (error) {
            new Notice(`插件${pluginId}更新失败！${error}`)
            return false
        }
    }

}