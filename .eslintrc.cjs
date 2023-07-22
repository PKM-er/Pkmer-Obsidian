module.exports = {
    env: {
        browser: true,
        es2021: true,
        commonjs: true
    },
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint", "prettier"],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
        "plugin:prettier/recommended"
    ],
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
            jsx: true
        }
    },
    rules: {
        "prettier/prettier": "error",
        //强制在代码块中使用一致的大括号风格
        "brace-style": 1,
        //强制在逗号前后使用一致的空格
        "comma-spacing": ["error", { before: false, after: true }],
        //强制使用一致的逗号风格
        "comma-style": 1,
        //缩进为4字符
        indent: ["error", 4],
        //要求在对象字面量的冒号和值之间存在至少有一个空格
        "key-spacing": ["error", { afterColon: true }],
        //构造函数首字母大写
        "new-cap": ["error", { newIsCap: true }],
        //连续两个空行报错
        "no-multiple-empty-lines": ["error", { max: 2, maxEOF: 1 }],
        //使用双引号
        quotes: ["error", "double"],
        //不要分号
        semi: ["error", "never"],
        //函数后面的括号不要以空格分开
        "space-before-function-paren": 0,
        //操作符中间要空格
        "space-infix-ops": ["error", { int32Hint: true }],
        //数组中间不要空两格，一格就够了
        "array-bracket-spacing": ["error", "never"],
        "@typescript-eslint/array-type": ["error", { default: "array" }],
        "@typescript-eslint/ban-ts-comment": 0
    }
}
