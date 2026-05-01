# GitShow

个人 GitHub 可视化主页 + 关注动态看板。

## 功能

- **主页** (`/`)：GitHub 个人信息、统计数字、贡献热力图、项目列表、最近动态
- **关注** (`/following`)：关注者的最近活跃状态、仓库和提交
- **动态流** (`/feed`)：自己和关注者的提交动态聚合

数据每小时自动从 GitHub API 同步一次，前端始终读取缓存，避免触发限流。

## 快速开始

### 1. 配置 GitHub Token

编辑 `backend/config.json`：

```json
{
  "username": "你的GitHub用户名",
  "token": "ghp_你的token",
  "following": ["antfu", "yyx990803", "torvalds"]
}
```

Token 获取：[GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)（勾选 `read:user` 和 `public_repo`）

### 2. 启动

```bash
./start.sh
```

或分别启动：

```bash
# 后端
cd backend
go run .

# 前端（新终端）
cd frontend
npm run dev
```

访问 http://localhost:3000

## 技术栈

- **后端**: Go + 内存缓存 + 定时任务
- **前端**: Nuxt 3 + TailwindCSS
- **API**: GitHub REST API + GraphQL (contributions)

## 目录结构

```
gitshow/
├── backend/
│   ├── main.go          # Go API 服务
│   ├── config.json      # 配置文件
│   └── go.mod
├── frontend/
│   ├── pages/           # 页面
│   ├── components/      # 组件
│   ├── composables/     # API 客户端
│   └── layouts/         # 布局
└── start.sh             # 一键启动脚本
```
