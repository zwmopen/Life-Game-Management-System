@echo off
chcp 65001 >nul
title 人生游戏管理系统启动工具

echo ============================================
echo        人生游戏管理系统启动工具
echo ============================================
echo.

:menu
echo.
echo 请选择要执行的操作：
echo 1. 启动开发服务器
echo 2. 构建生产版本
echo 3. 预览生产版本
echo 4. 同时启动WebDAV和开发服务器
echo 5. 安装依赖
echo 0. 退出
echo.
set /p choice="请输入选项 (0-5): "

if "%choice%"=="1" goto start_dev
if "%choice%"=="2" goto build
if "%choice%"=="3" goto preview
if "%choice%"=="4" goto start_both
if "%choice%"=="5" goto install
if "%choice%"=="0" goto exit_app

echo.
echo 无效的选项，请重新选择。
goto menu

:start_dev
echo.
echo 正在启动开发服务器...
npm run dev
pause
goto menu

:build
echo.
echo 正在构建生产版本...
npm run build
pause
goto menu

:preview
echo.
echo 正在预览生产版本...
npm run preview
pause
goto menu

:start_both
echo.
echo 正在同时启动WebDAV和开发服务器...
npm run start
pause
goto menu

:install
echo.
echo 正在安装依赖...
npm install
pause
goto menu

:exit_app
echo.
echo 感谢使用人生游戏管理系统！
pause