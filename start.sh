#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "=== GitShow 启动脚本 ==="
echo ""

# Check config
if ! grep -q '"token": "ghp_' backend/config.json 2>/dev/null || grep -q '"token": "ghp_your_token_here"' backend/config.json 2>/dev/null; then
  echo "⚠️  请先编辑 backend/config.json，填入你的 GitHub Token"
  echo "   获取方式: https://github.com/settings/tokens (只需要 public_repo 权限)"
  exit 1
fi

# Build backend if needed
if [ ! -f backend/gitshow ]; then
  echo "🔧 编译后端..."
  cd backend && go build -o gitshow . && cd ..
fi

# Start backend
echo "🚀 启动后端 (http://localhost:3001)..."
cd backend
./gitshow &
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
