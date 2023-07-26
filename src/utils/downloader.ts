import { App, Notice, normalizePath, requestUrl } from 'obsidian';
import * as JSZip from 'jszip';
import { PkmerApi } from '../api/api';
import { PkmerDownloaderSettings } from '../main';
export default class PluginProcessor {
    settings: PkmerDownloaderSettings
    app: App
    api: PkmerApi
    constructor(app: App, settings: PkmerDownloaderSettings) {
        this.app = app
        this.settings = settings
        this.api = new PkmerApi(settings.token)
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
        const downloadUrl = await this.getPluginDownloadUrl(pluginId, version)
        console.log(downloadUrl)

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