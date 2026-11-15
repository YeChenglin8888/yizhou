<p align="center">
  <img src="public/icon-512.png" width="112" alt="昼光" />
</p>

<h1 align="center">昼光</h1>

<p align="center">一部以夏以昼为核心的 AI 陪伴小手机。</p>

<p align="center">
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0--only-blue" alt="License" /></a>
  <a href="https://github.com/YeChenglin8888/yizhou"><img src="https://img.shields.io/badge/platform-Web%20%7C%20PWA-orange" alt="Platform" /></a>
</p>

**昼光**是一款本地优先的 AI 虚拟手机 Web 应用 / PWA：拟真手机桌面 + 拟人角色聊天 + 世界书 + 查手机 + 朋友圈/日记 + 主题美化，数据全部保存在你自己的设备上。

角色不只是会聊天——她有作息、有日程、有记忆，会主动找你说话，会发朋友圈，会记得你们上周聊过什么。聊天记录、角色数据、世界书、主题设置都只存在本机（IndexedDB / localStorage），不经过任何自建后端。

## 内置内容

首次启动自动注入完整资源包，无需手动导入：

- **角色卡 ×5**：夏以昼（主角，含专属羁绊世界书）+ 黎深 / 祁煜 / 沈星回 / 秦彻（可进群聊、朋友圈当配角）
- **世界书 ×2**：《恋与深空·世界观与男主图鉴》（全局）+《夏以昼·专属羁绊》（仅夏以昼）
- **壁纸主题**：「昼光·夏以昼」暮橙暖色主题 + 4 张官方风格竖版壁纸
- **用户身份**：内置昵称预设
- **新手引导**：5 步引导覆盖 API 配置、PWA 安装、备份习惯与基本玩法

## 功能

- **聊天**：私聊 / 群聊 / 语音消息 / 消息操作 / 角色主动消息（作息系统）
- **世界书**：关键词触发注入，兼容 SillyTavern lorebook 格式，按角色绑定
- **查手机**：窥探角色的模拟手机——聊天、朋友圈、浏览器、相册、音乐、外卖、资产等 20+ 个模拟应用
- **小互动**：朋友圈、日记日历、小游戏、红包、心声碎碎念
- **自由美化**：多页桌面、小组件、壁纸、图标特效、气泡工坊、自定义 CSS
- **记忆系统**：长期记忆自动沉淀，角色越聊越懂你
- **数据管理**：导出 / 导入 / 自动备份（目录句柄或手动导出）

## 技术栈

React + TypeScript + Vite，PWA（manifest + service worker），Dexie / IndexedDB 做数据层，Capacitor 可套 Android / iOS 原生壳。本仓库面向 **Web / PWA** 分发。

## 快速开始

```bash
npm install
npm run dev        # http://localhost:3001
npm run build      # 产物在 out/，可直接丢给任意静态托管
```

## 部署

纯静态站点即可：Netlify / Vercel / Cloudflare Pages / GitHub Pages / 自建 nginx，构建命令 `npm run build`，发布目录 `out`，站点挂域名根路径。环境变量留空。

**iPhone 用法**：Safari 打开 → 分享 → 添加到主屏幕，以 PWA 形态使用，IndexedDB 存储更稳定。

## API 配置

模型服务全部由用户自备，应用不内置、不代理任何模型：

- **OpenAI 兼容**（含 DeepSeek、Moonshot、各类中转站）
- **Anthropic**（官方端点走原生 Messages API；浏览器直连注意 CORS，需中转）
- **Google Gemini**

在 **设置 → API 设置** 填写 Base URL 与 API Key 即可，Key 只存本机。生图、语音、音乐同理各自配置。

## 数据与隐私

- 全部数据在设备本地，清浏览器数据会丢失——建议定期用 **设置 → 数据管理** 导出备份
- API Key 明文存于本机 IndexedDB，不上传
- 「查手机」内容由 LLM 按角色人设生成，与真实聊天记录相互独立

## 许可证

本项目以 **GNU Affero General Public License v3.0 only（AGPL-3.0-only）** 发布，详见 [LICENSE](./LICENSE)。

昼光基于 [Pneuma](https://github.com/shiaho777/pneuma-android) 二次开发，Pneuma 派生自 [xiaolongbao0709/ai-virtual-phone](https://github.com/xiaolongbao0709/ai-virtual-phone) 及其衍生版本。来源项目同样使用 AGPL-3.0：只要仍包含来源代码，本项目及其衍生版本都必须继续以 AGPL-3.0 开放源代码，并保留原有的版权与许可声明。

## 致谢

感谢 [shiaho777/pneuma-android](https://github.com/shiaho777/pneuma-android) 与 [xiaolongbao0709/ai-virtual-phone](https://github.com/xiaolongbao0709/ai-virtual-phone) 的作者们——昼光的每一行界面骨架，都站在他们的工作之上。

---

> 《恋与深空》及夏以昼为叠纸游戏的知识产权。本项目仅供个人自用学习，禁止商用与公开再分发角色素材。
