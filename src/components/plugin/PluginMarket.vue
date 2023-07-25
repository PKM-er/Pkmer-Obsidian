<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue"
import Toolbar from "@/components/plugin/Toolbar.vue"
import PluginCard from "@/components/plugin/PluginCard.vue"
import { PkmerApi } from "@/api/api"
import { PkmerDownloaderSettings } from "@/main"

import type { PluginInfo } from "@/types/plugin"
import PluginProcessor from "@/utils/downloader"
import { App, Notice } from "obsidian"

interface Props {
    settings: PkmerDownloaderSettings
    app: App
}

const props = defineProps<Props>()

const sortBy = ref("")
const showModal = ref(false)
const AllPluginList = ref()
let perPageCount = ref(24)
let currentPage = ref(1)
const isDownload = ref(true)
const api = new PkmerApi(props.settings.token)
const pluginProcessor = new PluginProcessor(props.app, props.settings)

const isUserLogin = await api.isUserLogin()

const loadAllPlugins = async () => {
    const pkmerDocs = await api.getPkmerDocs()

    if (isUserLogin) {
        try {
            AllPluginList.value = await api.getPluginList()
            if (Array.isArray(AllPluginList.value)) {
                AllPluginList.value.forEach((plugin) => {
                    if (pkmerDocs.includes(plugin.id)) {
                        plugin.contentUrl = `https://pkmer.cn/show/${plugin.id}`
                    } else {
                        plugin.contentUrl = ""
                    }
                    //@ts-ignore
                    const pluginManifests = props.app.plugins.manifests

                    plugin.isInstalled =
                        pluginManifests[plugin.id] !== undefined
                    plugin.isOutdated =
                        plugin.isInstalled &&
                        pluginManifests[plugin.id].version !== plugin.version
                })
            } else {
                AllPluginList.value = []
            }
        } catch (error) {
            console.error("Error loading plugins:", error)
        }
    } else {
        AllPluginList.value = await api.getTop20Plugins()
        if (Array.isArray(AllPluginList.value)) {
            AllPluginList.value.forEach((plugin) => {
                if (pkmerDocs.includes(plugin.id)) {
                    plugin.contentUrl = `https://pkmer.cn/show/${plugin.id}`
                } else {
                    plugin.contentUrl = ""
                }
                //@ts-ignore
                const manifest = props.app.plugins.manifests[plugin.id]
                plugin.isInstalled = manifest !== undefined
                plugin.isOutdated = manifest?.version !== plugin.version
            })
        } else {
            AllPluginList.value = []
        }
    }
}

const searchTextRef = ref("")
const activeCategory = ref("all")
const selectPlugin = ref("")
const selectPluginVersion = ref("")
const handleDownloadPlugin = async () => {
    showModal.value = false
    new Notice("正在下载插件，请稍后...", 3000)
    const downloadStatus = await pluginProcessor.downloadPluginToPluginFolder(
        selectPlugin.value, 
        selectPluginVersion.value
    )

    if (!downloadStatus) return

    AllPluginList.value = AllPluginList.value.map((plugin: any) => {
        if (plugin.id == selectPlugin.value) {
            plugin.isInstalled = true
        }
        return plugin
    })
}

const handleUpdatePlugin = async () => {
    showModal.value = false
    new Notice("正在更新插件，请稍后...", 3000)
    const updateStatus = await pluginProcessor.updatePluginToExistPluginFolder(
        selectPlugin.value,
        selectPluginVersion.value
    )
    if (!updateStatus) return

    AllPluginList.value = AllPluginList.value.map((plugin: any) => {
        if (plugin.id == selectPlugin.value) {
            plugin.isOutdated = false
        }
        return plugin
    })
}

const cancelModal = () => {
    showModal.value = false
}

const handleUpdateActiveCategory = (value: string) => {
    activeCategory.value = value
}

const handleShowPluginModal = (
    action: "download" | "update",
    pluginId: string,
    version: string
) => {
    showModal.value = true
    selectPlugin.value = pluginId
    selectPluginVersion.value = version
    if (action === "download") {
        isDownload.value = true
    } else {
        isDownload.value = false
    }
}

