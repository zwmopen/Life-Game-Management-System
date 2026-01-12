Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$epubPath = "self-teaching-book.epub"
$tempZipPath = "temp.zip"

# 删除旧文件
if (Test-Path $epubPath) {
    Remove-Item $epubPath -Force
}
if (Test-Path $tempZipPath) {
    Remove-Item $tempZipPath -Force
}

# 创建临时zip文件
$zip = [System.IO.Compression.ZipFile]::Open($tempZipPath, [System.IO.Compression.ZipArchiveMode]::Create)

# 添加mimetype文件，不压缩
$mimetypeEntry = $zip.CreateEntry("mimetype", [System.IO.Compression.CompressionLevel]::NoCompression)
$mimetypeStream = $mimetypeEntry.Open()
$mimetypeContent = [System.Text.Encoding]::UTF8.GetBytes("application/epub+zip")
$mimetypeStream.Write($mimetypeContent, 0, $mimetypeContent.Length)
$mimetypeStream.Close()

# 添加EPUB目录下的所有文件
$epubDir = "EPUB"
Get-ChildItem -Path $epubDir -Recurse | ForEach-Object {
    $entryPath = $_.FullName.Replace($PSScriptRoot + "\", "")
    $zipEntry = $zip.CreateEntry($entryPath)
    $fileStream = $_.OpenRead()
    $zipStream = $zipEntry.Open()
    $fileStream.CopyTo($zipStream)
    $fileStream.Close()
    $zipStream.Close()
}

# 关闭zip文件
$zip.Dispose()

# 重命名为epub
Rename-Item -Path $tempZipPath -NewName $epubPath -Force

Write-Host "EPUB文件已创建：$epubPath"