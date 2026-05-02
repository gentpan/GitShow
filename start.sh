#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "=== GitShow 启动脚本 ==="
echo ""

# Load token from .env if present
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs 2>/dev/null || true)
fi

# Check token: env var or config.json
TOKEN_FROM_ENV="${GITHUB_TOKEN:-}"
TOKEN_FROM_CONFIG=""
if [ -f backend/config.json ]; then
  TOKEN_FROM_CONFIG=$(grep '"token"' backend/config.json | sed 's/.*: "\([^"]*\)".*/\1/' | tr -d ' ')
fi

if [ -n "$TOKEN_FROM_ENV" ] && [ "$TOKEN_FROM_ENV" != "ghp_your_token_here" ]; then
  echo "✅ 使用环境变量 GITHUB_TOKEN"
  export GITHUB_TOKEN
elif [ -n "$TOKEN_FROM_CONFIG" ] && [ "$TOKEN_FROM_CONFIG" != "ghp_your_token_here" ]; then
  echo "✅ 使用 config.json 中的 token"
else
  echo "⚠️  请先配置 GitHub Token"
  echo "   方式1: 创建 .env 文件填入 GITHUB_TOKEN=ghp_xxx"
  echo "   方式2: 编辑 backend/config.json 填入 token"
  echo "   获取: https://github.com/settings/tokens (勾选 read:user + public_repo)"
  exit 1
fi

# Build backend if needed or source changed
if [ ! -f backend/gitshow ] || [ backend/main.go -nt backend/gitshow ]; then
  echo "🔧 编译后端..."
  cd backend && go build -o gitshow . && cd ..
fi

# Start backend
echo "🚀 启动后端 (http://localhost:3001)..."
cd backend
GITHUB_TOKEN="${GITHUB_TOKEN:-$TOKEN_FROM_CONFIG}" ./gitshow &
BACKEND_PID=$!
cd ..

# Start frontend
echo "🚀 启动前端 (http://localhost:3000)..."
cd frontend
NUXT_PUBLIC_API_BASE=http://localhost:3001 npx nuxt dev --port 3000 &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ 服务已启动!"
echo "   前端: http://localhost:3000"
echo "   后端: http://localhost:3001"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo ""

wait
