<!--
 * @Author: cumany cuman@qq.com
 * @Date: 2023-06-22 13:17:46
 * @LastEditors: cumany cuman@qq.com
 * @LastEditTime: 2023-09-09 11:46:53
 * @Description: 
-->
<script setup lang="ts">
import { ref } from "vue"
import type { PluginInfo } from "@/types/plugin"
interface Props {
    pluginList: PluginInfo[]
    pluginTags:string[]
    activeCategory: string
}

const props = defineProps<Props>()

defineEmits(["update-active-category"])
const showCategories = ref(false)
// const categories = computed(() => {
//     let tagsArray: string[] = []
//     if (Array.isArray(props.pluginList)) {
//         props.pluginList.forEach((obj) => {
//             if (obj.tags && typeof obj.tags === "string") {
//                 let tags = obj.tags.split(",").map((tag) => tag.trim())
//                 tags = tags.filter((tag) => tag !== "") // 过滤掉空字符串
//                 if (tags.length > 0) {
//                     tagsArray.push(tags[0])
//                 }
//             }
//         })
//     }
//     return tagsArray
// })

// const uniqueCategories = computed(() => {
//     return Array.from(new Set(categories.value))
// })
const IsShowCategories = () => {
    showCategories.value = !showCategories.value
}
</script>
<template>
    <div class="relative flex flex-wrap justify-center w-full gap-2">
        <button
            class="inline-flex items-center border-2 shadow-md justify-center px-4 py-2 font-sans text-sm transition-colors duration-300 rounded-lg bg-muted-200 dark:bg-muted-800 text-muted-500 hover:bg-muted-300 dark:hover:bg-muted-700 dark:hover:text-muted-200 tw-accessibility"
            :class="
                activeCategory === 'all'
                    ? 'border-primary-500 bg-muted-50 dark:bg-muted-700'
                    : 'border-transparent '
            "
            @click="$emit('update-active-category', 'all')">
            All
        </button>
        <button
            class="inline-flex w-full items-center  shadow-md justify-center px-4 py-2 font-sans text-sm transition-colors duration-300 rounded-lg bg-muted-200 dark:bg-muted-800 text-muted-500 hover:bg-muted-300 dark:hover:bg-muted-700 dark:hover:text-muted-200 tw-accessibility"
            @click="IsShowCategories">
            按分类筛选 ⇣
        </button>
        <div
            class="relative flex flex-wrap justify-center w-full gap-2"
            v-show="showCategories">
            <div
                class="plugin-item"
                v-for="category in props.pluginTags"
                :key="category">
                <button
                    class="h-6 inline-flex items-center border-2 shadow-md justify-center flex-1 px-4 py-2 font-sans text-sm transition-colors duration-300 rounded-lg bg-muted-200 dark:bg-muted-800 text-muted-500 hover:bg-muted-300 dark:hover:bg-muted-700 dark:hover:text-muted-200 tw-accessibility"
                    :class="
                        activeCategory === category
                            ? 'border-primary-500 bg-muted-50 dark:bg-muted-700'
                            : 'border-transparent'
                    "
                    @click="
                        () => {
                            $emit('update-active-category', category)
                        }
                    ">
                    {{ category }}
                </button>
            </div>
        </div>
    </div>
</template>
