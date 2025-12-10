// GMGN.AI 直接 API 调用
// 通过分析 GMGN 网站的实际网络请求来获取真实端点
// 参考: https://github.com/1f1n/gmgnai-wrapper

const GMGN_BASE_URL = 'https://gmgn.ai';
// 根据 gmgnai-wrapper 项目，可能的实际 API 端点
// 需要分析 GMGN 网站的网络请求来确定

/**
 * 获取 GMGN 热门代币（通过分析网站实际请求）
 * 注意：GMGN 可能使用内部 API，需要分析实际端点
 * @param chainId 网络ID（solana, bsc, ethereum等），默认为 solana
 */
export async function getGMGNTrendingTokensDirect(limit: number = 20, chainId: string = 'solana'): Promise<any[]> {
  try {
    // 方法1: 尝试直接访问 GMGN 的内部 API
    // 这些端点可能需要特定的请求头和参数
    
    // 根据 chainId 构建端点
    const chainMap: Record<string, string> = {
      'solana': 'sol',
      'bsc': 'bsc',
      'ethereum': 'eth',
      'base': 'base',
      'monad': 'monad',
      'tron': 'tron',
    };
    const chainPrefix = chainMap[chainId] || chainId;
    
    // 可能的端点格式（需要根据实际网络请求调整）
    const endpoints = [
      // REST API 格式 - 使用链前缀
      `${GMGN_BASE_URL}/api/v1/${chainPrefix}/tokens/trending?limit=${limit}`,
      `${GMGN_BASE_URL}/api/v1/tokens/trending?chain=${chainId}&limit=${limit}`,
      `${GMGN_BASE_URL}/api/${chainPrefix}/tokens/trending?limit=${limit}`,
      // 默认 Solana 端点（向后兼容）
      `${GMGN_BASE_URL}/api/v1/sol/tokens/trending?limit=${limit}`,
      // GraphQL 格式
      `${GMGN_BASE_URL}/graphql`,
    ];

    for (const endpoint of endpoints) {
      try {
        let response;
        
        if (endpoint.includes('graphql')) {
          // GraphQL 请求
          const query = {
            query: `
              query GetTrendingTokens($limit: Int, $chain: String) {
                tokens(chain: $chain, limit: $limit, sort: "trending") {
                  address
                  name
                  symbol
                  price
                  priceChange24h
                  marketCap
                  volume24h
                  liquidity
                  logo
                  createdAt
                  holders
                }
              }
            `,
            variables: { limit, chain: chainId }
          };
          
          response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'application/json',
              'Referer': 'https://gmgn.ai/',
              'Origin': 'https://gmgn.ai',
            },
            body: JSON.stringify(query),
          });
        } else {
          // REST API 请求
          response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'application/json',
              'Referer': 'https://gmgn.ai/',
              'Origin': 'https://gmgn.ai',
            },
          });
        }

        if (response.ok) {
          const data = await response.json();
          // 处理不同的响应格式
          let tokens = [];
          if (data.data?.tokens) {
            tokens = data.data.tokens;
          } else if (data.tokens) {
            tokens = data.tokens;
          } else if (data.data) {
            tokens = Array.isArray(data.data) ? data.data : [];
          } else if (Array.isArray(data)) {
            tokens = data;
          }
          
          if (tokens.length > 0) {
            return tokens.map((token: any) => formatGMGNTokenDirect(token));
          }
        } else if (response.status === 403 || response.status === 429) {
          console.warn('GMGN API blocked by Cloudflare:', response.status);
          // 继续尝试下一个端点
          continue;
        }
      } catch (err) {
        console.warn(`Failed to fetch from ${endpoint}:`, err);
        continue;
      }
    }

    throw new Error('All GMGN API endpoints failed. GMGN.ai may be protected by Cloudflare.');
  } catch (error) {
    console.error('Failed to fetch trending tokens from GMGN:', error);
    throw error;
  }
}

/**
 * 格式化 GMGN 代币数据
 */
function formatGMGNTokenDirect(token: any) {
  return {
    address: token.contract_address || token.address || token.mint || token.token_address || '',
    name: token.name || token.symbol || 'Unknown',
    symbol: token.symbol || token.name || 'UNKNOWN',
    price: parseFloat(token.price || token.price_usd || token.priceUSD || '0') || 0,
    priceChange24h: parseFloat(token.price_change_24h || token.priceChange24h || token.price_change_24h_percent || '0') || 0,
    marketCap: parseFloat(token.market_cap || token.marketCap || token.mc || '0') || 0,
    volume24h: parseFloat(token.volume_24h || token.volume24h || token.volume || '0') || 0,
    liquidity: parseFloat(token.liquidity || token.liq || '0') || 0,
    icon: token.logo || token.logo_uri || token.logoURI || token.image || '',
    age: token.age || (token.created_at || token.createdAt ? calculateAge(token.created_at || token.createdAt) : ''),
    txCount: token.tx_count || token.transactions || token.txns || 0,
    holders: token.holders || token.holder_count || 0,
    pairAddress: token.pair_address || token.pairAddress || '',
    dex: token.dex || token.dex_id || 'Unknown',
  };
}

/**
 * 计算代币年龄
 */
function calculateAge(createdAt: number | string): string {
  try {
    const created = typeof createdAt === 'string' 
      ? (createdAt.includes('T') ? new Date(createdAt).getTime() : parseInt(createdAt) * 1000)
      : createdAt * 1000;
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
      return minutes > 0 ? `${minutes}m` : 'New';
    }
  } catch (error) {
    return '';
  }
}

/**
 * 获取新代币对
 */
export async function getGMGNNewPairs(limit: number = 20): Promise<any[]> {
  try {
    const endpoints = [
      `${GMGN_BASE_URL}/api/v1/sol/pairs/new?limit=${limit}`,
      `${GMGN_BASE_URL}/api/v1/pairs/new?chain=solana&limit=${limit}`,
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://gmgn.ai/',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const pairs = data.pairs || data.data || [];
          return pairs.map((pair: any) => formatGMGNTokenDirect(pair));
        }
      } catch (err) {
        continue;
      }
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch new pairs from GMGN:', error);
    return [];
  }
}

/**
 * 获取热门钱包
 */
export async function getGMGNTrendingWallets(limit: number = 20): Promise<any[]> {
  try {
    const endpoints = [
      `${GMGN_BASE_URL}/api/v1/sol/wallets/trending?limit=${limit}`,
      `${GMGN_BASE_URL}/api/v1/wallets/trending?chain=solana&limit=${limit}`,
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://gmgn.ai/',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const wallets = data.wallets || data.data || [];
          return wallets;
        }
      } catch (err) {
        continue;
      }
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch trending wallets from GMGN:', error);
    return [];
  }
}

/**
 * 搜索代币（GMGN）
 */
export async function searchGMGNTokensDirect(query: string): Promise<any[]> {
  try {
    const endpoints = [
      `${GMGN_BASE_URL}/api/v1/sol/search?q=${encodeURIComponent(query)}`,
      `${GMGN_BASE_URL}/api/v1/search?q=${encodeURIComponent(query)}&chain=solana`,
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://gmgn.ai/',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const tokens = data.tokens || data.data || data.results || [];
          return tokens.map((token: any) => formatGMGNTokenDirect(token));
        }
      } catch (err) {
        continue;
      }
    }
    return [];
  } catch (error) {
    console.error('Failed to search tokens from GMGN:', error);
    return [];
  }
}

