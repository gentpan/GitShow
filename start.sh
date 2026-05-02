#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "=== GitShow 启动脚本 ==="
echo ""

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs 2>/dev/null || true)
fi

TOKEN_FROM_ENV="${GITHUB_TOKEN:-}"
TOKEN_FROM_CONFIG=""
if [ -f config.json ]; then
  TOKEN_FROM_CONFIG=$(grep '"token"' config.json | sed 's/.*: "\([^"]*\)".*/\1/' | tr -d ' ')
fi

if [ -n "$TOKEN_FROM_ENV" ] && [ "$TOKEN_FROM_ENV" != "ghp_your_token_here" ]; then
  echo "✅ 使用环境变量 GITHUB_TOKEN"
  export GITHUB_TOKEN
elif [ -n "$TOKEN_FROM_CONFIG" ] && [ "$TOKEN_FROM_CONFIG" != "ghp_your_token_here" ]; then
  echo "✅ 使用 config.json 中的 token"
else
  echo "⚠️  请先配置 GitHub Token"
  echo "   方式1: 创建 .env 文件填入 GITHUB_TOKEN=ghp_xxx"
  echo "   方式2: 编辑 config.json 填入 token"
  echo "   获取: https://github.com/settings/tokens (勾选 read:user + public_repo)"
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "📦 安装前端依赖..."
  npm install
fi

echo "🏗️  构建前端静态文件..."
NUXT_PUBLIC_API_BASE= npm run generate

echo "🔧 编译 Go 服务..."
go build -o gitshow .

echo "🚀 启动 GitShow (http://localhost:3000)..."
PORT=3000 GITHUB_TOKEN="${GITHUB_TOKEN:-$TOKEN_FROM_CONFIG}" ./gitshow
