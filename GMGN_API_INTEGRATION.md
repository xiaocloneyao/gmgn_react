# GMGN API 集成说明

## 关于 gmgnai-wrapper

根据 [gmgnai-wrapper 项目](https://github.com/1f1n/gmgnai-wrapper)，这是一个 Python 封装的 GMGN.ai API 包装器。

**重要提示：**
- GMGN.ai 受 Cloudflare 保护，直接从浏览器调用可能被阻止
- 建议使用后端代理来调用 GMGN API
- 或者加入 [GMGN Discord](https://discord.gg/xxWqZppjht) 获取访问权限

## 当前实现

项目已集成 GMGN API 调用，但需要注意：

1. **浏览器直接调用可能失败**（Cloudflare 保护）
2. **建议使用后端代理**（见下方说明）

## 方案 1: 使用后端代理（推荐）

创建一个简单的 Node.js 后端来代理 GMGN API 请求：

```javascript
// backend/gmgn-proxy.js
const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// 代理获取热门代币
app.get('/api/gmgn/trending', async (req, res) => {
  try {
    const limit = req.query.limit || 20;
    // 这里需要分析 GMGN 的实际 API 端点
    // 或者使用 gmgnai-wrapper 的 Python 脚本
    const response = await fetch(`https://gmgn.ai/api/v1/tokens/trending?limit=${limit}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0...',
        // 可能需要其他头部
      }
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => {
  console.log('GMGN Proxy server running on port 3001');
});
```

然后在前端调用自己的后端：

```typescript
// src/lib/gmgnApi.ts
const PROXY_URL = 'http://localhost:3001';

export async function getGMGNTrendingTokens(limit: number = 20) {
  const response = await fetch(`${PROXY_URL}/api/gmgn/trending?limit=${limit}`);
  const data = await response.json();
  return data.tokens || [];
}
```

## 方案 2: 使用 Python 后端 + API

如果使用 gmgnai-wrapper 的 Python 代码：

```python
# backend/gmgn_api.py
from flask import Flask, jsonify
from flask_cors import CORS
from gmgn import gmgn

app = Flask(__name__)
CORS(app)

gmgn_instance = gmgn()

@app.route('/api/trending', methods=['GET'])
def get_trending():
    # 使用 gmgnai-wrapper 获取数据
    # 注意：需要根据实际 API 调整
    tokens = gmgn_instance.getTrendingTokens()
    return jsonify(tokens)

if __name__ == '__main__':
    app.run(port=3001)
```

## 方案 3: 分析 GMGN 网站的实际 API

1. 打开 GMGN.ai 网站
2. 打开浏览器开发者工具 > Network
3. 观察页面加载时的 API 请求
4. 找到实际的 API 端点和请求格式
5. 更新 `src/lib/gmgnApi.ts` 中的端点

## 当前状态

- ✅ 已移除顶部大按钮，只保留小按钮
- ✅ 已集成 GMGN API 调用框架
- ✅ 已添加图标处理（真实数据可能没有图标，使用默认图标）
- ⚠️ 需要实际测试 API 端点（可能被 Cloudflare 阻止）

## 测试步骤

1. 打开浏览器开发者工具（F12）
2. 切换到 Network 标签
3. 点击 "Switch to Real Data" 按钮
4. 查看网络请求，找到实际的 API 端点
5. 根据实际端点更新代码

## 图标处理

真实数据可能没有图标，代码已处理：
- 如果 API 返回图标，使用 API 的图标
- 如果没有，使用默认图标（🪙）
- 对于常见代币（SOL, USDC, USDT），使用预设图标

