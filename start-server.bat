@echo off
chcp 65001 >nul
cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
  echo.
  echo [错误] 找不到 node。请先安装 Node.js: https://nodejs.org
  echo.
  pause
  exit /b 1
)

echo.
echo 正在启动 Blackout Reboot（端口 3000）...
echo 关掉本窗口 = 停止服务器。
echo 若提示端口被占用，请在任务管理器中结束 Node 后再试。
echo.

node server.js

echo.
echo 服务器已退出（若上面有红色报错，请截图或复制文字）。
echo.
pause
