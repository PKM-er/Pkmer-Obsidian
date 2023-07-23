<!--
 * @Author: cumany cuman@qq.com
 * @Date: 2023-02-23 17:17:12
 * @LastEditors: cumany cuman@qq.com
 * @LastEditTime: 2023-07-20 19:27:38
 * @FilePath: \pkmer-docs\src\components\Widget\WidgetCard.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<script setup lang="ts">
import type { PluginInfo } from '@/types/plugin';

interface Props {
	pluginInfo: PluginInfo;
}
const prop = defineProps<Props>();
defineEmits(['download-update-plugin']);
function getUsernameFromRepo() {
	if (prop.pluginInfo.authorAvatar && prop.pluginInfo.authorAvatar.length > 0) {
		// let regex = /^([^\/]*)\//;
		// let usernameMatch = repo.match(regex);
		// return usernameMatch ? usernameMatch[1] : null;
		return prop.pluginInfo.authorAvatar;
	} else return getDefaultAvata(prop.pluginInfo.author);
}

// let url = prop.pluginInfo.url ?? '';
// let regex = /https:\/\/github\.com\/(.*)\//;

// let usernameMatch = url.match(regex);
// let username = usernameMatch ? usernameMatch[1] : null;


let tags: string[] = [];
if (prop.pluginInfo.tags && prop.pluginInfo.tags.length > 0) {
	tags = prop.pluginInfo.tags.split(',');
}



 
// function formatDate(timestamp: string) {
// 	if (timestamp) {
// 		// 创建 Date 对象并格式化日期
// 		const date = new Date(timestamp);
// 		const year = date.getFullYear();
// 		const month = date.getMonth() + 1;
// 		const day = date.getDate();
// 		const formattedDate = `${month}月${day}, ${year}`;
// 		return formattedDate;
// 	} else return ' - - -';
// }
function formatNumber(num: number) {
	// 转换数字
	if (num >= 1000000) {
		return (num / 1000000).toFixed(0) + 'M';
	} else if (num >= 1000) {
		return (num / 1000).toFixed(0) + 'K';
	} else {
		return num.toString();
	}
}

function diffDays(timestamp: string) {
	// 计算距离今天多少天，并转化为月份和年份
	if (timestamp) {
		const date = new Date(timestamp);
		const today = new Date();
		const oneDay = 24 * 60 * 60 * 1000; // 一天的毫秒数
		const daysDiff = Math.round(Math.abs((today.getTime() - date.getTime()) / oneDay));
		const monthsDiff = Math.round(daysDiff / 30);
		const yearsDiff = Math.round(daysDiff / 365);

		// 根据时间差决定显示文字
		if (daysDiff <= 30) {
			return `${daysDiff}天前`;
		} else if (monthsDiff <= 12) {
			return `${monthsDiff}月前`;
		} else {
			return `${yearsDiff}年前`;
		}
	} else {
		return `未知`;
	}
}
//名称的首字母大写
function getInitials(name: string) {
	let initials = name.match(/\b\w/g) || [];
	return initials.join('').toUpperCase();
}
function getDefaultAvata(name: string) {
	let url = '';
	if (name) {
		//用户首字头像
		const firstChar = getInitials(name);
		if (/^[a-zA-Z]+$/.test(firstChar)) {
			url = `https://dummyimage.com/100x100/555/fff&text=${firstChar.toUpperCase()}`;
		} else {
			url = `https://dummyimage.com/100x100/555/ffff&text=${encodeURIComponent(firstChar)}`;
		}
	} else url = `https://cdn.pkmer.cn/covers/logo.png!nomark`;
	return url;
}
function generateRatingStars(rating: number) {
	const fullStar = '<i class="w-4 h-4 text-yellow-400 iconify" data-icon="mingcute:star-fill"></i>';
	const halfStar = '<i class="w-4 h-4 text-yellow-400 iconify" data-icon="mingcute:star-half-fill"></i>';
	const emptyStar = '<i class="w-4 h-4 text-yellow-400 iconify" data-icon="mingcute:star-line"></i>';

	let stars = '';
	const fullStarsCount = Math.floor(rating);
	const hasHalfStar = rating % 1 !== 0;

	for (let i = 0; i < fullStarsCount; i++) {
		stars += fullStar;
	}

	if (hasHalfStar) {
		stars += halfStar;
	}

	const emptyStarsCount = 5 - Math.ceil(rating);

	for (let i = 0; i < emptyStarsCount; i++) {
		stars += emptyStar;
	}

	return stars;
}


