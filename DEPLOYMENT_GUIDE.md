# 人生游戏管理系统 - 部署指南

本文档详细介绍了如何将人生游戏管理系统部署到各种免费静态网站托管平台。

## 项目信息
- 项目名称：人生游戏管理系统
- 仓库地址：https://github.com/zwmopen/Life-Game-Management-System
- 构建命令：`npm run build`
- 构建输出目录：`dist`
- 框架：React + TypeScript + Vite

## 已部署平台

| 平台名称 | 访问地址 | 部署状态 |
|---------|---------|---------|
| GitHub Pages | https://zwmopen.github.io/Life-Game-Management-System/ | ✅ 已部署 |
| Vercel | https://life-game-management-system.vercel.app/ | ✅ 已部署 |
| Netlify | https://life-game-management-system.netlify.app/ | ✅ 已部署 |

## 部署步骤

### 1. GitHub Pages

#### 配置方式
1. 在GitHub仓库中创建 `.github/workflows/deploy.yml` 文件
2. 写入以下内容：
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
          publish_branch: gh-pages
          force_orphan: true
```
3. 推送代码到main分支，GitHub Actions会自动部署
4. 部署完成后，访问 `https://<username>.github.io/<repository-name>/`

### 2. Vercel

#### 部署步骤
1. 访问 https://vercel.com/，使用GitHub账号登录
2. 点击右上角 "New Project"
3. 选择 "Import Git Repository"
4. 连接GitHub账号，选择仓库：`zwmopen/Life-Game-Management-System`
5. 配置部署选项：
   - 构建命令：`npm run build`
   - 输出目录：`dist`
   - 框架预设：选择 "Vite"
6. 点击 "Deploy"
7. 部署完成后，访问生成的域名，如 `your-project.vercel.app`

### 3. Netlify

#### 部署步骤
1. 访问 https://www.netlify.com/，使用GitHub账号登录
2. 点击 "Add new site" → "Import an existing project"
3. 选择 "GitHub"，连接GitHub账号，选择仓库
4. 配置部署选项：
   - 构建命令：`npm run build`
   - 发布目录：`dist`
5. 点击 "Deploy site"
6. 部署完成后，访问生成的域名，如 `your-site.netlify.app`

### 4. Cloudflare Pages

#### 部署步骤
1. 访问 https://pages.cloudflare.com/，登录Cloudflare账号
2. 点击 "Create a project"
3. 选择 "Connect to Git"
4. 连接GitHub账号，选择仓库
5. 配置部署选项：
   - 生产分支：`main`
   - 构建命令：`npm run build`
   - 构建输出目录：`dist`
6. 点击 "Save and Deploy"
7. 部署完成后，访问生成的域名，如 `your-project.pages.dev`

### 5. Render

#### 部署步骤
1. 访问 https://render.com/，使用GitHub账号登录
2. 点击 "New" → "Static Site"
3. 连接GitHub账号，选择仓库
4. 配置部署选项：
   - 名称：自定义
   - 分支：`main`
   - 构建命令：`npm run build`
   - 发布目录：`dist`
5. 点击 "Create Static Site"
6. 部署完成后，访问生成的域名，如 `your-site.onrender.com`

### 6. Surge.sh

#### 部署步骤
1. 安装Surge CLI：`npm install -g surge`
2. 构建项目：`npm run build`
3. 部署到Surge：`surge dist`
4. 首次使用会提示输入邮箱和密码注册
5. 部署时可自定义域名，如 `your-project.surge.sh`
6. 确认部署后，即可访问

### 7. GitLab Pages

#### 部署步骤
1. 访问 https://gitlab.com/，登录GitLab账号
2. 导入GitHub仓库：点击 "New project" → "Import project" → "GitHub"
3. 在项目根目录创建 `.gitlab-ci.yml` 文件
4. 写入以下内容：
```yaml
image: node:20
pages:
  stage: deploy
  script:
    - npm install
    - npm run build
    - mkdir .public
    - cp -r dist/* .public
    - mv .public public
  artifacts:
    paths:
      - public
  only:
    - main
```
5. 推送代码到GitLab仓库，GitLab CI会自动部署
6. 部署完成后，访问 `https://<username>.gitlab.io/<project-name>/`

### 8. Bitbucket Cloud

#### 部署步骤
1. 访问 https://bitbucket.org/，登录Bitbucket账号
2. 导入GitHub仓库：点击 "Create" → "Import repository" → "GitHub"
3. 在项目根目录创建 `bitbucket-pipelines.yml` 文件
4. 写入以下内容：
```yaml
image: node:20
pipelines:
  branches:
    main:
      - step:
          name: Build and Deploy
          script:
            - npm install
            - npm run build
            - pipe: atlassian/bitbucket-pipelines-deploy-to-bitbucket-cloud:0.2.3
              variables:
                BITBUCKET_USERNAME: $BITBUCKET_USERNAME
                BITBUCKET_APP_PASSWORD: $BITBUCKET_APP_PASSWORD
                WORKING_DIR: 'dist'
```
5. 在Bitbucket项目设置中添加环境变量：
   - `BITBUCKET_USERNAME`：您的Bitbucket用户名
   - `BITBUCKET_APP_PASSWORD`：在Bitbucket个人设置中创建
6. 推送代码到Bitbucket仓库，Bitbucket Pipelines会自动部署
7. 部署完成后，访问 `https://<username>.bitbucket.io/<project-name>/`

## 部署注意事项

1. **构建检查**：部署前确保本地构建成功，运行 `npm run build` 检查
2. **权限设置**：所有平台都需要访问您的GitHub仓库权限
3. **域名管理**：每个平台都会生成一个免费域名，您可以根据需要绑定自定义域名
4. **自动部署**：大多数平台支持代码推送后自动部署
5. **环境变量**：如果项目需要环境变量，可以在各平台的项目设置中配置
6. **SSL证书**：所有平台都提供免费的SSL证书

## 各平台优势对比

| 平台名称 | 优势 | 适合场景 |
|---------|------|----------|
| GitHub Pages | 与GitHub深度集成，适合开源项目 | 开源项目展示 |
| Vercel | 对现代前端框架支持最好，部署速度最快 | 现代前端框架项目 |
| Netlify | 功能丰富，支持表单和函数计算 | 需要额外功能的项目 |
| Cloudflare Pages | 全球CDN，速度快，无带宽限制 | 高流量项目 |
| Render | 支持多种部署类型，适合全栈应用 | 全栈应用 |
| Surge.sh | 简单易用，适合快速部署 | 快速原型展示 |
| GitLab Pages | 适合使用GitLab的团队 | GitLab用户 |
| Bitbucket Cloud | 适合使用Atlassian生态的团队 | Atlassian用户 |

## 后续维护

1. **更新部署**：推送代码到GitHub仓库后，各平台会自动重新部署
2. **监控状态**：可以在各平台的控制台查看部署状态和日志
3. **绑定域名**：如果需要自定义域名，可以在各平台的项目设置中配置
4. **分析统计**：部分平台提供访问统计功能，可以查看网站访问情况

## 故障排查

1. **部署失败**：检查构建日志，确保构建命令和输出目录配置正确
2. **页面空白**：检查浏览器控制台，查看是否有JavaScript错误
3. **资源加载失败**：确保 `vite.config.ts` 中的 `base` 配置正确
4. **404错误**：检查路由配置，确保使用了正确的路由模式

## 联系信息

如果您在部署过程中遇到问题，可以通过以下方式联系：
- GitHub Issues：https://github.com/zwmopen/Life-Game-Management-System/issues

---

**更新时间**：2026-01-01
**文档版本**：v1.0.0