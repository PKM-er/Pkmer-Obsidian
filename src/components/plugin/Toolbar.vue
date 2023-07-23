<!--
 * @Author: cumany cuman@qq.com
 * @Date: 2023-06-22 13:17:46
 * @LastEditors: cumany cuman@qq.com
 * @LastEditTime: 2023-07-23 22:27:21
 * @Description: 
-->
<script setup lang="ts">
import { computed } from "vue"
import type { PluginInfo } from "@/types/plugin"
interface Props {
    pluginList: PluginInfo[]
    activeCategory: string
}

const props = defineProps<Props>()

defineEmits(["update-active-category"])

const categories = computed(() => {
    let tagsArray: string[] = []
    if (Array.isArray(props.pluginList)) {
        props.pluginList.forEach((obj) => {
            if (obj.tags && typeof obj.tags === "string") {
                let tags = obj.tags.split(",").map((tag) => tag.trim())
                tags = tags.filter((tag) => tag !== "") // 过滤掉空字符串
                if (tags.length > 0) {
                    tagsArray.push(tags[0])
                }
            }
        })
    }
    return tagsArray
})

const uniqueCategories = computed(() => {
    return Array.from(new Set(categories.value))
})
</script>
<template>
    <div class="relative flex flex-wrap justify-center w-full gap-2">
        <button
            class="inline-flex items-center justify-center px-4 py-2 font-sans text-sm transition-colors duration-300 rounded-lg bg-muted-200 dark:bg-muted-800 text-muted-500 hover:bg-muted-300 dark:hover:bg-muted-700 dark:hover:text-muted-200 tw-accessibility"
            :class="
                activeCategory === 'all'
                    ? 'border-primary-500 bg-muted-50 dark:bg-muted-700'
                    : 'border-transparent '
            "
            @click="$emit('update-active-category', 'all')">
            All
        </button>
        <div
            class="plugin-item"
            v-for="category in uniqueCategories"
            :key="category">
            <button
                class="inline-flex items-center justify-center flex-1 px-4 py-2 font-sans text-sm transition-colors duration-300 rounded-lg bg-muted-200 dark:bg-muted-800 text-muted-500 hover:bg-muted-300 dark:hover:bg-muted-700 dark:hover:text-muted-200 tw-accessibility"
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
</template>