// console.log(props.pluginList);
// 从location.hash提取分类名称并赋值给activeCategory
const extractCategoryFromHash = () => {
    const hash = window.location.hash.slice(1) // 获取类似于“widget/widgetMarket#倒计时”的字符串，去掉前面的#
    if (hash) {
        const category = decodeURIComponent(hash)
        activeCategory.value = category
    }
}
const pkmerSize = ref()
const ele = ref<HTMLElement | null>(null)
onMounted(async () => {
    extractCategoryFromHash() // 初始化时提取分类名称
    await loadAllPlugins()
    ele.value = document.querySelector(
        '.workspace-leaf-content[data-type="pkmer-downloader"]'
    ) as HTMLElement
    ele.value && resizeObserver.observe(ele.value)
    window.addEventListener("resize", handleWindowResize)
    handleWindowResize()
})

const handleWindowResize = () => {
    pkmerSize.value = ele.value && ele.value?.offsetWidth
}
onUnmounted(() => {
    ele.value && resizeObserver.unobserve(ele.value)
    window.removeEventListener("resize", handleWindowResize)
})

const resizeObserver = new ResizeObserver(() => {
    handleWindowResize()
})

const filteredList = computed<PluginInfo[]>(() => {
    const searchText = searchTextRef.value.toLowerCase().trim() // 将搜索关键字转为小写
    if (searchText.length < 1) return AllPluginList.value
    return AllPluginList.value.filter(
        (plugin: PluginInfo) =>
            plugin.name.toLowerCase().includes(searchText) || // 插件名称中包含搜索关键字
            plugin.author.toLowerCase().includes(searchText) || // 插件作者中包含搜索关键字
            plugin.chineseDescription?.toLowerCase().includes(searchText) || // 插件描述中包含搜索关键字
            plugin.tags?.toLowerCase().includes(searchText)
    ) // 插件标签中包含搜索关键字
})

const totalPageCount = computed(() => {
    return Math.ceil(filteredList.value?.length / perPageCount.value)
})

const showReadMoreButton = computed(() => {
    return currentPage.value < totalPageCount.value
})

const sortOrder = ref("") // 排序操作
function sortByDownloadCount() {
    sortBy.value = "downloadCount"
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc"
}
// 点击按更新时间排序按钮
function sortByUpdateTime() {
    sortBy.value = "updateTime"
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc"
}
function sortByFilename() {
    sortBy.value = "fileName"
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc"
}

function sortByInstalled() {
    sortBy.value = "installed"
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc"
}

const displayedPlugins = computed<PluginInfo[]>(() => {
    let ResultPlugins = []
    if (activeCategory.value == "all") {
        if (sortBy.value === "downloadCount") {
            if (sortOrder.value === "asc") {
                ResultPlugins = filteredList.value.sort(
                    (a, b) => a.downloadCount - b.downloadCount
                )
            } else {
                ResultPlugins = filteredList.value.sort(
                    (a, b) => b.downloadCount - a.downloadCount
                )
            }
        } else if (sortBy.value === "updateTime") {
            if (sortOrder.value === "asc") {
                ResultPlugins = filteredList.value.sort(
                    (a, b) =>
                        parseInt(a.pluginUpdatedTime) -
                        parseInt(b.pluginUpdatedTime)
                )
            } else {
                ResultPlugins = filteredList.value.sort(
                    (a, b) =>
                        parseInt(b.pluginUpdatedTime) -
                        parseInt(a.pluginUpdatedTime)
                )
            }
        } else if (sortBy.value === "fileName") {
            if (sortOrder.value === "asc") {
                ResultPlugins = filteredList.value.sort((a, b) =>
                    a.name.localeCompare(b.name)
                )
            } else {
                ResultPlugins = filteredList.value.sort((a, b) =>
                    b.name.localeCompare(a.name)
                )
            }
        } else if (sortBy.value === "installed") {
            ResultPlugins = filteredList.value.filter(
                (plugin) => plugin.isInstalled
            )
        } else {
            ResultPlugins = filteredList.value?.slice(
                0,
                currentPage.value * perPageCount.value
            )
        }
    } else {
        ResultPlugins = filteredList.value.filter((plugin) =>
            plugin.tags?.toLowerCase().includes(activeCategory.value)
        ) // 插件标签中包含搜索关键字

        if (sortBy.value === "downloadCount") {
            if (sortOrder.value === "asc") {
                ResultPlugins = ResultPlugins.sort(
                    (a, b) => a.downloadCount - b.downloadCount
                )
            } else {
                ResultPlugins = ResultPlugins.sort(
                    (a, b) => b.downloadCount - a.downloadCount
                )
            }
        } else if (sortBy.value === "updateTime") {
            if (sortOrder.value === "asc") {
                ResultPlugins = ResultPlugins.sort(
                    (a: PluginInfo, b: PluginInfo) =>
                        parseInt(a.pluginUpdatedTime) -
                        parseInt(b.pluginUpdatedTime)
                )
            } else {
                ResultPlugins = ResultPlugins.sort(
                    (a, b) =>
                        parseInt(b.pluginUpdatedTime) -
                        parseInt(a.pluginUpdatedTime)
                )
            }
        } else if (sortBy.value === "fileName") {
            if (sortOrder.value === "asc") {
                ResultPlugins = ResultPlugins.sort((a, b) =>
                    a.name.localeCompare(b.name)
                )
            } else {
                ResultPlugins = ResultPlugins.sort((a, b) =>
                    b.name.localeCompare(a.name)
                )
            }
        }
    }

    return ResultPlugins?.slice(0, currentPage.value * perPageCount.value)
})
const validPluginList = computed(() => {
    if (Array.isArray(filteredList.value)) {
        return filteredList.value
    } else {
        return []
    }
})
const readMore = () => {
    const startIndex = currentPage.value * perPageCount.value
    const endIndex = startIndex + perPageCount.value
    const pluginsToAdd = filteredList.value?.slice(startIndex, endIndex)
    currentPage.value++
    AllPluginList.value = [...AllPluginList.value, ...pluginsToAdd]
}

