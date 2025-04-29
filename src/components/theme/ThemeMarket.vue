<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue"
import ThemeCard from "./ThemeCard.vue"
import ThemeToolbar from "./ThemeToolbar.vue"
import { PkmerApi } from "@/api/api"
import { PkmerSettings } from "@/main"
import Head from "@/components/common/Head.vue"
import type { ThemeInfo } from "@/types/theme"
import ThemeProcessor from "@/utils/tdownloader"
import { App, Notice, debounce } from "obsidian"

interface Props {
    settings: PkmerSettings
    app: App
    tab: string
}

const props = defineProps<Props>()

const sortBy = ref("")
const sortOrder = ref("desc")
const showModal = ref(false)
const AllThemeList = ref<ThemeInfo[]>([])
let perPageCount = ref(24)
let currentPage = ref(1)
const isClose = ref(false)
const isDownload = ref(true)
const api = new PkmerApi(props.settings.token)
const themeProcessor = new ThemeProcessor(props.app, props.settings)

// 添加分页变量
const totalThemes = ref(0)
const totalPages = ref(1)
const isLoading = ref(false)

const isUserLogin = await api.isUserLogin()
const closeNotification = () => {
    isClose.value = true
    sortByDownloadCount()
}
const loadAllThemes = async () => {
    isLoading.value = true;
    const pkmerDocs = await api.getPkmerDocs()
    if (isUserLogin) {
        try {
            // 使用带分页和排序的API替代全量请求
            const { themes, total, totalPages: pages } = await api.getThemeListPaginated(
                currentPage.value, 
                perPageCount.value, 
                sortBy.value || "downloadCount", 
                sortOrder.value?.toUpperCase() || "DESC"
            );
            
            AllThemeList.value = themes;
            totalThemes.value = total;
            totalPages.value = pages;
            
            if (Array.isArray(AllThemeList.value)) {
                AllThemeList.value.forEach((theme) => {
                    //把主题名称中的空格替换为下划线
                    const matchingPkmerDoc = pkmerDocs.find(
                        (doc) =>
                            doc.slug ==
                            theme.name.replace(/\s+/g, "-").toLowerCase()
                    )

                    if (matchingPkmerDoc) {
                        theme.contentUrl = `https://pkmer.cn/show/${matchingPkmerDoc.uid}`
                    }

                    //@ts-ignore
                    const themeManifests = props.app.customCss.themes

                    theme.isInstalled = themeManifests[theme.name] !== undefined
                    theme.isOutdated =
                        theme.isInstalled &&
                        themeManifests[theme.name].version !== theme.version
                })
            } else {
                AllThemeList.value = []
            }
        } catch (error) {
            console.error("Error loading themes:", error)
        }
    } else {
        AllThemeList.value = await api.getTop20Themes()
        if (Array.isArray(AllThemeList.value)) {
            AllThemeList.value.forEach((theme) => {
                //把主题名称中的空格替换为下划线
                const matchingPkmerDoc = pkmerDocs.find(
                    (doc) =>
                        doc.slug ==
                        theme.name.replace(/\s+/g, "-").toLowerCase()
                )

                if (matchingPkmerDoc) {
                    theme.contentUrl = `https://pkmer.cn/show/${matchingPkmerDoc.uid}`
                }

                //@ts-ignore
                const themeManifests = props.app.customCss.themes

                theme.isInstalled = themeManifests[theme.name] !== undefined
                theme.isOutdated =
                    theme.isInstalled &&
                    themeManifests[theme.name].version !== theme.version
            })
        } else {
            AllThemeList.value = []
        }
    }
    isLoading.value = false;
}

const countInstalledTheme = computed(() => {
    // 使用 filter 方法筛选 isInstalled 为 true 的记录
    if (AllThemeList.value) {
        let installedTheme = AllThemeList.value.filter(
            (theme) => theme.isInstalled === true
        )

        // 统计筛选后记录的数量
        let count = installedTheme.length
        return count
    }
})
const countUpdatedTheme = computed(() => {
    // 使用 filter 方法筛选 isInstalled 为 true 的记录
    if (AllThemeList.value) {
        let updatedTheme = AllThemeList.value.filter(
            (theme) => theme.isOutdated === true
        )

        // 统计筛选后记录的数量
        let count = updatedTheme.length
        return count
    }
    return false
})
const searchTextRef = ref("")
const activeCategory = ref("all")
const selectTheme = ref("")
const selectThemeVersion = ref("")
const downloadCount = ref(0)

