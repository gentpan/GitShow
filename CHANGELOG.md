# Changelog

## 2.0.0 - 2026-07-10

### Changed

- **重大架构迁移**：Go + Nuxt Vue → TanStack Start + React 19 + TypeScript 7.0 + Bun 全栈
- 后端逻辑迁移至 `server/utils/`（GitHub API、内存缓存、Passkey）
- 前端重写为 React 组件与 TanStack Router 文件路由
- Docker 镜像改为 `oven/bun`，构建产物为 Nitro `.output/`

### Added

- TanStack Start 全栈架构，类型安全的 React 路由
- Bun 构建与运行支持
- TypeScript 7.0

### Removed

- Go 后端（`main.go`）
- Nuxt 3 前端

### Note

- Passkey 凭证格式变更（`@simplewebauthn/server`），旧版 Go WebAuthn 凭证需重新注册

## 1.2.0 - 2026-05-02

（历史版本，Go + Nuxt 架构）
