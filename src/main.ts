import { Notice, Plugin } from "obsidian";

import { DEFAULT_VIEW_TYPE, PkmderDownloaderView } from "./pkmerView";
import { PkmerSettingTab } from "./settings";
// import { downloadAndInstallPlugins } from "./utils/download";

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
            const pluginId = params.pluginId;
            const pkmerToken = localStorage.getItem("pkmer-token");
            // console.log(pkmerToken)
            if (!pkmerToken) {
                new Notice("请登录插件内的pkmer页面");
                return;
            }
            if (pluginId) {
                try {
                    // await downloadAndInstallPlugins(pluginId, this.settings.token);
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