// 添加分页处理函数
const handlePageChange = async (page: number) => {
    currentPage.value = page;
    await loadAllThemes();
}

// 添加搜索功能
const handleSearch = async () => {
    isLoading.value = true;
    currentPage.value = 1; // 搜索时重置到第一页
    
    try {
        if (searchTextRef.value.trim()) {
            // 使用后端搜索API
            const { themes, total, totalPages: pages } = await api.searchThemesPaginated(
                searchTextRef.value,
                currentPage.value,
                perPageCount.value,
                sortBy.value || "downloadCount",
                sortOrder.value?.toUpperCase() || "DESC"
            );
            
            AllThemeList.value = themes;
            totalThemes.value = total;
            totalPages.value = pages;
            
            // 处理主题额外信息
            if (Array.isArray(AllThemeList.value)) {
                const pkmerDocs = await api.getPkmerDocs();
                AllThemeList.value.forEach((theme) => {
                    const matchingPkmerDoc = pkmerDocs.find(
                        (doc) =>
                            doc.slug ==
                            theme.name.replace(/\s+/g, "-").toLowerCase()
                    );
                    if (matchingPkmerDoc) {
                        theme.contentUrl = `https://pkmer.cn/show/${matchingPkmerDoc.uid}`;
                    }
                    
                    //@ts-ignore
                    const themeManifests = props.app.customCss.themes;
                    theme.isInstalled = themeManifests[theme.name] !== undefined;
                    theme.isOutdated = 
                        theme.isInstalled &&
                        themeManifests[theme.name].version !== theme.version;
                });
            }
        } else {
            await loadAllThemes();
        }
    } catch (error) {
        console.error("Error searching themes:", error);
    } finally {
        isLoading.value = false;
    }
}

// 修改搜索输入处理函数
const handleSetSearchText = (event: any) => {
    debounce(() => {
        searchTextRef.value = event.target.value;
        handleSearch(); // 当输入变化时触发搜索
    }, 800)();
}

const cancelModal = () => {
    showModal.value = false
}

const handleUpdateActiveCategory = (value: string) => {
    activeCategory.value = value;
    currentPage.value = 1; // 重置页码
    
    if (value === "all") {
        // 所有分类使用API加载
        loadAllThemes();
    } else {
        // 特定分类先加载所有数据，然后在前端过滤
        // 注意：如果后端API支持按分类过滤，应该使用API
        loadAllThemes().then(() => {
            // 前端过滤特定分类
            AllThemeList.value = AllThemeList.value.filter((theme) => 
                theme.tags?.includes(value)
            );
        });
    }
}

const handleShowThemeModal = (
    action: "download" | "update",
    themeName: string,
    version: string
) => {
    showModal.value = true
    selectTheme.value = themeName
    selectThemeVersion.value = version
    if (action === "download") {
        isDownload.value = true
    } else {
        isDownload.value = false
    }
}

const handleUpdateTheme = async () => {
    showModal.value = false
    new Notice("正在更新主题，请稍后...", 3000)
    const updateStatus = await themeProcessor.updateThemeToExistThemeFolder(
        selectTheme.value,
        selectThemeVersion.value
    )
    if (!updateStatus) return

    AllThemeList.value = AllThemeList.value.map((theme: any) => {
        if (theme.name == selectTheme.value) {
            theme.isOutdated = false
        }
        return theme
    })
}

const handleDownloadTheme = async () => {
    showModal.value = false
    new Notice("正在下载主题，请稍后...", 3000)

    const downloadStatus = await themeProcessor.downloadThemeToThemeFolder(
        selectTheme.value,
        selectThemeVersion.value
    )

    if (!downloadStatus) return

    AllThemeList.value = AllThemeList.value.map((theme: any) => {
        if (theme.name == selectTheme.value) {
            theme.isInstalled = true
        }
        return theme
    })
}

const hideModal = () => {
    showModal.value = false
}

