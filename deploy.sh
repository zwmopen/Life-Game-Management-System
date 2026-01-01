#!/bin/bash

# 部署脚本 - 人生游戏管理系统

echo "=== 开始部署人生游戏管理系统 ==="

# 设置环境变量
export NODE_ENV=production

# 安装依赖
echo "=== 安装依赖 ==="
npm install

# 构建应用
echo "=== 构建应用 ==="
npm run build

# 检查构建结果
if [ $? -ne 0 ]; then
    echo "=== 构建失败！部署终止 ==="
    exit 1
fi

echo "=== 构建成功！应用已部署到 dist 目录 ==="
echo "=== 部署完成 ==="
