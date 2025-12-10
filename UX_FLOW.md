# GMGN.AI 复制交易平台 - UX 流程文档

## 1. 项目概述

本项目是基于 React + TypeScript 开发的 GMGN.AI 复制交易平台前端应用，实现了像素级还原的移动端界面，包含用户认证、钱包管理、复制交易、市场数据展示等核心功能。

### 1.1 技术栈
- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式方案**: Tailwind CSS
- **路由管理**: React Router v6 (HashRouter for GitHub Pages)
- **状态管理**: React Hooks + localStorage
- **数据源**: DexScreener API (支持多链)
- **部署方式**: GitHub Pages

### 1.2 核心功能
- ✅ 用户登录/注册（多步骤表单）
- ✅ 钱包总览与余额管理（初始 1000 SOL）
- ✅ 复制交易功能（创建、编辑、暂停、停止）
- ✅ 市场数据展示（支持 Mock/Real Data 切换）
- ✅ 多链支持（SOL, ETH, BSC, Base, Monad, Tron）
- ✅ 实时数据集成（DexScreener API）

## 2. 用户旅程图

### 2.1 新用户注册流程

```
进入应用 → 点击"Sign Up" → 输入邮箱 → 输入密码 → 输入验证码 → 注册成功 → 自动登录
```

**关键交互点：**
- 首页顶部显示"Sign Up"和"Log In"按钮
- 点击后弹出模态框，支持登录/注册切换
- 验证码输入支持任意值（模拟验证）
- 注册成功后自动登录并跳转到主界面

### 2.2 用户登录流程

```
进入应用 → 点击"Log In" → 输入邮箱 → 输入密码 → 输入验证码 → 登录成功 → 进入主界面
```

**关键交互点：**
- 支持从多个入口触发登录（首页、Track 页面、Portfolio 页面）
- 登录后状态持久化（localStorage）
- 登录后隐藏"Account"按钮，显示用户余额

### 2.3 完成一次复制交易流程

```
登录 → 进入 Rank 页面 → 浏览排行榜 → 点击"Copy"按钮 → 配置复制参数 → 确认创建 → 查看 CopyTrade 列表 → 点击进入详情 → 查看交易历史
```

### 2.4 查看市场数据流程

```
进入应用 → 选择网络（SOL/ETH/BSC） → 点击"Real Data"按钮 → 查看真实市场数据 → 切换网络查看不同链数据
```

**关键交互点：**
- 顶部网络选择器：点击显示下拉菜单，选择目标网络
- Real Data 切换：在 Trenches/Trending/Monitor 页面可切换 Mock/Real 数据
- 网络切换后自动刷新对应链的数据
- 支持搜索功能（Trenches 页面）

**详细步骤：**

1. **浏览排行榜**
   - 进入应用后，点击底部导航"CopyTrade"
   - 在顶部标签中选择"Rank"
   - 浏览排行榜列表，查看钱包地址、余额、收益率等信息

2. **选择要复制的钱包**
   - 点击列表中任意钱包的"Copy"按钮
   - 右侧滑出配置面板（全屏）

3. **配置复制参数**
   - **Copy From**: 显示源钱包地址（可编辑）
   - **Buy Mode**: 选择买入模式（Max Buy Amount / Fixed Buy / Fixed Ratio）
   - **Amount**: 设置买入金额（预设值：10, 25, 50, 100 SOL 或自定义）
   - **Sell Method**: 选择卖出策略（Copy Sell / Not Sell / TP & SL / Adv Strategy）
   - **Advanced Settings**: 设置滑点和 Gas 限制

4. **确认创建**
   - 点击"Confirm"按钮
   - 系统检查钱包余额（初始 1000 SOL）
   - 创建成功后，Rank 列表中的按钮变为"Copied"（绿色）

5. **查看复制交易**
   - 返回 CopyTrade 主页面
   - 查看已创建的复制交易列表
   - 显示钱包地址、任务名称、买入/卖出数量、运行状态