// console.log(props.pluginList);
// 从location.hash提取分类名称并赋值给activeCategory
const extractCategoryFromHash = () => {
    const hash = window.location.hash.slice(1) // 获取类似于"widget/widgetMarket#倒计时"的字符串，去掉前面的#
    if (hash) {
        const category = decodeURIComponent(hash)
        activeCategory.value = category
    }
}
const pkmerSize = ref()

onMounted(async () => {
    isClose.value = false;
    extractCategoryFromHash(); // 初始化时提取分类名称
    
    // 设置默认排序
    sortBy.value = "downloadCount";
    sortOrder.value = "desc";
    
    app.workspace.on("resize", handleWindowResize);
    //@ts-ignore
    pkmerSize.value = props.app.workspace.activeLeaf.view.leaf.width;

    if (isUserLogin) downloadCount.value = await api.getDownloadCount();

    if (props.tab) {
        const parsedData = JSON.parse(props.tab);
        if (parsedData.type == "tupdated") {
            await sortByUpdated();
        }
        if (parsedData.type == "tinstalled") {
            await sortByInstalled();
        }
    } else {
        // 组件挂载后加载数据
        await loadAllThemes();
    }
});

const handleWindowResize = () => {
    //@ts-ignore
    pkmerSize.value = props.app.workspace.activeLeaf.view.leaf.width
}

onUnmounted(() => {
    window.removeEventListener("resize", handleWindowResize)
})

const filteredList = computed<ThemeInfo[]>(() => {
    // 移动端/桌面端过滤逻辑可以在这里添加，如有需要
    return AllThemeList.value || [];
});

const computedTotalPages = computed(() => {
    if (activeCategory.value === "all") {
        return totalPages.value;
    } else {
        // 对于分类，可能仍需要前端计算
        const filteredByCategory = filteredList.value.filter((theme) => 
            theme.tags?.includes(activeCategory.value)
        );
        return Math.ceil(filteredByCategory.length / perPageCount.value);
    }
});

 

//是否显示"Read More"按钮

// const bestTheme = computed(() => {
// 	let bestList = prop.pluginList.filter(
// 		(plugin) => plugin.rating == 5
// 		// (plugin.rating == 5 && plugin.author == 'Cuman') ||
// 		// (plugin.rating == 5 && plugin.author == 'Boninall')
// 		// 插件评级等于5
// 	);
// 	let randomIndex1 = Math.floor(Math.random() * bestList.length);
// 	let randomIndex2 = Math.floor(Math.random() * bestList.length);
// 	while (randomIndex2 === randomIndex1) {
// 		randomIndex2 = Math.floor(Math.random() * bestList.length);
// 	}

// 	return [bestList[randomIndex1], bestList[randomIndex2]];
// });

 
function sortByPkmerDownloadCount() {
    sortBy.value = "pkmerDownloadCount"
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc"
}
function sortByDownloadCount() {
    sortBy.value = "downloadCount"
    sortOrder.value = sortOrder.value === "desc" ? "asc" : "desc"
    currentPage.value = 1; // 重置到第一页
    loadAllThemes(); // 使用新的排序重新加载数据
}
// 点击按更新时间排序按钮
function sortByUpdateTime() {
    sortBy.value = "updatedTime"
    sortOrder.value = sortOrder.value === "desc" ? "asc" : "desc"
    currentPage.value = 1; // 重置到第一页
    loadAllThemes(); // 使用新的排序重新加载数据
}
function sortByFilename() {
    sortBy.value = "fileName"
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc"
}
function sortByInstalled() {
    sortBy.value = "downloadCount"
    sortOrder.value = "desc"
    currentPage.value = 1
    loadAllThemes();
    // 前端过滤已安装主题
    AllThemeList.value = AllThemeList.value.filter(
        (theme) => theme.isInstalled
    );
}
async function sortByUpdated() {
    sortBy.value = "downloadCount"
    sortOrder.value = "desc"
    currentPage.value = 1
    loadAllThemes();
    // 前端过滤需要更新的主题
    AllThemeList.value = AllThemeList.value.filter(
        (theme) => theme.isOutdated
    );
}
const displayedThemes = computed<ThemeInfo[]>(() => {
    if (activeCategory.value === "all") {
        return filteredList.value;
    } else {
        // 分类筛选仍需要在前端进行
        return filteredList.value.filter((theme) => 
            theme.tags?.includes(activeCategory.value)
        );
    }
});
const validThemeList = computed(() => {
    if (Array.isArray(filteredList.value)) {
        return filteredList.value
    } else {
        return []
    }
})
 

