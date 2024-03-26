/*
 * @Author: cumany cuman@qq.com
 * @Date: 2023-07-26 16:57:16
 * @LastEditors: cumany cuman@qq.com
 * @LastEditTime: 2024-03-26 12:18:29
 * @Description: 
 */
import { Notice, Plugin, setIcon, debounce  } from "obsidian";

import { DEFAULT_VIEW_TYPE, PkmderDownloaderView } from "./views/PluginMarket";
import { PkmerSettingTab } from "./settings";
import PluginProcessor from "@/utils/downloader"
import ThemeProcessor from "@/utils/tdownloader"
import PluginStatistics from "@/utils/pluginstatistics"
import { filter } from "jszip";
export interface PkmerSettings {
    token: string;
}

const DEFAULT_SETTINGS: PkmerSettings = {
    token: "",
}
export default class PkmerPlugin extends Plugin {
    settings!: PkmerSettings;
    private statusBarIconEl!: HTMLElement ;

    async onload() {
        await this.loadSettings();

        this.registerCustomURI();
        this.registerCustomCommands();
        this.registerCustomRibbon();
        this.addStatusBarIcon();
       //await this.updateStatusBar();
        this.addSettingTab(new PkmerSettingTab(this.app, this));
        this.registerView(DEFAULT_VIEW_TYPE, (leaf) => new PkmderDownloaderView(leaf, this,"opened"));
        // 监听自定义事件
        addEventListener("reload-statusbar", async () => {

            addEventListener("reload-statusbar", this.reloadStatusBarHandler);

        });

    }
    reloadStatusBarHandler = async () => {
        await this.updateStatusBar();
    };
    onunload() {
        removeEventListener("reload-statusbar", this.reloadStatusBarHandler);
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
    private addStatusBarIcon() {
        this.statusBarIconEl = this.addStatusBarItem();
        this.statusBarIconEl.addClass("pkmer-statusbar");
        setIcon(this.statusBarIconEl, "rocket");
           // 定义防抖函数
        const debouncedClickHandler = debounce(() => {
            dispatchEvent(new Event("reload-statusbar"));
        }, 100);
        // 注册点击事件，并使用防抖函数作为处理程序
        this.registerDomEvent(this.statusBarIconEl, "click", () => {
            debouncedClickHandler(); // 点击事件触发时调用防抖函数
        });
    }


    private async updateStatusBar() {
    
        const pluginStatistics = new PluginStatistics(app, this.settings);
        // 使用 Promise.all() 并行获取插件数量
        const { installedCount, updatedCount } = await pluginStatistics.getPluginStatus();
        this.statusBarIconEl.setText(`Installed: ${installedCount}, Updated: ${updatedCount}`);
 
         debounce(() => {
            this.app.workspace.getLeaf().setViewState({ active: true, type: DEFAULT_VIEW_TYPE ,state: { filter: "tags" } });

        }, 500);
         
    }


    // private registerStatusBarIcon() {
    //     this.statusBarIconEl = this.addStatusBarItem();

    //     if (!requireApiVersion('1.0.0')) {
    //         this.statusBarIconEl.style.padding = '0';
    //         this.statusBarIconEl.style.marginLeft = '-0.25rem';
    //         this.statusBarIconEl.style.marginRight = '-0.25rem';
    //     }
    //     this.statusBarIconEl.addClass("pkmer-statusbar");
    //     setIcon(this.statusBarIconEl, "cloud-download");

    // }

}