6. **管理复制交易**
   - 点击列表项进入详情页
   - 可以执行以下操作：
     - **Pause**: 暂停复制交易
     - **Restart**: 恢复暂停的交易
     - **Edit**: 编辑配置参数
     - **Stop**: 停止并删除交易

## 3. 核心页面线框图

### 3.1 首页（Trenches）

```
┌─────────────────────────────────┐
│  Header (Logo, Search, Menu)    │
├─────────────────────────────────┤
│  Tabs: New | Almost bonded | ...│
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │
│  │ Token Card                │  │
│  │ - Icon, Name, Symbol      │  │
│  │ - Price, Change %         │  │
│  │ - Market Cap, Volume      │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │ Token Card                │  │
│  └───────────────────────────┘  │
├─────────────────────────────────┤
│  Bottom Nav (6 tabs)            │
└─────────────────────────────────┘
```

**关键交互元素：**
- 顶部标签切换：New / Almost bonded / Migrated
- Token 卡片点击：跳转到详情页
- 底部导航：Trenches / Trending / CopyTrade / Monitor / Track / Portfolio

### 3.2 Rank 页面

```
┌─────────────────────────────────┐
│  Header                         │
├─────────────────────────────────┤
│  Tabs: Rank | CopyTrade | SnipeX│
│  Filters: All | Pump SM | ...   │
│  Search Bar                      │
│  Time: 1D | 7D | 30D            │
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │
│  │ Rank Item                 │  │
│  │ - Rank #, Icon, Name      │  │
│  │ - Balance, PnL            │  │
│  │ - [Copy/Copied Button]    │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

**关键交互元素：**
- "Copy"按钮：打开配置面板
- "Copied"按钮：跳转到详情页
- 列表项点击：跳转到 RankDetail 页面

### 3.3 CopyTrade 配置面板

```
┌─────────────────────────────────┐
│  [X] CopyTrade              [W1] │
├─────────────────────────────────┤
│  Copy From                      │
│  [Source Address Input]         │
│  ─────────────────────────────  │
│  Buy Mode                       │
│  [Max] [Fixed] [Ratio]          │
│  ─────────────────────────────  │
│  Amount                         │
│  [10] [25] [50] [100] [Custom]  │
│  ─────────────────────────────  │
│  Sell Method                    │
│  [Copy] [NoSell] [TP&SL] [Adv]  │
│  ─────────────────────────────  │
│  Advanced Settings              │
│  Slippage: [Input]              │
│  Gas Limit: [Input]             │
│  ─────────────────────────────  │
│  [Confirm Button]               │
└─────────────────────────────────┘
```

**关键交互元素：**
- 所有输入字段可编辑
- 买入模式切换影响显示字段
- 卖出策略切换显示不同配置选项
- "Confirm"按钮：仅在源地址填写时可用

### 3.4 CopyTrade 详情页

```
┌─────────────────────────────────┐
│  Header                         │
├─────────────────────────────────┤
│  Profile Section                │
│  - Avatar, Address, Status     │
│  [Pause] [Edit] [Stop]           │
├─────────────────────────────────┤
│  Profit Summary                 │
│  [Tracking] [Realized] [Unreal] │
├─────────────────────────────────┤
│  Tabs: Trades | Failed | Filter │
├─────────────────────────────────┤
│  Table Header                   │
│  Type | Token | USD | Amount... │
├─────────────────────────────────┤
│  Trade History List             │
│  - Buy/Sell transactions        │
└─────────────────────────────────┘
```

**关键交互元素：**
- Pause/Restart 按钮：切换运行状态
- Edit 按钮：打开配置面板编辑
- Stop 按钮：停止交易并返回列表
- 交易历史表格：显示所有买入/卖出记录

### 3.5 Portfolio 页面

```
┌─────────────────────────────────┐
│  Header (Network Selector)      │
├─────────────────────────────────┤
│  {Network} Wallet (1)           │
│  [Share] [Import] [+ Create]    │
│  ┌───────────────────────────┐  │
│  │ Wallet1                   │  │
│  │ Address, Balance          │  │
│  └───────────────────────────┘  │
├─────────────────────────────────┤
│  Wallet Summary                  │
│  Total Value: 1000 {Network}      │
│  Total PnL: $0.00               │
│  [Deposit] [Buy] [Withdraw] ...  │
├─────────────────────────────────┤
│  Tabs: Holding | History | Orders│
│  ┌───────────────────────────┐  │
│  │ CopyTrade History         │  │
│  │ - Source, Status, Time    │  │
│  │ - Total Spent, Fees       │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

