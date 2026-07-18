# GitShow

<div align="center">

[![GitHub Stars](https://img.shields.io/github/stars/gentpan/GitShow?style=flat-square&logo=github&color=f59e0b)](https://github.com/gentpan/GitShow/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/gentpan/GitShow?style=flat-square&logo=github&color=3b82f6)](https://github.com/gentpan/GitShow/network/members)
[![License](https://img.shields.io/github/license/gentpan/GitShow?style=flat-square&color=22c55e)](./LICENSE)
[![Version](https://img.shields.io/github/package-json/v/gentpan/GitShow?style=flat-square&color=ec4899)](https://github.com/gentpan/GitShow/releases)
[![React](https://img.shields.io/badge/React-19.2-61dafb?style=flat-square&logo=react)](https://react.dev)
[![TanStack](https://img.shields.io/badge/TanStack_Start-1.0-ff4154?style=flat-square)](https://tanstack.com/start)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Bun](https://img.shields.io/badge/Bun-1.3-f9e1a0?style=flat-square&logo=bun)](https://bun.sh)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4.3-06b6d4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ed?style=flat-square&logo=docker)](https://docker.com)

**自托管个人 GitHub 主页 | Self-hosted Personal GitHub Portfolio**

展示资料、项目、贡献热力图、动态看板与轻量管理后台。

*Show your profile, projects, contribution heatmap, activity dashboard and lightweight admin panel.*

[Demo](https://github.com/gentpan) · [Issues](https://github.com/gentpan/GitShow/issues) · [Changelog](./CHANGELOG.md)

</div>

---

## 功能特性 | Features

- **个人资料展示** | Profile Showcase — 用户名、头像、简介、位置、社交链接
- **项目列表** | Repository List — 展示你的 GitHub 仓库，含语言、Stars、Forks
- **项目详情** | Repository Detail — README 渲染、文件浏览、目录树
- **贡献热力图** | Contribution Heatmap — 可视化 GitHub 贡献历史
- **动态看板** | Activity Dashboard — 实时追踪你的 GitHub 动态
- **关注用户** | Following Feed — 查看你关注用户的最新动态
- **管理后台** | Admin Panel — WebAuthn/Passkey 认证，修改站点配置
- **Star 历史** | Star History — 追踪仓库获 Star 趋势
- **RSS 支持** | RSS Feed — 生成动态 RSS 订阅
- **自定义主题** | Custom Themes — 多种主题切换
- **响应式设计** | Responsive — 适配桌面与移动端
- **SSR 服务端渲染** | SSR — 首屏加载快，SEO 友好

---

## 技术栈 | Tech Stack

| 技术 | 版本 | 用途 | Technology | Version | Purpose |
|------|------|------|------------|---------|---------|
| [TanStack Start](https://tanstack.com/start) | 1.168 | 全栈 React 框架（路由 + SSR + Server Functions） | Full-stack React Framework |
| [React](https://react.dev) | 19.2 | UI 组件库 | UI Library |
| [TypeScript](https://www.typescriptlang.org) | 7.0 | 类型安全 | Type Safety |
| [Bun](https://bun.sh) | 1.3 | 运行时与构建工具 | Runtime & Bundler |
| [Vite](https://vitejs.dev) | 8.1 | 构建工具 | Build Tool |
| [Tailwind CSS](https://tailwindcss.com) | 4.3 | 样式框架（`@tailwindcss/vite`） | Styling (`@tailwindcss/vite`) |
| [TanStack Router](https://tanstack.com/router) | 1.170 | 文件系统路由 | File-based Routing |
| [TanStack Query](https://tanstack.com/query) | 5.0 | 服务端状态管理 | Server State Management |
| [WebAuthn](https://www.w3.org/TR/webauthn/) | 13.1 | Passkey 无密码认证 | Passwordless Authentication |
| [Vinxi](https://github.com/nksaraf/vinxi) | 0.5 | 元框架引擎 | Meta Framework Engine |

---

## 快速开始 | Quick Start

```bash
# 克隆项目 | Clone
git clone https://github.com/gentpan/GitShow.git
cd GitShow

# 复制配置文件 | Copy config files
cp config.json.example config.json
cp settings.json.example settings.json

# 编辑 config.json 填入你的 GitHub username 和 token
# Edit config.json with your GitHub username and token

# 启动开发服务器 | Start dev server
./start.sh
# 或 | or
bun install
bun --bun run dev
```

访问 | Visit http://localhost:3000

---

## 配置说明 | Configuration

| 文件 | File | 用途 | Purpose |
|------|------|------|---------|
| `config.json` | GitHub 用户名、Token、Following 列表 | GitHub username, token, following list |
| `settings.json` | 站点标题、社交链接、主题、管理员密码、Passkey | Site title, social links, theme, admin password, passkeys |
| `star-history.json` | Star 历史曲线（自动生成） | Star history (auto-generated) |
| `.env` | 可选，GITHUB_TOKEN 覆盖 config 中的 token | Optional, GITHUB_TOKEN overrides config |

---

## 部署方式 | Deployment

### Docker Compose（推荐 | Recommended）

```bash
cp config.json.example config.json
cp settings.json.example settings.json
# 编辑配置文件 | Edit config files

docker compose up -d --build
```

### 手动构建 | Manual Build

```bash
bun install
bun --bun run build
bun run start
```

### 环境变量 | Environment Variables

| 变量 | 说明 | Description |
|------|------|-------------|
| `GITHUB_TOKEN` | GitHub 个人访问令牌 | GitHub Personal Access Token |
| `PORT` | 服务端口，默认 3000 | Server port, default 3000 |
| `NODE_ENV` | 环境模式 production/development | Environment mode |

---

## 开发命令 | Scripts

```bash
bun --bun run dev          # 开发服务器 | Development server
bun --bun run build        # 生产构建 | Production build
bun run start              # 启动生产服务 | Start production server
bun run preview            # 预览生产构建 | Preview production build
bun run typecheck          # TypeScript 类型检查 | TypeScript type check
```

---

## 目录结构 | Directory Structure

```
GitShow/
├── src/
│   ├── routes/           # 页面路由：/、/projects、/following、/activity、/admin
│   │                     # Routes: /, /projects, /following, /activity, /admin
│   ├── components/       # React 组件 | React components
│   ├── lib/              # 客户端工具库 | Client utilities
│   ├── server/           # 后端 Server Functions（API 端点）
│   │                     # Backend Server Functions (API endpoints)
│   ├── entry-client.tsx  # 客户端入口 | Client entry
│   ├── entry-server.tsx  # SSR 服务端入口 | Server entry
│   └── router.tsx        # TanStack Router 配置 | Router config
├── public/               # 静态资源 | Static assets
├── dist/                 # 构建产物 | Build output
│   ├── client/           # 客户端资源 | Client assets
│   └── server/           # 服务端代码 | Server code
├── app.config.ts         # TanStack Start 配置 | TanStack Start config
├── vite.config.ts        # Vite 客户端配置 | Vite client config
├── vite.config.server-entry.ts  # Vite SSR 配置 | Vite SSR config
├── Dockerfile            # Docker 构建文件 | Docker build file
├── docker-compose.yml    # Docker Compose 配置 | Docker Compose config
└── package.json          # 项目依赖 | Dependencies
```

---

## 页面路由 | Routes

| 路径 | 页面 | 说明 | Path | Page | Description |
|------|------|------|------|------|-------------|
| `/` | 首页 | 个人资料 + 项目展示 | Home | Profile + projects |
| `/projects` | 项目列表 | 所有仓库 | Projects | All repositories |
| `/projects/:name` | 项目详情 | README + 文件浏览 | Project Detail | README + file browser |
| `/activity` | 动态看板 | GitHub 活动流 | Activity | GitHub activity feed |
| `/following` | 关注用户 | 关注用户的动态 | Following | Following users feed |
| `/admin` | 管理后台 | 站点配置 + Passkey | Admin | Site config + passkeys |

---

## 许可证 | License

MIT License — 详见 [LICENSE](./LICENSE) 文件。

See [LICENSE](./LICENSE) for full details.

---

<div align="center">

Built with **TanStack Start** + **React 19** + **Bun** by [gentpan](https://github.com/gentpan)

</div>
