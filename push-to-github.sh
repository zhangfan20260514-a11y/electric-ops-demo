#!/bin/sh
# 把当前目录推送到你的 GitHub 仓库
set -e
printf "仓库地址（形如 https://github.com/用户名/仓库名.git）："
read REPO
if [ -z "$REPO" ]; then
  echo "没有输入仓库地址，已退出。"
  exit 1
fi

if [ ! -d .git ]; then
  git init -b main
fi
git add -A
git commit -m "chore: electric-ops demo" || true
git branch -M main
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO"

echo "正在推送到 $REPO ..."
git push -u origin main

echo
echo "完成。若提示认证失败，请用 Personal Access Token 代替账号密码："
echo "GitHub → Settings → Developer settings → Personal access tokens"
