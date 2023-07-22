import { ItemView, WorkspaceLeaf } from "obsidian"
import PkmerDownloaderPlugin from "./main"
import AppVue from "./App.vue"
import { createApp } from "vue"

export const DEFAULT_VIEW_TYPE = "pkmer-downloader"

export class PkmderDownloaderView extends ItemView {
    plugin: PkmerDownloaderPlugin

    constructor(leaf: WorkspaceLeaf, plugin: PkmerDownloaderPlugin) {
        super(leaf)
        this.plugin = plugin
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
        const app = createApp(AppVue)
        app.mount(contentEl)
    }
}
