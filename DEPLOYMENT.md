# GitHub Pages 部署指南

## 📦 项目信息

- **GitHub 用户名**: xiaocloneyao
- **项目名称**: gmgn_react
- **GitHub Pages 地址**: https://xiaocloneyao.github.io/gmgn_react/
- **GitHub 仓库地址**: https://github.com/xiaocloneyao/gmgn_react

## 🚀 部署步骤

### 1. 创建 GitHub 仓库

在 GitHub 上创建新仓库：
- 仓库名称：`gmgn_react`
- 设置为 Public（GitHub Pages 免费版需要公开仓库）
- 不要初始化 README、.gitignore 或 license（项目已包含）

### 2. 推送代码到 GitHub

```bash
# 在项目根目录执行
cd /home/x499803737/screenshot-to-flutter-main/screenshot-to-flutter-main

# 添加远程仓库
git remote add origin https://github.com/xiaocloneyao/gmgn_react.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

### 3. 启用 GitHub Pages

1. 进入仓库：https://github.com/xiaocloneyao/gmgn_react
2. 点击 **Settings** 标签
3. 在左侧菜单找到 **Pages**
4. 在 **Source** 部分：
   - 选择 **GitHub Actions**
   - 保存设置

### 4. 触发自动部署

GitHub Actions 工作流会在以下情况自动运行：
- 推送到 `main` 分支
- 手动触发（Actions → Deploy to GitHub Pages → Run workflow）

### 5. 查看部署状态

1. 进入仓库的 **Actions** 标签
2. 查看 "Deploy to GitHub Pages" 工作流
3. 等待部署完成（通常需要 1-2 分钟）

### 6. 访问部署地址

部署成功后，访问：
```
https://xiaocloneyao.github.io/gmgn_react/
```

## 📝 路由说明

项目使用 HashRouter，所有路由都使用 `#` 前缀：

- 首页：`https://xiaocloneyao.github.io/gmgn_react/#/`
- 排行榜：`https://xiaocloneyao.github.io/gmgn_react/#/rank`
- 复制交易：`https://xiaocloneyao.github.io/gmgn_react/#/copytrade`
- 趋势页面：`https://xiaocloneyao.github.io/gmgn_react/#/trending`
- 监控页面：`https://xiaocloneyao.github.io/gmgn_react/#/monitor`
- 跟踪页面：`https://xiaocloneyao.github.io/gmgn_react/#/track`
- 资产组合：`https://xiaocloneyao.github.io/gmgn_react/#/portfolio`

## 🔧 配置说明

### Vite 配置

项目已配置 `vite.config.ts`，生产环境使用 `/gmgn_react/` 作为基础路径：

```typescript
base: process.env.NODE_ENV === "production" ? "/gmgn_react/" : "/"
```

### GitHub Actions

自动部署工作流文件：`.github/workflows/deploy.yml`

工作流会在每次推送到 `main` 分支时：
1. 安装依赖
2. 构建项目
3. 部署到 GitHub Pages

## 🐛 故障排除

### 部署失败

1. 检查 GitHub Actions 日志
2. 确认仓库设置为 Public
3. 确认 Pages 设置中选择了 "GitHub Actions"

### 页面 404

1. 确认 `vite.config.ts` 中的 `base` 路径正确
2. 确认使用 HashRouter（已配置）
3. 清除浏览器缓存

### 资源加载失败

1. 检查构建产物中的资源路径
2. 确认所有静态资源在 `public/` 目录
3. 检查浏览器控制台的错误信息

## 📚 相关文档

- [README.md](./README.md) - 项目说明
- [UX_FLOW.md](./UX_FLOW.md) - UX 流程文档

---

**最后更新**: 2024
