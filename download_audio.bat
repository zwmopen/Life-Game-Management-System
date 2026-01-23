@echo off
REM 切换到音频目录
cd /d "public\audio\sfx"

echo 正在下载音效文件...
echo.

REM 下载购买音效
curl -o "购买音效.mp3" "https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-221.mp3"
echo 购买音效.mp3 下载完成

REM 下载任务完成音效
curl -o "任务完成音效.mp3" "https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.mp3"
echo 任务完成音效.mp3 下载完成

REM 下载任务放弃音效
curl -o "任务放弃音效.mp3" "https://assets.mixkit.co/sfx/preview/mixkit-game-show-wrong-answer-buzz-950.mp3"
echo 任务放弃音效.mp3 下载完成

REM 下载金币收入音效
curl -o "金币收入音效.mp3" "https://assets.mixkit.co/sfx/preview/mixkit-coins-spinning-in-hands-1933.mp3"
echo 金币收入音效.mp3 下载完成

REM 下载成就解锁音效
curl -o "成就解锁音效.mp3" "https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3"
echo 成就解锁音效.mp3 下载完成

REM 下载骰子音效
curl -o "骰子音效.mp3" "https://assets.mixkit.co/sfx/preview/mixkit-dice-roll-6125.mp3"
echo 骰子音效.mp3 下载完成

echo.
echo 所有音效文件下载完成！
pause