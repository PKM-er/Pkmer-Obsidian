/*
 * @Author: cumany cuman@qq.com
 * @Date: 2023-07-24 16:35:56
 * @LastEditors: cumany cuman@qq.com
 * @LastEditTime: 2024-04-01 18:17:35
 * @Description:
 */
import { App, Platform, PluginSettingTab, Setting } from "obsidian"

import type { PKMerUserInfo } from "@/auth/types"
import PkmerPlugin from "./main"

export class PkmerSettingTab extends PluginSettingTab {
    plugin: PkmerPlugin

    constructor(app: App, plugin: PkmerPlugin) {
        super(app, plugin)
        this.plugin = plugin
    }

    display(): void {
        const { containerEl } = this
        const userInfo = this.plugin.settings.auth.userInfo
        const isLoggedIn = this.plugin.authService.hasToken

        containerEl.empty()
        containerEl.setAttribute("data-type", "pkmer-downloader")

        containerEl.createEl("h1", { text: "Obsidian PKMer Market" })

        this.renderAccountSection(containerEl, userInfo, isLoggedIn)
        this.renderManualTokenSection(containerEl)
        this.renderTips(containerEl)
        this.renderOpenMarketSection(containerEl)

        containerEl.createEl("hr", { cls: "mt-2" })
        this.renderLinks(containerEl)
    }

    private renderAccountSection(containerEl: HTMLElement, userInfo: PKMerUserInfo | null, isLoggedIn: boolean) {
        const accountName = userInfo?.name || userInfo?.email || "未登录"
        const accountDesc = isLoggedIn
            ? `当前已登录账号：${accountName}`
            : "当前未登录，登录后可访问完整插件与主题市场。"

        new Setting(containerEl)
            .setName("当前账号")
            .setDesc(accountDesc)

        if (isLoggedIn && userInfo) {
            const card = containerEl.createDiv({ cls: "pkmer-account-card setting-item-description" })
            card.style.display = "flex"
            card.style.alignItems = "center"
            card.style.gap = "12px"
            card.style.padding = "10px 12px"
            card.style.margin = "0 0 12px 0"
            card.style.border = "1px solid var(--background-modifier-border)"
            card.style.borderRadius = "10px"
            card.style.background = "var(--background-secondary)"

            if (userInfo.avatar) {
                card.createEl("img", {
                    attr: {
                        src: userInfo.avatar,
                        alt: accountName,
                        width: "40",
                        height: "40",
                    },
                })
            }

            const info = card.createDiv({ cls: "pkmer-account-info" })
            info.style.display = "flex"
            info.style.flexDirection = "column"
            info.style.gap = "4px"
            info.createEl("div", { text: userInfo.name || "PKMer 用户" })

            if (userInfo.email) {
                info.createEl("div", { text: userInfo.email })
            }

            new Setting(containerEl)
                .setName("账号操作")
                .setDesc("可前往个人中心查看详情，或直接退出当前登录。")
                .addButton((button) => {
                    button
                        .setButtonText("个人中心")
                        .onClick(() => {
                            window.open("https://pkmer.cn/products/UserProfile/")
                        })
                })
                .addButton((button) => {
                    button
                        .setButtonText("退出登录")
                        .setWarning()
                        .onClick(async () => {
                            button.setDisabled(true)

                            try {
                                await this.plugin.authService.logout()
                                //@ts-ignore
                                this.app.workspace.activeLeaf?.rebuildView()
                            } finally {
                                this.display()
                            }
                        })
                })

            return
        }

        if (Platform.isDesktopApp) {
            new Setting(containerEl)
                .setName("登录 PKMer")
                .setDesc("打开 PKMer 登录页并自动提取市场所需的 PKMer Token，无需 AI Token 权限。")
                .addButton((button) => {
                    button
                        .setButtonText("立即登录")
                        .setCta()
                        .onClick(async () => {
                            button.setDisabled(true)

                            try {
                                const success = await this.plugin.authService.login()
                                if (success) {
                                    //@ts-ignore
                                    this.app.workspace.activeLeaf?.rebuildView()
                                }
                            } finally {
                                this.display()
                            }
                        })
                })
        }
    }

    private renderManualTokenSection(containerEl: HTMLElement) {
        new Setting(containerEl)
            .setName("手动 Token[备用]")
            .setDesc("兼容移动端或特殊场景，可手动粘贴 PKMer 个人 Token。")
            .addText((text) => {
                text
                    .setPlaceholder("输入 PKMer Token")
                    .setValue(this.plugin.settings.token)
                    .onChange(async (value) => {
                        await this.plugin.authService.setLegacyToken(value)
                    })
            })
    }

    private renderTips(containerEl: HTMLElement) {
        if (Platform.isDesktopApp) {
            new Setting(containerEl)
                .setName("提示")
                .setDesc("桌面端推荐使用网页登录，插件会自动提取并保存 PKMer Token。")
        }

        if (Platform.isMobileApp) {
            new Setting(containerEl)
                .setName("提示")
                .setDesc("移动端暂时仅支持手动 Token 方式，请在电脑端登录后复制 Token 到此处。")
        }
    }

    private renderOpenMarketSection(containerEl: HTMLElement) {
        new Setting(containerEl)
            .setName("打开 PKMer Market")
            .setDesc("进入 PKMer 市场浏览插件和主题。")
            .addButton((button) => {
                button
                    .setIcon("download")
                    .setButtonText("进入")
                    .setClass("px-5")
                    .setCta()
                    .onClick(() => {
                        this.app.setting.close()
                        setTimeout(() => {
                            this.plugin.openView("")
                        }, 100)
                    })
            })
    }

    private renderLinks(containerEl: HTMLElement) {
        const links = containerEl.createEl("div", { cls: "mt-4" })
        links.createEl("a", {
            text: "PKMer.cn",
            href: "https://pkmer.cn",
        })
        links.createEl("span", { text: " | " })
        links.createEl("a", {
            text: "个人中心",
            href: "https://pkmer.cn/products/UserProfile/",
        })
    }
}
