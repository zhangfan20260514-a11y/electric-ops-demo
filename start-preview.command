#!/usr/bin/env bash
# 成渝中线电务智能运维 Demo —— 本地预览启动脚本
cd "$(dirname "$0")" || exit 1

PORT=4173
URL="http://localhost:${PORT}/index.html#/panorama/emergency/process"

echo "========================================"
echo "  成渝中线电务智能运维 Demo - 本地预览"
echo "========================================"
echo ""
echo "访问地址：${URL}"
echo "按 Ctrl+C 停止服务"
echo ""

# 延迟 1 秒后尝试打开浏览器（macOS / Linux）
( sleep 1
  if command -v open >/dev/null 2>&1; then open "$URL"
  elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$URL" >/dev/null 2>&1
  fi ) &

if command -v python3 >/dev/null 2>&1; then
  python3 -m http.server "$PORT"
elif command -v python >/dev/null 2>&1; then
  python -m http.server "$PORT"
elif command -v npx >/dev/null 2>&1; then
  npx --yes http-server -p "$PORT" -c-1
else
  echo "[提示] 未检测到 Python 或 Node.js。"
  echo "可直接双击 index.html 打开（纯静态页面，无需服务）。"
fi
