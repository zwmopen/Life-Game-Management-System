# 安卓应用构建指南

## 1. 环境准备

### 1.1 安装 Node.js
- 下载并安装 Node.js 18 或更高版本：https://nodejs.org/
- 验证安装：`node -v` 和 `npm -v`

### 1.2 安装 Android Studio
- 下载并安装 Android Studio：https://developer.android.com/studio
- 安装过程中选择 "Custom" 选项，确保安装以下组件：
  - Android SDK
  - Android SDK Platform
  - Android Virtual Device (AVD)
  - Intel x86 Emulator Accelerator (HAXM installer)

### 1.3 配置 Android SDK
- 打开 Android Studio，进入 `File > Settings > Appearance & Behavior > System Settings > Android SDK`
- 选择并安装以下 SDK Platforms：
  - Android 13 (Tiramisu) 或更高版本
  - Android SDK Platform-Tools
  - Android SDK Build-Tools
- 配置环境变量：
  - 将 Android SDK 路径添加到 `ANDROID_HOME` 环境变量
  - 将 `$ANDROID_HOME/platform-tools` 和 `$ANDROID_HOME/tools` 添加到 `PATH` 环境变量

### 1.4 安装 JDK
- Android Studio 会自动安装 JDK，无需单独安装
- 验证 JDK 版本：`java -version`

## 2. 项目配置

### 2.1 安装 Capacitor
- 确保项目已安装 Capacitor：
  ```bash
  npm install @capacitor/core @capacitor/cli
  ```
- 初始化 Capacitor：
  ```bash
  npx cap init
  ```

### 2.2 添加 Android 平台
```bash
npm install @capacitor/android
npx cap add android
```

### 2.3 配置应用信息
- 编辑 `capacitor.config.ts` 文件，配置应用的基本信息：
  ```typescript
  import { CapacitorConfig } from '@capacitor/cli';

  const config: CapacitorConfig = {
    appId: 'com.lifegame.manager',
    appName: '人生游戏管理系统',
    webDir: 'dist',
    server: {
      androidScheme: 'https'
    }
  };

  export default config;
  ```

### 2.4 配置应用权限
- 编辑 `android/app/src/main/AndroidManifest.xml` 文件，添加所需权限：
  ```xml
  <uses-permission android:name="android.permission.INTERNET" />
  <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
  <!-- 根据应用需求添加其他权限 -->
  ```

## 3. 构建流程

### 3.1 构建 Web 应用
```bash
npm run build
```

### 3.2 更新 Android 平台
```bash
npx cap sync
```

### 3.3 打开 Android 项目
```bash
npx cap open android
```

### 3.4 在 Android Studio 中构建 APK

#### 3.4.1 构建调试版 APK
1. 在 Android Studio 中，点击 `Build > Make Project`
2. 构建完成后，APK 文件将生成在 `android/app/build/outputs/apk/debug/` 目录下

#### 3.4.2 构建发布版 APK

1. **生成签名密钥**
   ```bash
   keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **配置签名信息**
   - 在 Android Studio 中，进入 `Build > Generate Signed Bundle / APK`
   - 选择 "APK" 并点击 "Next"
   - 点击 "Create new..." 按钮，填写签名密钥信息
   - 保存签名配置文件 `signing.properties` 到项目根目录

3. **构建发布版 APK**
   - 选择 "Build Type" 为 "release"
   - 点击 "Finish" 开始构建
   - 构建完成后，APK 文件将生成在 `android/app/build/outputs/apk/release/` 目录下

### 3.5 使用命令行构建 APK

#### 3.5.1 构建调试版 APK
```bash
cd android
./gradlew assembleDebug
```

#### 3.5.2 构建发布版 APK
```bash
cd android
./gradlew assembleRelease
```

## 4. 调试与测试

### 4.1 使用 Android 模拟器
1. 在 Android Studio 中，点击 `Tools > AVD Manager`
2. 创建一个新的虚拟设备或使用现有设备
3. 启动虚拟设备
4. 运行应用：`npx cap run android`

### 4.2 使用物理设备
1. 启用设备的开发者选项和 USB 调试
2. 使用 USB 数据线连接设备到电脑
3. 验证设备连接：`adb devices`
4. 运行应用：`npx cap run android`

### 4.3 调试应用
- 使用 Chrome DevTools 调试 Web 部分：
  ```bash
  npx cap open android
  ```
  - 在 Android Studio 中运行应用
  - 打开 Chrome，输入 `chrome://inspect`
  - 选择你的应用进行调试

## 5. 优化与配置

### 5.1 应用图标配置
- 替换 `android/app/src/main/res/mipmap-*` 目录下的图标文件
- 图标尺寸要求：
  - mipmap-mdpi: 48x48
  - mipmap-hdpi: 72x72
  - mipmap-xhdpi: 96x96
  - mipmap-xxhdpi: 144x144
  - mipmap-xxxhdpi: 192x192

