import os
from moviepy.editor import AudioFileClip
import sys

def trim_audio_files(input_folder, output_folder=None):
    """
    处理输入文件夹中的所有音频文件，去除前2秒和后2秒
    :param input_folder: 输入音频文件夹路径
    :param output_folder: 输出音频文件夹路径，默认为在原文件名前加"trimmed_"
    """
    # 如果未指定输出文件夹，则在原文件夹中创建trimmed子文件夹
    if output_folder is None:
        output_folder = os.path.join(input_folder, "trimmed")
        if not os.path.exists(output_folder):
            os.makedirs(output_folder)
    
    # 支持的音频格式
    supported_formats = ('.mp3', '.wav', '.m4a', '.flac', '.aac', '.ogg')
    
    # 获取输入文件夹中的所有音频文件
    audio_files = [f for f in os.listdir(input_folder) if f.lower().endswith(supported_formats)]
    
    if not audio_files:
        print(f"在 {input_folder} 中未找到音频文件")
        return
    
    print(f"找到 {len(audio_files)} 个音频文件需要处理")
    
    for i, filename in enumerate(audio_files, 1):
        input_path = os.path.join(input_folder, filename)
        
        # 确定输出路径 - 保持原始文件名
        output_path = os.path.join(output_folder, filename)
        
        print(f"[{i}/{len(audio_files)}] 正在处理: {filename}")
        
        try:
            # 加载音频文件
            audio = AudioFileClip(input_path)
            
            # 获取音频总时长
            duration = audio.duration
            
            # 检查音频是否足够长以进行修剪（至少4秒）
            if duration <= 4:
                print(f"  警告: {filename} 长度不足4秒 ({duration:.2f}s)，跳过处理")
                continue
            
            # 计算新的开始和结束时间
            new_start = 2.0  # 去掉前2秒
            new_end = duration - 2.0  # 去掉后2秒
            
            # 进行修剪
            trimmed_audio = audio.subclip(new_start, new_end)
            
            # 保存修剪后的音频
            trimmed_audio.write_audiofile(output_path, verbose=False, logger=None)
            
            # 关闭音频对象以释放资源
            audio.close()
            trimmed_audio.close()
            
            print(f"  已保存: {os.path.basename(output_path)}")
            
        except Exception as e:
            print(f"  错误: 处理 {filename} 时出现问题: {str(e)}")
            # 确保在出现异常时也关闭资源
            try:
                audio.close()
            except:
                pass
    
    print(f"\n处理完成! 修剪后的文件保存在: {output_folder}")

if __name__ == "__main__":
    # 设置输入和输出文件夹路径
    input_folder = r"d:\AI编程\人生游戏管理系统\public\audio\pomodoro\bgm copy"
    
    # 确保输入文件夹存在
    if not os.path.exists(input_folder):
        print(f"错误: 输入文件夹不存在: {input_folder}")
        sys.exit(1)
    
    # 运行处理函数
    trim_audio_files(input_folder)
    
    print("\n所有音频文件处理完毕!")