/*
 * @Author: cumany cuman@qq.com
 * @Date: 2024-03-27 14:22:09
 * @LastEditors: cumany cuman@qq.com
 * @LastEditTime: 2024-03-27 14:36:53
 * @Description: 
 */
import { PkmerSettings } from "@/main";
import { App } from "obsidian";
import { PkmerApi } from "@/api/api";

export default class PluginStatistics {
    private api: PkmerApi;
    private isUserLogin: boolean;

    constructor(private app: App, private settings: PkmerSettings) {
        this.api = new PkmerApi(this.settings.token)
        this.isUserLogin = false;
    }

    async getPluginStatus(): Promise<{ installedCount: number; updatedCount: number }> {
        try {
            this.isUserLogin = await this.api.isUserLogin();
            if (!this.isUserLogin) {
                return { installedCount: 0, updatedCount: 0 };
            }
            
            // 获取已安装插件的 ID 列表
            const installedPluginIds = Object.keys(this.app.plugins.manifests);
            const installedCount = installedPluginIds.length;
            
            if (installedCount === 0) {
                return { installedCount: 0, updatedCount: 0 };
            }
            
            // 使用新的 API 获取已安装插件信息
            const { plugins } = await this.api.getInstalledPluginsPaginated(
                installedPluginIds,
                1,
                installedCount,  // 获取所有已安装插件
                "downloadCount",
                "DESC"
            );
            
            // 计算需要更新的插件数量
            const updatedCount = plugins.filter(plugin => {
                const manifest = this.app.plugins.manifests[plugin.id];
                return manifest && manifest.version !== plugin.version;
            }).length;
            
            return { installedCount, updatedCount };
        } catch (error) {
            console.error("Error getting plugin status:", error);
            return { installedCount: 0, updatedCount: 0 };
        }
    }
}
