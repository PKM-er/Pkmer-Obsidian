/*
 * @Author: cumany cuman@qq.com
 * @Date: 2024-03-27 09:08:58
 * @LastEditors: cumany cuman@qq.com
 * @LastEditTime: 2024-03-27 09:37:07
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

    constructor(private app: App, private settings: PkmerSettings) {
        this.api = new PkmerApi(settings.token);
        this.isUserLogin = false;
        this.allThemeList = [];
        this.loadAllThemes(); // 在构造函数中加载插件列表
    }

    private async loadAllThemes() {

        try {
            this.isUserLogin = await this.api.isUserLogin();
            if (this.isUserLogin) {
                const themes = await this.api.getThemeList();
                this.allThemeList = Array.isArray(themes) ? themes : [];
                await this.updateThemeStatus();
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