const handleRefreshPlugin = async () => {
    await loadAllPlugins()
}

const handleOpenSettings = () => {
    //@ts-ignore
    app.setting.open()
    //@ts-ignore
    props.app.setting.openTabById("Pkmer")
}
</script>

<template>
    <div class="text-right pkmer-toolbar">
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
                    >当前是未登录状态，仅展示下载前20的热门插件，请<button
                        class="inline-block px-3 py-1 m-1 font-sans text-xs rounded-lg"
                        @click="handleOpenSettings">
                        登录</button
                    >后获取全部插件内容。</span
                >
            </div>
        </div>
    </div>
    <main data-pagefind-body class="w-full">
        <!-- Renders the page body -->

        <section class="w-full bg-muted-100 dark:bg-muted-1000">
            <div class="w-full mx-auto max-w-7xl">
                <!-- toolbar-->
                <div
                    class="relative top-0 z-30 flex items-center w-full overflow-x-auto divide-x rounded dark:bg-muted-800 border-muted-200 dark:border-muted-700 divide-muted-200 dark:divide-muted-700 dark:shadow-muted-900/30 md:overflow-x-visible">
                    <div class="widget-item">
                        <button
                            :class="{
                                active:
                                    sortBy == 'downloadCount' || sortBy == ''
                            }"
                            tooltip="按下载量"
                            flow="down"
                            @click="sortByDownloadCount"
                            class="flex items-center px-2 font-sans transition-colors duration-300 group whitespace-nowrap text-muted-800 dark:text-muted-100 hover:bg-muted-50 dark:hover:bg-muted-700">
                            <span
                                class="flex items-center justify-center w-10 h-10 whitespace-pre-wrap text-muted-400 group-hover:text-primary-500">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                    role="img"
                                    width="1em"
                                    height="1em"
                                    viewBox="0 0 24 24"
                                    data-icon="solar:round-sort-vertical-line-duotone"
                                    class="w-6 h-6 iconify iconify--solar">
                                    <g
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="1.5">
                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            opacity=".5"></circle>
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            d="M9.5 8v8m0 0L7 13.25M9.5 16l2.5-2.75M14.5 16V8m0 0L12 10.75M14.5 8l2.5 2.75"></path>
                                    </g>
                                </svg>
                            </span>
                        </button>
                    </div>
                    <div class="widget-item">
                        <button
                            :class="{ active: sortBy == 'updateTime' }"
                            tooltip="按更新时间"
                            flow="down"
                            @click="sortByUpdateTime"
                            class="items-center flex-1 px-2 font-sans transition-colors duration-300 group md:flex-auto md:flex whitespace-nowrap text-muted-800 dark:text-muted-100 hover:bg-muted-50 dark:hover:bg-muted-700">
                            <span
                                class="items-center justify-center w-10 h-10 whitespace-pre-wrap md:flex text-muted-400 group-hover:text-primary-500">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                    role="img"
                                    width="1em"
                                    height="1em"
                                    viewBox="0 0 24 24"
                                    data-icon="ic:sharp-update"
                                    class="w-6 h-6 iconify iconify--ic">
                                    <path
                                        fill="currentColor"
                                        d="M11 8v5l4.25 2.52l.77-1.28l-3.52-2.09V8H11zm10 2V3l-2.64 2.64A8.937 8.937 0 0 0 12 3a9 9 0 1 0 9 9h-2c0 3.86-3.14 7-7 7s-7-3.14-7-7s3.14-7 7-7c1.93 0 3.68.79 4.95 2.05L14 10h7z"></path></svg
                            ></span>
                        </button>
                    </div>

                    <div class="widget-item">
                        <button
                            :class="{ active: sortBy == 'fileName' }"
                            tooltip="按文件名排序"
                            flow="down"
                            @click="sortByFilename"
                            class="items-center flex-1 px-2 font-sans transition-colors duration-300 group md:flex-auto md:flex whitespace-nowrap text-muted-800 dark:text-muted-100 hover:bg-muted-50 dark:hover:bg-muted-700">
                            <span
                                class="items-center justify-center w-10 h-10 whitespace-pre-wrap md:flex text-muted-400 group-hover:text-primary-500">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                    role="img"
                                    width="1em"
                                    height="1em"
                                    viewBox="0 0 24 24"
                                    data-icon="material-symbols:sort-by-alpha"
                                    class="w-6 h-6 iconify iconify--material-symbols">
                                    <path
                                        fill="currentColor"
                                        d="M2 17L5.75 7H7.9l3.75 10H9.6l-.85-2.4H4.9L4.1 17H2Zm3.5-4.1h2.6L6.9 9.15h-.15L5.5 12.9Zm8.2 4.1v-1.9l5.05-6.3H13.9V7h7.05v1.9l-5 6.3H21V17h-7.3ZM9 5l3-3l3 3H9Zm3 17l-3-3h6l-3 3Z"></path>
                                </svg>
                            </span>
                        </button>
                    </div>
                    <div class="widget-item">
                        <button
                            :class="{ active: sortBy == 'installed' }"
                            tooltip="按已安装排序"
                            flow="down"
                            @click="sortByInstalled"
                            class="items-center flex-1 px-2 font-sans transition-colors duration-300 group md:flex-auto md:flex whitespace-nowrap text-muted-800 dark:text-muted-100 hover:bg-muted-50 dark:hover:bg-muted-700">
                            <span
                                class="items-center justify-center w-10 h-10 whitespace-pre-wrap md:flex text-muted-400 group-hover:text-primary-500">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                    role="img"
                                    width="1em"
                                    height="1em"
                                    viewBox="0 0 24 24"
                                    data-icon="material-symbols:sort-by-alpha"
                                    class="w-5 h-5 iconify iconify--material-symbols">
                                    <path
                                        fill="currentColor"
                                        d="M4.5 11a8.5 8.5 0 1 1 8.188 8.494a6.47 6.47 0 0 1-.68 1.457c.327.033.658.049.992.049c5.523 0 10-4.477 10-10S18.523 1 13 1S3 5.477 3 11c0 .334.016.665.048.991a6.51 6.51 0 0 1 1.458-.68A8.65 8.65 0 0 1 4.5 11Zm8.493-5.352a.75.75 0 0 0-1.493.102v6l.007.102a.75.75 0 0 0 .743.648h4l.102-.007A.75.75 0 0 0 16.25 11H13V5.75l-.007-.102ZM1 17.5a5.5 5.5 0 0 1 5-5.477v5.77l-1.646-1.647a.5.5 0 0 0-.708.708l2.5 2.5a.5.5 0 0 0 .708 0l2.5-2.5a.5.5 0 0 0-.708-.708L7 17.793v-5.77A5.5 5.5 0 1 1 1 17.5Zm8.5 3A.5.5 0 0 0 9 20H4a.5.5 0 0 0 0 1h5a.5.5 0 0 0 .5-.5Z" />
                                </svg>
                            </span>
                        </button>
                    </div>

                    <div class="relative w-full">
                        <label class="hidden text-sm font-alt text-muted-400"
                            >Search</label
                        >
                        <div class="relative group">
                            <input
                                type="text"
                                class="w-full h-8 pl-16 pr-5 font-sans text-base leading-5 transition-all duration-300 text-muted-600 focus:border-muted-300 focus:shadow-lg focus:shadow-muted-300/50 dark:focus:shadow-muted-800/50 placeholder:text-muted-300 dark:placeholder:text-muted-500 dark:bg-muted-800 dark:text-muted-200 dark:border-muted-700 dark:focus:border-muted-600 tw-accessibility"
                                placeholder="Search plugins..."
                                v-model="searchTextRef" />
                            <div
                                class="absolute top-0 left-0 flex items-center justify-center w-16 h-8 transition-colors duration-300 text-muted-400 group-focus-within:text-primary-500">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                    role="img"
                                    width="1em"
                                    height="1em"
                                    viewBox="0 0 24 24"
                                    data-icon="lucide:search"
                                    class="w-4 h-4 iconify iconify--lucide">
                                    <g
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2">
                                        <circle cx="11" cy="11" r="8"></circle>
                                        <path d="m21 21l-4.3-4.3"></path>
                                    </g>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
                <!--main -->
                <div class="flex items-center w-full overflow-hidden">
                    <!--Content-->
                    <div
                        class="flex flex-col justify-between w-full h-full px-6 pt-4 pb-16">
                        <!--Search-->
                        <div
                            class="w-full max-w-[90vw] mx-auto space-y-4 text-center">
                            <!--Categories-->
                            <Toolbar
                                :active-category.sync="activeCategory"
                                :pluginList="validPluginList"
                                @update-active-category="
                                    handleUpdateActiveCategory
                                ">
                            </Toolbar>
                        </div>

                        <!--Blog content-->

                        <div class="flex flex-col gap-12 py-12">
                            <!--Articles grid-->

                            <!--Article-->
                            <div
                                class="grid gap-6 -m-3 ptablet:grid-cols-2 ltablet:grid-cols-3 lg:grid-cols-3"
                                :class="{
                                    '!grid-cols-1':
                                        pkmerSize <= 768 && pkmerSize > 0,
                                    '!grid-cols-2':
                                        pkmerSize > 768 && pkmerSize < 1024,
                                    '!grid-cols-3': pkmerSize > 1024
                                }">
                                <div
                                    v-for="plugin in displayedPlugins"
                                    :key="plugin.id">
                                    <PluginCard
                                        :plugin-info="plugin"
                                        :islogin="isUserLogin"
                                        @download-update-plugin="
                                            handleShowPluginModal
                                        ">
                                    </PluginCard>
                                    <!-- 显示其他插件信息 -->
                                </div>
                                <!--Article-->
                            </div>

                            <!--Articles grid-->
                            <div
                                class="flex items-center justify-center w-full p-6 -m-3">
                                <div class="w-full max-w-[210px] pt-16">
                                    <button
                                        v-if="showReadMoreButton"
                                        @click="readMore"
                                        class="relative inline-flex items-center justify-center w-full gap-2 px-6 py-4 font-sans font-semibold transition-all duration-300 border rounded-lg dark:bg-muted-700 text-muted-800 dark:text-white border-muted-300 dark:border-muted-600 tw-accessibility hover:shadow-xl hover:shadow-muted-400/20">
                                        <div>Load More</div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!--End Layout-->
    </main>

    <!-- Modal price-->
    <div
        class="fixed inset-0 z-30 flex items-center justify-center overflow-auto bg-black bg-opacity-50"
        v-show="showModal">
        <!-- Modal inner -->
        <div
            class="max-w-3xl px-6 py-4 mx-auto text-left bg-white rounded shadow-lg dark:bg-muted-700"
            @click.away="showModal = false"
            x-transition:enter="motion-safe:ease-out duration-300"
            x-transition:enter-start="opacity-0 scale-90"
            x-transition:enter-end="opacity-100 scale-100">
            <!-- Title / Close-->
            <div class="flex items-center justify-between">
                <h5 class="mr-3 max-w-none"></h5>

                <button
                    type="button"
                    class="z-50 cursor-pointer"
                    @click="showModal = false">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>

            <!-- content -->

            <section class="body-font">
                <div class="container px-5 py-4 mx-auto">
                    <h3
                        class="mb-6 text-2xl font-medium text-center title-font">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                            role="img"
                            width="1em"
                            height="1em"
                            viewBox="0 0 24 24"
                            data-icon="line-md:downloading-loop"
                            class="w-6 h-6 iconify iconify--line-md">
                            <g
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-width="2">
                                <path
                                    stroke-dasharray="2 4"
                                    stroke-dashoffset="6"
                                    d="M12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21">
                                    <animate
                                        attributeName="stroke-dashoffset"
                                        dur="0.6s"
                                        repeatCount="indefinite"
                                        values="6;0"></animate>
                                </path>
                                <path
                                    stroke-dasharray="30"
                                    stroke-dashoffset="30"
                                    d="M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3">
                                    <animate
                                        fill="freeze"
                                        attributeName="stroke-dashoffset"
                                        begin="0.1s"
                                        dur="0.3s"
                                        values="30;0"></animate>
                                </path>
                                <path
                                    stroke-dasharray="10"
                                    stroke-dashoffset="10"
                                    d="M12 8v7.5">
                                    <animate
                                        fill="freeze"
                                        attributeName="stroke-dashoffset"
                                        begin="0.5s"
                                        dur="0.2s"
                                        values="10;0"></animate>
                                </path>
                                <path
                                    stroke-dasharray="6"
                                    stroke-dashoffset="6"
                                    d="M12 15.5l3.5 -3.5M12 15.5l-3.5 -3.5">
                                    <animate
                                        fill="freeze"
                                        attributeName="stroke-dashoffset"
                                        begin="0.7s"
                                        dur="0.2s"
                                        values="6;0"></animate>
                                </path>
                            </g>
                        </svg>
                        即将安装....{{ selectPlugin.toUpperCase() }}
                    </h3>
                    <div>
                        <p class="mb-4 text-base leading-relaxed">
                            注意，安装和更新操作不可逆，请确认后再操作。
                        </p>
                    </div>

                    <div
                        class="flex-wrap block -mx-4 -mt-4 space-y-6 md:flex sm:-m-4 md:-mb-10 md:space-y-0">
                        <div class="flex md:p-4 md:w-1/2">
                            <div class="flex-grow">
                                <h2
                                    v-if="isDownload"
                                    @click="handleDownloadPlugin"
                                    class="block py-4 my-1 font-sans text-base font-medium text-center text-green-500 transition-all duration-300 border rounded-lg cursor-pointer dark:hover:bg-green-300/20 hover:bg-green-100 border-green-700/25">
                                    确 认
                                </h2>
                                <h2
                                    v-else
                                    @click="handleUpdatePlugin"
                                    class="block py-4 my-1 font-sans text-base font-medium text-center text-green-500 transition-all duration-300 border rounded-lg cursor-pointer dark:hover:bg-green-300/20 hover:bg-green-100 border-green-700/25">
                                    更 新
                                </h2>
                            </div>
                        </div>
                        <div class="flex md:p-4 md:w-1/2">
                            <div class="flex-grow">
                                <h2
                                    @click="cancelModal"
                                    class="block py-4 my-1 font-sans text-base font-medium text-center text-green-500 transition-all duration-300 border rounded-lg cursor-pointer dark:hover:bg-green-300/20 hover:bg-green-100 border-green-700/25">
                                    取 消
                                </h2>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>

<style>
.noimg {
    display: flex;
    filter: saturate(70%) contrast(85%);
    background: 50% 50% / cover;
    border-radius: 0.5rem;
    background-color: transparent;
    color: var(--theme-text-light);
    border-color: var(--theme-border);
    font-weight: bold;
    align-items: center;
    justify-content: center;
    text-align: center;
    box-shadow: rgba(50, 50, 93, 0.25) 0px 13px 27px -5px,
        rgba(0, 0, 0, 0.3) 0px 8px 16px -8px;
}

.noimg::before {
    content: attr(data-name);
    /* 设置标题文字 */
    display: block;
    /* 将标题设置为块级元素 */
    font-size: 1.6vw;
    /* 设置标题文字大小 */
    margin-left: 4px;

    color: #fff;
    text-shadow: 0 2px 2px #000;
}

img[src=""],
img:not([src]) {
    width: 0;
    height: 0;
    padding: 82px 130px;
    background: url("https://cdn.pkmer.cn/covers/pkmer2.png!nomark") no-repeat
        center;
    background-size: 100% 100%;
}
button.active span {
    color: rgb(208, 111, 78);
}
</style>
