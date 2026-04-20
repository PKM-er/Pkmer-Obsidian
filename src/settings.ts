/*
 * @Author: cumany cuman@qq.com
 * @Date: 2023-07-24 16:35:56
 * @LastEditors: cumany cuman@qq.com
 * @LastEditTime: 2024-04-01 18:17:35
 * @Description:
 */
import { App, Notice, Platform, PluginSettingTab, Setting } from "obsidian"

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
        const isTokenExpired = isLoggedIn && !this.plugin.settings.auth.tokenExpiresAt
            ? false
            : isLoggedIn && this.plugin.settings.auth.tokenExpiresAt > 0
                && this.plugin.settings.auth.tokenExpiresAt <= Date.now()

        containerEl.empty()
        containerEl.setAttribute("data-type", "pkmer-downloader")

        containerEl.createEl("h1", { text: "Obsidian PKMer Market" })

        this.renderAccountSection(containerEl, userInfo, isLoggedIn, isTokenExpired)
        //this.renderManualTokenSection(containerEl)
        this.renderTips(containerEl)
        this.renderOpenMarketSection(containerEl)

        containerEl.createEl("hr", { cls: "mt-2" })
        this.renderLinks(containerEl)
    }

    private renderAccountSection(
        containerEl: HTMLElement,
        userInfo: PKMerUserInfo | null,
        isLoggedIn: boolean,
        isTokenExpired: boolean,
    ) {
        const accountName = userInfo?.name || userInfo?.email || "未登录"

        // Token 过期提示
        if (isLoggedIn && isTokenExpired) {
            const expiredBanner = containerEl.createDiv({ cls: "setting-item-description" })
            expiredBanner.style.padding = "10px 12px"
            expiredBanner.style.marginBottom = "12px"
            expiredBanner.style.borderRadius = "8px"
            expiredBanner.style.background = "var(--background-modifier-error)"
            expiredBanner.style.color = "var(--text-error)"
            expiredBanner.style.border = "1px solid var(--background-modifier-error-hover)"
            expiredBanner.setText("⚠️ PKMer Token 已过期，请重新登录以继续使用插件市场。")
        }

        const accountDesc = isLoggedIn && !isTokenExpired
            ? `当前已登录账号：${accountName}`
            : isTokenExpired
                ? "Token 已过期，请重新登录。"
                : "当前未登录，登录后可访问完整插件与主题市场。"

        new Setting(containerEl)
            .setName("当前账号")
            .setDesc(accountDesc)

        if (isLoggedIn && !isTokenExpired && userInfo) {
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

            // 会员状态
            if (userInfo.supporter !== undefined) {
                const badge = info.createEl("div", {
                    text: userInfo.supporter ? "✅ 赞助会员" : "普通用户",
                })
                badge.style.fontSize = "12px"
                badge.style.color = userInfo.supporter
                    ? "var(--color-green)"
                    : "var(--text-muted)"
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

        // 未登录或 Token 过期时显示登录按钮
        if (Platform.isDesktopApp) {
            new Setting(containerEl)
                .setName("OAuth 授权登录（推荐）")
                .setDesc("通过浏览器完成 PKMer 授权，安全获取访问凭证，无需手动复制 Token。")
                .addButton((button) => {
                    button
                        .setButtonText(isTokenExpired ? "重新授权登录" : "立即授权登录")
                        .setCta()
                        .onClick(async () => {
                            button.setDisabled(true)
                            button.setButtonText("等待浏览器授权...")

                            try {
                                await this.plugin.authService.loginWithOAuth()
                                // OAuth 是异步的（等待浏览器回调），这里只是发起请求
                                // 实际登录完成后会通过 reload-statusbar 事件刷新
                                new Notice("请在浏览器中完成授权，完成后设置页面将自动更新。", 6000)
                            } catch (err) {
                                console.error("OAuth login failed:", err)
                            } finally {
                                button.setDisabled(false)
                                button.setButtonText(isTokenExpired ? "重新授权登录" : "立即授权登录")
                                this.display()
                            }
                        })
                })

            // new Setting(containerEl)
            //     .setName("内嵌窗口登录（备用）")
            //     .setDesc("在 Obsidian 内弹出登录窗口，自动提取 PKMer Token。")
            //     .addButton((button) => {
            //         button
            //             .setButtonText("内嵌登录")
            //             .onClick(async () => {
            //                 button.setDisabled(true)

            //                 try {
            //                     const success = await this.plugin.authService.login()
            //                     if (success) {
            //                         //@ts-ignore
            //                         this.app.workspace.activeLeaf?.rebuildView()
            //                     }
            //                 } finally {
            //                     this.display()
            //                 }
            //             })
            //     })
        }

        if (Platform.isMobileApp) {
            new Setting(containerEl)
                .setName("OAuth 授权登录")
                .setDesc("通过系统浏览器完成 PKMer 授权，完成后自动返回 Obsidian。")
                .addButton((button) => {
                    button
                        .setButtonText(isTokenExpired ? "重新授权登录" : "立即授权登录")
                        .setCta()
                        .onClick(async () => {
                            button.setDisabled(true)
                            button.setButtonText("等待浏览器授权...")

                            try {
                                await this.plugin.authService.loginWithOAuth()
                            } catch (err) {
                                console.error("OAuth login failed:", err)
                            } finally {
                                button.setDisabled(false)
                                button.setButtonText(isTokenExpired ? "重新授权登录" : "立即授权登录")
                                this.display()
                            }
                        })
                })
        }
    }

    // private renderManualTokenSection(containerEl: HTMLElement) {
    //     new Setting(containerEl)
    //         .setName("手动 Token [备用]")
    //         .setDesc("兼容移动端或特殊场景无法授权等，可手动粘贴 PKMer 个人 Token。")
    //         .addText((text) => {
    //             text
    //                 .setPlaceholder("输入 PKMer Token")
    //                 .setValue(this.plugin.settings.token)
    //                 .onChange(async (value) => {
    //                     await this.plugin.authService.setLegacyToken(value)
    //                 })
    //         })
    // }

    private renderTips(containerEl: HTMLElement) {
        if (Platform.isDesktopApp) {
            new Setting(containerEl)
                .setName("提示")
                .setDesc("桌面端推荐使用 OAuth 授权登录，点击后会打开系统浏览器完成授权，无需手动复制 Token。")
        }

        if (Platform.isMobileApp) {
            new Setting(containerEl)
                .setName("提示")
                .setDesc("移动端支持 OAuth 授权登录，点击后会打开系统浏览器，完成授权后会自动跳回 Obsidian。")
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
