# Set ffmpeg.exe path
$ffmpegPath = Join-Path $PSScriptRoot "node_modules\ffmpeg-static\ffmpeg.exe"

# Set target folder path
$audioFolder = Join-Path $PSScriptRoot "public\audio\pomodoro\bgm copy"

# Get all audio files
$audioExtensions = @(".mp3", ".wav", ".ogg", ".flac", ".m4a")
$audioFiles = Get-ChildItem -Path $audioFolder | Where-Object { $audioExtensions -contains $_.Extension.ToLower() }

Write-Host "Found $($audioFiles.Count) audio files to process"

# Process each audio file
foreach ($audioFile in $audioFiles) {
    $inputPath = $audioFile.FullName
    $outputPath = Join-Path $audioFolder "temp_$($audioFile.Name)"
    
    Write-Host "Processing: $($audioFile.Name)"
    
    # Get audio duration using ffmpeg
    $ffmpegOutput = & "$ffmpegPath" -i "$inputPath" 2>&1
    $durationLine = $ffmpegOutput | Where-Object { $_ -match "Duration:" }
    
    if ($durationLine -match "Duration: (\d{2}):(\d{2}):(\d{2}\.\d{2})") {
        $hours = [int]$Matches[1]
        $minutes = [int]$Matches[2]
        $seconds = [double]$Matches[3]
        $totalSeconds = $hours * 3600 + $minutes * 60 + $seconds
        
        # Check if audio is long enough to trim
        if ($totalSeconds -le 4) {
            Write-Host "Warning: $($audioFile.Name) is less than 4 seconds, skipping"
            continue
        }
        
        # Calculate trim parameters: remove first 2 seconds and last 2 seconds
        $startTime = 2
        $trimDuration = $totalSeconds - 4
        
        # Trim audio using ffmpeg
        & "$ffmpegPath" -i "$inputPath" -ss $startTime -t $trimDuration -c copy "$outputPath" 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            # Replace original file
            Remove-Item -Path $inputPath -Force
            Rename-Item -Path $outputPath -NewName $audioFile.Name -Force
            Write-Host "Completed: $($audioFile.Name)"
        } else {
            Write-Host "Error processing $($audioFile.Name): ffmpeg command failed"
        }
    } else {
        Write-Host "Error processing $($audioFile.Name): cannot get duration"
    }
}

Write-Host "All audio files processed!"
