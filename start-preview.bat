@echo off
chcp 65001 >nul
cd /d %~dp0
echo ========================================
echo   成渝中线电务智能运维 Demo - 本地预览
echo ========================================
echo.
echo 正在启动本地服务 http://localhost:4173
echo 关闭此窗口即可停止服务。
echo.

where python >nul 2>nul
if %errorlevel%==0 (
    start "" http://localhost:4173/index.html#/panorama/emergency/process
    python -m http.server 4173
    goto :eof
)

where py >nul 2>nul
if %errorlevel%==0 (
    start "" http://localhost:4173/index.html#/panorama/emergency/process
    py -m http.server 4173
    goto :eof
)

where node >nul 2>nul
if %errorlevel%==0 (
    start "" http://localhost:4173/index.html#/panorama/emergency/process
    npx --yes http-server -p 4173 -c-1
    goto :eof
)

echo [提示] 未检测到 Python 或 Node.js。
echo 可直接双击本目录下的 index.html 打开（纯静态页面，无需服务）。
pause
