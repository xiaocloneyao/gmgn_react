# API 测试指南

## 快速测试 DexScreener API

### 方法 1: 在浏览器控制台测试

1. 启动开发服务器：
```bash
npm run dev
```

2. 打开浏览器，访问 http://localhost:8080

3. 打开浏览器开发者工具（F12），切换到 Console 标签

4. 运行测试命令：
```javascript
// 测试所有 API
window.testApis()

// 或只测试 DexScreener
window.testDexScreener()
```

### 方法 2: 在 Trending 页面测试

1. 启动开发服务器
2. 访问 http://localhost:8080/trending
3. 点击页面上的 "Mock Data" 按钮切换到 "Real Data"
4. 观察数据加载情况

### 方法 3: 使用 curl 测试 API

```bash
# 测试 DexScreener - 获取 Solana 链上的交易对
curl "https://api.dexscreener.com/latest/dex/pairs/solana"

# 测试搜索功能
curl "https://api.dexscreener.com/latest/dex/search?q=SOL"

# 测试获取特定代币
curl "https://api.dexscreener.com/latest/dex/tokens/So11111111111111111111111111111111111111112"
```

## 测试 GMGN API

目前 GMGN 没有公开的 API 文档。如果需要获取 GMGN 的数据，可以：

1. **分析 GMGN 网站的网络请求**
   - 打开 GMGN 网站 (https://gmgn.ai)
   - 打开浏览器开发者工具 > Network 标签
   - 观察页面加载时的 API 请求
   - 找到实际的 API 端点

2. **使用浏览器扩展**
   - 安装浏览器扩展来拦截和分析网络请求
   - 找到 GMGN 使用的 API 端点

3. **联系 GMGN 团队**
   - 询问是否有公开 API 或合作伙伴 API

## 预期结果

### DexScreener API 测试应该返回：

1. **SOL 价格**: 一个数字（USD）
2. **热门代币列表**: 包含以下字段的数组：
   - `name`: 代币名称
   - `symbol`: 代币符号
   - `price`: 价格（USD）
   - `priceChange24h`: 24小时价格变化（%）
   - `marketCap`: 市值
   - `volume24h`: 24小时交易量
   - `address`: 代币地址

3. **搜索结果**: 匹配的代币列表

## 常见问题

### Q: API 返回 429 (Too Many Requests)
**A**: DexScreener 有速率限制，等待一段时间后重试，或使用缓存减少请求次数。

### Q: 返回空数组
**A**: 检查网络连接，确认 API 端点正确，查看控制台错误信息。

### Q: CORS 错误
**A**: 如果从浏览器直接调用 API 遇到 CORS 问题，考虑：
- 使用后端代理
- 或使用支持 CORS 的 API 端点

## 调试技巧

1. **查看网络请求**
   - 打开开发者工具 > Network
   - 筛选 XHR/Fetch 请求
   - 查看请求和响应详情

2. **查看控制台日志**
   - 所有 API 调用都有 console.log 输出
   - 错误信息会显示在控制台

3. **检查缓存**
   - 在控制台运行：`localStorage.getItem('cache')`
   - 或查看 `src/lib/cache.ts` 的实现

## 下一步

如果 DexScreener API 测试成功，可以：
1. 在 Trending 页面启用真实数据
2. 在其他页面集成真实数据
3. 优化数据格式以匹配 UI 需求
4. 添加更多数据源作为备选

