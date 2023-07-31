/*
 * @Author: cumany cuman@qq.com
 * @Date: 2023-07-26 16:57:16
 * @LastEditors: cumany cuman@qq.com
 * @LastEditTime: 2023-07-31 17:08:25
 * @Description: 
 */
import { Notice, Plugin } from "obsidian";

import { DEFAULT_VIEW_TYPE, PkmderDownloaderView } from "./views/PluginMarket";
import { PkmerSettingTab } from "./settings";
import PluginProcessor from "@/utils/downloader"
import ThemeProcessor from "@/utils/tdownloader" 
export interface PkmerSettings {
    token: string;
}

const DEFAULT_SETTINGS: PkmerSettings = {
    token: "",
}
export default class PkmerPlugin extends Plugin {
    settings!: PkmerSettings;

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
        //注册协议 pkmer-installer
        this.registerObsidianProtocolHandler("pkmer-installer", async (params) => {
            const pluginId = params.pluginID;
            const themeID = params.themeID;
            const version = params.version;
            const pkmerToken = this.settings.token

            if (!pkmerToken) {
                new Notice("请先登录获取token", 5000);
                //@ts-ignore
                app.setting.open()
                //@ts-ignore
                app.setting.openTabById("PKMer")
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
            if (themeID) {
                try {
                    new Notice("正在安装主题，请稍后...", 3000)
                    const themeProcessor = new ThemeProcessor(app, this.settings)
                    await themeProcessor.downloadThemeToThemeFolder(
                        themeID,
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
            id: 'open-pkmer-market-view',
            name: 'Open Pkmer Market View',
            callback: () => {
                app.workspace.getLeaf().setViewState({ active: true, type: DEFAULT_VIEW_TYPE });
            }
        });
    }

    private registerCustomRibbon() {
        this.addRibbonIcon('download', 'Open Pkmer Market', () => {
            this.app.workspace.getLeaf().setViewState({ active: true, type: DEFAULT_VIEW_TYPE });
        });
    }
}