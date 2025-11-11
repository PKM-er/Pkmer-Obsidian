/*
 * @Author: cumany cuman@qq.com
 * @Date: 2023-07-24 16:35:56
 * @LastEditors: cumany cuman@qq.com
 * @LastEditTime: 2024-04-01 18:17:35
 * @Description: 
 */
import PkmerLoginModal from "./components/login/PkmerLoginModal";
import PkmerPlugin from "./main";
import { App, PluginSettingTab, Setting, Platform } from "obsidian";
export class PkmerSettingTab extends PluginSettingTab {
    plugin: PkmerPlugin;

    constructor(app: App, plugin: PkmerPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();


        containerEl.createEl("h1", { text: "Obsidian PKMer Market" });


        //给containerEl添加data-type属性，用于css选择器
        containerEl.setAttribute('data-type', 'pkmer-downloader')
        if (Platform.isDesktopApp) {
            if (!this.plugin.settings.token) {
                this.showLogin()
            } else {
                this.showLoginOut()
            }
        }
        new Setting(containerEl)
            .setName("Token")
            .setDesc("Default token for pkmer downloader")
            .addText((text) =>
                text
                    .setPlaceholder('输入token')
                    .setValue(this.plugin.settings.token)
                    .setDisabled(false)
                    .onChange(async (value) => {
                        this.plugin.settings.token = value;
                        await this.plugin.saveSettings();
                    })
            );
        if (Platform.isDesktopApp) {
            new Setting(containerEl)
                .setName("Tips")
                .setDesc("如果登录后，仍然提示登录，请退出重新登录PKMER ")
        }
        if (Platform.isMobileApp) {
            new Setting(containerEl)
                .setName("Tips")
                .setDesc("移动端需要您手动在电脑端登录获取token后复制到输入框中 ")


        }

        new Setting(containerEl)
            .setName("🥚打开PKMer Market")

            .setDesc("点击开始挑选心爱的插件和主题吧")
            .addButton((button) => {
                button
                    .setIcon("download")
                    .setButtonText("进入")
                    .setClass("px-5")
                    .setCta()
                    .onClick(() => {
                        this.app.setting.close();
                        setTimeout(() => {

                            this.plugin.openView("");
                        }, 100);
                    });
            });

        containerEl.createEl("hr", { cls: "mt-2" });
        const div = containerEl.createEl("div", {
            cls: "mt-4",
        });
        div.createEl("a", {
            text: "🥚PKMer.cn",
            href: "https://pkmer.cn",
        });
        div.createEl("span", {
            text: " | ",
        });
        div.createEl("a", {
            text: "👤个人中心",
            href: "https://pkmer.cn/products/UserProfile/",
        });
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
