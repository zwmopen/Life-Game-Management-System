# 切换到音频目录
Set-Location -Path "public/audio/sfx"

# 下载购买音效
Write-Host "正在下载: 购买音效"
Invoke-WebRequest -Uri "https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-221.mp3" -OutFile "购买音效.mp3"

# 下载任务完成音效
Write-Host "正在下载: 任务完成音效"
Invoke-WebRequest -Uri "https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.mp3" -OutFile "任务完成音效.mp3"

# 下载任务放弃音效
Write-Host "正在下载: 任务放弃音效"
Invoke-WebRequest -Uri "https://assets.mixkit.co/sfx/preview/mixkit-game-show-wrong-answer-buzz-950.mp3" -OutFile "任务放弃音效.mp3"

# 下载金币收入音效
Write-Host "正在下载: 金币收入音效"
Invoke-WebRequest -Uri "https://assets.mixkit.co/sfx/preview/mixkit-coins-spinning-in-hands-1933.mp3" -OutFile "金币收入音效.mp3"

# 下载成就解锁音效
Write-Host "正在下载: 成就解锁音效"
Invoke-WebRequest -Uri "https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3" -OutFile "成就解锁音效.mp3"

# 下载骰子音效
Write-Host "正在下载: 骰子音效"
Invoke-WebRequest -Uri "https://assets.mixkit.co/sfx/preview/mixkit-dice-roll-6125.mp3" -OutFile "骰子音效.mp3"

Write-Host "下载完成！"