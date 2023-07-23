<script setup lang="ts">
import PluginMarket from "@/components/plugin/PluginMarket.vue"
import type { PkmerDownloaderSettings } from "@/main"
import { App } from "obsidian";

interface Props {
    settings: PkmerDownloaderSettings
    app: App
}

const props = defineProps<Props>()

</script>
<template>
    <Suspense>
        <template #default>
            <PluginMarket :settings="props.settings" :app="props.app"></PluginMarket>
        </template>
        <template #fallback>
            <h1>Loading...</h1>
        </template>
    </Suspense>
</template>
<style></style>
