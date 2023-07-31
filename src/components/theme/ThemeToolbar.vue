<!--
 * @Author: cumany cuman@qq.com
 * @Date: 2023-06-22 13:17:46
 * @LastEditors: cumany cuman@qq.com
 * @LastEditTime: 2023-07-31 10:03:18
 * @Description: 
-->
<script setup lang="ts">
import { computed } from 'vue';
import type { ThemeInfo } from '@/types/theme';
interface Props {
	themeList: ThemeInfo[];
	activeCategory: string;
}

const props = defineProps<Props>();

defineEmits(['update-active-category']);

let tagsArray: string[] = []
const categories = computed(() => {
	if (Array.isArray(props.themeList)) {
		props.themeList.forEach((obj) => {
			if (obj.tags && typeof obj.tags === 'string') {
				let tags = obj.tags.split(',').map((tag) => tag.trim());
				tags = tags.filter((tag) => tag !== ''); // 过滤掉空字符串
				if (tags.length > 0) {
					tagsArray.push(tags[0]);
				}
			}
		});
	}

	let cateArray: string[] = []
	if (Array.isArray(props.themeList)) {
		props.themeList.forEach((obj) => {
			if (obj.modes && typeof obj.modes === 'string') {
				let modes = obj.modes.split(',').map((mode) => mode.trim());
				modes = modes.filter((mode) => mode !== ''); // 过滤掉空字符串
				if (modes.length > 0) {
					cateArray.push(modes[0]);
				}
			}
		});
	}
	return tagsArray.concat(cateArray);
});

const uniqueCategories = computed(() => {
	return Array.from(new Set(categories.value));
});
</script>
<template>
	<div class="relative w-full flex justify-center gap-2 flex-wrap">
		<button
			class="inline-flex justify-center items-center py-2 px-4 font-sans text-sm rounded-lg bg-muted-200 dark:bg-muted-800 text-muted-500 hover:bg-muted-300 dark:hover:bg-muted-700 dark:hover:text-muted-200 border-2 transition-colors duration-300 tw-accessibility"
			:class="
				activeCategory === 'all'
					? 'border-primary-500 bg-muted-50 dark:bg-muted-700'
					: 'border-transparent '
			"
			@click="$emit('update-active-category', 'all')"
		>
			All
		</button>
		<div class="plugin-item" v-for="category in uniqueCategories" :key="category">
			<button
				class="flex-1 inline-flex justify-center items-center py-2 px-4 font-sans text-sm rounded-lg bg-muted-200 dark:bg-muted-800 text-muted-500 hover:bg-muted-300 dark:hover:bg-muted-700 dark:hover:text-muted-200 border-2 transition-colors duration-300 tw-accessibility"
				:class="
					activeCategory === category
						? 'border-primary-500 bg-muted-50 dark:bg-muted-700'
						: 'border-transparent'
				"
				@click="
					(e) => {
						$emit('update-active-category', category);
					}
				"
			>
				{{ category }}
			</button>
		</div>
	</div>
</template>
