#!/bin/bash
set -e
cd "$(dirname "$0")"

export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
export PATH="$BUN_INSTALL/bin:$PATH"

echo "=== GitShow 启动脚本 (TanStack Start + Bun) ==="

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs 2>/dev/null || true)
fi

if [ ! -f config.json ]; then
  cp config.json.example config.json
fi
if [ ! -f settings.json ]; then
  cp settings.json.example settings.json
fi

if [ -z "$GITHUB_TOKEN" ] && grep -q 'ghp_your_token_here' config.json 2>/dev/null; then
  echo "⚠️  请先配置 GitHub Token（config.json 或 GITHUB_TOKEN 环境变量）"
  exit 1
fi

if ! command -v bun >/dev/null 2>&1; then
  echo "📦 安装 Bun..."
  curl -fsSL https://bun.sh/install | bash
  export PATH="$BUN_INSTALL/bin:$PATH"
fi

if [ ! -d node_modules ]; then
  echo "📦 安装依赖..."
  bun install
fi

echo "🏗️  构建..."
bun --bun run build

echo "🚀 启动 GitShow (http://localhost:3000)..."
PORT=3000 bun run start
