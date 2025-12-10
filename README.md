# GMGN.AI 复制交易平台

基于 React + TypeScript 开发的 GMGN.AI 复制交易平台前端应用，实现了像素级还原的移动端界面，包含用户认证、钱包管理、复制交易、市场数据展示等核心功能。

## 📋 项目信息

- **项目名称**: GMGN.AI Copy Trading Platform
- **技术栈**: React 18 + TypeScript + Vite + Tailwind CSS
- **UI 组件库**: Radix UI + shadcn/ui
- **路由**: React Router v6
- **状态管理**: React Hooks + localStorage
- **AI 工具**: Lovable.dev (用于生成初始代码)

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0 或 yarn >= 1.22.0

### 安装依赖

```bash
npm install
```

### 配置环境变量（可选）

如果要使用真实市场数据，创建 `.env` 文件：

```bash
# 启用真实数据
VITE_USE_REAL_DATA=true

# Birdeye API (可选)
VITE_BIRDEYE_API_KEY=your_api_key_here

# 其他 API 配置（详见 REAL_DATA_INTEGRATION.md）
```

**注意**: 默认使用 Mock 数据，无需配置即可运行。

### 开发模式

```bash
npm run dev
```

访问 http://localhost:8080 查看应用

### 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist/` 目录

### 预览生产构建

```bash
npm run preview
```

## 📁 项目结构

```
screenshot-to-flutter-main/
├── src/
│   ├── components/          # 可复用组件
│   │   ├── Header.tsx       # 顶部导航栏
│   │   ├── BottomNav.tsx    # 底部导航栏
│   │   ├── CopyTradePanel.tsx  # 复制交易配置面板
│   │   └── ...
│   ├── pages/               # 页面组件
│   │   ├── Index.tsx        # 首页（Trenches）
│   │   ├── Rank.tsx         # 排行榜页面
│   │   ├── CopyTrade.tsx    # 复制交易主页面
│   │   ├── Portfolio.tsx    # 资产组合页面
│   │   └── ...
│   ├── lib/                 # 工具函数和 API
│   │   ├── api.ts           # Mock API 服务
│   │   └── authStore.ts     # 认证状态管理
│   ├── App.tsx              # 应用入口组件
│   └── main.tsx             # 应用启动文件
├── public/                   # 静态资源
├── UX_FLOW.md               # UX 流程文档
└── README.md                # 项目说明文档
```

## 🎯 核心功能

### 1. 用户认证系统
- ✅ 用户注册（邮箱 + 密码 + 验证码）
- ✅ 用户登录
- ✅ 登录状态持久化
- ✅ 登出功能

### 2. 钱包管理
- ✅ 钱包总览（余额显示）
- ✅ 初始余额：1000 SOL
- ✅ 余额实时更新
- ✅ 交易历史记录

### 3. 复制交易功能
- ✅ 排行榜浏览（Rank 页面）
- ✅ 创建复制交易配置
- ✅ 买入模式选择（Max / Fixed / Ratio）
- ✅ 卖出策略配置（Copy Sell / Not Sell / TP & SL / Advanced）
- ✅ 交易状态管理（Running / Paused / Stopped）
- ✅ 交易历史查看
- ✅ 交易执行与余额扣款

### 4. 市场数据展示
- ✅ 代币列表（Trenches）
- ✅ 趋势页面（Trending）
- ✅ 代币详情页
- ✅ 监控页面（Monitor）

## 🛠️ 技术实现

### AI 工具使用

本项目使用 **Lovable.dev** 作为 AI 辅助开发工具：

1. **初始代码生成**: 通过上传 GMGN.AI 的截图，使用 Lovable 生成像素级精确的 React 组件代码
2. **UI 组件库**: 基于 shadcn/ui 和 Radix UI，确保组件质量和可访问性
3. **样式还原**: 使用 Tailwind CSS 实现像素级样式还原

### Mock API

后端采用 **localStorage** 实现的 Mock API：

- 用户数据存储
- 钱包余额管理
- 复制交易配置存储
- 交易历史记录

所有数据存储在浏览器的 localStorage 中，页面刷新后数据保持。

### 状态管理

- **全局状态**: 使用自定义 `authStore.ts` 管理认证状态
- **本地状态**: 使用 React Hooks (useState, useEffect)
- **数据持久化**: localStorage API

### 路由配置

使用 React Router v6 实现单页应用路由：

- `/` - 首页（Trenches）
- `/rank` - 排行榜
- `/rank/:address` - 排行榜详情
- `/copytrade` - 复制交易主页面
- `/copytrade/:id` - 复制交易详情
- `/trending` - 趋势页面
- `/trenches/:name` - 代币详情
- `/monitor` - 监控页面
- `/track` - 跟踪页面
- `/portfolio` - 资产组合页面

