# 真实市场数据集成指南

本文档说明如何将项目从 Mock API 迁移到真实的市场数据 API。

## 📊 推荐的数据源

### 1. Solana 生态数据源

#### Birdeye API（推荐）
- **官网**: https://birdeye.so
- **特点**: 专门针对 Solana 生态，数据全面
- **免费额度**: 有免费 tier
- **API 文档**: https://docs.birdeye.so
- **适用场景**: 代币价格、交易量、市值、K线数据

#### Jupiter API
- **官网**: https://jup.ag
- **特点**: Solana DEX 聚合器，价格数据准确
- **免费**: 完全免费
- **API 文档**: https://station.jup.ag/docs/apis/swap-api
- **适用场景**: 实时价格、交易对信息

#### DexScreener API
- **官网**: https://dexscreener.com
- **特点**: 多链 DEX 数据，包含 Solana
- **免费**: 有免费 tier
- **API 文档**: https://docs.dexscreener.com
- **适用场景**: 代币搜索、价格、交易量、K线

#### Helius API
- **官网**: https://helius.dev
- **特点**: Solana RPC 和数据服务
- **免费额度**: 有免费 tier
- **API 文档**: https://docs.helius.dev
- **适用场景**: 链上数据、交易历史、钱包信息

### 2. 通用加密货币数据源

#### CoinGecko API
- **官网**: https://www.coingecko.com
- **特点**: 支持多种代币，数据全面
- **免费额度**: 有免费 tier（每分钟 10-50 次请求）
- **API 文档**: https://www.coingecko.com/api/documentation
- **适用场景**: SOL 价格、市值、历史数据

## 🚀 实现步骤

### 步骤 1: 选择数据源并获取 API Key

以 **Birdeye API** 为例：

1. 访问 https://birdeye.so
2. 注册账号并获取 API Key
3. 查看 API 文档了解接口格式

### 步骤 2: 创建环境变量配置

创建 `.env` 文件（不要提交到 Git）：

```bash
# .env
VITE_BIRDEYE_API_KEY=your_api_key_here
VITE_JUPITER_API_URL=https://quote-api.jup.ag/v6
VITE_DEXSCREENER_API_URL=https://api.dexscreener.com/latest/dex
```

创建 `.env.example` 文件（提交到 Git）：

```bash
# .env.example
VITE_BIRDEYE_API_KEY=your_api_key_here
VITE_JUPITER_API_URL=https://quote-api.jup.ag/v6
VITE_DEXSCREENER_API_URL=https://api.dexscreener.com/latest/dex
```

### 步骤 3: 创建真实数据服务

创建 `src/lib/realApi.ts` 文件：

