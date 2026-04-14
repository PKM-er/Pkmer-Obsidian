<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { App, Notice } from "obsidian"

import type PKMerAuthService from "@/auth/PKMerAuthService"
import { PkmerApi } from "@/api/api"
import type { PkmerSettings } from "@/main"
import PluginProcessor from "@/utils/downloader"

interface Props {
    isLogin: boolean
    settings: PkmerSettings
    app: App
    authService: PKMerAuthService
}

const props = defineProps<Props>()
const downloadCount = ref(0)
const pkmerVer = ref("")
const remoteVersion = ref<string | undefined>()
const api = new PkmerApi(() => props.authService.getAccessToken())
const pluginProcessor = new PluginProcessor(props.app, props.settings, props.authService)

watch(
    () => props.isLogin,
    async (newIsLogin) => {
        if (!newIsLogin) {
            downloadCount.value = 0
            return
        }

        try {
            downloadCount.value = await api.getDownloadCount()
        } catch (error) {
            console.error("Head.vue: Error fetching download count:", error)
            downloadCount.value = 0
        }
    },
    { immediate: true },
)

void (async () => {
    try {
        const version = await api.getPkmerVersion()
        remoteVersion.value = Array.isArray(version) ? version[0] : version
    } catch (error) {
        console.error("Head.vue: Error fetching PKMer version:", error)
    }
})()

//@ts-ignore
pkmerVer.value = props.app.plugins.manifests["pkmer"].version

const isUpdate = computed(() => {
    if (remoteVersion.value && pkmerVer.value && remoteVersion.value !== pkmerVer.value) {
        return `发现新版本: ${remoteVersion.value} (点我更新)`
    }

    if (remoteVersion.value && pkmerVer.value === remoteVersion.value) {
        return `Ver: ${pkmerVer.value}`
    }

    return "版本检查中..."
})

const handleUpdatePlugin = async () => {
    if (!remoteVersion.value || remoteVersion.value === pkmerVer.value) {
        return
    }

    new Notice("正在更新插件，请稍后...", 3000)
    const updateStatus = await pluginProcessor.updatePluginToExistPluginFolder(
        "obsidian-pkmer",
        remoteVersion.value,
    )

    if (!updateStatus) {
        return
    }

    //@ts-ignore
    props.app.workspace.activeLeaf.rebuildView()
}

const handleRefreshPlugin = async () => {
    if (props.isLogin) {
        localStorage.removeItem("pluginList")
        localStorage.removeItem("pluginListExpiry")
        localStorage.removeItem("themeList")
        localStorage.removeItem("themeListExpiry")
    }

    //@ts-ignore
    props.app.workspace.activeLeaf.rebuildView()
}

const handleOpenSettings = () => {
    //@ts-ignore
    props.app.setting.open()
    //@ts-ignore
    props.app.setting.openTabById("pkmer")
}
</script>

<template>
    <div class="text-right pkmer-toolbar">
        <span
            @click="handleUpdatePlugin"
            class="inline-block font-sans text-xs py-1.5 px-3 m-1 rounded-lg bg-yellow-600 text-white shadow-xl shadow-primary-500/20">
            {{ isUpdate }}
        </span>

        <span
            v-show="props.isLogin"
            :tooltip="downloadCount <= 5 ? '请在 PKMer 个人中心绑定微信后获取更多次数' : null"
            class="inline-block font-sans text-xs py-1.5 px-3 m-1 rounded-lg bg-yellow-600 text-white shadow-xl shadow-primary-500/20">
            剩余次数 {{ downloadCount }}
        </span>

        <span
            @click="handleRefreshPlugin"
            class="inline-block font-sans text-xs py-1.5 px-3 m-1 rounded-lg bg-green-500 text-white shadow-xl shadow-primary-500/20">
            刷新
        </span>

        <span
            class="inline-block font-sans text-xs py-1.5 px-3 m-1 rounded-lg bg-primary-500 text-white shadow-xl shadow-primary-500/20"
            @click="handleOpenSettings">
            设置
        </span>
    </div>

    <div
        v-show="!props.isLogin"
        class="z-10 flex w-3/4 p-4 m-auto my-4 top-20 bg-yellow-200/50">
        <div class="flex items-center">
            <div class="mr-2">⚠️</div>
            <div>
                <span class="font-bold">提示：</span>
                <span>
                    当前处于未登录状态，仅展示前 20 个热门内容，请
                    <button
                        class="bg-yellow-600 w-20 h-6 inline-block px-1 py-1 m-1 font-sans text-xs rounded-lg"
                        @click="handleOpenSettings">
                        点此登录
                    </button>
                    后获取全部内容。
                </span>
            </div>
        </div>
    </div>
</template>

<style></style>
