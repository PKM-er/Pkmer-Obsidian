# Pkmer Obsidian

> 这不是 Obsidian 官方插件主题市场，是由社区爱好者自发建立的插件主题市场，和官方的插件主题同步！
>
> This is not an Obsidian official plugin and theme marketplace, it is a plugin and theme marketplace created by community enthusiasts themselves. Synchronization with the official plugin and theme!

Pkmer Obsidian 是一款 Obsidian 插件，旨在帮助国内用户轻松自由的访问优秀的 Obsidian 插件。

![Pkmer](./public/pkmer.png)

## 主要功能

-   插件浏览：提供丰富的插件浏览视图，帮助用户按标签，下载量，更新日期，关注量等多维度找到想要的插件
-   插件文档：对常用插件在 Pkmer 提供由社区贡献者编写的中文文档，帮助用户上手使用插件
-   插件下载和更新：提供一键下载和更新插件，极致的下载速度，彻底摆脱访问困难
-   主题同上

## 实现原理

Pkmer 从 Obsidian 官方发布的插件信息列表中，找到最近更新的插件版本，定时且不间断获取最新的插件(这涉及到服务器、对象存储和 CDN 费用)。

在本插件内，用户点击下载按钮，如果用户 Obsidian 插件目录中，不存在名为插件 id 的目录，则会新建一个目录，在该插件内解压插件内容到该目录。如果存在名为插件 id 的目录，则会直接解压插件内容覆盖里面的 `main.js`, `manifest.json` 和 `styles.css` 三个文件，并不会删除和覆盖 `data.json` 等配置文件。

## 价格

注册 [Pkmer](https://pkmer.cn) 的用户完全免费使用该插件及下载插件，但为了防止滥用和过高的成本，每月免费下载 15 次 插件，Pkmer 会员则每月限制下载 200 次 插件（视实际情况而定，防止有人肆意爬取我们的插件数据）。

Pkmer 会员除了付费获取外，可以通过为社区提供知识管理相关的文档，视频，翻译，开发 Obsidian 插件，协助运营 Pkmer 等多种方式免费获取，具体方式可参考 [社区指南](https://pkmer.cn/show/20230330155738) 参与贡献。

## 路线图

-   [x] 实现插件市场
-   [x] 实现主题市场
-   [ ] 优化下载体验（进行中）
-   [ ] 实现 CSS 片段市场
-   [ ] 实现 Dataview 片段市场

## 注意事项

本插件完全开源，云端下载的文件任何人都可通过文件哈希和原开源项目发布的文件哈希比对，以确保安全性。

1. Pkmer 社区承担着成本，如无必要，尽量别挥霍下载资源（ Pkmer 会员除外）
2. 插件解压缩会覆盖原来的文件，理论上会存在解压缩失败的情况，其风险和在 Obsidian 社区更新相当，如您的库非常重要，建议下载更新前及时备份
3. 插件仅获取正式的版本号，对于测试的版本号全都忽略。因此，某些上架后很久未更新，未发布正式版的插件，并未展示在其中。如实际有未收录的官方插件，欢迎反馈。

如有任何问题，可以加 [Pkmer](https://pkmer.cn) 网站上的 QQ 群和微信群进行联系。
