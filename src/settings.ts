import PkmerLoginModal from "./components/login/PkmerLoginModal";
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
        //给containerEl添加data-type属性，用于css选择器
        containerEl.setAttribute('data-type', 'pkmer-downloader')

        if (!this.plugin.settings.token) {
            this.showLogin()
        } else {
            this.showLoginOut()
        }

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

    private showLogin(): void {
        new Setting(this.containerEl).setName('登录Pkmer').addButton((button) => {
            return button
                .setButtonText('登录')
                .setCta()
                .onClick(async () => {
                    button.setDisabled(true);
                    const loginModel = new PkmerLoginModal(this);
                    await loginModel.doLogin();
                    this.display();
                });
        });
    }

    private showLoginOut(): void {
        new Setting(this.containerEl).setName('退出登录').addButton((button) => {
            return button
                .setButtonText('退出')
                .setCta()
                .onClick(async () => {
                    button.setDisabled(true);
                    const loginModel = new PkmerLoginModal(this);
                    await loginModel.Loginout();
                    this.display();
                });
        });
    }



    saveToken(token: string) {
        this.plugin.settings.token = token;
        this.plugin.saveSettings();
    }
}
