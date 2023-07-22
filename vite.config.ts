import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    build: {
        minify: false,
        lib: {
            entry: './src/main.ts',
            name: 'main',
            formats: ['cjs']
        },
        rollupOptions: {
            external: [
                "obsidian",
                "electron",
                "@codemirror/autocomplete",
                "@codemirror/collab",
                "@codemirror/commands",
                "@codemirror/language",
                "@codemirror/lint",
                "@codemirror/search",
                "@codemirror/state",
                "@codemirror/view",
                "@lezer/common",
                "@lezer/highlight",
                "@lezer/lr"
            ],
            output: {
                entryFileNames: "main.js",
                assetFileNames: "styles.css",
                dir: ".",
                sourcemap: "inline",
                format: "cjs",
                exports: "default"
            }
        }
    }
})
