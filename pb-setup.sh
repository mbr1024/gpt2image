#!/bin/bash
# PocketBase 部署脚本
# 用法: bash pb-setup.sh

set -e

PB_VERSION="0.25.9"
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

case "$ARCH" in
  x86_64) ARCH="amd64" ;;
  aarch64|arm64) ARCH="arm64" ;;
esac

PB_DIR="./pocketbase"
PB_ZIP="pocketbase_${PB_VERSION}_${OS}_${ARCH}.zip"
PB_URL="https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/${PB_ZIP}"

echo "==> 下载 PocketBase v${PB_VERSION} (${OS}/${ARCH})..."
mkdir -p "$PB_DIR"
curl -fsSL "$PB_URL" -o "/tmp/${PB_ZIP}"
unzip -o "/tmp/${PB_ZIP}" -d "$PB_DIR"
rm "/tmp/${PB_ZIP}"
chmod +x "${PB_DIR}/pocketbase"

echo "==> PocketBase 已安装到 ${PB_DIR}/pocketbase"
echo ""
echo "启动方式:"
echo "  ${PB_DIR}/pocketbase serve --http=0.0.0.0:8090"
echo ""
echo "首次启动后:"
echo "  1. 访问 http://your-server:8090/_/ 创建管理员账号"
echo "  2. 运行 node pb-migrate.js 自动建表"
echo "  3. 在前端 .env 中配置 VITE_PB_URL=http://your-server:8090"