// 加载更多插件

// const readMore = async () => {
// 	page.value++;
// 	await loadThemes();
// };
</script>
<template>
    <Head :settings="props.settings" :isLogin="isUserLogin" :app="props.app">
    </Head>
    <main data-pagefind-body class="w-full">
        <!-- Renders the page body -->
        <div
            class="flex items-center justify-between w-full px-2 py-4 mx-auto font-sans search first-letter:">
            <div
                class="flex flex-wrap items-center justify-center w-full first-letter:mx-auto">
                <!--Search-->
                <div class="w-full lg:max-w-[60vw] mx-auto py-3 md:px-6">
                    <!-- toolbar-->
                    <div
                        class="flex-wrap relative top-0 z-30 flex items-center w-full overflow-x-auto divide-x rounded dark:bg-muted-800 border-muted-200 dark:border-muted-700 divide-muted-200 dark:divide-muted-700 dark:shadow-muted-900/30 md:overflow-x-visible">
                        <div class="widget-item">
                            <button
                                :class="{
                                    active: sortBy == 'downloadCount'
                                }"
                                tooltip="按下载量"
                                flow="down"
                                @click="sortByDownloadCount"
                                class="flex items-center px-2 font-sans transition-colors duration-300 group whitespace-nowrap text-muted-800 dark:text-muted-100 hover:bg-muted-50 dark:hover:bg-muted-700">
                                <span
                                    class="items-center justify-center w-10 h-10 whitespace-pre-wrap flex text-muted-400 group-hover:text-primary-500">
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
                                    class="items-center justify-center w-10 h-10 whitespace-pre-wrap flex text-muted-400 group-hover:text-primary-500">
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
                                    class="items-center justify-center w-10 h-10 whitespace-pre-wrap flex text-muted-400 group-hover:text-primary-500">
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
                                class="active items-center flex-1 px-2 font-sans transition-colors duration-300 group md:flex-auto md:flex whitespace-nowrap text-muted-800 dark:text-muted-100 hover:bg-muted-50 dark:hover:bg-muted-700"
                                :class="{
                                    active: sortBy == 'pkmerDownloadCount'
                                }"
                                tooltip="按主题热度"
                                flow="down"
                                @click="sortByPkmerDownloadCount">
                                <span
                                    class="items-center justify-center w-10 h-10 whitespace-pre-wrap flex text-muted-400 group-hover:text-primary-500">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        aria-hidden="true"
                                        role="img"
                                        width="1em"
                                        height="1em"
                                        viewBox="0 0 24 24"
                                        data-icon="material-symbols:whatshot"
                                        class="iconify w-6 h-6 iconify--material-symbols">
                                        <path
                                            fill="currentColor"
                                            d="M12 22q-2.5 0-4.588-1.1T3.95 17.95l4.1-4.1l3 2.5L16 11.4V14h2V8h-6v2h2.6l-3.65 3.65l-3-2.5L2.9 16.2q-.425-.95-.662-2.013T2 12q0-2.075.788-3.9t2.137-3.175q1.35-1.35 3.175-2.137T12 2q2.075 0 3.9.788t3.175 2.137q1.35 1.35 2.138 3.175T22 12q0 2.075-.788 3.9t-2.137 3.175q-1.35 1.35-3.175 2.138T12 22Z"></path></svg
                                ></span>
                            </button>
                        </div>
                        <div class="widget-item">
                            <button
                                :class="{ active: sortBy == 'installed' }"
                                tooltip="筛选已安装主题"
                                flow="down"
                                @click="sortByInstalled"
                                class="items-center flex-1 px-2 font-sans transition-colors duration-300 group md:flex-auto md:flex whitespace-nowrap text-muted-800 dark:text-muted-100 hover:bg-muted-50 dark:hover:bg-muted-700">
                                <span
                                    class="items-center justify-center w-10 h-10 whitespace-pre-wrap flex text-muted-400 group-hover:text-primary-500">
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
                                <span class="num">{{
                                    countInstalledTheme
                                }}</span>
                            </button>
                        </div>

                        <div class="relative w-full">
                            <div class="relative group">
                                <input
                                    type="text"
                                    class="w-full h-8 pl-2 md:pl-16 pr-5 font-sans text-base leading-5 transition-all duration-300 text-muted-600 focus:border-muted-300 focus:shadow-lg focus:shadow-muted-300/50 dark:focus:shadow-muted-800/50 placeholder:text-muted-300 dark:placeholder:text-muted-500 dark:bg-muted-800 dark:text-muted-200 dark:border-muted-700 dark:focus:border-muted-600 tw-accessibility"
                                    placeholder="Search themes..."
                                    @input="handleSetSearchText"
                                    :value="searchTextRef" />
                                <div
                                    class="absolute top-0 left-0 hidden md:flex items-center justify-center w-16 h-8 transition-colors duration-300 text-muted-400 group-focus-within:text-primary-500">
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
                                            <circle
                                                cx="11"
                                                cy="11"
                                                r="8"></circle>
                                            <path d="m21 21l-4.3-4.3"></path>
                                        </g>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="text-right">
            <button
                @click="sortByUpdated"
                v-show="countUpdatedTheme"
                class="inline-block w-full font-sans text-xs px-3 m-1 rounded-lg bg-green-600 text-white shadow-xl shadow-primary-500/20">
                发现 {{ countUpdatedTheme }} 个主题更新！【点我查看】
                <button
                    @click.stop="closeNotification"
                    class="ml-2 px-3 shadow-none">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="1em"
                        height="1em"
                        viewBox="0 0 32 32">
                        <path
                            fill="white"
                            d="M16 2C8.2 2 2 8.2 2 16s6.2 14 14 14s14-6.2 14-14S23.8 2 16 2m5.4 21L16 17.6L10.6 23L9 21.4l5.4-5.4L9 10.6L10.6 9l5.4 5.4L21.4 9l1.6 1.6l-5.4 5.4l5.4 5.4z" />
                    </svg>
                </button>
            </button>
        </div>
        <section class="w-full bg-muted-100 dark:bg-muted-1000">
            <div class="w-full max-w-7xl mx-auto">
                <!-- ThemeToolbar-->

                <!--main -->
                <div class="w-full flex items-center overflow-hidden">
                    <!--Content-->
                    <div
                        class="w-full h-full flex flex-col justify-between md:px-6 pb-16 pt-4">
                        <!--Search-->
                        <div
                            class="w-full max-w-[90vw] mx-auto space-y-4 text-center">
                            <!--Categories-->
                            <ThemeToolbar
                                :active-category.sync="activeCategory"
                                :themeList="validThemeList"
                                @update-active-category="
                                    handleUpdateActiveCategory
                                ">
                            </ThemeToolbar>
                        </div>

                        <!--Blog content-->

                        <div class="flex flex-col gap-12 py-12">
                            <!--Articles grid-->

                            <div
                                class="grid gap-6 -m-3 ptablet:grid-cols-2 ltablet:grid-cols-3 lg:grid-cols-3"
                                :class="{
                                    '!grid-cols-1':
                                        pkmerSize <= 768 && pkmerSize > 0,
                                    '!grid-cols-2':
                                        pkmerSize > 768 && pkmerSize < 1024,
                                    '!grid-cols-3': pkmerSize > 1024
                                }">
                                <!--Article-->

                                <!-- <div
									v-show="
										activeCategory === 'all' ||
										ThemeInfo.tags.includes(activeCategory)
									"
									v-for="(ThemeInfo, index) in displayedThemes"
									:key="ThemeInfo.name + index"
								>
									<ThemeCard :plugin-info="ThemeInfo"> </ThemeCard>
								</div> -->

                                <div
                                    v-for="theme in displayedThemes"
                                    :key="theme.id">
                                    <ThemeCard
                                        :app="props.app"
                                        :theme-info="theme"
                                        :isLogin="isUserLogin"
                                        @download-update-theme="
                                            handleShowThemeModal
                                        ">
                                    </ThemeCard>
                                    <!-- 显示其他主题信息 -->
                                </div>
                                <!--Article-->
                            </div>

                            <!--Articles grid-->
                            <div class="flex items-center justify-center w-full p-6 -m-3">
                                <!-- 分页导航 -->
                                <div class="flex items-center justify-center w-full mb-4">
                                    <div class="flex space-x-2">
                                        <button 
                                            v-if="currentPage > 1"
                                            @click="handlePageChange(currentPage - 1)" 
                                            class="px-3 py-1 border rounded hover:bg-gray-100 dark:hover:bg-muted-700">
                                            上一页
                                        </button>
                                        
                                        <span class="flex items-center px-3 py-1">
                                            第 {{ currentPage }} 页 / 共 {{ computedTotalPages }} 页
                                        </span>
                                        
                                        <button 
                                            v-if="currentPage < computedTotalPages"
                                            @click="handlePageChange(currentPage + 1)" 
                                            class="px-3 py-1 border rounded hover:bg-gray-100 dark:hover:bg-muted-700">
                                            下一页
                                        </button>
                                    </div>
                                </div>
                                
                                <!-- <div class="w-full max-w-[210px] pt-16" v-if="showReadMoreButton">
                                    <button
                                        @click="readMore"
                                        class="relative inline-flex items-center justify-center w-full gap-2 px-6 py-4 font-sans font-semibold transition-all duration-300 border rounded-lg dark:bg-muted-700 text-muted-800 dark:text-white border-muted-300 dark:border-muted-600 tw-accessibility hover:shadow-xl hover:shadow-muted-400/20">
                                        <div>加载更多</div>
                                    </button>
                                </div> -->
                            </div>

                            <!-- 加载指示器 -->
                            <div v-if="isLoading" class="flex justify-center items-center py-10">
                                <div class="w-12 h-12 border-4 border-t-4 border-gray-200 rounded-full animate-spin dark:border-gray-700 dark:border-t-primary-500"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!--End Layout-->
    </main>

    <!-- Modal plugin-->
    <div
        class="fixed inset-0 z-30 flex items-center justify-center overflow-auto bg-black bg-opacity-50"
        v-show="showModal">
        <!-- Modal inner -->
        <div
            class="max-w-3xl px-6 py-4 mx-auto text-left bg-white rounded shadow-lg dark:bg-muted-700"
            @click.away="hideModal"
            x-transition:enter="motion-safe:ease-out duration-300"
            x-transition:enter-start="opacity-0 scale-90"
            x-transition:enter-end="opacity-100 scale-100">
            <!-- Title / Close-->
            <div class="flex items-center justify-between">
                <h5 class="mr-3 max-w-none"></h5>

                <button
                    type="button"
                    class="z-50 cursor-pointer"
                    @click="hideModal">
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
                <div class="container md:px-5 py-4 mx-auto">
                    <h3
                        class="text-2xl font-medium title-font text-center mb-6">
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
                        即将安装....{{ selectTheme.toUpperCase() }}
                    </h3>
                    <div>
                        <p class="mb-4 text-base leading-relaxed">
                            注意，安装和更新操作不可逆，请确认后再操作。
                        </p>
                    </div>

                    <div
                        class="block md:flex flex-wrap sm:-m-4 -mx-4 md:-mb-10 md:-mt-4 md:space-y-0">
                        <div class="md:p-4 md:w-1/2 flex">
                            <div class="flex-grow">
                                <h2
                                    v-if="isDownload"
                                    @click="handleDownloadTheme"
                                    class="block py-4 my-1 font-sans text-base font-medium text-center text-green-500 transition-all duration-300 border rounded-lg cursor-pointer dark:hover:bg-green-300/20 hover:bg-green-100 border-green-700/25">
                                    确 认
                                </h2>
                                <h2
                                    v-else
                                    @click="handleUpdateTheme"
                                    class="block py-4 my-1 font-sans text-base font-medium text-center text-green-500 transition-all duration-300 border rounded-lg cursor-pointer dark:hover:bg-green-300/20 hover:bg-green-100 border-green-700/25">
                                    更 新
                                </h2>
                            </div>
                        </div>
                        <div class="md:p-4 md:w-1/2 flex">
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
.num {
    margin-left: -8px;
    margin-top: -16px;
    font-size: 9px;
    color: #fff;
    background: #ed4014;
    text-align: center;
    border-radius: 10px;
    padding: 0 4px;
}
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

button.active span {
    color: rgb(208, 111, 78);
}
button.active .num {
    color: rgb(239, 166, 142);
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
</style>
