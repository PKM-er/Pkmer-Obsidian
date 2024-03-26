<!--
 * @Author: cumany cuman@qq.com
 * @Date: 2023-07-31 10:11:39
 * @LastEditors: cumany cuman@qq.com
 * @LastEditTime: 2024-03-26 09:03:27
 * @Description: 
-->
<script setup lang="ts">
import { ref } from "vue"
import PluginMarket from "@/components/plugin/PluginMarket.vue"
import ThemeMarket from "@/components/theme/ThemeMarket.vue"
import type { PkmerSettings } from "@/main"
import { App } from "obsidian"

interface Props {
    settings: PkmerSettings
    app: App
    filter:String
}

const props = defineProps<Props>()
console.log(props.filter,"filter");
const currentTab = ref("plugin")
// 处理点击 Tab 的事件，切换当前显示的组件
const switchTab = (tab: string) => {
    currentTab.value = tab
}
</script>
<template>
    <div class="w-full">
        <!-- Renders the page body -->
        <div class="flex flex-wrap md:content-center">
            <!--Site logo-->
            <div
                class="flex items-center justify-between md:px-8 mx-auto font-sans logo scale-90 md:scale-125 max-w-7xl">
                <div
                    class="flex flex-wrap items-center justify-center w-full mx-auto max-w-7xl">
                    <!--Logo-->
                    <div class="items-center w-auto gap-6 basis-0">
                        <a
                            href="https://pkmer.cn"
                            class="flex items-center gap-3 no-underline text-inherit">
                            <div
                                class="transition-all duration-300 text-primary-600">
                                <svg
                                    class="fill-current w-7 h-7"
                                    :class="'w-7 h-7'"
                                    width="1.75rem"
                                    xmlns="http://www.w3.org/2000/svg"
                                    version="1.1"
                                    xmlns:xlink="http://www.w3.org/1999/xlink"
                                    xmlns:svgjs="http://svgjs.com/svgjs"
                                    viewBox="0 0 512 512"
                                    xml:space="preserve">
                                    <g>
                                        <path
                                            d="M395.631 98.837C358.783 45.867 309.195 16.696 256 16.696S153.217 45.867 116.369 98.837c-35.565 51.124-55.151 118.797-55.151 190.554 0 113.54 87.379 205.913 194.783 205.913s194.783-92.373 194.783-205.913c-.001-71.756-19.588-139.43-55.153-190.554z"
                                            style=""
                                            fill="#ffc170"
                                            class=""></path>
                                        <path
                                            d="M256 495.304c107.403 0 194.783-92.373 194.783-205.913 0-71.757-19.586-139.43-55.151-190.554C358.783 45.867 309.195 16.696 256 16.696"
                                            style=""
                                            fill="#e1a05a"
                                            data-original="#ffd6a0"
                                            class=""></path>
                                        <path
                                            d="M0 128h55.652v33.391H0z"
                                            style=""
                                            fill="#a0bdd4"
                                            class=""></path>
                                        <path
                                            d="M13.053 51.94h55.65v33.391h-55.65z"
                                            style=""
                                            transform="rotate(-160.527 40.878 68.636)"
                                            fill="#a0bdd4"
                                            class=""></path>
                                        <path
                                            d="M456.348 128H512v33.391h-55.652z"
                                            style=""
                                            fill="#a0bdd4"
                                            class=""></path>
                                        <path
                                            d="M454.411 40.807h33.391v55.65h-33.391z"
                                            style=""
                                            transform="rotate(-109.469 471.111 68.636)"
                                            fill="#a0bdd4"
                                            class=""></path>
                                        <path
                                            d="m187.719 277.315 14.949-29.896-47.598-21.154-93.659 51.085c-.124 4-.194 8.013-.194 12.041 0 8.564.505 17.005 1.471 25.298l93.892-51.214 31.139 13.84zM450.63 278.997l-105.587-52.794-89.463 44.731-22.369-9.942-14.948 29.896 38.155 16.958 88.625-44.31 104.166 52.083a218.592 218.592 0 0 0 1.573-26.228c.001-3.476-.059-6.938-.152-10.394z"
                                            style=""
                                            fill="#f8f8f8"
                                            class=""></path>
                                        <path
                                            d="m450.63 278.997-105.587-52.794-89.463 44.731.839 36.913 88.624-44.31 104.166 52.083a218.592 218.592 0 0 0 1.573-26.228 382.07 382.07 0 0 0-.152-10.395z"
                                            style=""
                                            fill="#fef5ea"
                                            class=""></path>
                                    </g>
                                </svg>
                            </div>
                            <span
                                class="font-sans text-lg font-extrabold tracking-widest uppercase whitespace-nowrap feat dark:text-muted-100"
                                >Obsidian PKMer Market</span
                            >
                        </a>
                    </div>
                </div>
            </div>
        </div>
        <!--End Layout-->
    </div>
    <div class="pkmer-tab-container">
        <ul class="mb-5 flex list-none flex-row flex-wrap border-b-0 pl-0">
            <li
                class="flex-auto text-center"
                :class="{ active: currentTab === 'plugin' }"
                @click="switchTab('plugin')">
                <span
                    class="cursor-pointer my-2 block border-x-0 border-b-2 border-t-0 border-transparent px-7 pb-3.5 pt-4 font-bold uppercase leading-tight hover:isolate dark:hover:bg-slate-900/30 hover:bg-neutral-100 focus:isolate focus:border-transparent">
                    插件市场
                </span>
            </li>
            <li
                class="flex-auto text-center"
                :class="{ active: currentTab === 'theme' }"
                @click="switchTab('theme')">
                <span
                    class="cursor-pointer my-2 block border-x-0 border-b-2 border-t-0 border-transparent px-7 pb-3.5 pt-4 font-bold uppercase leading-tight hover:isolate dark:hover:bg-slate-900/30 hover:bg-neutral-100 focus:isolate focus:border-transparent">
                    主题市场
                </span>
            </li>
        </ul>

        <div class="pkmer-tab-content">
            <Suspense>
                <template #default>
                    <template v-if="currentTab === 'plugin'">
                        <div
                            class="opacity-100 transition-opacity duration-150 ease-linear">
                            <PluginMarket
                                :settings="props.settings"
                                :app="props.app"></PluginMarket>
                        </div>
                    </template>
                    <template v-else-if="currentTab === 'theme'">
                        <div
                            class="opacity-100 transition-opacity duration-150 ease-linear">
                            <ThemeMarket
                                :settings="props.settings"
                                :app="props.app"></ThemeMarket>
                        </div>
                    </template>
                </template>
                <template #fallback>
                    <h1>Loading...</h1>
                    <h2>如果长时间加载，请确保网络通常，并关闭网络代理。</h2>
                </template>
            </Suspense>
        </div>
    </div>
</template>
<style>
.pkmer-tab-container {
    margin-top: 30px;
}

li.active span {
    color: var(--text-accent);
    border-color: var(--text-accent-hover);
}

.pkmer-tab-content {
    margin-top: 30px;
}
</style>
