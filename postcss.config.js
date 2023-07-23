import tailwindcss from "tailwindcss"
import autoprefixer from "autoprefixer"
import prefixSelector from "postcss-prefix-selector"

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
        })
    ]
}
