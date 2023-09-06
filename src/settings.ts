/*
 * @Author: cumany cuman@qq.com
 * @Date: 2023-07-24 16:35:56
 * @LastEditors: cumany cuman@qq.com
 * @LastEditTime: 2023-08-24 22:19:09
 * @Description: 
 */
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
                    .setPlaceholder('登录获取token')
                    .setValue(this.plugin.settings.token)
                    .setDisabled(false)
                    .onChange(async (value) => {
                        this.plugin.settings.token = value;
                        await this.plugin.saveSettings();
                    })
            );
            new Setting(containerEl)
            .setName("Tips")
            .setDesc("如果登录后，仍然提示登录，请退出重新登录PKMER。移动端您需要手动在电脑端登录获取token后复制到 ")

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
