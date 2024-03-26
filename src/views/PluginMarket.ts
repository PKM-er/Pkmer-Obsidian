/*
 * @Author: cumany cuman@qq.com
 * @Date: 2023-07-23 17:35:33
 * @LastEditors: cumany cuman@qq.com
 * @LastEditTime: 2024-03-26 12:21:11
 * @Description:
 */
import { ItemView, WorkspaceLeaf } from "obsidian"
import PkmerDownloaderPlugin, { PkmerSettings } from "../main"
import PluginMarketView from "./PluginMarketView.vue"
import { createApp } from "vue"
import "../styles/global.css"
import "../styles/base.css"

export type MarketState = {
    filter: string
}

export const DEFAULT_VIEW_TYPE = "pkmer-downloader"

export class PkmderDownloaderView extends ItemView {
    plugin: PkmerDownloaderPlugin
    settings: PkmerSettings
    constructor(
        leaf: WorkspaceLeaf,
        plugin: PkmerDownloaderPlugin,
        state: MarketState
    ) {
        super(leaf)
        this.plugin = plugin
        this.settings = plugin.settings
        this.state=state
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
    state: MarketState = { filter: "" }
    async setState(state: MarketState): Promise<void> {
        this.state = { ...state }
        return
    }

    getState() {
        return this.state
    }
    async onOpen() {
        const { contentEl } = this

        const pluginMarketApp = createApp(PluginMarketView, {
            settings: this.settings,
            app: this.app,
            filter: this.state.filter
        })

        pluginMarketApp.mount(contentEl)
    }
}
