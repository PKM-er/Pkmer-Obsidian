import { ItemView, WorkspaceLeaf } from "obsidian"
import PkmerDownloaderPlugin, { PkmerDownloaderSettings } from "../main"
import PluginMarketView from "./PluginMarketView.vue"
import { createApp } from "vue"
import "../styles/base.css"

export const DEFAULT_VIEW_TYPE = "pkmer-downloader"

export class PkmderDownloaderView extends ItemView {
    plugin: PkmerDownloaderPlugin
    settings: PkmerDownloaderSettings

    constructor(leaf: WorkspaceLeaf, plugin: PkmerDownloaderPlugin) {
        super(leaf)
        this.plugin = plugin
        this.settings = plugin.settings
    }

    getIcon() {
        return "bookmark"
    }

    getDisplayText() {
        return "Pkmer Downloader"
    }

    getViewType() {
        return DEFAULT_VIEW_TYPE
    }

    async onOpen() {
        const { contentEl } = this
        const pluginMarketApp = createApp(PluginMarketView, { settings: this.settings, app: this.app })

        pluginMarketApp.mount(contentEl)
    }
}