## 📱 移动端适配

- 响应式设计，移动端优先
- 触摸友好的交互设计
- 适配不同屏幕尺寸
- 暗色主题支持

## 📄 文档

- **[UX_FLOW.md](./UX_FLOW.md)** - 详细的用户旅程图、页面线框图和交互流程说明
- **[REAL_DATA_INTEGRATION.md](./REAL_DATA_INTEGRATION.md)** - 真实市场数据集成指南
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - GitHub Pages 部署指南

## 📊 真实市场数据集成

项目支持集成真实的市场数据 API。默认使用 Mock 数据，如需使用真实数据：

1. **查看集成指南**: 阅读 [REAL_DATA_INTEGRATION.md](./REAL_DATA_INTEGRATION.md)
2. **选择数据源**: 推荐使用 DexScreener（无需 API Key）或 Birdeye
3. **配置环境变量**: 创建 `.env` 文件并设置 `VITE_USE_REAL_DATA=true`
4. **获取 API Key**: 如使用 Birdeye，访问 https://birdeye.so 注册获取

**已实现的功能**:
- ✅ 代币价格查询（支持多个数据源）
- ✅ 热门代币列表
- ✅ 代币搜索
- ✅ 数据缓存机制
- ✅ 自定义 Hooks（useTokenPrice, useTokenList 等）

## 🚀 GitHub Pages 部署

### 自动部署（推荐）

项目已配置 GitHub Actions 工作流，推送到 `main` 分支后会自动部署到 GitHub Pages。

**部署步骤：**

1. **创建 GitHub 仓库**
   ```bash
   # 在 GitHub 上创建新仓库，例如：gmgn-ai-clone
   ```

2. **推送代码到 GitHub**
   ```bash
   git add .
   git commit -m "Initial commit: GMGN.AI Clone"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```

3. **启用 GitHub Pages**
   - 进入仓库 Settings → Pages
   - Source 选择 "GitHub Actions"
   - 保存设置

4. **自动部署**
   - 每次推送到 `main` 分支，GitHub Actions 会自动构建并部署
   - 部署完成后，访问地址：`https://<your-username>.github.io/<repo-name>/`

### 手动部署

如果需要手动部署：

```bash
# 构建项目
npm run build

# 如果使用 gh-pages 分支
git checkout --orphan gh-pages
git rm -rf .
cp -r dist/* .
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages --force
```

### 访问地址

**GitHub Pages 部署地址：**
```
https://xiaocloneyao.github.io/gmgn_react/
```

**GitHub 项目仓库链接：**
```
https://github.com/xiaocloneyao/gmgn_react
```

**注意**: 项目使用 HashRouter，所有路由都会自动添加 `#` 前缀，例如：
- `https://xiaocloneyao.github.io/gmgn_react/#/`
- `https://xiaocloneyao.github.io/gmgn_react/#/rank`
- `https://xiaocloneyao.github.io/gmgn_react/#/copytrade`
- `https://xiaocloneyao.github.io/gmgn_react/#/trending`
- `https://xiaocloneyao.github.io/gmgn_react/#/portfolio`

## 🔧 开发说明

### 添加新页面

1. 在 `src/pages/` 目录创建新页面组件
2. 在 `src/App.tsx` 中添加路由配置
3. 在 `src/components/BottomNav.tsx` 中添加导航项（如需要）

### 修改 API

所有 Mock API 实现在 `src/lib/api.ts` 中，可以根据需要修改数据结构和逻辑。

### 样式定制

项目使用 Tailwind CSS，配置文件为 `tailwind.config.ts`。可以通过修改配置文件或直接使用 Tailwind 工具类来调整样式。

## 📝 开发日志

### v1.0.0 (当前版本)

- ✅ 实现用户登录/注册功能
- ✅ 实现钱包管理和余额显示
- ✅ 实现复制交易核心功能
- ✅ 实现排行榜和详情页面
- ✅ 实现交易历史记录
- ✅ 实现状态管理和数据持久化
- ✅ 完成移动端适配
- ✅ 创建 UX 流程文档

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

- [Lovable.dev](https://lovable.dev) - AI 辅助开发工具
- [shadcn/ui](https://ui.shadcn.com) - UI 组件库
- [Radix UI](https://www.radix-ui.com) - 无样式组件库
- [Tailwind CSS](https://tailwindcss.com) - CSS 框架

---

**项目维护者**: GMGN.AI Development Team  
**最后更新**: 2024
