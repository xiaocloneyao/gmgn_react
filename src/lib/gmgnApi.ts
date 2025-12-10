// GMGN.AI API 集成
// 基于 https://github.com/1f1n/gmgnai-wrapper
// 注意：GMGN.ai 受 Cloudflare 保护，某些请求可能需要特殊处理

const GMGN_BASE_URL = 'https://gmgn.ai';
// GMGN 的实际 API 端点（通过分析网站网络请求获得）
const GMGN_API_BASE = 'https://api.gmgn.ai'; // 可能的 API 地址

/**
 * 获取代币信息
 * @param contractAddress Solana 代币合约地址
 */
export async function getGMGNTokenInfo(contractAddress: string): Promise<any> {
  try {
    // 根据 gmgnai-wrapper 项目，可能的端点格式
    // 实际端点需要根据项目文档或网络请求分析确定
    const response = await fetch(
      `${GMGN_BASE_URL}/api/v1/token/${contractAddress}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          // 可能需要添加其他头部来绕过 Cloudflare
        },
      }
    );

    if (!response.ok) {
      // 如果失败，尝试备用端点
      const altResponse = await fetch(
        `${GMGN_API_BASE}/token/${contractAddress}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!altResponse.ok) {
        throw new Error(`GMGN API error: ${altResponse.status}`);
      }
      
      const data = await altResponse.json();
      return data;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch from GMGN API:', error);
    throw error;
  }
}

/**
 * 获取新代币对列表
 * 对应 gmgnai-wrapper 的 getNewPairs
 */
export async function getGMGNNewPairs(limit: number = 20): Promise<any[]> {
  try {
    // 可能的端点
    const response = await fetch(
      `${GMGN_BASE_URL}/api/v1/pairs/new?limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GMGN API error: ${response.status}`);
    }

    const data = await response.json();
    return data.pairs || data.data || [];
  } catch (error) {
    console.error('Failed to fetch new pairs from GMGN:', error);
    throw error;
  }
}

/**
 * 获取热门钱包列表
 * 对应 gmgnai-wrapper 的 getTrendingWallets
 * 优先使用代理，如果失败则尝试直接调用（可能被 CORS 阻止）
 */
export async function getGMGNTrendingWallets(limit: number = 20): Promise<any[]> {
  try {
    // 方法1: 尝试通过 Vite 代理（开发环境）
    try {
      const proxyResponse = await fetch(`/api/gmgn/wallets/trending?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (proxyResponse.ok) {
        const data = await proxyResponse.json();
        const wallets = data.wallets || data.data || [];
        if (wallets.length > 0) {
          return wallets.map((wallet: any) => ({
            address: wallet.address || wallet.wallet_address || '',
            name: wallet.name || wallet.label || wallet.address?.slice(0, 6) || 'Unknown',
            balance: parseFloat(wallet.balance || wallet.sol_balance || '0') || 0,
            pnl: parseFloat(wallet.pnl || wallet.total_pnl || '0') || 0,
            pnlPercent: parseFloat(wallet.pnl_percent || wallet.pnl_percentage || '0') || 0,
            winRate: parseFloat(wallet.win_rate || wallet.winrate || '0') || 0,
            trades: wallet.trades || wallet.trade_count || 0,
            icon: wallet.icon || wallet.avatar || '',
          }));
        }
      }
    } catch (proxyErr) {
      console.warn('Vite proxy failed, trying direct API:', proxyErr);
    }

    // 方法2: 尝试直接调用（可能被 CORS 阻止）
    const endpoints = [
      `${GMGN_BASE_URL}/api/v1/sol/wallets/trending?limit=${limit}`,
      `${GMGN_BASE_URL}/api/v1/wallets/trending?chain=solana&limit=${limit}`,
      `${GMGN_BASE_URL}/api/v1/wallets/trending?limit=${limit}`,
      `${GMGN_API_BASE}/wallets/trending?limit=${limit}`,
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json',
            'Referer': 'https://gmgn.ai/',
            'Origin': 'https://gmgn.ai',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const wallets = data.wallets || data.data || [];
          if (wallets.length > 0) {
            return wallets.map((wallet: any) => ({
              address: wallet.address || wallet.wallet_address || '',
              name: wallet.name || wallet.label || wallet.address?.slice(0, 6) || 'Unknown',
              balance: parseFloat(wallet.balance || wallet.sol_balance || '0') || 0,
              pnl: parseFloat(wallet.pnl || wallet.total_pnl || '0') || 0,
              pnlPercent: parseFloat(wallet.pnl_percent || wallet.pnl_percentage || '0') || 0,
              winRate: parseFloat(wallet.win_rate || wallet.winrate || '0') || 0,
              trades: wallet.trades || wallet.trade_count || 0,
              icon: wallet.icon || wallet.avatar || '',
            }));
          }
        } else if (response.status === 403 || response.status === 429) {
          console.warn('GMGN API blocked by Cloudflare:', response.status);
          continue;
        }
      } catch (err) {
        // CORS 错误会被捕获在这里
        if (err instanceof TypeError && err.message.includes('CORS')) {
          console.warn('CORS blocked direct API call, use proxy instead');
          break; // 不再尝试其他端点
        }
        console.warn(`Failed to fetch from ${endpoint}:`, err);
        continue;
      }
    }

    // 如果所有端点都失败，返回空数组而不是抛出错误
    console.warn('All GMGN wallet endpoints failed, returning empty array');
    return [];
  } catch (error) {
    console.error('Failed to fetch trending wallets from GMGN:', error);
    return []; // 返回空数组而不是抛出错误
  }
}

/**
 * 获取热门代币列表（Trending）
 * 这是 GMGN 的主要功能之一
 * 优先使用代理，如果失败则尝试直接调用（可能被 CORS 阻止）
 * @param chainId 网络ID（solana, bsc, ethereum等），默认为 solana
 */
export async function getGMGNTrendingTokens(limit: number = 20, chainId: string = 'solana'): Promise<any[]> {
  try {
    // 方法1: 尝试通过 Vite 代理（开发环境）
    try {
      const proxyResponse = await fetch(`/api/gmgn/tokens/trending?limit=${limit}&chain=${chainId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (proxyResponse.ok) {
        const data = await proxyResponse.json();
        const tokens = data.tokens || data.data || data.pairs || [];
        if (tokens.length > 0) {
          return tokens.map((token: any) => formatGMGNToken(token));
        }
      }
    } catch (proxyErr) {
      console.warn('Vite proxy failed, trying direct API:', proxyErr);
    }

    // 方法2: 尝试直接调用（可能被 CORS 阻止）
    const endpoints = [
      `${GMGN_BASE_URL}/api/v1/tokens/trending?limit=${limit}&chain=${chainId}`,
      `${GMGN_BASE_URL}/api/v1/${chainId}/tokens/trending?limit=${limit}`,
      `${GMGN_BASE_URL}/api/v1/trending?limit=${limit}&chain=${chainId}`,
      `${GMGN_API_BASE}/tokens/trending?limit=${limit}&chain=${chainId}`,
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const tokens = data.tokens || data.data || data.pairs || [];
          return tokens.map((token: any) => formatGMGNToken(token));
        }
      } catch (err) {
        // CORS 错误会被捕获在这里
        if (err instanceof TypeError && err.message.includes('CORS')) {
          console.warn('CORS blocked direct API call, use proxy instead');
          break; // 不再尝试其他端点
        }
        console.warn(`Failed to fetch from ${endpoint}:`, err);
        continue;
      }
    }

    throw new Error('All GMGN API endpoints failed. Please use proxy server or check CORS settings.');
  } catch (error) {
    console.error('Failed to fetch trending tokens from GMGN:', error);
    throw error;
  }
}

