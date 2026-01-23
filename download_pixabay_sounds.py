import requests
from bs4 import BeautifulSoup
import os

# 音效搜索关键词
sound_keywords = {
    "任务完成音效": "positive beep",
    "任务放弃音效": "error beep",
    "成就解锁音效": "achievement",
    "金币收入音效": "coin",
    "金币支出音效": "purchase",
    "骰子音效": "dice roll"
}

# 目标目录
target_dir = "public/audio/sfx"
os.makedirs(target_dir, exist_ok=True)

def download_sound(keyword, output_file):
    """从Pixabay下载音效"""
    # 构建搜索URL
    search_url = f"https://pixabay.com/zh/sound-effects/search/{keyword.replace(' ', '%20')}/"
    
    # 发送请求
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    print(f"搜索关键词: {keyword}")
    print(f"搜索URL: {search_url}")
    
    # 获取搜索结果页面
    response = requests.get(search_url, headers=headers)
    if response.status_code != 200:
        print(f"搜索失败: {response.status_code}")
        return False
    
    # 解析HTML
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # 查找下载链接
    # 先尝试查找js-download类
    download_links = soup.find_all('a', class_='js-download')
    if not download_links:
        # 尝试查找包含download的链接
        download_links = soup.find_all('a', href=lambda href: href and '/download/' in href)
    
    if not download_links:
        print("未找到下载链接")
        return False
    
    # 获取第一个下载链接
    first_download = download_links[0]
    download_href = first_download.get('href')
    
    if not download_href:
        print("下载链接为空")
        return False
    
    # 构建完整下载URL
    if not download_href.startswith('http'):
        download_href = f"https://pixabay.com{download_href}"
    
    print(f"下载链接: {download_href}")
    
    # 下载音效文件
    sound_response = requests.get(download_href, headers=headers, stream=True)
    if sound_response.status_code == 200:
        with open(output_file, 'wb') as f:
            for chunk in sound_response.iter_content(chunk_size=8192):
                f.write(chunk)
        print(f"✓ 成功下载: {output_file}")
        return True
    else:
        print(f"下载失败: {sound_response.status_code}")
        return False

# 下载所有音效
for sound_name, keyword in sound_keywords.items():
    output_file = os.path.join(target_dir, f"{sound_name}.mp3")
    download_sound(keyword, output_file)

print("\n所有音效下载完成！")