```typescript
// src/lib/realApi.ts

const BIRDEYE_API_KEY = import.meta.env.VITE_BIRDEYE_API_KEY;
const BIRDEYE_BASE_URL = 'https://public-api.birdeye.so';

// 获取代币价格
export async function getTokenPrice(tokenAddress: string): Promise<number> {
  try {
    const response = await fetch(
      `${BIRDEYE_BASE_URL}/defi/price?address=${tokenAddress}`,
      {
        headers: {
          'X-API-KEY': BIRDEYE_API_KEY || '',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data?.value || 0;
  } catch (error) {
    console.error('Failed to fetch token price:', error);
    throw error;
  }
}

// 获取代币信息
export async function getTokenInfo(tokenAddress: string) {
  try {
    const response = await fetch(
      `${BIRDEYE_BASE_URL}/defi/token_overview?address=${tokenAddress}`,
      {
        headers: {
          'X-API-KEY': BIRDEYE_API_KEY || '',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Failed to fetch token info:', error);
    throw error;
  }
}

// 获取代币列表（热门代币）
export async function getTrendingTokens(limit: number = 20) {
  try {
    const response = await fetch(
      `${BIRDEYE_BASE_URL}/defi/trending?limit=${limit}`,
      {
        headers: {
          'X-API-KEY': BIRDEYE_API_KEY || '',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data?.tokens || [];
  } catch (error) {
    console.error('Failed to fetch trending tokens:', error);
    throw error;
  }
}

// 获取 K线数据
export async function getKlineData(
  tokenAddress: string,
  type: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' = '1h',
  timeFrom?: number,
  timeTo?: number
) {
  try {
    const params = new URLSearchParams({
      address: tokenAddress,
      type,
    });
    
    if (timeFrom) params.append('time_from', timeFrom.toString());
    if (timeTo) params.append('time_to', timeTo.toString());
    
    const response = await fetch(
      `${BIRDEYE_BASE_URL}/defi/kline?${params.toString()}`,
      {
        headers: {
          'X-API-KEY': BIRDEYE_API_KEY || '',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data?.items || [];
  } catch (error) {
    console.error('Failed to fetch kline data:', error);
    throw error;
  }
}

// 搜索代币
export async function searchTokens(query: string) {
  try {
    const response = await fetch(
      `${BIRDEYE_BASE_URL}/defi/search?query=${encodeURIComponent(query)}`,
      {
        headers: {
          'X-API-KEY': BIRDEYE_API_KEY || '',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data?.tokens || [];
  } catch (error) {
    console.error('Failed to search tokens:', error);
    throw error;
  }
}

// 获取钱包交易历史
export async function getWalletTransactions(
  walletAddress: string,
  limit: number = 50
) {
  try {
    const response = await fetch(
      `${BIRDEYE_BASE_URL}/v1/wallet/token_list?wallet=${walletAddress}&limit=${limit}`,
      {
        headers: {
          'X-API-KEY': BIRDEYE_API_KEY || '',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data?.items || [];
  } catch (error) {
    console.error('Failed to fetch wallet transactions:', error);
    throw error;
  }
}
```

### 步骤 4: 创建数据缓存服务

创建 `src/lib/cache.ts` 文件：

```typescript
// src/lib/cache.ts

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class DataCache {
  private cache: Map<string, CacheItem<any>> = new Map();

  set<T>(key: string, data: T, ttl: number = 60000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean expired items
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export const cache = new DataCache();

// Cleanup expired items every 5 minutes
setInterval(() => {
  cache.cleanup();
}, 5 * 60 * 1000);
```

### 步骤 5: 更新 API 服务以支持真实数据

修改 `src/lib/api.ts`，添加真实数据获取方法：

```typescript
// 在 api.ts 中添加

import * as realApi from './realApi';
import { cache } from './cache';

// 配置：是否使用真实数据
const USE_REAL_DATA = import.meta.env.VITE_USE_REAL_DATA === 'true';

// 获取代币列表（带缓存）
export async function getTokenList(filters?: {
  tab?: string;
  limit?: number;
}): Promise<Token[]> {
  if (USE_REAL_DATA) {
    const cacheKey = `tokens_${filters?.tab || 'all'}_${filters?.limit || 20}`;
    const cached = cache.get<Token[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const tokens = await realApi.getTrendingTokens(filters?.limit || 20);
      const formatted: Token[] = tokens.map((token: any) => ({
        id: token.address,
        name: token.name || 'Unknown',
        symbol: token.symbol || 'UNKNOWN',
        price: token.price || 0,
        priceChange24h: token.priceChange24h || 0,
        marketCap: token.marketCap || 0,
        volume24h: token.volume24h || 0,
        icon: token.logoURI || '',
      }));

      // Cache for 1 minute
      cache.set(cacheKey, formatted, 60000);
      return formatted;
    } catch (error) {
      console.error('Failed to fetch real token data, falling back to mock:', error);
      // Fallback to mock data
      return getMockTokenList(filters);
    }
  }

  // Use mock data
  return getMockTokenList(filters);
}

// 获取代币价格
export async function getTokenPrice(tokenAddress: string): Promise<number> {
  if (USE_REAL_DATA) {
    const cacheKey = `price_${tokenAddress}`;
    const cached = cache.get<number>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    try {
      const price = await realApi.getTokenPrice(tokenAddress);
      // Cache for 30 seconds
      cache.set(cacheKey, price, 30000);
      return price;
    } catch (error) {
      console.error('Failed to fetch real price, using mock:', error);
      return 0;
    }
  }

  return 0;
}

// 获取 K线数据
export async function getKlineData(
  tokenAddress: string,
  interval: string = '1h'
): Promise<Array<{ time: number; open: number; high: number; low: number; close: number; volume: number }>> {
  if (USE_REAL_DATA) {
    const cacheKey = `kline_${tokenAddress}_${interval}`;
    const cached = cache.get<any[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const klines = await realApi.getKlineData(tokenAddress, interval as any);
      const formatted = klines.map((k: any) => ({
        time: k.unixTime * 1000,
        open: k.o,
        high: k.h,
        low: k.l,
        close: k.c,
        volume: k.v,
      }));

      // Cache for 1 minute
      cache.set(cacheKey, formatted, 60000);
      return formatted;
    } catch (error) {
      console.error('Failed to fetch real kline data:', error);
      return [];
    }
  }

  return [];
}
```