/**
 * 格式化 GMGN 代币数据为统一格式
 */
function formatGMGNToken(token: any) {
  return {
    address: token.contract_address || token.address || token.mint || '',
    name: token.name || token.symbol || 'Unknown',
    symbol: token.symbol || token.name || 'UNKNOWN',
    price: parseFloat(token.price || token.price_usd || '0') || 0,
    priceChange24h: parseFloat(token.price_change_24h || token.price_change_24h_percent || '0') || 0,
    marketCap: parseFloat(token.market_cap || token.mc || '0') || 0,
    volume24h: parseFloat(token.volume_24h || token.volume || '0') || 0,
    liquidity: parseFloat(token.liquidity || token.liq || '0') || 0,
    icon: token.logo || token.logo_uri || token.image || '',
    // GMGN 特有字段
    age: token.age || token.created_at ? calculateAge(token.created_at || token.age) : '',
    txCount: token.tx_count || token.transactions || 0,
    holders: token.holders || 0,
    // 其他可能有用的字段
    pairAddress: token.pair_address || '',
    dex: token.dex || 'Unknown',
  };
}

/**
 * 计算代币年龄
 */
function calculateAge(createdAt: number | string): string {
  try {
    const created = typeof createdAt === 'string' ? new Date(createdAt).getTime() : createdAt;
    const now = Date.now();
    const diff = now - created;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days}d`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${minutes}m`;
    }
  } catch (error) {
    return '';
  }
}

/**
 * 搜索代币
 * 优先使用代理，如果失败则尝试直接调用（可能被 CORS 阻止）
 * @param chainId 网络ID（solana, bsc, ethereum等），默认为 solana
 */
export async function searchGMGNTokens(query: string, chainId: string = 'solana'): Promise<any[]> {
  try {
    // 方法1: 尝试通过 Vite 代理（开发环境）
    try {
      const proxyResponse = await fetch(`/api/gmgn/search?q=${encodeURIComponent(query)}&chain=${chainId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (proxyResponse.ok) {
        const data = await proxyResponse.json();
        const tokens = data.tokens || data.data || [];
        if (tokens.length > 0) {
          return tokens.map((token: any) => formatGMGNToken(token));
        }
      }
    } catch (proxyErr) {
      console.warn('Vite proxy failed, trying direct API:', proxyErr);
    }

    // 方法2: 尝试直接调用（可能被 CORS 阻止）
    const response = await fetch(
      `${GMGN_BASE_URL}/api/v1/search?q=${encodeURIComponent(query)}&chain=${chainId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GMGN API error: ${response.status}`);
    }

    const data = await response.json();
    const tokens = data.tokens || data.data || [];
    return tokens.map((token: any) => formatGMGNToken(token));
  } catch (error) {
    // 如果是 CORS 错误，提供更友好的提示
    if (error instanceof TypeError && error.message.includes('CORS')) {
      console.error('CORS blocked direct API call. Please use proxy server.');
      throw new Error('CORS blocked. Please use proxy server or check Vite proxy configuration.');
    }
    console.error('Failed to search tokens from GMGN:', error);
    throw error;
  }
}

/**
 * 检查 GMGN API 是否可用
 */
export async function checkGMGNApiAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${GMGN_BASE_URL}`, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}
