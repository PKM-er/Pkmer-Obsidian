/*
 * @Author: cumany cuman@qq.com
 * @Date: 2024-03-27 09:08:58
 * @LastEditors: cumany cuman@qq.com
 * @LastEditTime: 2024-03-27 14:37:08
 * @Description: 
 */
import { PkmerSettings } from "@/main";
import { App } from "obsidian";
import { PkmerApi } from "@/api/api";

interface ThemeInfo {
    id: string;
    name: string;
    version: string;
    isInstalled: boolean | undefined;
    isOutdated: boolean | undefined;
}

export default class PluginStatistics {

    private api: PkmerApi;
    private isUserLogin: boolean;
    private allThemeList: ThemeInfo[];
    private isLoaded: boolean;

    constructor(private app: App, private settings: PkmerSettings) {

        this.api = new PkmerApi(this.settings.token)
        this.isUserLogin = false;
        this.allThemeList = [];
        this.isLoaded = false;
        // 移除构造函数中的自动加载
    }

    private async loadAllThemes() {
        if (this.isLoaded) return; // 如果已经加载过，则不再重复加载

        try {
            this.isUserLogin = await this.api.isUserLogin();
            if (this.isUserLogin) {
                const themes = await this.api.getThemeList();
                this.allThemeList = Array.isArray(themes) ? themes : [];
                await this.updateThemeStatus();
                this.isLoaded = true;
            }
        } catch (error) {
            console.error("Error loading themes:", error)
        }
    }

    private async updateThemeStatus() {
        //@ts-ignore
        const themeManifests = this.app.customCss.themes;
        this.allThemeList.forEach((theme) => {
            theme.isInstalled = themeManifests[theme.name] !== undefined
            theme.isOutdated =
                theme.isInstalled &&
                themeManifests[theme.name].version !== theme.version
        });
    }

    async getThemeStatus(): Promise<{ tinstalledCount: number; tupdatedCount: number }> {
        await this.loadAllThemes(); // 确保插件列表已加载

        const tinstalledCount = this.allThemeList.filter((theme) => theme.isInstalled).length;
        const tupdatedCount = this.allThemeList.filter((theme) => theme.isOutdated).length;

        return { tinstalledCount, tupdatedCount };
    }
}