**关键交互元素：**
- 钱包列表：显示当前网络的所有钱包及余额
- 网络切换：顶部显示当前选择的网络，切换后过滤对应网络的钱包
- 操作按钮：Deposit, Buy, Withdraw, Convert
- 标签页切换：查看持仓、历史（包含 CopyTrade 历史）、订单

### 3.6 Trending 页面

```
┌─────────────────────────────────┐
│  Header (Network Selector)      │
├─────────────────────────────────┤
│  Tabs: New pair | Trending | ...│
│  Time: 1m | 5m | 1h | 6h | 24h  │
│  [Real Data] [Filter] [Adv]     │
├─────────────────────────────────┤
│  Token / Age    MC    ATI       │
│  ┌───────────────────────────┐  │
│  │ Token Row                 │  │
│  │ - Icon, Name, Age        │  │
│  │ - Market Cap, Change %   │  │
│  │ - Price, Chart Icon       │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

**关键交互元素：**
- 顶部标签：New pair, Trending, Surge, xStocks, Next
- 时间粒度选择：1m, 5m, 1h, 6h, 24h
- Real Data 切换：切换 Mock/Real 数据源
- 网络切换：自动更新对应链的热门代币数据

### 3.7 Monitor 页面

```
┌─────────────────────────────────┐
│  Header (Network Selector)      │
├─────────────────────────────────┤
│  Tabs: Track | Smart | KOL      │
│  Time: 1m | 5m | 15m | 1h | 24h │
│  [Real Data] Filters            │
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │
│  │ Wallet Card               │  │
│  │ - Title, Subtitle         │  │
│  │ - MC, Change %, Inflow    │  │
│  │ - Wallet List             │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

**关键交互元素：**
- 标签切换：Track, Smart, KOL
- 时间过滤：1m, 5m, 15m, 1h, 24h
- Real Data 切换：显示真实钱包监控数据
- 卡片点击：跳转到 MonitorDetail 页面

## 4. 交互流程说明

### 4.1 复制交易创建流程

**触发方式：**
1. 从 Rank 页面点击"Copy"按钮
2. 从 CopyTrade 主页面点击"+ Create"按钮

**流程步骤：**
1. 右侧滑出全屏配置面板
2. 用户填写/选择配置参数
3. 系统验证：
   - 源地址不能为空
   - 钱包余额充足（初始 1000 SOL）
4. 点击"Confirm"创建
5. 成功后：
   - 关闭面板
   - Rank 列表按钮变为"Copied"
   - CopyTrade 列表显示新交易
   - 触发 `copytrade-created` 事件

### 4.2 复制交易状态管理

**状态流转：**
```
Created → Running → Paused → Running → Stopped
```

**状态说明：**
- **Running**: 正常运行，显示绿色标签，可执行 Pause
- **Paused**: 已暂停，显示黄色标签，可执行 Restart
- **Stopped**: 已停止，显示灰色标签，列表项变灰

**状态变更触发：**
- Pause: 点击"Pause"按钮 → 状态变为"paused"
- Restart: 点击"Restart"按钮 → 状态变为"running"
- Stop: 点击"Stop"按钮 → 状态变为"stopped"，enabled=false

### 4.3 交易执行与扣款流程

**模拟交易执行：**
1. 当 CopyTrade 创建后，系统可以模拟执行交易
2. 买入交易：
   - 检查钱包余额
   - 扣除相应 SOL 金额
   - 更新钱包余额
   - 创建交易历史记录
3. 卖出交易：
   - 增加钱包余额
   - 更新交易历史记录

