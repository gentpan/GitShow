# GitShow

<div align="center">

[![GitHub Stars](https://img.shields.io/github/stars/gentpan/GitShow?style=flat-square&logo=github&color=f59e0b)](https://github.com/gentpan/GitShow/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/gentpan/GitShow?style=flat-square&logo=github&color=3b82f6)](https://github.com/gentpan/GitShow/network/members)
[![License](https://img.shields.io/github/license/gentpan/GitShow?style=flat-square&color=22c55e)](./LICENSE)
[![Version](https://img.shields.io/github/package-json/v/gentpan/GitShow?style=flat-square&color=ec4899)](https://github.com/gentpan/GitShow/releases)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev)
[![TanStack](https://img.shields.io/badge/TanStack_Start-1.168-ff4154?style=flat-square)](https://tanstack.com/start)
[![TypeScript](https://img.shields.io/badge/TypeScript-7-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Bun](https://img.shields.io/badge/Bun-1.3-f9e1a0?style=flat-square&logo=bun)](https://bun.sh)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)

**自托管个人 GitHub 主页 | Self-hosted Personal GitHub Portfolio**

展示资料、项目、贡献热力图、动态看板与轻量管理后台。

*Profile, projects, contribution heatmap, activity feed and a lightweight admin panel.*

[Demo](https://xifeng.dev) · [Issues](https://github.com/gentpan/GitShow/issues) · [Changelog](./CHANGELOG.md)

</div>

---

## 功能特性 | Features

- **个人资料** | Profile — 头像、简介、统计、个人徽章
- **项目展示** | Projects — `/projects` 列出全部公开仓库；首页精选由后台开关控制
- **项目详情** | Repo Detail — README、目录与近期提交
- **贡献热力图** | Contribution Heatmap — 近一年贡献可视化
- **技术栈** | Tech Stack — 语言徽章 + Top 5 环形图
- **动态看板** | Activity — 缓存的 GitHub 动态流
- **关注动态** | Following — 关注用户的近期活动
- **中英文切换** | i18n — 界面中文 / English
- **管理后台** | Admin — 站点标题、GitHub Token、首页精选、社交链接、Passkey
- **本地缓存** | Caching — GitHub 数据约 1 小时同步；头像落盘缓存（约 7 天）
- **浏览量** | Pageviews — 页脚计数（每次刷新 +1）
- **SSR** | Server Rendering — 首屏与 SEO 友好

---

## 技术栈 | Tech Stack

| 技术 | 用途 | Technology | Purpose |
|------|------|------------|---------|
| [TanStack Start](https://tanstack.com/start) | 全栈框架（路由 + SSR + Server Functions） | Full-stack framework |
| [React](https://react.dev) 19 | UI | UI |
| [TypeScript](https://www.typescriptlang.org) 7 | 类型 | Types |
| [Bun](https://bun.sh) / [Vite](https://vitejs.dev) 8 | 运行与构建 | Runtime & build |
| [Tailwind CSS](https://tailwindcss.com) 4 | 样式 | Styling |
| [TanStack Query](https://tanstack.com/query) | 客户端数据 | Client data |
| [WebAuthn](https://www.w3.org/TR/webauthn/) | Passkey 登录 | Passkey auth |

---

## 快速开始 | Quick Start

```bash
git clone https://github.com/gentpan/GitShow.git
cd GitShow
bun install
bun --bun run dev
```

打开 http://localhost:3000 ，进入 `/admin` 配置 GitHub 用户名与 Token。

Open http://localhost:3000, then `/admin` to set GitHub username and token.

生产启动建议使用仓库内的 `start-server.mjs`（含头像静态服务与缓存预热）：

For production, prefer `start-server.mjs` (avatar static files + cache warmup):

```bash
bun --bun run build
node start-server.mjs
# 默认 | default: http://localhost:3001  （可用 PORT 覆盖 | override with PORT）
```

---

## 部署 | Deployment

```bash
bun --bun run build
PORT=3001 node start-server.mjs
```

将反向代理指向应用端口；静态资源在 `dist/server/client`，本地头像在 `data/avatars`（可参考 `deploy/Caddyfile.gitshow-snippet`）。

Point a reverse proxy at the app port; static assets live in `dist/server/client`, avatars in `data/avatars` (see `deploy/Caddyfile.gitshow-snippet`).

持久化目录建议挂载：`data/`（浏览量、头像等）、以及站点配置文件（若仍使用 `settings.json` / `config.json`）。

---

## 开发命令 | Scripts

```bash
bun --bun run dev       # 开发 | Dev
bun --bun run build     # 构建 | Build
bun run start           # 仅启动 Vite 产物 | Start built server.js
node start-server.mjs   # 推荐生产入口 | Recommended production entry
bun run typecheck       # 类型检查 | Typecheck
```

---

## 目录结构 | Structure

```
GitShow/
├── src/
│   ├── routes/         # 页面路由 | Pages
│   ├── components/     # UI
│   ├── lib/            # i18n、工具 | i18n & utils
│   ├── server/         # Server Functions、缓存、头像
│   ├── entry-client.tsx
│   ├── entry-server.tsx
│   └── router.tsx
├── public/             # favicon 等 | Public assets
├── data/               # 运行时数据（浏览量、头像）| Runtime data
├── deploy/             # Caddy 片段等 | Deploy snippets
├── dist/               # 构建产物 | Build output
├── start-server.mjs    # 生产入口 | Production entry
└── package.json
```

---

## 路由 | Routes

| 路径 | 说明 | Description |
|------|------|-------------|
| `/` | 首页 | Home |
| `/projects` | 全部项目 | All projects |
| `/projects/:name` | 项目详情 | Repo detail |
| `/activity` | 动态看板 | Activity |
| `/following` | 关注 | Following |
| `/admin` | 管理后台 | Admin |

---

## 许可证 | License

MIT — 见 [LICENSE](./LICENSE)。
