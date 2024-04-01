/*
 * @Author: cumany cuman@qq.com
 * @Date: 2023-07-23 17:35:33
 * @LastEditors: cumany cuman@qq.com
 * @LastEditTime: 2024-04-01 11:34:47
 * @Description:
 */
import { ItemView, WorkspaceLeaf } from "obsidian"
import PkmerDownloaderPlugin, { PkmerSettings } from "../main"
import PluginMarketView from "./PluginMarketView.vue"
import { createApp } from "vue"
import "../styles/global.css"
import "../styles/base.css"



export const DEFAULT_VIEW_TYPE = "pkmer-downloader"

export class PkmderDownloaderView extends ItemView {
    plugin: PkmerDownloaderPlugin
    settings: PkmerSettings
    constructor(
        leaf: WorkspaceLeaf,
        plugin: PkmerDownloaderPlugin,
    ) {
        super(leaf)
        this.plugin = plugin
        this.settings = plugin.settings
    }

    getIcon() {
        return "bookmark"
    }

    getDisplayText() {
        return "Pkmer Market"
    }

    getViewType() {
        return DEFAULT_VIEW_TYPE
    }


    async onOpen() {
        const { contentEl } = this
        console.log("welcome Pkmer Market")
        const pluginMarketApp = createApp(PluginMarketView, {
            settings: this.settings,
            app: this.app,
        })

        pluginMarketApp.mount(contentEl)
    }
}