**余额管理：**
- 初始余额：1000 SOL
- 余额检查：执行交易前验证余额充足
- 余额更新：实时更新钱包和总余额
- 余额显示：Header 菜单、Portfolio 页面实时显示

### 4.4 导航流程

**底部导航：**
- **Trenches**: 首页，显示代币列表
- **Trending**: 趋势页面，显示热门代币
- **CopyTrade**: 复制交易主页面
- **Monitor**: 监控页面，显示钱包监控
- **Track**: 跟踪页面，显示跟踪列表
- **Portfolio**: 资产组合页面

**页面跳转：**
- Rank → RankDetail: 点击列表项
- Rank → CopyTradeDetail: 点击"Copied"按钮
- CopyTrade → CopyTradeDetail: 点击列表项
- TrenchDetail: 从首页点击代币卡片

### 4.5 用户认证流程

**登录流程：**
1. 点击"Log In"按钮
2. 弹出登录模态框
3. 输入邮箱 → 下一步
4. 输入密码 → 下一步
5. 输入验证码 → 完成登录
6. 更新全局状态，隐藏登录按钮

**注册流程：**
1. 点击"Sign Up"按钮
2. 弹出注册模态框
3. 输入邮箱 → 下一步
4. 输入密码 → 下一步
5. 输入验证码 → 完成注册
6. 自动登录并初始化钱包（1000 SOL）

**登出流程：**
1. 点击 Header 菜单图标
2. 滑出底部菜单面板
3. 滚动到底部
4. 点击"Disconnect"按钮
5. 清除登录状态，返回首页

### 4.6 网络切换流程

**切换网络：**
1. 点击 Header 中的网络选择器（显示当前网络，如"SOL"）
2. 弹出下拉菜单，显示所有可用网络：
   - SOL (Solana) ☀️
   - BSC (Binance Smart Chain) 🟡
   - Base 🔵
   - Monad 🟣
   - ETH (Ethereum) 💎
   - Tron 🔴
3. 选择目标网络
4. 系统自动：
   - 更新全局网络状态
   - 触发 `chain-changed` 事件
   - 刷新当前页面的数据（如果使用 Real Data）
   - 更新钱包列表（Portfolio 页面）
   - 更新市场数据（Trenches, Trending, Monitor 页面）

**网络状态持久化：**
- 选择的网络保存在 localStorage
- 页面刷新后保持选择的网络
- 所有数据获取 API 调用时传递当前网络 chainId

### 4.7 真实数据切换流程

**启用真实数据：**
1. 在支持真实数据的页面（Trenches, Trending, Monitor, Track）找到"Real Data"按钮
2. 点击按钮切换为"Real Data"模式（按钮变为绿色）
3. 系统自动：
   - 调用 DexScreener API 获取真实数据
   - 显示加载状态（旋转图标）
   - 根据当前选择的网络获取对应链的数据
   - 如果获取失败，显示错误信息并提供切换回 Mock Data 的选项

**数据源说明：**
- **Mock Data**: 本地模拟数据，用于 UI 展示和测试
- **Real Data**: 从 DexScreener API 获取的真实市场数据
  - 支持多链：Solana, Ethereum, BSC, Base 等
  - 自动根据选择的网络过滤数据
  - 包含价格、市值、交易量、24h 变化等实时信息

## 5. 关键交互细节

### 5.1 滑动面板动画

**CopyTrade 配置面板：**
- 从右侧滑入（全屏）
- 动画时长：0.3s
- 背景遮罩：半透明黑色

**底部菜单面板：**
- 从底部滑入
- 高度：85vh，最大 600px
- 可滚动内容区域

### 5.2 状态反馈

**按钮状态：**
- 禁用状态：opacity-50, cursor-not-allowed
- 加载状态：显示"Creating..."文本
- 成功状态：触发事件通知其他组件

**列表状态：**
- Stopped 状态：opacity-60，灰色背景
- Running 状态：正常显示，绿色标签
- Paused 状态：黄色标签

### 5.3 数据同步

