# GitShow

自托管个人 GitHub 主页：展示资料、项目、贡献热力图、动态看板与轻量管理后台。

## 技术栈

- **TanStack Start** — React 19 全栈框架（路由 + SSR + Server Functions）
- **TypeScript 7.0** — 类型安全
- **Bun** — 运行时与构建
- **Nitro** — 服务端与 API 路由
- **Tailwind CSS 3** — 样式

## 快速开始

```bash
cp config.json.example config.json
cp settings.json.example settings.json
# 编辑 config.json 填入 GitHub username 和 token

./start.sh
# 或
bun install
bun --bun run dev
```

访问 http://localhost:3000

## 配置

| 文件 | 用途 |
|------|------|
| `config.json` | GitHub 用户名、Token、Following 列表 |
| `settings.json` | 站点标题、社交链接、首页项目、主题、管理员密码、Passkey |
| `star-history.json` | Star 历史曲线（自动生成） |
| `.env` | 可选，`GITHUB_TOKEN` 覆盖 config 中的 token |

## Docker 部署

```bash
cp config.json.example config.json
cp settings.json.example settings.json
docker compose up -d --build
```

## 开发命令

```bash
bun --bun run dev          # 开发服务器
bun --bun run build        # 生产构建
bun run start              # 启动生产服务
bun run typecheck          # TypeScript 检查（src/）
bun run generate-routes    # 重新生成路由树
```

## 目录结构

```
GitShow/
├── src/              # 前端站点（根目录，TanStack Router 页面路由 /）
│   ├── routes/       # 页面：/、/projects、/following、/activity、/admin
│   ├── components/   # React 组件
│   └── lib/          # 客户端 API 封装（请求 /api/*）
├── api/              # 后端 API（Nitro 服务目录，路由前缀 /api）
│   ├── routes/api/   # REST 入口：/api/*
│   ├── utils/        # GitHub、缓存、Passkey
│   └── plugins/      # 启动时缓存刷新
├── public/           # 静态资源
└── vite.config.ts    # serverDir: 'api'
```

## License

MIT
