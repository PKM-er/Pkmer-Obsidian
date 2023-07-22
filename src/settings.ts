import PkmerPlugin from "./main";
import { App, PluginSettingTab, Setting } from "obsidian";

export class PkmerSettingTab extends PluginSettingTab {
    plugin: PkmerPlugin;

    constructor(app: App, plugin: PkmerPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName("Token")
            .setDesc("Default token for pkmer downloader")
            .addText((text) =>
                text
                    .setValue(this.plugin.settings.token)
                    .onChange(async (value) => {
                        this.plugin.settings.token = value;
                        await this.plugin.saveSettings();
                    })
            );
    }
}
