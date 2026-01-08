# 读取思维模型数据
$thinkingModels = Get-Content -Path "d:\AI编程\人生游戏管理系统\components\thinkingModels.json" | ConvertFrom-Json

# 获取所有思维模型的ID
$thinkingModelIds = $thinkingModels | ForEach-Object { $_.id }

# 读取MissionControl.tsx文件
$missionControlContent = Get-Content -Path "d:\AI编程\人生游戏管理系统\components\MissionControl.tsx" -Raw

# 更新chartCategories状态中的thinking数组
$chartCategoriesRegex = [regex]::new('const \[chartCategories, setChartCategories\] = useState<{ \[key: string\]: string\[\] }>({[\s\S]*?thinking: \[(.*?)\][\s\S]*?});')
$match = $chartCategoriesRegex.Match($missionControlContent)

if ($match.Success) {
    $thinkingArray = $match.Groups[1].Value
    
    # 提取当前的thinking数组
    $currentThinkingModels = $thinkingArray.Split(',') | ForEach-Object { $_.Trim().Replace("'", "") } | Where-Object { $_ }
    
    # 合并所有思维模型ID
    $allThinkingModels = @($currentThinkingModels) + @($thinkingModelIds) | Select-Object -Unique
    
    # 替换匹配的部分
    $updatedThinkingArray = $allThinkingModels | ForEach-Object { "'$($_)'" } -join ', '
    $missionControlContent = $missionControlContent.Replace($thinkingArray, $updatedThinkingArray)
}

# 更新initialCategories中的thinking数组
$initialCategoriesRegex = [regex]::new('const initialCategories = {[\s\S]*?thinking: \[(.*?)\][\s\S]*?};')
$match = $initialCategoriesRegex.Match($missionControlContent)

if ($match.Success) {
    $thinkingArray = $match.Groups[1].Value
    
    # 提取当前的thinking数组
    $currentThinkingModels = $thinkingArray.Split(',') | ForEach-Object { $_.Trim().Replace("'", "") } | Where-Object { $_ }
    
    # 合并所有思维模型ID
    $allThinkingModels = @($currentThinkingModels) + @($thinkingModelIds) | Select-Object -Unique
    
    # 替换匹配的部分
    $updatedThinkingArray = $allThinkingModels | ForEach-Object { "'$($_)'" } -join ', '
    $missionControlContent = $missionControlContent.Replace($thinkingArray, $updatedThinkingArray)
}

# 保存更新后的文件
$missionControlContent | Set-Content -Path "d:\AI编程\人生游戏管理系统\components\MissionControl.tsx" -Encoding UTF8

Write-Host "chartCategories updated successfully!"
Write-Host "Added $($thinkingModelIds.Count) thinking models."