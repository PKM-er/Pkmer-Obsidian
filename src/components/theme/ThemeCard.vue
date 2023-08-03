<!--
 * @Author: cumany cuman@qq.com
 * @Date: 2023-02-23 17:17:12
 * @LastEditors: cumany cuman@qq.com
 * @LastEditTime: 2023-08-03 10:54:21
 * @FilePath: \pkmer-docs\src\components\Widget\WidgetCard.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<script setup lang="ts">
import { ref } from 'vue';
import type { ThemeInfo } from '@/types/theme';
interface Props {
	themeInfo: ThemeInfo;
	isLogin:boolean;
}
const prop = defineProps<Props>();
	const isUserLogin =prop.isLogin;

defineEmits(['download-theme-update']);
function getUsernameFromRepo() {
	if (prop.themeInfo.authorAvatar && prop.themeInfo.authorAvatar.length > 0) {
		// let regex = /^([^\/]*)\//;
		// let usernameMatch = repo.match(regex);
		// return usernameMatch ? usernameMatch[1] : null;
		return prop.themeInfo.authorAvatar;
	} else return getDefaultAvata(prop.themeInfo.author);
}
 

const  showImage=ref(false);
// let url = prop.themeInfo.url ?? '';
// let regex = /https:\/\/github\.com\/(.*)\//;

// let usernameMatch = url.match(regex);
// let username = usernameMatch ? usernameMatch[1] : null;


let tags: string[] = [];
if (prop.themeInfo.tags && prop.themeInfo.tags.length > 0) {
	tags = prop.themeInfo.tags.split(',');
}


