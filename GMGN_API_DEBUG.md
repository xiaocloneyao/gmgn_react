# GMGN API 调试指南

## 问题：GMGN API 可能没有生效

如果 GMGN API 没有正常工作，请按照以下步骤调试：

## 步骤 1: 在浏览器控制台测试

1. 打开浏览器开发者工具（F12）
2. 切换到 Console 标签
3. 运行以下命令：

```javascript
// 测试所有 GMGN API
window.testGMGNApis()

// 分析 API 端点
window.analyzeGMGNApi()
```

## 步骤 2: 分析 GMGN 网站的实际 API

由于 GMGN.ai 受 Cloudflare 保护，需要分析实际端点：

1. **打开 GMGN 网站**
   - 访问 https://gmgn.ai
   - 打开开发者工具（F12）

2. **监控网络请求**
   - 切换到 Network 标签
   - 筛选 XHR 或 Fetch 请求
   - 与网站交互（滚动、点击、搜索）

3. **找到实际 API 端点**
   - 查看请求 URL
   - 查看请求头（Headers）
   - 查看请求体（Payload）
   - 查看响应数据（Response）

4. **更新代码**
   - 将找到的实际端点更新到 `src/lib/gmgnApi.ts`
   - 更新请求头和参数格式

## 步骤 3: 使用 gmgnai-wrapper 项目

参考 [gmgnai-wrapper](https://github.com/1f1n/gmgnai-wrapper) 项目：

1. **查看 Python 代码**
   - 项目中的 Python 脚本可能包含实际的 API 端点
   - 查看 `getNewPairs.py`、`getTokenInfo.py` 等文件

2. **转换为 JavaScript**
   - 将 Python 代码中的 API 调用转换为 JavaScript
   - 更新 `src/lib/gmgnApi.ts` 中的端点

## 步骤 4: 申请 GMGN 官方 API Key

根据搜索结果，GMGN 提供官方 API，但需要申请：

1. **填写申请表单**
   - 访问：https://forms.gle/CWABDLRe8twvygvy5
   - 填写申请信息

2. **获取 API Key**
   - 审核通过后，GMGN 会发送 API Key 到邮箱
   - 在请求头中添加 `x-route-key`

3. **更新代码**
   ```typescript
   // 在请求头中添加 API Key
   headers: {
     'x-route-key': 'YOUR_API_KEY_HERE',
     // 其他头部...
   }
   ```

## 步骤 5: 使用后端代理（推荐）

如果直接调用被 Cloudflare 阻止，使用后端代理：

1. **创建后端服务**（Node.js/Express）
2. **在后端调用 GMGN API**
3. **前端调用自己的后端**

这样可以：
- 绕过 Cloudflare 保护
- 隐藏 API Key
- 添加缓存和限流

## 当前实现的功能

✅ **已实现**：
- GMGN API 调用框架
- 多个端点尝试
- 错误处理和降级
- 在 Trending、Trenches、Monitor、Track 页面支持真实数据
- 搜索功能支持真实数据

⚠️ **可能的问题**：
- Cloudflare 保护可能阻止直接调用
- API 端点可能不正确（需要分析实际端点）
- 需要 API Key（如果使用官方 API）

## 调试检查清单

- [ ] 在浏览器控制台运行 `window.testGMGNApis()`
- [ ] 查看 Network 标签中的 API 请求
- [ ] 检查是否有 CORS 错误
- [ ] 检查是否有 403/429 错误（Cloudflare）
- [ ] 分析 GMGN 网站的实际网络请求
- [ ] 更新 `src/lib/gmgnApi.ts` 中的端点
- [ ] 考虑使用后端代理

## 快速测试

在浏览器控制台运行：

```javascript
// 测试 GMGN 热门代币
import('@/lib/gmgnApi').then(m => m.getGMGNTrendingTokens(5))
  .then(console.log)
  .catch(console.error)

// 测试 GMGN 热门钱包
import('@/lib/gmgnApi').then(m => m.getGMGNTrendingWallets(5))
  .then(console.log)
  .catch(console.error)

// 测试搜索
import('@/lib/gmgnApi').then(m => m.searchGMGNTokens('SOL'))
  .then(console.log)
  .catch(console.error)
```

如果这些调用都失败，说明 GMGN API 端点不正确或被 Cloudflare 阻止，需要：
1. 分析 GMGN 网站的实际网络请求
2. 或使用后端代理
3. 或申请官方 API Key

