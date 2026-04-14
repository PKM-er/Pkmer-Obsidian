/*
 * @Author: cumany cuman@qq.com
 * @Date: 2023-07-26 16:57:16
 * @LastEditors: cumany cuman@qq.com
 * @LastEditTime: 2024-04-01 18:22:30
 * @Description:
 */
import { Notice, Plugin } from "obsidian"

import PKMerAuthService from "@/auth/PKMerAuthService"
import {
    DEFAULT_PKMER_AUTH_SETTINGS,
    type PKMerAuthSettings,
} from "@/auth/types"
import PluginStatistics from "@/utils/pluginstatistics"
import ThemeStatistics from "@/utils/themestatistics"
import PluginProcessor from "@/utils/downloader"
import ThemeProcessor from "@/utils/tdownloader"
import { PkmerSettingTab } from "./settings"
import { DEFAULT_VIEW_TYPE, PkmderDownloaderView } from "./views/PluginMarket"

export interface PkmerSettings {
    token: string
    refreshToken: string
    auth: PKMerAuthSettings
}

const DEFAULT_SETTINGS: PkmerSettings = {
    token: "",
    refreshToken: "",
    auth: DEFAULT_PKMER_AUTH_SETTINGS,
}

export default class PkmerPlugin extends Plugin {
    settings!: PkmerSettings
    authService!: PKMerAuthService
    private statusBarIconEl!: HTMLElement

    async onload() {
        await this.loadSettings()

        this.authService = new PKMerAuthService(this)
        await this.authService.initialize()

        localStorage.removeItem("pkmer-update-tab")
        this.registerCustomURI()
        this.registerCustomCommands()
        this.registerCustomRibbon()
        this.addStatusBarIcon()
        this.addSettingTab(new PkmerSettingTab(this.app, this))
        this.registerView(
            DEFAULT_VIEW_TYPE,
            (leaf) => new PkmderDownloaderView(leaf, this),
        )

        await this.reloadStatusBarHandler()
        addEventListener("reload-statusbar", this.reloadStatusBarHandler)
    }

    reloadStatusBarHandler = async () => {
        await this.updateStatusBar("")
    }

    onunload() {
        this.authService.onunload()
        removeEventListener("reload-statusbar", this.reloadStatusBarHandler)
    }

    async loadSettings() {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            await this.loadData(),
        )

        this.settings.auth = Object.assign(
            {},
            DEFAULT_PKMER_AUTH_SETTINGS,
            this.settings.auth ?? {},
        )
    }

    async saveSettings() {
        await this.saveData(this.settings)
    }

    private registerCustomURI() {
        this.registerObsidianProtocolHandler("pkmer-installer", async (params) => {
            const pluginId = params.pluginID
            const themeId = params.themeID
            const version = params.version
            const isAuthorized = await this.authService.verify()

            if (!isAuthorized) {
                new Notice("请先完成 PKMer 授权后再安装。", 5000)
                //@ts-ignore
                this.app.setting.open()
                //@ts-ignore
                this.app.setting.openTabById("pkmer")
                return
            }

            if (pluginId) {
                try {
                    new Notice("正在下载插件，请稍后...", 3000)
                    const pluginProcessor = new PluginProcessor(
                        this.app,
                        this.settings,
                        this.authService,
                    )
                    await pluginProcessor.downloadPluginToPluginFolder(pluginId, version)
                } catch (error) {
                    console.error("Plugin install failed:", error)
                    new Notice("下载失败，请检查网络或授权状态。", 5000)
                }
            }

            if (themeId) {
                try {
                    new Notice("正在安装主题，请稍后...", 3000)
                    const themeProcessor = new ThemeProcessor(
                        this.app,
                        this.settings,
                        this.authService,
                    )
                    await themeProcessor.downloadThemeToThemeFolder(themeId, version)
                } catch (error) {
                    console.error("Theme install failed:", error)
                    new Notice("安装失败，请检查网络或授权状态。", 5000)
                }
            }
        })
    }

    private registerCustomCommands() {
        this.addCommand({
            id: "open-pkmer-market-view",
            name: "Open Pkmer Market View",
            callback: () => {
                this.openView("")
            },
        })
    }

    private registerCustomRibbon() {
        this.addRibbonIcon("download", "Open Pkmer Market", () => {
            this.openView("")
        })
    }

    private addStatusBarIcon() {
        this.statusBarIconEl = this.addStatusBarItem()
        this.statusBarIconEl.addClass("pkmer-statusbar")
        this.statusBarIconEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rocket"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>`
        this.statusBarIconEl.setAttribute("aria-label", "PKMer 插件市场")

        this.registerDomEvent(this.statusBarIconEl, "click", () => {
            this.updateStatusBar("statusbar")
        })
    }

    private async updateStatusBar(event: string) {
        const pluginStatistics = new PluginStatistics(this.app, this.settings, this.authService)
        const themeStatistics = new ThemeStatistics(this.app, this.settings, this.authService)
        const { installedCount, updatedCount } = await pluginStatistics.getPluginStatus()
        const { tinstalledCount, tupdatedCount } = await themeStatistics.getThemeStatus()

        if (updatedCount > 0 || tupdatedCount > 0) {
            this.statusBarIconEl.setAttribute("aria-label-position", "top")
            this.statusBarIconEl.setAttribute(
                "aria-label",
                `Updated Info: Plugins: ${updatedCount}/${installedCount}, Themes: ${tupdatedCount}/${tinstalledCount}`,
            )
            this.statusBarIconEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rocket"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg><svg xmlns="http://www.w3.org/2000/svg" style="margin-top: -12px;margin-left: -3px;" width="1em" height="1em" viewBox="0 0 15 15"><path fill="orange" d="M9.875 7.5a2.375 2.375 0 1 1-4.75 0a2.375 2.375 0 0 1 4.75 0"/></svg>`

            if (event === "statusbar") {
                if (updatedCount > 0) {
                    this.openView(JSON.stringify({ type: "updated", count: updatedCount }))
                } else {
                    this.openView(JSON.stringify({ type: "tupdated", count: tupdatedCount }))
                }
            }
            return
        }

        this.statusBarIconEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rocket"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>`
        this.statusBarIconEl.setAttribute(
            "aria-label",
            `Updated Info: Plugins: ${updatedCount}/${installedCount}, Themes: ${tupdatedCount}/${tinstalledCount}`,
        )

        if (event === "statusbar") {
            this.openView("")
        }
    }

    openView(state: string) {
        let pkmerDownloaderFound = false

        this.app.workspace.iterateAllLeaves((leaf: { getViewState: () => { type: string } }) => {
            try {
                if (leaf.getViewState().type === DEFAULT_VIEW_TYPE) {
                    pkmerDownloaderFound = true
                    localStorage.setItem("pkmer-update-tab", state)
                    setTimeout(() => {
                        this.app.workspace.setActiveLeaf(leaf as never)
                        //@ts-ignore
                        this.app.workspace.activeLeaf.rebuildView()
                    }, 300)
                }
            } catch (error) {
                console.error("Error occurred while processing leaf:", error)
            }
        })

        if (!pkmerDownloaderFound) {
            localStorage.setItem("pkmer-update-tab", state)
            setTimeout(() => {
                this.app.workspace?.getLeaf()?.setViewState({
                    active: true,
                    type: DEFAULT_VIEW_TYPE,
                })
            }, 300)
        }
    }
}
