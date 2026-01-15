# Batch modify layout of thinking model HTML files
# Change from left-right layout to top-bottom layout

# Define file path
$folderPath = "d:\AI编程\人生游戏管理系统\thinking-models"
$htmlFiles = Get-ChildItem -Path $folderPath -Filter *.html -Recurse

# Define strings to replace
$oldLayout = "grid grid-cols-1 lg:grid-cols-2 gap-20 items-center"
$newLayout = "grid grid-cols-1 gap-20"

# Counter for modified files
$modifiedCount = 0

# Loop through all HTML files
foreach ($file in $htmlFiles) {
    Write-Output "Processing file: $($file.FullName)"
    
    try {
        # Read file content
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
        
        # Check if file contains the layout to replace
        if ($content -match $oldLayout) {
            # Replace layout
            $newContent = $content -replace $oldLayout, $newLayout
            
            # Save modified file
            Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8
            Write-Output "  [OK] Layout changed to top-bottom"
            $modifiedCount++
        } else {
            Write-Output "  [SKIP] Layout not found"
        }
    } catch {
        Write-Output "  [ERROR] $($_.Exception.Message)"
    }
    
    Write-Output ""
}

Write-Output "Processing complete!"
Write-Output "Total files processed: $($htmlFiles.Count)"
Write-Output "Files modified: $modifiedCount"
