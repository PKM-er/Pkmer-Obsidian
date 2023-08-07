<script setup lang="ts">
import { ref } from "vue"
import { PkmerSettings } from "@/main"
import { App } from "obsidian"
import { PkmerApi } from "@/api/api"
interface Props {
    isLogin: boolean
    settings: PkmerSettings
    app: App
}

const props = defineProps<Props>()
const downloadCount = ref(0)
const isUserLogin = props.isLogin
const api = new PkmerApi(props.settings.token)
if (isUserLogin) downloadCount.value = await api.getDownloadCount()

const handleRefreshPlugin = async () => {
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
            v-show="isUserLogin"
            class="inline-block font-sans text-xs py-1.5 px-3 m-1 rounded-lg bg-yellow-600 text-white shadow-xl shadow-primary-500/20">
            剩余下载次数 {{ downloadCount }}
        </span>
        <button
            @click="handleRefreshPlugin"
            class="inline-block font-sans text-xs py-1.5 px-3 m-1 rounded-lg bg-green-500 text-white shadow-xl shadow-primary-500/20">
            刷新
        </button>
        <button
            class="inline-block font-sans text-xs py-1.5 px-3 m-1 rounded-lg bg-primary-500 text-white shadow-xl shadow-primary-500/20"
            @click="handleOpenSettings">
            设置
        </button>
    </div>
    <div
        v-show="!isUserLogin"
        class="z-10 flex w-3/4 p-4 m-auto my-4 top-20 bg-yellow-200/50">
        <div class="flex items-center">
            <div class="mr-2">⚠️</div>
            <div>
                <span class="font-bold">提示：</span>
                <span
                    >当前是未登录状态，仅展示下载前20的热门内容，请<button
                        class="inline-block px-3 py-1 m-1 font-sans text-xs rounded-lg"
                        @click="handleOpenSettings">
                        登录</button
                    >后获取全部内容。</span
                >
            </div>
        </div>
    </div>
</template>

<style></style>
