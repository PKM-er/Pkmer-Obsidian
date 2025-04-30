/*
 * @Author: cumany cuman@qq.com
 * @Date: 2023-07-26 16:57:16
 * @LastEditors: cumany cuman@qq.com
 * @LastEditTime: 2024-04-01 18:22:30
 * @Description:
 */
import { Notice, Plugin, } from "obsidian"

import { DEFAULT_VIEW_TYPE, PkmderDownloaderView } from "./views/PluginMarket"
import { PkmerSettingTab } from "./settings"
import PluginProcessor from "@/utils/downloader"
import ThemeProcessor from "@/utils/tdownloader"
import PluginStatistics from "@/utils/pluginstatistics"
import ThemeStatistics from "@/utils/themestatistics"

export interface PkmerSettings {
    token: string
}

const DEFAULT_SETTINGS: PkmerSettings = {
    token: ""
}
export default class PkmerPlugin extends Plugin {
    settings!: PkmerSettings
    private statusBarIconEl!: HTMLElement

    async onload() {
        await this.loadSettings()
        localStorage.removeItem("pkmer-update-tab")
        this.registerCustomURI()
        this.registerCustomCommands()
        this.registerCustomRibbon()
        this.addStatusBarIcon()
        await this.reloadStatusBarHandler();
        this.addSettingTab(new PkmerSettingTab(this.app, this))
        this.registerView(
            DEFAULT_VIEW_TYPE,
            (leaf) => new PkmderDownloaderView(leaf, this)
        )
        // 监听自定义事件
        addEventListener("reload-statusbar", async () => {
            this.reloadStatusBarHandler();
        })
    }
    reloadStatusBarHandler = async () => {
        await this.updateStatusBar("")
    }
    onunload() {
        removeEventListener("reload-statusbar", this.reloadStatusBarHandler)
    }

    async loadSettings() {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            await this.loadData()
        )
    }

    async saveSettings() {
        await this.saveData(this.settings)
    }

    private registerCustomURI() {
        //注册协议 pkmer-installer
        this.registerObsidianProtocolHandler(
            "pkmer-installer",
            async (params) => {
                const pluginId = params.pluginID
                const themeID = params.themeID
                const version = params.version
                const pkmerToken = this.settings.token

                if (!pkmerToken) {
                    new Notice("请先登录获取token", 5000)
                    //@ts-ignore
                    app.setting.open()
                    //@ts-ignore
                    app.setting.openTabById("PKMer")
                    return
                }
                if (pluginId) {
                    try {
                        new Notice("正在下载插件，请稍后...", 3000)
                        const pluginProcessor = new PluginProcessor(
                            app,
                            this.settings
                        )
                        await pluginProcessor.downloadPluginToPluginFolder(
                            pluginId,
                            version
                        )
                    } catch (e) {
                        new Notice("下载失败，请检查网络")
                    }
                }
                if (themeID) {
                    try {
                        new Notice("正在安装主题，请稍后...", 3000)
                        const themeProcessor = new ThemeProcessor(
                            app,
                            this.settings
                        )
                        await themeProcessor.downloadThemeToThemeFolder(
                            themeID,
                            version
                        )
                    } catch (e) {
                        new Notice("下载失败，请检查网络")
                    }
                }
            }
        )
    }

    private registerCustomCommands() {
        this.addCommand({
            id: "open-pkmer-market-view",
            name: "Open Pkmer Market View",
            callback: () => {


                this.openView('')
            }
        })
    }

    private registerCustomRibbon() {
        this.addRibbonIcon("download", "Open Pkmer Market", () => {

            this.openView('');
        })
    }
    private addStatusBarIcon() {
        this.statusBarIconEl = this.addStatusBarItem()
        this.statusBarIconEl.addClass("pkmer-statusbar")
        this.statusBarIconEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rocket"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>`
        this.statusBarIconEl.setAttribute("aria-label", "PKMer插件市场");

        // 注册点击事件，并使用防抖函数作为处理程序
        this.registerDomEvent(this.statusBarIconEl, "click", () => {
            // 用户点击状态栏时才检查更新状态
            this.updateStatusBar("statusbar")
        })
    }

    private async updateStatusBar(event: string) {
        const pluginStatistics = new PluginStatistics(app, this.settings)
        const themeStatistics = new ThemeStatistics(app, this.settings)
        // 使用 Promise.all() 并行获取插件数量
        const { installedCount, updatedCount } = await pluginStatistics.getPluginStatus();
        const { tinstalledCount, tupdatedCount } = await themeStatistics.getThemeStatus();

        if (updatedCount > 0 || tupdatedCount > 0) {
            this.statusBarIconEl.setAttribute("aria-label-position", "top");
            this.statusBarIconEl.setAttribute("aria-label", "Updated Info: Plugins: " + updatedCount + "/" + installedCount + ", Themes: " + tupdatedCount + "/" + tinstalledCount);
            this.statusBarIconEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rocket"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
            <svg xmlns="http://www.w3.org/2000/svg"  style="margin-top: -12px;margin-left: -3px;"  width="1em" height="1em" viewBox="0 0 15 15"><path fill="orange" d="M9.875 7.5a2.375 2.375 0 1 1-4.75 0a2.375 2.375 0 0 1 4.75 0"/></svg> `
            if (event === "statusbar") {
                if (updatedCount > 0) {
                    const data = {
                        type: "updated",
                        count: updatedCount
                    };

                    this.openView(JSON.stringify(data))
                }

                else {
                    const data = {
                        type: "tupdated",
                        count: tupdatedCount
                    };

                    this.openView(JSON.stringify(data))

                }
            }
        } else {
            this.statusBarIconEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rocket"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>`
            this.statusBarIconEl.setAttribute("aria-label", "Updated Info: Plugins: " + updatedCount + "/" + installedCount + ", Themes: " + tupdatedCount + "/" + tinstalledCount);
            if (event === "statusbar")
                this.openView('');
        }
    }
    openView(state: string) {
        let pkmerDownloaderFound = false;

        app.workspace.iterateAllLeaves((leaf) => {
            try {

                if (leaf.getViewState().type === "pkmer-downloader") {
                    pkmerDownloaderFound = true;
                    localStorage.setItem("pkmer-update-tab", state);
                    setTimeout(() => {
                        this.app.workspace.setActiveLeaf(leaf);
                        //@ts-ignore
                        this.app.workspace.activeLeaf.rebuildView()

                    }, 300);

                    return;
                }
            } catch (error) {
                // 异常处理
                console.error("Error occurred while processing leaf:", error);
            }
        });

        // 如果未找到 "pkmer-downloader" 类型的 leaf，则打开默认视图
        if (!pkmerDownloaderFound) {

            localStorage.setItem("pkmer-update-tab", state);
            setTimeout(() => {
                this.app.workspace?.getLeaf()?.setViewState({ active: true, type: DEFAULT_VIEW_TYPE });

            }, 300);

        }
    }
}
