# 🚀 快速部署指南

## 项目信息

- **GitHub 用户名**: xiaocloneyao
- **项目名称**: gmgn_react
- **GitHub Pages 地址**: https://xiaocloneyao.github.io/gmgn_react/
- **GitHub 仓库地址**: https://github.com/xiaocloneyao/gmgn_react

## 部署步骤

### 步骤 1: 在 GitHub 上创建仓库

1. 访问 https://github.com/new
2. 仓库名称填写：`gmgn_react`
3. 设置为 **Public**（GitHub Pages 免费版需要）
4. **不要**勾选 "Add a README file"（项目已有）
5. 点击 "Create repository"

### 步骤 2: 推送代码到 GitHub

在项目目录执行以下命令：

```bash
cd /home/x499803737/screenshot-to-flutter-main/screenshot-to-flutter-main

# 添加所有文件
git add .

# 提交代码
git commit -m "Initial commit: GMGN.AI Clone - React implementation"

# 设置主分支名称
git branch -M main

# 添加远程仓库
git remote add origin https://github.com/xiaocloneyao/gmgn_react.git

# 推送到 GitHub
git push -u origin main
```

**注意**: 如果提示需要认证，请使用 Personal Access Token 或 SSH 密钥。

### 步骤 3: 启用 GitHub Pages

1. 访问 https://github.com/xiaocloneyao/gmgn_react/settings/pages
2. 在 **Source** 部分：
   - 选择 **GitHub Actions**
   - 点击 **Save**

### 步骤 4: 等待自动部署

1. 访问 https://github.com/xiaocloneyao/gmgn_react/actions
2. 查看 "Deploy to GitHub Pages" 工作流
3. 等待部署完成（通常 1-2 分钟）

### 步骤 5: 访问部署地址

部署成功后，访问：
**https://xiaocloneyao.github.io/gmgn_react/**

## 提交内容清单

✅ **GitHub Pages 部署地址（公开访问）**
```
https://xiaocloneyao.github.io/gmgn_react/
```

✅ **GitHub 项目仓库链接**
```
https://github.com/xiaocloneyao/gmgn_react
```

✅ **UX 流程文档（PDF/Markdown，包含在仓库中）**
- 文件路径：`UX_FLOW.md`
- 在线查看：https://github.com/xiaocloneyao/gmgn_react/blob/main/UX_FLOW.md

## 验证部署

部署成功后，可以访问以下页面验证：

- 首页：https://xiaocloneyao.github.io/gmgn_react/#/
- 排行榜：https://xiaocloneyao.github.io/gmgn_react/#/rank
- 复制交易：https://xiaocloneyao.github.io/gmgn_react/#/copytrade
- 趋势页面：https://xiaocloneyao.github.io/gmgn_react/#/trending
- 资产组合：https://xiaocloneyao.github.io/gmgn_react/#/portfolio

## 故障排除

### 如果推送失败

1. 检查是否已创建仓库
2. 确认仓库名称正确：`gmgn_react`
3. 确认使用正确的 GitHub 用户名：`xiaocloneyao`

### 如果部署失败

1. 检查 GitHub Actions 日志
2. 确认仓库设置为 Public
3. 确认 Pages 设置中选择了 "GitHub Actions"

### 如果页面无法访问

1. 等待几分钟（首次部署可能需要时间）
2. 检查 GitHub Actions 是否成功完成
3. 清除浏览器缓存

---

**完成部署后，请提供以下信息：**
- ✅ GitHub Pages 部署地址
- ✅ GitHub 项目仓库链接
- ✅ UX 流程文档链接

