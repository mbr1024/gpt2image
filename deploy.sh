#!/bin/bash
# 1Panel 部署脚本
# 在本地执行，自动构建前端并打包上传所需文件

set -e

echo "==> 安装依赖..."
pnpm install

echo "==> 构建前端 (PB 地址 = /pb)..."
VITE_PB_URL=/pb pnpm build

echo "==> 打包部署文件..."
tar czf deploy.tar.gz \
  dist/ \
  docker-compose.pb.yml

echo ""
echo "✓ 打包完成: deploy.tar.gz (仅含 dist/ + docker-compose.pb.yml)"
echo ""
echo "接下来:"
echo "  1. 上传到服务器"
echo "     scp deploy.tar.gz root@your-server:/tmp/"
echo ""
echo "  2. 服务器上解压"
echo "     mkdir -p /opt/gpt-image && cd /opt/gpt-image"
echo "     tar xzf /tmp/deploy.tar.gz"
echo ""
echo "  3. 1Panel 部署 PocketBase (Compose) + 静态网站 (dist/)"
echo ""
echo "  4. 本地运行建表脚本 (需要 PocketBase 端口可访问)"
echo "     node pb-migrate.js http://服务器IP:8090 admin@xx.com password"