const getRadomImage = () => {
	const url = `/img/cover/${Math.floor(Math.random() * 11)}.jpg`;

	return `background-image:url(${url});`;
};
</script>
<template>
	<div class="relative h-[430px]">
		<div class="flex flex-col items-start h-full gap-4 p-6">
			<!--Article content-->
			<div class="relative w-full space-y-2">
				<!--Article image-->
				<div class="relative">
					<!--Badge-->
					<span
						class="absolute top-3 left-3 inline-block font-sans text-xs py-1.5 px-3 m-1 rounded-lg bg-primary-500 text-white shadow-xl shadow-primary-500/20">
						{{ tags[0] }}
					</span>

					<view class="mark" v-show="pluginInfo.contentUrl">
						<span class="learn">Tips </span>
					</view>
					<!--Featured image-->

					<div v-show="!pluginInfo.banner" class="noimg" :data-name="pluginInfo.name" :style="getRadomImage()" />

					<img v-show="pluginInfo.banner" class="object-cover w-full h-52 rounded-xl" :src="pluginInfo.banner ? pluginInfo.banner : ''" :alt="pluginInfo.name"
						width="348" height="208"
						onerror="javascript:this.src='https://cdn.pkmer.cn/covers/pkmer2.png!nomark';this.οnerrοr=null;" />
				</div>
				<!--Title-->
				<h3 data-pagefind-meta="title"
					class="flex items-center text-lg font-medium leading-6 plugin_name font-heading text-muted-800 dark:text-white">
					{{ pluginInfo.name }}
					<img class="ml-2 -mt-2" alt="version"
						:src="`https://img.shields.io/badge/${pluginInfo.version}-brightgreen`" />
					<a class="absolute right-2"  :href="pluginInfo.contentUrl ? pluginInfo.contentUrl : 'javascript:void(0)'" v-show="pluginInfo.contentUrl">
						<span class="  text-white  font-sans text-xs py-1.5 px-3 m-1 rounded-lg bg-yellow-500 ">
							教程
						</span>
					</a>
				</h3>
				<p class="leading-6 text-muted-600 dark:text-muted-400">
					<img class="" alt="GitHub stars"
						:src="`https://img.shields.io/github/stars/${pluginInfo.repo}?style=plastic&color=4F46E5&label=关注量`" />

					<img class="ml-2" alt="下载数量" :src="`https://img.shields.io/badge/下载总数-${formatNumber(
						pluginInfo.downloadCount
					)}-yellow`" />
				<div class="inline-block float-right mr-2">
					<span v-html="generateRatingStars(pluginInfo.score ? pluginInfo.score : 0)" />


				</div>
				</p>
				<p class="plugin_desc text-base mt-auto min-h-[3rem] text-muted-600 dark:text-muted-400 leading-6">
					{{
						pluginInfo.chineseDescription?.replace('【机翻】', '') ||
						pluginInfo.description
					}}
				</p>
			</div>
			<!--Article meta-->
			<div class="w-full mt-auto space-y-6">
				<div class="relative flex items-center justify-start w-full">
					<img class="w-12 mask mask-blob" :src="getUsernameFromRepo()"
						:onerror="`javascript:this.src='${getDefaultAvata(pluginInfo.author)}'`" alt="avatar" />
					<a :href="'https://github.com/' + pluginInfo.repo">
						<div class="pl-2">
							<h3 class="whitespace-nowrap text-ellipsis overflow-hidden max-w-[140px] font-heading font-medium text-muted-800 dark:text-muted-50"
								:tooltip="pluginInfo.author">
								{{ pluginInfo.author }}
							</h3>

							<p class="font-sans text-sm text-muted-400">
								{{ diffDays(pluginInfo.pluginUpdatedTime) }}
							</p>
						</div>
					</a>
					<div class="block ml-auto font-sans text-sm text-muted-400">
						<button
                            v-if="!pluginInfo.isInstalled"
							class="inline-flex items-center px-5 py-2 text-white transition-colors duration-300 border-0 rounded shadow-xl whitespace-nowrap bg-primary-500 hover:bg-primary-600 shadow-primary-500/20 tw-accessibility"
							@click="$emit('download-update-plugin','download',pluginInfo.id)">
							<i class="block w-4 h-4 mx-auto iconify" data-icon="line-md:cloud-download-outline-loop"></i>
							下载
						</button>
						<button
                            v-else-if="pluginInfo.isInstalled && pluginInfo.isOutdated"
							class="inline-flex items-center px-5 py-2 text-white transition-colors duration-300 border-0 rounded shadow-xl whitespace-nowrap bg-primary-500 hover:bg-primary-600 shadow-primary-500/20 tw-accessibility"
							@click="$emit('download-update-plugin', 'update', pluginInfo.id)">
							<i class="block w-4 h-4 mx-auto iconify" data-icon="line-md:cloud-download-outline-loop"></i>
							更新
						</button>
                        <button
                            v-else
                            class="inline-flex items-center px-5 py-2 text-white transition-colors duration-300 border-0 rounded shadow-xl whitespace-nowrap bg-primary-500 hover:bg-primary-600 shadow-primary-500/20 tw-accessibility"
                            >
                            <i class="block w-4 h-4 mx-auto iconify" data-icon="line-md:cloud-download-outline-loop"></i>
                            已安装
                        </button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<style scoped>
.noimg {
	display: flex;
	height: 208px;
	background-color: var(--theme-bg);
	border-radius: 0.75rem;
	font-size: 24px;
	font-weight: bold;
	align-items: center;
	justify-content: center;
	text-align: center;
	background: 50% 50% / cover;
	filter: saturate(70%) contrast(85%);
	box-shadow: rgba(50, 50, 93, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -8px;
}

.noimg::before {
	color: white;
	content: attr(data-name);
	/* 设置标题文字 */
	display: block;
	/* 将标题设置为块级元素 */
	font-size: 28px;
	/* 设置标题文字大小 */
	margin-bottom: 20px;
	/* 设置标题与内容的间距 */
	text-shadow: 0 2px 2px #000;
}

.plugin_desc {
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
}

.mark {
	position: absolute;
	top: 0;
	right: 0;
	margin: 0;
}

.mark:before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	border-style: solid;
	border-width: 40px;
	z-index: 1;
	border-color: rgba(206, 118, 3, 0.7) rgba(206, 118, 3, 0.7) transparent transparent;
	transform: translateX(-100%);
	border-top-right-radius: 0.75rem;
}

.learn {
	-moz-transform: rotate(0deg) translateX(-100%) translateZ(0);
	-ms-transform: rotate(0deg) translateX(-100%) translateZ(0);
	-o-transform: rotate(0deg) translateX(-100%) translateZ(0);
	-webkit-transform: rotate(0deg) translateX(-100%) translateZ(0);
	transform: rotate(0deg) translateX(-100%) translateZ(0);
	color: #fff;
	display: inline-block;
	position: absolute;
	top: 10px;
	/* left: 0; */
	z-index: 1;

	text-transform: uppercase;
	width: 50px;
	text-align: center;
}
</style>
