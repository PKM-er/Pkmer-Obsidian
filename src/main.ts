/*
 * @Author: cumany cuman@qq.com
 * @Date: 2023-07-26 16:57:16
 * @LastEditors: cumany cuman@qq.com
 * @LastEditTime: 2023-07-26 21:06:41
 * @Description: 
 */
import { Notice, Plugin } from "obsidian";

import { DEFAULT_VIEW_TYPE, PkmderDownloaderView } from "./views/PluginMarket";
import { PkmerSettingTab } from "./settings";
import PluginProcessor from "@/utils/downloader"

export interface PkmerDownloaderSettings {
    token: string;
}

const DEFAULT_SETTINGS: PkmerDownloaderSettings = {
    token: "",
}
export default class PkmerPlugin extends Plugin {
    settings!: PkmerDownloaderSettings;

    async onload() {
        await this.loadSettings();

        this.registerCustomURI();
        this.registerCustomCommands();
        this.registerCustomRibbon();


        this.addSettingTab(new PkmerSettingTab(this.app, this));
        this.registerView(DEFAULT_VIEW_TYPE, (leaf) => new PkmderDownloaderView(leaf, this));

    }

    onunload() {

    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    private registerCustomURI() {
        this.registerObsidianProtocolHandler("pkmer-installer", async (params) => {
            const pluginId = params.pluginID;
            const version = params.version;
            const pkmerToken = this.settings.token

            if (!pkmerToken) {
                new Notice("请先登录获取token", 5000);
                //@ts-ignore
                app.setting.open()
                //@ts-ignore
                app.setting.openTabById("Pkmer")
                return;
            }
            if (pluginId) {
                try {
                    new Notice("正在下载插件，请稍后...", 3000)
                    const pluginProcessor = new PluginProcessor(app, this.settings)
                    await pluginProcessor.downloadPluginToPluginFolder(
                        pluginId,
                        version
                    )
                } catch (e) {
                    new Notice("下载失败，请检查网络");
                }
            }


        });
    }

    private registerCustomCommands() {
        this.addCommand({
            id: 'open-pkmer-download-view',
            name: 'Open Pkmer Download View',
            callback: () => {
                app.workspace.getLeaf().setViewState({ active: true, type: DEFAULT_VIEW_TYPE });
            }
        });
    }

    private registerCustomRibbon() {
        this.addRibbonIcon('download', 'Open Pkmer Download View', () => {
            this.app.workspace.getLeaf().setViewState({ active: true, type: DEFAULT_VIEW_TYPE });
        });
    }
}