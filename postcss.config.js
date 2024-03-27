/*
 * @Author: cumany cuman@qq.com
 * @Date: 2023-07-26 21:45:50
 * @LastEditors: cumany cuman@qq.com
 * @LastEditTime: 2024-03-27 08:47:44
 * @Description:
 */
import tailwindcss from "tailwindcss"
import autoprefixer from "autoprefixer"
import prefixSelector from "postcss-prefix-selector"
import fs from "fs" // 引入文件系统模块

export default {
    plugins: [
        tailwindcss(),
        autoprefixer(),
        prefixSelector({
            prefix: "[data-type='pkmer-downloader']",
            transform: (
                prefix,
                selector,
                prefixedSelector,
                _filePath,
                _rule
            ) => {
                if (selector.includes(".dark ")) {
                    return selector.replace(".dark ", `.theme-dark ${prefix} `)
                } else if (selector.includes(".dark:")) {
                    return selector
                } else {
                    return `${prefixedSelector}`
                }
            }
        }),
        {
            postcssPlugin: "exclude-prefix",
            Once(root, { result }) {
                // 读取自定义 CSS 文件内容
                const customCSS = fs.readFileSync(
                    "./src/styles/custom.css",
                    "utf-8"
                )

                // 将自定义 CSS 内容追加到结果中，确保它不会被处理添加前缀
                result.root.append(customCSS)
            }
        }
    ]
}
