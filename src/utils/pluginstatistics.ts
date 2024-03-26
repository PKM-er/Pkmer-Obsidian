import { PkmerSettings } from "@/main";
import { App } from "obsidian";
import { PkmerApi } from "@/api/api";

interface PluginInfo {
    id: string;
    name: string;
    version: string;
    isInstalled: boolean;
    isOutdated: boolean;
}

export default class PluginStatistics {
    private api: PkmerApi;
    private isUserLogin: boolean;
    private allPluginList: PluginInfo[];

    constructor(private app: App, private settings: PkmerSettings) {
        this.api = new PkmerApi(settings.token);
        this.isUserLogin = false;
        this.allPluginList = [];
        this.loadAllPlugins(); // 在构造函数中加载插件列表
    }

    private async loadAllPlugins() {
        try {
            this.isUserLogin = await this.api.isUserLogin();
            if (this.isUserLogin) {
                const plugins = await this.api.getPluginList();
                this.allPluginList = Array.isArray(plugins) ? plugins : [];
                await this.updatePluginStatus();
            }
        } catch (error) {
            console.error("Error loading plugins:", error);
            throw new Error("Failed to load plugins");
        }
    }

    private async updatePluginStatus() {

        const pluginManifests = this.app.plugins.manifests;
        this.allPluginList.forEach((plugin) => {
            plugin.isInstalled = !!pluginManifests[plugin.id];
            plugin.isOutdated = plugin.isInstalled && pluginManifests[plugin.id].version !== plugin.version;
        });

    }

    async getPluginStatus(): Promise<{ installedCount: number; updatedCount: number }> {
        await this.loadAllPlugins(); // 确保插件列表已加载

        const installedCount = this.allPluginList.filter((plugin) => plugin.isInstalled).length;
        const updatedCount = this.allPluginList.filter((plugin) => plugin.isOutdated).length;

        return { installedCount, updatedCount };
    }
}