### 5.2 启动屏幕配置
- 编辑 `android/app/src/main/res/drawable/splash.png`
- 配置 `android/app/src/main/res/layout/splash_screen.xml`

### 5.3 性能优化
- 启用 ProGuard 混淆：
  - 编辑 `android/app/build.gradle` 文件
  - 设置 `minifyEnabled true` 和 `shrinkResources true`
- 配置 WebView 优化：
  - 启用硬件加速
  - 配置缓存策略

## 6. 发布与部署

### 6.1 生成 App Bundle (AAB)
1. 在 Android Studio 中，点击 `Build > Generate Signed Bundle / APK`
2. 选择 "Android App Bundle" 并点击 "Next"
3. 选择签名配置并点击 "Finish"
4. AAB 文件将生成在 `android/app/build/outputs/bundle/release/` 目录下

### 6.2 上传到 Google Play Store
1. 登录 Google Play Console：https://play.google.com/console
2. 创建应用或选择现有应用
3. 进入 "Release > Production"
4. 上传 AAB 文件
5. 填写发布信息并提交审核

### 6.3 安装到设备
- 调试版：直接将 APK 文件复制到设备并安装
- 发布版：通过 Google Play Store 或其他应用商店安装

## 7. 常见问题与解决方案

### 7.1 构建失败
- 检查 Gradle 版本是否兼容
- 确保所有依赖已正确安装
- 清理构建缓存：`./gradlew clean`

### 7.2 设备连接问题
- 检查 USB 驱动是否安装正确
- 确保 USB 调试已启用
- 重启 ADB 服务：`adb kill-server && adb start-server`

### 7.3 应用崩溃
- 查看日志：`adb logcat`
- 检查权限配置
- 验证 WebView 兼容性

### 7.4 性能问题
- 优化图片资源
- 减少网络请求
- 优化 JavaScript 代码

## 8. 自动化构建

### 8.1 使用 GitHub Actions
```yaml
name: Android CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3
    - name: Set up JDK 17
      uses: actions/setup-java@v3
      with:
        java-version: '17'
        distribution: 'temurin'
    - name: Install dependencies
      run: npm ci
    - name: Build web app
      run: npm run build
    - name: Sync Capacitor
      run: npx cap sync
    - name: Build APK
      run: cd android && ./gradlew assembleDebug
    - name: Upload APK
      uses: actions/upload-artifact@v3
      with:
        name: app-debug
        path: android/app/build/outputs/apk/debug/app-debug.apk
```

### 8.2 使用 Jenkins
- 配置 Jenkins 服务器
- 创建新的流水线任务
- 配置 Git 仓库和构建脚本
- 设置构建触发器

## 9. 版本管理

### 9.1 版本号格式
- 使用语义化版本号：`MAJOR.MINOR.PATCH`
- 示例：`1.0.0`

### 9.2 更新版本号
- 编辑 `package.json` 文件中的 `version` 字段
- 运行 `npx cap sync` 更新 Android 项目版本
- 在 `android/app/build.gradle` 文件中更新 `versionCode` 和 `versionName`

## 10. 安全最佳实践

### 10.1 代码混淆
- 启用 ProGuard 混淆
- 配置混淆规则文件 `proguard-rules.pro`

### 10.2 敏感信息保护
- 不在代码中硬编码敏感信息
- 使用环境变量或配置文件管理敏感数据
- 加密存储用户数据

### 10.3 网络安全
- 使用 HTTPS 协议
- 验证服务器证书
- 实现安全的身份验证机制

## 11. 性能监控与优化

### 11.1 使用 Firebase Performance Monitoring
- 集成 Firebase Performance SDK
- 监控应用性能指标
- 分析和优化瓶颈

### 11.2 使用 Android Profiler
- 在 Android Studio 中使用 Profiler 工具
- 监控 CPU、内存和网络使用情况
- 识别和解决性能问题

## 12. 后续维护

### 12.1 定期更新依赖
- 更新 Capacitor 版本：`npm update @capacitor/core @capacitor/android`
- 更新 Android SDK 和 Build Tools
- 更新 Gradle 版本

### 12.2 收集用户反馈
- 集成 Firebase Crashlytics
- 实现应用内反馈机制
- 定期分析用户反馈和崩溃报告

### 12.3 持续集成与部署
- 建立自动化构建流程
- 实现持续测试和部署
- 定期发布更新和修复

## 13. 参考资源

- [Capacitor 官方文档](https://capacitorjs.com/docs/)
- [Android 开发者文档](https://developer.android.com/docs)
- [Android Studio 文档](https://developer.android.com/studio/intro)
- [Google Play Console 文档](https://support.google.com/googleplay/android-developer/)

---

本指南涵盖了从环境准备到应用发布的完整流程，适合开发人员参考和使用。根据项目实际情况，可能需要调整部分配置和步骤。