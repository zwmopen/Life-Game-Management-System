# 设置ffmpeg.exe的路径
$ffmpegPath = Join-Path $PSScriptRoot "node_modules\ffmpeg-static\ffmpeg.exe"

# 设置目标文件夹路径
$audioFolder = Join-Path $PSScriptRoot "public\audio\pomodoro\bgm copy"

# 获取所有音频文件
$audioExtensions = @(".mp3", ".wav", ".ogg", ".flac", ".m4a")
$audioFiles = Get-ChildItem -Path $audioFolder | Where-Object { $audioExtensions -contains $_.Extension.ToLower() }

Write-Host "找到 $($audioFiles.Count) 个音频文件需要处理"

# 遍历处理每个音频文件
foreach ($audioFile in $audioFiles) {
    $inputPath = $audioFile.FullName
    $outputPath = Join-Path $audioFolder "temp_$($audioFile.Name)"
    
    Write-Host "处理: $($audioFile.Name)"
    
    # 使用ffmpeg获取音频时长
    $ffmpegOutput = & "$ffmpegPath" -i "$inputPath" 2>&1
    $durationLine = $ffmpegOutput | Where-Object { $_ -match "Duration:" }
    
    if ($durationLine -match "Duration: (\d{2}):(\d{2}):(\d{2}\.\d{2})") {
        $hours = [int]$Matches[1]
        $minutes = [int]$Matches[2]
        $seconds = [double]$Matches[3]
        $totalSeconds = $hours * 3600 + $minutes * 60 + $seconds
        
        # 检查音频时长是否足够裁剪
        if ($totalSeconds -le 4) {
            Write-Host "警告: $($audioFile.Name) 时长不足4秒，跳过处理"
            continue
        }
        
        # 计算裁剪参数：去掉前2秒和后2秒
        $startTime = 2
        $trimDuration = $totalSeconds - 4
        
        # 使用ffmpeg裁剪音频
        & "$ffmpegPath" -i "$inputPath" -ss $startTime -t $trimDuration -c copy "$outputPath" 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            # 替换原文件
            Remove-Item -Path $inputPath -Force
            Rename-Item -Path $outputPath -NewName $audioFile.Name -Force
            Write-Host "完成: $($audioFile.Name)"
        } else {
            Write-Host "错误处理 $($audioFile.Name): ffmpeg命令执行失败"
        }
    } else {
        Write-Host "错误处理 $($audioFile.Name): 无法获取音频时长"
    }
}

Write-Host "所有音频文件处理完成！"