### 步骤 6: 更新组件以使用真实数据

修改 `src/pages/Index.tsx`：

```typescript
import { useEffect, useState } from 'react';
import { api, getTokenList } from '@/lib/api';

const Index = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTokens();
  }, [activeTab]);

  const loadTokens = async () => {
    setLoading(true);
    try {
      const data = await getTokenList({ tab: activeTab });
      setTokens(data);
    } catch (error) {
      console.error('Failed to load tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component
};
```

### 步骤 7: 添加错误处理和重试机制

创建 `src/lib/retry.ts`：

```typescript
// src/lib/retry.ts

export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (i < maxRetries - 1) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

// 使用示例
export async function getTokenPriceWithRetry(tokenAddress: string): Promise<number> {
  return retry(() => realApi.getTokenPrice(tokenAddress), 3, 1000);
}
```

## 🔧 使用 DexScreener API（备选方案）

如果 Birdeye API 不可用，可以使用 DexScreener：

```typescript
// src/lib/dexscreenerApi.ts

const DEXSCREENER_BASE_URL = 'https://api.dexscreener.com/latest/dex';

export async function getTokenPrice(tokenAddress: string): Promise<number> {
  try {
    const response = await fetch(
      `${DEXSCREENER_BASE_URL}/tokens/${tokenAddress}`
    );
    
    const data = await response.json();
    const pair = data.pairs?.[0];
    return parseFloat(pair?.priceUsd || '0');
  } catch (error) {
    console.error('Failed to fetch price from DexScreener:', error);
    throw error;
  }
}

export async function searchTokens(query: string) {
  try {
    const response = await fetch(
      `${DEXSCREENER_BASE_URL}/search?q=${encodeURIComponent(query)}`
    );
    
    const data = await response.json();
    return data.pairs || [];
  } catch (error) {
    console.error('Failed to search tokens:', error);
    throw error;
  }
}
```

## 🔄 使用 Jupiter API 获取价格

Jupiter 是 Solana 上最大的 DEX 聚合器，价格数据准确：

```typescript
// src/lib/jupiterApi.ts

const JUPITER_BASE_URL = 'https://quote-api.jup.ag/v6';

// 获取代币价格（通过 SOL 价格计算）
export async function getTokenPriceInSOL(
  tokenMint: string,
  solMint: string = 'So11111111111111111111111111111111111111112'
): Promise<number> {
  try {
    const response = await fetch(
      `${JUPITER_BASE_URL}/quote?inputMint=${tokenMint}&outputMint=${solMint}&amount=1000000`
    );
    
    const data = await response.json();
    // Calculate price: output amount / input amount
    return parseFloat(data.outAmount || '0') / 1000000;
  } catch (error) {
    console.error('Failed to fetch price from Jupiter:', error);
    throw error;
  }
}
```

## 📝 环境变量配置

更新 `.env.example`：

