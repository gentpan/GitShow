# Changelog

## 1.3.0 - 2026-07-18

### Changed

- 全栈架构：TanStack Start + React 19 + TypeScript + Bun + Tailwind CSS 4
- 默认主题青绿；首页与导航视觉改版（品牌字体、像素猫 favicon、格子布局）
- GitHub 数据缓存改为 1 小时同步；削减 releases / following 冗余 API 调用
- `/projects` 默认展示全部公开仓库；后台开关仅控制首页精选
- 正文改用系统字体；Font Awesome 切换至 bluecdn 7.3.0

### Added

- 中英文界面切换
- 个人资料徽章、技术栈与语言环形图
- 页脚站点浏览量（每次刷新 +1）
- 头像本地缓存（`data/avatars`，7 天刷新）
- 管理后台：标题、GitHub、Passkey、首页精选项目

### Fixed

- 服务端缓存刷新不再泄漏到浏览器（`readFileSync` 报错）
- 桌面端误显示移动端菜单按钮
- 启动时可靠预热缓存并启动定时同步

## 1.2.0 - 2026-05-02

（历史版本，Go + Nuxt 架构）
