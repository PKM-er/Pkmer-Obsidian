<!--
 * @Author: cumany cuman@qq.com
 * @Date: 2023-02-23 17:17:12
 * @LastEditors: cumany cuman@qq.com
 * @LastEditTime: 2023-07-31 14:31:07
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


function formatNumber(num) {
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
	const fullStar = '<i class="iconify w-4 h-4 text-yellow-400" data-icon="mingcute:star-fill"></i>';
	const halfStar = '<i class="iconify w-4 h-4 text-yellow-400" data-icon="mingcute:star-half-fill"></i>';
	const emptyStar = '<i class="iconify w-4 h-4 text-yellow-400" data-icon="mingcute:star-line"></i>';

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
				<div class="inline-block float-right mr-2">
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
					<img class="w-12 mask mask-blob" :src="getUsernameFromRepo(themeInfo.repo)"
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
							<svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        aria-hidden="true"
                                        role="img"
                                        width="1em"
                                        height="1em"
                                        viewBox="0 0 24 24"
                                        data-v-1f16b271=""
                                        data-icon="line-md:cloud-download-outline-loop"
                                        class="block w-4 h-4 mx-auto iconify iconify--line-md">
                                        <mask id="IconifyId189830ae935ba47180">
                                            <g fill="#fff">
                                                <circle
                                                    cx="12"
                                                    cy="10"
                                                    r="6"></circle>
                                                <rect
                                                    width="9"
                                                    height="8"
                                                    x="8"
                                                    y="12"></rect>
                                                <rect
                                                    width="17"
                                                    height="12"
                                                    x="1"
                                                    y="8"
                                                    rx="6">
                                                    <animate
                                                        attributeName="x"
                                                        dur="19s"
                                                        repeatCount="indefinite"
                                                        values="1;0;1;2;1"></animate>
                                                </rect>
                                                <rect
                                                    width="17"
                                                    height="10"
                                                    x="6"
                                                    y="10"
                                                    rx="5">
                                                    <animate
                                                        attributeName="x"
                                                        dur="23s"
                                                        repeatCount="indefinite"
                                                        values="6;5;6;7;6"></animate>
                                                </rect>
                                            </g>
                                            <circle
                                                cx="12"
                                                cy="10"
                                                r="4"></circle>
                                            <rect
                                                width="8"
                                                height="8"
                                                x="8"
                                                y="10"></rect>
                                            <rect
                                                width="11"
                                                height="8"
                                                x="3"
                                                y="10"
                                                rx="4">
                                                <animate
                                                    attributeName="x"
                                                    dur="19s"
                                                    repeatCount="indefinite"
                                                    values="3;2;3;4;3"></animate>
                                            </rect>
                                            <rect
                                                width="13"
                                                height="6"
                                                x="8"
                                                y="12"
                                                rx="3">
                                                <animate
                                                    attributeName="x"
                                                    dur="23s"
                                                    repeatCount="indefinite"
                                                    values="8;7;8;9;8"></animate>
                                            </rect>
                                            <g fill="#fff">
                                                <rect
                                                    width="3"
                                                    height="4"
                                                    x="10.5"
                                                    y="10"></rect>
                                                <path d="M12 17L16 13H8L12 17Z">
                                                    <animateMotion
                                                        calcMode="linear"
                                                        dur="1.5s"
                                                        keyPoints="0;0.25;0.5;0.75;1"
                                                        keyTimes="0;0.1;0.5;0.8;1"
                                                        path="M0 0v1v-2z"
                                                        repeatCount="indefinite"></animateMotion>
                                                </path>
                                            </g>
                                        </mask>
                                        <rect
                                            width="24"
                                            height="24"
                                            fill="currentColor"
                                            mask="url(#IconifyId189830ae935ba47180)"></rect>
                                    </svg>
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

.overlay img {
	min-width: 60vw;
  max-width: 80%;
 
}
</style>
