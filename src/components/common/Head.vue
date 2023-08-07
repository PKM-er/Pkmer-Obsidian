<!--
 * @Author: cumany cuman@qq.com
 * @Date: 2023-07-31 08:33:07
 * @LastEditors: cumany cuman@qq.com
 * @LastEditTime: 2023-08-08 00:34:23
 * @Description: 
-->
<script setup lang="ts">
import { computed, ref } from "vue"
import { PkmerSettings } from "@/main"
import PluginProcessor from "@/utils/downloader"
import { App, Notice } from "obsidian"
import { PkmerApi } from "@/api/api"
interface Props {
    isLogin: boolean
    settings: PkmerSettings
    app: App
}

const props = defineProps<Props>()
const downloadCount = ref(0)
const pkmerVer = ref("")
const remoteVersion = ref()
const isUserLogin = props.isLogin
const api = new PkmerApi(props.settings.token)
const pluginProcessor = new PluginProcessor(props.app, props.settings)
remoteVersion.value = await api.getPkmerVersion()
if (isUserLogin) downloadCount.value = await api.getDownloadCount()
//@ts-ignore
pkmerVer.value = props.app.plugins.manifests["pkmer"].version

const isUpdate = computed(() => {
    if (remoteVersion.value != pkmerVer.value) return "发现新版本:"+remoteVersion.value
    if (remoteVersion.value == pkmerVer.value) return  "版本号:"+pkmerVer.value
})

const handleUpdatePlugin = async () => {
    if (remoteVersion.value == pkmerVer.value) return 
    new Notice("正在更新插件，请稍后...", 3000)
    const updateStatus = await pluginProcessor.updatePluginToExistPluginFolder(
        'obsidian-pkmer',
        remoteVersion.value,
    )
    if (!updateStatus) return
    handleRefreshPlugin()
}

 
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
        <span   @click="handleUpdatePlugin"
            class="inline-block font-sans text-xs py-1.5 px-3 m-1 rounded-lg bg-yellow-600 text-white shadow-xl shadow-primary-500/20">
            {{ isUpdate }}
        </span>

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