```bash
# API Configuration
VITE_USE_REAL_DATA=true

# Birdeye API
VITE_BIRDEYE_API_KEY=your_birdeye_api_key

# DexScreener API (no key required)
VITE_DEXSCREENER_API_URL=https://api.dexscreener.com/latest/dex

# Jupiter API (no key required)
VITE_JUPITER_API_URL=https://quote-api.jup.ag/v6

# Helius API (optional)
VITE_HELIUS_API_KEY=your_helius_api_key
VITE_HELIUS_API_URL=https://api.helius.xyz
```

## 🚨 注意事项

### 1. API 限流
- 实现请求限流，避免超过 API 限制
- 使用缓存减少 API 调用
- 考虑使用多个 API Key 轮询

### 2. 错误处理
- 所有 API 调用都应该有错误处理
- 提供降级方案（fallback to mock data）
- 显示友好的错误提示给用户

### 3. 数据格式转换
- 不同 API 返回的数据格式可能不同
- 需要统一转换为应用内部的数据格式
- 处理缺失字段的情况

### 4. 性能优化
- 使用缓存减少重复请求
- 实现请求去重（debounce/throttle）
- 考虑使用 WebSocket 获取实时数据

### 5. 安全性
- **不要**将 API Key 提交到 Git
- 使用环境变量存储敏感信息
- 考虑使用后端代理 API 调用（避免暴露 API Key）

## 🔐 后端代理方案（推荐）

如果担心 API Key 暴露，可以创建一个简单的后端代理：

```typescript
// backend/proxy.ts (Node.js/Express example)

import express from 'express';
import fetch from 'node-fetch';

const app = express();
const BIRDEYE_API_KEY = process.env.BIRDEYE_API_KEY;

app.get('/api/token/price/:address', async (req, res) => {
  try {
    const response = await fetch(
      `https://public-api.birdeye.so/defi/price?address=${req.params.address}`,
      {
        headers: {
          'X-API-KEY': BIRDEYE_API_KEY || '',
        },
      }
    );
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch price' });
  }
});

app.listen(3000, () => {
  console.log('Proxy server running on port 3000');
});
```

然后在前端调用自己的后端：

```typescript
export async function getTokenPrice(tokenAddress: string): Promise<number> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/token/price/${tokenAddress}`
  );
  const data = await response.json();
  return data.data?.value || 0;
}
```

## 📊 数据更新策略

### 实时数据（WebSocket）

对于需要实时更新的数据（如价格），考虑使用 WebSocket：

```typescript
// src/lib/websocket.ts

class PriceWebSocket {
  private ws: WebSocket | null = null;
  private subscribers: Map<string, Set<(price: number) => void>> = new Map();

  connect() {
    // Connect to WebSocket server (需要自己实现或使用第三方服务)
    this.ws = new WebSocket('wss://your-websocket-server.com');
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const callbacks = this.subscribers.get(data.tokenAddress);
      callbacks?.forEach(cb => cb(data.price));
    };
  }

  subscribe(tokenAddress: string, callback: (price: number) => void) {
    if (!this.subscribers.has(tokenAddress)) {
      this.subscribers.set(tokenAddress, new Set());
    }
    this.subscribers.get(tokenAddress)?.add(callback);
  }

  unsubscribe(tokenAddress: string, callback: (price: number) => void) {
    this.subscribers.get(tokenAddress)?.delete(callback);
  }
}

export const priceWS = new PriceWebSocket();
```

## 🎯 实施建议

1. **渐进式迁移**
   - 先实现一个功能（如价格显示）
   - 测试稳定后再迁移其他功能
   - 保留 Mock 数据作为降级方案

2. **监控和日志**
   - 记录 API 调用次数和错误
   - 监控 API 响应时间
   - 设置告警机制

3. **用户体验**
   - 显示加载状态
   - 处理网络错误
   - 提供数据刷新按钮

---

**下一步**: 选择一个 API 提供商，获取 API Key，然后按照上述步骤逐步集成真实数据。

