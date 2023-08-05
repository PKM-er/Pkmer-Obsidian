import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

const isProd = process.env.NODE_ENV === 'production'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    resolve: {
        extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.less', '.css'],
        alias: {
            '@': path.resolve(__dirname, './src'),
        }
    },
    build: {
        minify: false,
        lib: {
            entry: './src/main.ts',
            name: 'main',
            formats: ['cjs']
        },
        emptyOutDir: isProd ?  false : true,
        target: 'esNext',
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