**事件驱动更新：**
- `copytrade-created`: 创建新交易时触发
- `copytrade-updated`: 更新交易状态时触发
- `open-auth-modal`: 打开登录/注册模态框

**状态持久化：**
- 使用 localStorage 存储用户数据
- 登录状态、钱包余额、交易配置持久化
- 页面刷新后状态保持

## 6. 移动端适配

### 6.1 响应式设计

- 使用 Tailwind CSS 实现响应式布局
- 移动端优先设计
- 触摸友好的按钮尺寸（最小 44x44px）
- 适配不同屏幕尺寸

### 6.2 性能优化

- 路由懒加载
- 组件按需渲染
- 使用 useMemo 优化计算
- 事件监听器正确清理

## 7. 技术实现要点

### 7.1 状态管理

- 全局认证状态：`authStore.ts`
- 本地组件状态：React useState
- 数据持久化：localStorage API

### 7.2 路由管理

- 使用 react-router-dom v6
- 动态路由参数
- 路由守卫（登录检查）

### 7.3 样式系统

- Tailwind CSS 工具类
- 自定义主题配置
- 暗色模式支持
- 像素级还原设计稿

## 8. 测试场景

### 8.1 用户注册登录
- ✅ 新用户注册流程
- ✅ 已注册用户登录
- ✅ 登录状态持久化
- ✅ 登出功能

### 8.2 复制交易
- ✅ 创建复制交易
- ✅ 编辑交易配置
- ✅ 暂停/恢复交易
- ✅ 停止交易
- ✅ 查看交易历史

### 8.3 状态同步
- ✅ Rank 页面按钮状态更新
- ✅ CopyTrade 列表状态显示
- ✅ 余额实时更新
- ✅ 交易历史记录

## 9. 数据集成说明

### 9.1 DexScreener API 集成

**API 端点：**
- 搜索代币: `https://api.dexscreener.com/latest/dex/search?q={query}`
- 获取交易对: `https://api.dexscreener.com/latest/dex/pairs/{chain}`

**数据流程：**
1. 用户选择网络（如 Solana）
2. 系统将网络映射到 DexScreener 链名称
3. 搜索该链的主要代币（如 SOL）
4. 过滤结果，只保留指定链的交易对
5. 按交易量排序，取前 N 条
6. 格式化数据并显示在 UI 中

**网络映射：**
- SOL → solana
- ETH → ethereum
- BSC → bsc
- Base → base

### 9.2 数据缓存策略

- 使用内存缓存，TTL 为 1 分钟
- 缓存键包含网络信息：`tokens_list_{chainId}_{limit}`
- 切换网络时自动清除旧缓存
- 支持手动刷新数据

## 10. 部署说明

### 10.1 GitHub Pages 部署

**构建步骤：**
```bash
npm install
npm run build
# 构建产物在 dist/ 目录
```

**部署配置：**
- 使用 HashRouter 支持 GitHub Pages
- 构建产物可直接部署到 GitHub Pages
- 访问地址：`https://{username}.github.io/{repo-name}/#/`

### 10.2 环境变量

**可选配置：**
- `VITE_BIRDEYE_API_KEY`: Birdeye API Key（备用数据源）
- 其他环境变量可在 `.env` 文件中配置

## 11. 后续优化建议

1. **实时数据更新**
   - 集成 WebSocket 获取实时价格
   - 实时更新交易状态
   - 添加数据刷新间隔设置

2. **更多交易策略**
   - 实现高级策略配置
   - 支持自定义策略脚本
   - 添加策略回测功能

3. **数据分析**
   - 添加收益分析图表
   - 交易统计报表
   - 性能指标可视化

4. **用户体验**
   - 添加加载动画
   - 优化错误提示
   - 添加操作确认对话框
   - 支持深色/浅色主题切换

5. **多链支持增强**
   - 支持更多区块链网络
   - 跨链数据聚合
   - 网络切换动画优化

---

**文档版本**: v2.0  
**最后更新**: 2024  
**维护者**: GMGN.AI Development Team  
**GitHub 仓库**: [项目链接]  
**在线演示**: [GitHub Pages 链接]

