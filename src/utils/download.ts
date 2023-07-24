/*
 * @Author: cumany cuman@qq.com
 * @Date: 2023-07-23 17:35:33
 * @LastEditors: cumany cuman@qq.com
 * @LastEditTime: 2023-07-24 22:20:51
 * @Description: 
 */
import * as JSZip from "jszip";
// import * as fs from "fs";
// import * as path from "path";
import { requestUrl, Notice, normalizePath } from "obsidian";
import { PkmerApi } from "../api/api.ts";

const fs = require('fs')
const path = require('path')


export async function downloadAndInstallPlugins(pluginId: string, token: string) {
    const api = new PkmerApi(token);
    let downloadUrl = undefined
    if (!pluginId) return new Notice("插件ID不能为空！");
    if (!token) {
        new Notice("请在pkmer网站上获取token，并在设置中填写");
        return
    }
    try {
        downloadUrl = await api.getDownloadUrl(pluginId)
    } catch (error) {
        new Notice(`获取${pluginId}插件下载地址失败！`)
        return
    }

    try {
        await downloadAndUpdatePlugin(downloadUrl, pluginId);
    } catch (error) {
        new Notice(`下载${pluginId}插件并安装失败！`)
    }
}

async function downloadAndUpdatePlugin(url: string, id: string) {
    //@ts-ignore
    if (app.plugins.plugins[id]) {
        try {
            await updatePlugin(url, id);
        } catch (err) {
            console.error(err)
            new Notice(`更新${id}失败！`)
        }
    } else {
        try {
            const response = await requestUrl({
                url: url,
                method: 'GET',
            })
            // eg: https://download.pkmer.cn/plugins/hotkeysplus-obsidian.zip?auth_key=1689299424-37aaaec64566486da075f1173e8b6fba-0-63c3df1853e0b4ac7d8c234c1cbfffe2
            const directory = path.join(normalizePath(app.vault.configDir + "/plugins/"), path.basename(id, '.zip'));
            const zip = await JSZip.loadAsync(response.arrayBuffer);

            if (!fs.existsSync(directory)) {
                fs.mkdirSync(directory, { recursive: true });
            }

            zip.forEach(async (relativePath: string, file: any) => {
                const absolutePath = path.join(directory, relativePath);
                const content = await file.async('nodebuffer');
                fs.writeFileSync(absolutePath, content);
            });

            new Notice(`下载安装${id}插件成功！\n请在插件列表中开启。`, 5000)
        } catch (error) {
            console.error('An error occurred during download and unzip: ', error);
            new Notice(`下载安装${id}插件失败！`)
        }
    }
}

export async function updatePlugin(url: string, id: string) {
    try {
        //@ts-ignore
        const pluginObj = app.plugins.getPlugin(id);
        //@ts-ignore
        const directory = path.join(app.vault.adapter.basePath, app.vault.configDir, 'plugins', pluginObj.manifest.dir);

        const response = await fetch(url, {
            method: 'GET',
        });

        const zip = await JSZip.loadAsync(response.arrayBuffer());

        zip.forEach(async (relativePath, file) => {
            const absolutePath = path.join(directory, relativePath);
            const content = await file.async('nodebuffer');
            fs.writeFileSync(absolutePath, content);
        });
    } catch (error) {
        console.error('An error occurred during the plugin update: ', error);
        new Notice(`更新${id}插件失败！`)
    }
}