function formatNumber(num:number) {
	// 转换数字
	if (num >= 1000000) {
		return (num / 1000000).toFixed(0) + 'M';
	} else if (num >= 1000) {
		return (num / 1000).toFixed(0) + 'K';
	} else {
		return num.toString();
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
	const fullStar = '<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="1em" height="1em" viewBox="0 0 24 24" data-icon="mingcute:star-fill" class="w-4 h-4 text-yellow-400 iconify iconify--mingcute"><g fill="none"><path d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z"></path><path fill="currentColor" d="M10.92 2.868a1.25 1.25 0 0 1 2.16 0l2.795 4.798l5.428 1.176a1.25 1.25 0 0 1 .667 2.054l-3.7 4.141l.56 5.525a1.25 1.25 0 0 1-1.748 1.27L12 19.592l-5.082 2.24a1.25 1.25 0 0 1-1.748-1.27l.56-5.525l-3.7-4.14a1.25 1.25 0 0 1 .667-2.055l5.428-1.176l2.795-4.798Z"></path></g></svg>';
	const halfStar = '<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="1em" height="1em" viewBox="0 0 24 24" data-icon="mingcute:star-half-fill" class="w-4 h-4 text-yellow-400 iconify iconify--mingcute"><g fill="none" fill-rule="evenodd"><path d="M24 0v24H0V0h24ZM12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036c-.01-.003-.019 0-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.016-.018Zm.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01l-.184-.092Z"/><path fill="currentColor" d="M13.08 2.868a1.25 1.25 0 0 0-2.16 0L8.126 7.665L2.697 8.842a1.25 1.25 0 0 0-.667 2.054l3.7 4.141l-.56 5.525a1.25 1.25 0 0 0 1.748 1.27L12 19.592l5.082 2.24a1.25 1.25 0 0 0 1.748-1.27l-.56-5.525l3.7-4.14a1.25 1.25 0 0 0-.667-2.055l-5.428-1.176l-2.795-4.798ZM12 17.523c.172 0 .344.035.504.106l4.206 1.854l-.463-4.573a1.25 1.25 0 0 1 .312-.959l3.062-3.427l-4.492-.973a1.25 1.25 0 0 1-.816-.592L12 4.987v12.536Z"/></g></svg>';
	const emptyStar = '<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="1em" height="1em" viewBox="0 0 24 24" data-icon="mingcute:star-line" class="w-4 h-4 text-yellow-400 iconify iconify--mingcute"><g fill="none" fill-rule="evenodd"><path d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z"></path><path fill="currentColor" d="M10.92 2.868a1.25 1.25 0 0 1 2.16 0l2.795 4.798l5.428 1.176a1.25 1.25 0 0 1 .667 2.054l-3.7 4.141l.56 5.525a1.25 1.25 0 0 1-1.748 1.27L12 19.592l-5.082 2.24a1.25 1.25 0 0 1-1.748-1.27l.56-5.525l-3.7-4.14a1.25 1.25 0 0 1 .667-2.055l5.428-1.176l2.795-4.798ZM12 4.987L9.687 8.959a1.25 1.25 0 0 1-.816.592l-4.492.973l3.062 3.427c.234.262.347.61.312.959l-.463 4.573l4.206-1.854a1.25 1.25 0 0 1 1.008 0l4.206 1.854l-.463-4.573a1.25 1.25 0 0 1 .311-.959l3.063-3.427l-4.492-.973a1.25 1.25 0 0 1-.816-.592L12 4.987Z"></path></g></svg>';

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
	const url = `https://pkmer.cn/img/cover/${Math.floor(Math.random() * 11)}.jpg`;

	return `background-image:url(${url});`;
};
</script>
<template>
	<div class="relative">
		<div class="h-full flex flex-col items-start gap-4 p-6">
			<!--Article content-->
			<div class="relative w-full space-y-2">
				<!--Article image-->
				<div class="relative">
					<!--Badge-->
					<span v-show="tags[0]"
						class="absolute top-3 left-3 inline-block font-sans text-xs py-1.5 px-3 m-1 rounded-lg bg-primary-500 text-white shadow-xl shadow-primary-500/20">
						{{ tags[0] }}
					</span>

					<view class="mark" v-show="themeInfo.contentUrl">
						<span class="learn">Tips </span>
					</view>
					<!--Featured image-->

					<div v-show="!themeInfo.banner" class="noimg" :data-name="themeInfo.name" :style="getRadomImage()" />

					<img v-show="themeInfo.banner" class="w-full h-52 object-contain aspect-video rounded-xl cursor-pointer"
						:src="themeInfo.banner?.replace('gif!pkmer', 'gif').replace('!pkmer', '!nomark')"
						:alt="themeInfo.name" width="348" height="208"
						onerror="javascript:this.src='https://cdn.pkmer.cn/covers/pkmer2.png!nomark';this.οnerrοr=null;" @click="showImage = true" />
					<div v-if="showImage" class="overlay" @click="showImage = false">
						<img :src="themeInfo.banner?.replace('!nomark','!pkmer')" alt="原图" @click.stop />
					</div>
				</div>
				<!--Title-->
				<div class="plugin_name relative flex items-center h-10 overflow-hidden">
					<h3 data-pagefind-meta="title"
						class="flex items-center font-heading text-lg font-medium text-muted-800 dark:text-white leading-6">
						{{ themeInfo.name }}
						<img class="-mt-2 ml-2" alt="version"
							:src="`https://img.shields.io/badge/${themeInfo.version}-brightgreen`" />

					</h3>
				</div>
				<p class="flex items-center flex-wrap leading-6 text-muted-600 dark:text-muted-400">
					<img class="h-ful" alt="GitHub stars"
						:src="`https://img.shields.io/github/stars/${themeInfo.repo}?style=plastic&color=4F46E5&label=关注量`" />

					<img class="h-ful ml-2" alt="下载数量" :src="`https://img.shields.io/badge/下载总数-${formatNumber(
						themeInfo.downloadCount
					)}-yellow`" />
					<a class=" ml-2" :href="themeInfo.contentUrl ? themeInfo.contentUrl : 'javascript:void(0)'"
						:class="{ 'visible': themeInfo.contentUrl, 'invisible': !themeInfo.contentUrl }"> <span
							class="  text-white  font-sans text-xs py-1 px-3 m-1 rounded-lg bg-yellow-500 ">
							教程
						</span>
					</a>
				<div class="inline-block w-full  mr-2">
					<span v-html="generateRatingStars(themeInfo.score?themeInfo.score:0)" />


				</div>
				</p>
				<p v-show="themeInfo.description"
					class="plugin_desc text-base mt-auto min-h-[3rem] text-muted-600 dark:text-muted-400 leading-6">
					{{
						themeInfo.chineseDescription?.replace('【机翻】', '') ||
						themeInfo.description
					}}
				</p>
			</div>
			<!--Article meta-->
			<div class="w-full mt-auto space-y-6">
				<div class="flex items-center justify-start w-full relative">
					<img class="w-12 mask mask-blob" :src="getUsernameFromRepo()"
						:onerror="`javascript:this.src='${getDefaultAvata(themeInfo.author)}'`" alt="avatar" />
					<a :href="'https://github.com/' + themeInfo.repo">
						<div class="pl-2">
							<h3 class="whitespace-nowrap text-ellipsis overflow-hidden max-w-[140px] font-heading font-medium text-muted-800 dark:text-muted-50"
								:tooltip="themeInfo.author">
								{{ themeInfo.author }}
							</h3>

							<!-- <p class="font-sans text-sm text-muted-400">
								{{ diffDays(themeInfo.updatedTime) }}
							</p> -->
						</div>
					</a>
					<div class="block ml-auto font-sans text-sm text-muted-400">
						<button v-show="!isUserLogin"
							class="inline-flex items-center px-5 py-2 text-white transition-colors duration-300 border-0 rounded shadow-xl whitespace-nowrap bg-primary-500 hover:bg-primary-600 shadow-primary-500/20 tw-accessibility"
							>
							请登录
						</button>

						<div  v-show="isUserLogin">
						<button
							v-show="isUserLogin"
                            v-if="!themeInfo.isInstalled"
							class="inline-flex items-center px-5 py-2 text-white transition-colors duration-300 border-0 rounded shadow-xl whitespace-nowrap bg-primary-500 hover:bg-primary-600 shadow-primary-500/20 tw-accessibility"
							@click="$emit('download-update-theme','download',themeInfo.name, themeInfo.version)">
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
							下载
						</button>
						<button
                            v-else-if="themeInfo.isInstalled && themeInfo.isOutdated"
							class="inline-flex items-center px-5 py-2 text-white transition-colors duration-300 border-0 rounded shadow-xl whitespace-nowrap bg-primary-500 hover:bg-primary-600 shadow-primary-500/20 tw-accessibility"
							@click="$emit('download-update-theme', 'update', themeInfo.name, themeInfo.version)">
							<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="1em" height="1em" viewBox="0 0 20 20" data-v-5ade68da="" data-icon="dashicons:update" class="block w-4 h-4 mx-auto iconify iconify--dashicons"><path fill="currentColor" d="M10.2 3.28c3.53 0 6.43 2.61 6.92 6h2.08l-3.5 4l-3.5-4h2.32a4.439 4.439 0 0 0-4.32-3.45c-1.45 0-2.73.71-3.54 1.78L4.95 5.66a6.965 6.965 0 0 1 5.25-2.38zm-.4 13.44c-3.52 0-6.43-2.61-6.92-6H.8l3.5-4c1.17 1.33 2.33 2.67 3.5 4H5.48a4.439 4.439 0 0 0 4.32 3.45c1.45 0 2.73-.71 3.54-1.78l1.71 1.95a6.95 6.95 0 0 1-5.25 2.38z"></path></svg>
							更新
						</button>
                        <button
                            v-else
                            class="inline-flex items-center px-5 py-2 text-white transition-colors duration-300 border-0 rounded shadow-xl whitespace-nowrap bg-primary-500 hover:bg-primary-600 shadow-primary-500/20 tw-accessibility"
                            >
                            <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="1em" height="1em" viewBox="0 0 48 48" data-v-5ade68da="" data-icon="icon-park-outline:link-cloud-sucess" class="block w-4 h-4 mx-auto iconify iconify--icon-park-outline"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4"><path d="M12 33c-3.333 0-8-1.5-8-7.5c0-7 7-8.5 9-8.5c1-3.5 3-9 11-9c7 0 10 4 11 7.5c0 0 9 1 9 9.5c0 6-4 8-8 8"></path><path d="m18 33l6 5l8-10"></path></g></svg>
							 已安装
                        </button>
					</div>
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
.overlay {
	z-index: 50;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
}

.overlay img{
    min-width: 60vw;
    max-width: 80%;
    max-height: 80%;
    object-fit: contain;
}
</style>
