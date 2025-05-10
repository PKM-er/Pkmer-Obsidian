 
<script setup lang="ts">
import {  watch, computed, ref } from 'vue';
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
// const isUserLogin = props.isLogin // <--- 移除这一行

const api = new PkmerApi(props.settings.token) // token 应该也是响应式的，如果 settings 是响应式 prop
const pluginProcessor = new PluginProcessor(props.app, props.settings)

// 使用 watch 来响应 props.isLogin 的变化去获取下载次数
watch(() => props.isLogin, async (newIsLogin) => {
 
    if (newIsLogin) {
        try {
            downloadCount.value = await api.getDownloadCount();
         
        } catch (error) {
         
            // 可以选择设置一个默认值或显示错误
            downloadCount.value = 0; // 或者保持上一次的值，或显示错误信息
        }
    } else {
        downloadCount.value = 0; // 用户未登录或登出时重置
    }
}, { immediate: true }); // immediate: true 确保在组件初始化时也执行一次，获取初始下载次数

 
(async () => {
    try {
        remoteVersion.value = await api.getPkmerVersion();
      
    } catch (error) {
        console.error('Head.vue: Error fetching PKMer version:', error);
        // 处理获取版本失败的情况
    }
})();

//@ts-ignore
pkmerVer.value = props.app.plugins.manifests["pkmer"].version;
 


const isUpdate = computed(() => {
    if (remoteVersion.value && pkmerVer.value && remoteVersion.value !== pkmerVer.value) { // 增加检查 remoteVersion.value 和 pkmerVer.value 是否有值
        return "发现新版本:" + remoteVersion.value + "(点我更新)";
    }
    if (remoteVersion.value && pkmerVer.value && remoteVersion.value === pkmerVer.value) {
        return "Ver:" + pkmerVer.value;
    }
    return "版本检查中..."; // 或者其他默认/加载中状态
});

const handleUpdatePlugin = async () => {
    if (!remoteVersion.value || remoteVersion.value === pkmerVer.value) return; // 增加检查
    new Notice("正在更新插件，请稍后...", 3000);
    const updateStatus = await pluginProcessor.updatePluginToExistPluginFolder(
        "obsidian-pkmer",
        remoteVersion.value
    );
    if (!updateStatus) return;
    //@ts-ignore
    props.app.workspace.activeLeaf.rebuildView();
};

const handleRefreshPlugin = async () => {
    if (props.isLogin) { // 使用 props.isLogin
        localStorage.removeItem('pluginList');
        localStorage.removeItem('pluginListExpiry');
        localStorage.removeItem('themeList');
        localStorage.removeItem('themeListExpiry');
    }
    //@ts-ignore
    props.app.workspace.activeLeaf.rebuildView();
};

const handleOpenSettings = () => {
    //@ts-ignore
    props.app.setting.open();
    //@ts-ignore
    props.app.setting.openTabById("pkmer");
};

 
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
            :tooltip="downloadCount <= 5 ? '请在Pkmer个人中心绑定微信后可获取更多次数' : null"
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
                <span
                    >当前是未登录状态，仅展示下载前20的热门内容，请<button
                        class="bg-yellow-600 w-20 h-6 inline-block px-1 py-1 m-1 font-sans text-xs rounded-lg"
                        @click="handleOpenSettings">
                        点此登录</button
                    >后获取全部内容。</span
                >
            </div>
        </div>
    </div>
</template>

<style></style>
