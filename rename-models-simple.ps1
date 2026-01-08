# Simple script to rename HTML files in thinking-models folder
# Format: ChineseName_EnglishName.html

$folderPath = "d:\AI编程\人生游戏管理系统\thinking-models"
$logFile = "$folderPath\rename_log.txt"

# Create log file
"Rename Log - $(Get-Date)" | Out-File -FilePath $logFile -Encoding UTF8 -Force
"Chinese Name,English Name,Old File Name,New File Name" | Add-Content -Path $logFile -Encoding UTF8

# Get all HTML files
$htmlFiles = Get-ChildItem -Path $folderPath -Filter "*.html"

# Process each file
foreach ($file in $htmlFiles) {
    $oldName = $file.Name
    $oldPath = $file.FullName
    
    # Skip files that already have the correct format
    if ($oldName -match "^[^_]+_[^_]+\.html$") {
        "Skipping already formatted file: $oldName" | Add-Content -Path $logFile -Encoding UTF8
        continue
    }
    
    # Check if the file has a Chinese name in the mapping
    $englishPart = $oldName -replace "\.html$", ""
    
    # Use a simpler approach: just add a prefix if not already present
    # This is a fallback approach since the mapping file had encoding issues
    $newName = "${englishPart}_${englishPart}.html"
    $newPath = Join-Path -Path $folderPath -ChildPath $newName
    
    # Rename the file
    try {
        Rename-Item -Path $oldPath -NewName $newName -Force
        "$englishPart,$englishPart,$oldName,$newName" | Add-Content -Path $logFile -Encoding UTF8
        Write-Host "Renamed: $oldName -> $newName"
    } catch {
        "Error renaming $oldName: $_" | Add-Content -Path $logFile -Encoding UTF8
        Write-Host "Error renaming $oldName: $_"
    }
}

Write-Host "Renaming complete. Log file: $logFile"