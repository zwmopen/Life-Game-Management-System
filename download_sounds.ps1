# 设置目标目录
$targetDir = "public\audio\sfx"
if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force
}

# 音频文件列表
$soundFiles = @(
    @{ Name = "任务完成音效"; Url = "https://cdn.pixabay.com/audio/2022/03/24/audio_41fead3bf0.mp3" },
    @{ Name = "任务放弃音效"; Url = "https://cdn.pixabay.com/audio/2022/03/24/audio_41fead3bf0.mp3" },
    @{ Name = "成就解锁音效"; Url = "https://cdn.pixabay.com/audio/2022/03/24/audio_41fead3bf0.mp3" },
    @{ Name = "金币收入音效"; Url = "https://cdn.pixabay.com/audio/2022/03/24/audio_41fead3bf0.mp3" },
    @{ Name = "金币支出音效"; Url = "https://cdn.pixabay.com/audio/2022/03/24/audio_41fead3bf0.mp3" },
    @{ Name = "骰子音效"; Url = "https://cdn.pixabay.com/audio/2022/03/24/audio_41fead3bf0.mp3" },
    @{ Name = "购买音效"; Url = "https://cdn.pixabay.com/audio/2022/03/24/audio_41fead3bf0.mp3" }
)

# 下载每个音频文件
foreach ($sound in $soundFiles) {
    $outputPath = Join-Path $targetDir "$($sound.Name).mp3"
    Write-Host "正在下载: $($sound.Name)"
    Write-Host "URL: $($sound.Url)"
    
    try {
        Invoke-WebRequest -Uri $sound.Url -OutFile $outputPath -ErrorAction Stop
        Write-Host "✓ 成功下载: $outputPath"
    } catch {
        Write-Host "✗ 下载失败: $($sound.Name) - $($_.Exception.Message)"
    }
    Write-Host ""
}

Write-Host "所有音效下载完成！"