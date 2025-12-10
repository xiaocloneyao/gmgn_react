# CORS 问题解决方案

## 问题描述

GMGN.ai 的 API 不允许从浏览器直接调用，所有请求都被 CORS 策略阻止。

## 解决方案

### 方案 1: 使用 Vite 代理（推荐，开发环境）

已配置 Vite 代理，在开发环境中自动工作：

1. **配置已添加**：`vite.config.ts` 中已配置代理
2. **自动工作**：重启开发服务器后，所有 `/api/gmgn/*` 请求会自动代理到 `https://gmgn.ai`
3. **无需额外操作**：代码会自动尝试使用代理

**使用方法**：
```bash
# 重启开发服务器
npm run dev
```

### 方案 2: 使用独立代理服务器（生产环境推荐）

如果 Vite 代理不工作，或需要生产环境支持：

1. **安装依赖**：
```bash
npm install express cors node-fetch
```

2. **启动代理服务器**：
```bash
node server/proxy.js
```

3. **更新代码**：代码会自动检测并使用代理

### 方案 3: 使用公共 CORS 代理（临时方案）

如果上述方案都不工作，可以使用公共 CORS 代理：

```typescript
// 在 gmgnApi.ts 中使用
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
const endpoint = `${CORS_PROXY}https://gmgn.ai/api/v1/tokens/trending`;
```

**注意**：公共代理可能不稳定，仅用于测试。

## 当前实现

代码已更新为：
1. **优先使用 Vite 代理**（`/api/gmgn/*`）
2. **降级到直接调用**（如果代理失败，但会被 CORS 阻止）
3. **提供清晰的错误提示**

## 测试

1. **重启开发服务器**：
```bash
npm run dev
```

2. **在浏览器控制台测试**：
```javascript
window.testGMGNApis()
```

3. **检查网络请求**：
   - 打开开发者工具 > Network
   - 查看 `/api/gmgn/*` 请求是否成功
   - 如果看到 200 状态码，说明代理工作正常

## 如果仍然失败

1. **检查 Vite 代理配置**：
   - 确认 `vite.config.ts` 中的代理配置正确
   - 重启开发服务器

2. **使用独立代理服务器**：
   - 运行 `node server/proxy.js`
   - 更新代码中的代理地址

3. **分析 GMGN 实际 API**：
   - 打开 https://gmgn.ai
   - 打开开发者工具 > Network
   - 找到实际的 API 端点
   - 更新代码中的端点

4. **申请官方 API Key**：
   - 访问：https://forms.gle/CWABDLRe8twvygvy5
   - 获取 API Key
   - 在请求头中添加 `x-route-key`

## 生产环境部署

生产环境需要：
1. **后端代理服务器**（推荐）
2. **或使用官方 API Key**
3. **或使用 Cloudflare Workers 等边缘计算服务**

Vite 代理仅在开发环境有效，生产环境需要独立的代理服务器。

