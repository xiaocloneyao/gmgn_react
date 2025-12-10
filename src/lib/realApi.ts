// 真实市场数据 API 服务
// 主要使用 DexScreener API（支持多链，无需 API Key）

const BIRDEYE_API_KEY = import.meta.env.VITE_BIRDEYE_API_KEY || '';
const BIRDEYE_BASE_URL = 'https://public-api.birdeye.so';
const DEXSCREENER_BASE_URL = 'https://api.dexscreener.com/latest/dex';
const JUPITER_BASE_URL = 'https://quote-api.jup.ag/v6';

// 数据源类型
type DataSource = 'gmgn' | 'birdeye' | 'dexscreener' | 'jupiter';

// 默认使用 DexScreener（支持多链，无需 API Key）
const DEFAULT_SOURCE: DataSource = 'dexscreener';

// 网络到 DexScreener 链名称的映射
// DexScreener 支持的链：solana, ethereum, bsc, polygon, arbitrum, avalanche, base, celo, cronos, fantom, optimism
const CHAIN_TO_DEXSCREENER: Record<string, string> = {
  'solana': 'solana',
  'SOL': 'solana',
  'bsc': 'bsc',
  'BSC': 'bsc',
  'ethereum': 'ethereum',
  'ETH': 'ethereum',
  'base': 'base',
  'Base': 'base',
  'monad': 'base', // DexScreener 可能不支持，使用 base 作为备用
  'Monad': 'base',
  'tron': 'bsc', // DexScreener 不支持 Tron，使用 bsc 作为备用
  'Tron': 'bsc',
};

/**
 * 获取代币价格（USD）
 */
export async function getTokenPrice(
  tokenAddress: string,
  source: DataSource = DEFAULT_SOURCE
): Promise<number> {
  try {
    switch (source) {
      case 'birdeye':
        return await getBirdeyePrice(tokenAddress);
      case 'dexscreener':
        return await getDexScreenerPrice(tokenAddress);
      case 'jupiter':
        return await getJupiterPrice(tokenAddress);
      default:
        return 0;
    }
  } catch (error) {
    console.error(`Failed to fetch price from ${source}:`, error);
    throw error;
  }
}

/**
 * Birdeye API - 获取代币价格
 */
async function getBirdeyePrice(tokenAddress: string): Promise<number> {
  if (!BIRDEYE_API_KEY) {
    throw new Error('Birdeye API key not configured');
  }

  const response = await fetch(
    `${BIRDEYE_BASE_URL}/defi/price?address=${tokenAddress}`,
    {
      headers: {
        'X-API-KEY': BIRDEYE_API_KEY,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Birdeye API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data?.value || 0;
}

/**
 * DexScreener API - 获取代币价格（无需 API Key）
 */
async function getDexScreenerPrice(tokenAddress: string): Promise<number> {
  const response = await fetch(
    `${DEXSCREENER_BASE_URL}/tokens/${tokenAddress}`
  );

  if (!response.ok) {
    throw new Error(`DexScreener API error: ${response.status}`);
  }

  const data = await response.json();
  const pair = data.pairs?.[0];
  return parseFloat(pair?.priceUsd || '0');
}

/**
 * Jupiter API - 获取代币价格（相对于 SOL）
 */
async function getJupiterPrice(tokenAddress: string): Promise<number> {
  const SOL_MINT = 'So11111111111111111111111111111111111111112';
  const amount = 1000000; // 1 token (assuming 6 decimals)

  const response = await fetch(
    `${JUPITER_BASE_URL}/quote?inputMint=${tokenAddress}&outputMint=${SOL_MINT}&amount=${amount}`
  );

  if (!response.ok) {
    throw new Error(`Jupiter API error: ${response.status}`);
  }

  const data = await response.json();
  // 需要获取 SOL 价格来计算 USD 价格
  const solPrice = await getSOLPrice();
  const priceInSOL = parseFloat(data.outAmount || '0') / amount;
  return priceInSOL * solPrice;
}

/**
 * 获取 SOL 价格（USD）
 */
export async function getSOLPrice(): Promise<number> {
  try {
    // 使用 CoinGecko API（免费，无需 API Key）
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    return data.solana?.usd || 150; // 默认值 $150
  } catch (error) {
    console.error('Failed to fetch SOL price:', error);
    return 150; // 降级到默认值
  }
}

/**
 * 搜索代币
 * 直接使用 DexScreener API
 * @param chainId 网络ID（solana, bsc, ethereum等）
 */
export async function searchTokens(query: string, source: DataSource = DEFAULT_SOURCE, chainId?: string): Promise<any[]> {
  try {
    // 直接使用 DexScreener 搜索 API
    // DexScreener 的搜索 API 是跨链的，但我们可以通过过滤结果来限制特定链
    const response = await fetch(
      `${DEXSCREENER_BASE_URL}/search?q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error(`DexScreener API error: ${response.status}`);
    }

    const data = await response.json();
    let pairs = data.pairs || [];
    
    // 如果指定了 chainId，过滤结果
    if (chainId) {
      const targetChain = CHAIN_TO_DEXSCREENER[chainId] || chainId.toLowerCase();
      pairs = pairs.filter((pair: any) => {
        const pairChain = pair?.chainId?.toLowerCase() || pair?.dexId?.toLowerCase() || '';
        return pairChain === targetChain || pairChain.includes(targetChain);
      });
    }
    
    // 格式化 DexScreener 数据，限制返回数量
    return pairs.slice(0, 20).map((pair: any) => formatTokenData(pair));
  } catch (error) {
    console.error('Failed to search tokens:', error);
    throw error;
  }
}

/**
 * 获取热门代币列表
 * 直接使用 DexScreener API（支持多链）
 * @param chainId 网络ID（solana, bsc, ethereum等）
 */
export async function getTrendingTokens(limit: number = 20, source: DataSource = DEFAULT_SOURCE, chainId?: string): Promise<any[]> {
  try {
    // 直接使用 DexScreener API
    const chain = chainId ? (CHAIN_TO_DEXSCREENER[chainId] || chainId.toLowerCase()) : 'solana';
    
    console.log(`[DexScreener] Fetching trending tokens for chain: ${chain} (from chainId: ${chainId})`);
    
    // DexScreener API 端点格式：
    // - /pairs/{chain} - 获取指定链上的交易对（返回热门交易对）
    // 实际测试：https://api.dexscreener.com/latest/dex/pairs/solana
    
    // DexScreener API 的正确端点格式：
    // 根据 DexScreener 文档，没有直接的 /pairs/{chain} 端点
    // 应该使用搜索端点，然后过滤结果
    // 或者使用代币搜索，获取热门代币
    
    // 方法1: 尝试使用多个搜索查询来获取更多数据
    // 对于 Solana，搜索多个热门代币
    // 对于其他链，搜索主要代币
    const searchQueries: Record<string, string[]> = {
      'solana': ['SOL', 'USDC', 'USDT', 'BONK', 'WIF'], // 搜索多个 Solana 热门代币
      'ethereum': ['ETH', 'USDC', 'USDT', 'WETH'],
      'bsc': ['BNB', 'USDT', 'BUSD'],
      'base': ['ETH', 'USDC'],
      'polygon': ['MATIC', 'USDC'],
      'arbitrum': ['ETH', 'USDC'],
      'avalanche': ['AVAX', 'USDC'],
    };
    
    const queries = searchQueries[chain] || ['USDC'];
    const primaryQuery = queries[0];
    
    // 先尝试主要查询
    let searchEndpoint = `${DEXSCREENER_BASE_URL}/search?q=${encodeURIComponent(primaryQuery)}`;
    
    console.log(`[DexScreener] Using search endpoint: ${searchEndpoint} for chain ${chain}`);
    
    let response: Response;
    try {
      response = await fetch(searchEndpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`DexScreener search API error: ${response.status} ${response.statusText}`);
      }
      
      console.log(`[DexScreener] Successfully fetched from search endpoint, status: ${response.status}`);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error(`[DexScreener] Failed to fetch from search endpoint:`, error);
      throw error;
    }

    if (!response || !response.ok) {
      throw new Error(`DexScreener API error: ${response?.status} ${response?.statusText}`);
    }

    let data = await response.json();
    let allPairs = data.pairs || [];
    
    console.log(`[DexScreener] Initial response:`, { 
      hasPairs: !!data.pairs, 
      pairsCount: data.pairs?.length || 0,
      dataKeys: Object.keys(data),
    });
    
    // 如果数据量少，尝试获取更多（仅对 Solana）
    if (chain === 'solana' && allPairs.length < 10 && queries.length > 1) {
      console.log(`[DexScreener] Initial query returned few results, trying additional queries...`);
      const additionalQueries = queries.slice(1);
      
      for (const query of additionalQueries) {
        try {
          const additionalEndpoint = `${DEXSCREENER_BASE_URL}/search?q=${encodeURIComponent(query)}`;
          const additionalResponse = await fetch(additionalEndpoint, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
          });
          
          if (additionalResponse.ok) {
            const additionalData = await additionalResponse.json();
            const additionalPairs = additionalData.pairs || [];
            console.log(`[DexScreener] Additional query "${query}" returned ${additionalPairs.length} pairs`);
            allPairs = [...allPairs, ...additionalPairs];
          }
        } catch (err) {
          console.warn(`[DexScreener] Failed to fetch additional query "${query}":`, err);
        }
      }
    }
    
    console.log(`[DexScreener] Total pairs collected: ${allPairs.length}`);
    
    let pairs = allPairs;
    
    // 过滤出指定链的交易对 - 更严格的过滤逻辑
    if (chain && pairs.length > 0) {
      const chainIdMap: Record<string, string[]> = {
        'solana': ['solana'],
        'ethereum': ['ethereum', 'eth'],
        'bsc': ['bsc', 'binance-smart-chain', 'binance'],
        'base': ['base'],
      };
      
      const validChainIds = chainIdMap[chain] || [chain];
      const originalCount = pairs.length;
      
      // 打印前几个 pair 的 chainId 信息用于调试
      if (pairs.length > 0) {
        console.log(`[DexScreener] Sample pairs chain info:`, pairs.slice(0, 3).map((p: any) => ({
          chainId: p?.chainId,
          dexId: p?.dexId,
          baseToken: p?.baseToken?.symbol,
          quoteToken: p?.quoteToken?.symbol,
        })));
      }
      
      pairs = pairs.filter((pair: any) => {
        // DexScreener 返回的 chainId 字段
        const pairChainId = (pair?.chainId || '').toLowerCase();
        const pairDexId = (pair?.dexId || '').toLowerCase();
        
        // 严格匹配：chainId 必须完全匹配或包含有效链ID
        const matches = validChainIds.some(validId => {
          const validIdLower = validId.toLowerCase();
          // 精确匹配或包含匹配
          return pairChainId === validIdLower || 
                 pairChainId.includes(validIdLower) ||
                 pairDexId === validIdLower ||
                 pairDexId.includes(validIdLower);
        });
        
        if (!matches && originalCount < 10) {
          // 如果数据量少，打印不匹配的原因
          console.log(`[DexScreener] Pair filtered out:`, {
            chainId: pairChainId,
            dexId: pairDexId,
            baseToken: pair?.baseToken?.symbol,
            expectedChains: validChainIds,
          });
        }
        
        return matches;
      });
      
      console.log(`[DexScreener] Filtered pairs: ${originalCount} -> ${pairs.length} for chain ${chain}`);
      
      // 如果过滤后数据太少，尝试放宽过滤条件
      if (pairs.length < 5 && originalCount > 0) {
        console.warn(`[DexScreener] Too few pairs after filtering, trying alternative filter...`);
        // 尝试基于 baseToken 的地址格式判断（Solana 地址通常更长）
        if (chain === 'solana') {
          pairs = allPairs.filter((pair: any) => {
            const address = pair?.baseToken?.address || '';
            // Solana 地址通常是 base58 编码，长度约 32-44 字符
            // 同时检查 chainId
            const pairChainId = (pair?.chainId || '').toLowerCase();
            return (address.length > 30 && address.length < 50) || pairChainId === 'solana';
          });
          console.log(`[DexScreener] Alternative filter result: ${pairs.length} pairs`);
        } else if (chain === 'ethereum') {
          // Ethereum 地址是 0x 开头的 42 字符
          pairs = allPairs.filter((pair: any) => {
            const address = pair?.baseToken?.address || '';
            const pairChainId = (pair?.chainId || '').toLowerCase();
            return (address.startsWith('0x') && address.length === 42) || 
                   pairChainId === 'ethereum' || pairChainId === 'eth';
          });
          console.log(`[DexScreener] Alternative filter result: ${pairs.length} pairs`);
        } else if (chain === 'bsc') {
          // BSC 地址也是 0x 开头的 42 字符，但 chainId 不同
          pairs = allPairs.filter((pair: any) => {
            const address = pair?.baseToken?.address || '';
            const pairChainId = (pair?.chainId || '').toLowerCase();
            return (address.startsWith('0x') && address.length === 42) && 
                   (pairChainId === 'bsc' || pairChainId === 'binance-smart-chain' || pairChainId === 'binance');
          });
          console.log(`[DexScreener] Alternative filter result: ${pairs.length} pairs`);
        }
      }
    }
    
    if (pairs.length === 0) {
      console.warn(`[DexScreener] No pairs found for chain ${chain} after filtering, returning empty array`);
      return [];
    }
    
    const processedPairs = processDexScreenerPairs(pairs, limit);
    console.log(`[DexScreener] Processed ${processedPairs.length} tokens from ${pairs.length} pairs`);
    
    return processedPairs;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[DexScreener] Failed to fetch trending tokens:`, error);
    console.error(`[DexScreener] Error details:`, error);
    // 返回空数组而不是抛出错误，让 UI 可以显示降级内容
    return [];
  }
}

/**
 * 处理 DexScreener 返回的交易对数据
 */
function processDexScreenerPairs(pairs: any[], limit: number): any[] {
  if (!pairs || pairs.length === 0) {
    return [];
  }
  
  // 安全地过滤和排序
  const filteredPairs = pairs
    .filter((pair: any) => {
      try {
        const hasPrice = pair?.priceUsd && !isNaN(parseFloat(pair.priceUsd)) && parseFloat(pair.priceUsd) > 0;
        const hasVolume = pair?.volume?.h24 && !isNaN(parseFloat(pair.volume.h24)) && parseFloat(pair.volume.h24) > 0;
        const hasAddress = pair?.baseToken?.address;
        return hasPrice && hasVolume && hasAddress;
      } catch (err) {
        console.warn('Error filtering pair:', pair, err);
        return false;
      }
    })
    .sort((a: any, b: any) => {
      try {
        // 按 24h 交易量排序
        const volA = parseFloat(a?.volume?.h24 || '0') || 0;
        const volB = parseFloat(b?.volume?.h24 || '0') || 0;
        if (volB !== volA) return volB - volA;
        
        // 如果交易量相同，按市值排序
        const mcA = parseFloat(a?.marketCap || '0') || 0;
        const mcB = parseFloat(b?.marketCap || '0') || 0;
        return mcB - mcA;
      } catch (err) {
        return 0;
      }
    });
  
  // 去重：基于 baseToken address（更严格的去重）
  const seen = new Set<string>();
  const uniquePairs = filteredPairs.filter((pair: any) => {
    try {
      const address = (pair?.baseToken?.address || '').toLowerCase();
      if (!address || address.length < 10) {
        return false; // 无效地址
      }
      
      if (seen.has(address)) {
        return false; // 已存在
      }
      
      seen.add(address);
      return true;
    } catch (err) {
      console.warn('Error in deduplication:', pair, err);
      return false;
    }
  });
  
  console.log(`[DexScreener] After deduplication: ${filteredPairs.length} -> ${uniquePairs.length} unique pairs`);
  
  // 安全地格式化数据并限制数量
  return uniquePairs
    .slice(0, limit)
    .map((pair: any) => {
      try {
        return formatTokenData(pair);
      } catch (err) {
        console.error('Error formatting token data:', pair, err);
        // 返回一个安全的默认值
        return {
          address: pair?.baseToken?.address || '',
          name: pair?.baseToken?.name || 'Unknown',
          symbol: pair?.baseToken?.symbol || 'UNKNOWN',
          price: 0,
          priceChange24h: 0,
          marketCap: 0,
          volume24h: 0,
          liquidity: 0,
          icon: '',
        };
      }
    })
    .filter((token: any) => token.address); // 确保至少有一个地址
}

/**
 * 格式化代币数据为统一格式
 */
function formatTokenData(pair: any) {
  try {
    const price = parseFloat(pair?.priceUsd || pair?.price || '0') || 0;
    const priceChange24h = parseFloat(pair?.priceChange?.h24 || pair?.priceChange24h || '0') || 0;
    const marketCap = parseFloat(pair?.marketCap || '0') || 0;
    const volume24h = parseFloat(pair?.volume?.h24 || pair?.volume24h || '0') || 0;
    const liquidity = parseFloat(pair?.liquidity?.usd || pair?.liquidity || '0') || 0;
    const createdAt = pair?.pairCreatedAt || pair?.createdAt || 0;
    const txns = pair?.txns?.h24 || {};
    const txCount = (parseInt(txns.buys || '0') || 0) + (parseInt(txns.sells || '0') || 0);
    
    return {
      address: pair?.baseToken?.address || pair?.tokenAddress || '',
      name: pair?.baseToken?.name || 'Unknown',
      symbol: pair?.baseToken?.symbol || 'UNKNOWN',
      price: isNaN(price) ? 0 : price,
      priceChange24h: isNaN(priceChange24h) ? 0 : priceChange24h,
      marketCap: isNaN(marketCap) ? 0 : marketCap,
      volume24h: isNaN(volume24h) ? 0 : volume24h,
      liquidity: isNaN(liquidity) ? 0 : liquidity,
      icon: pair?.baseToken?.logoURI || pair?.logoURI || '',
      pairAddress: pair?.pairAddress || '',
      dexId: pair?.dexId || '',
      // 额外字段用于 Trending 页面
      age: createdAt ? calculateAge(createdAt) : '',
      txCount: txCount,
    };
  } catch (error) {
    console.error('Error in formatTokenData:', pair, error);
    throw error;
  }
}

/**
 * 计算代币年龄（从创建时间到现在）
 */
function calculateAge(createdAt: number): string {
  const now = Date.now();
  const diff = now - createdAt;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    const minutes = Math.floor(diff / (1000 * 60));
    return `${minutes}m`;
  }
}

/**
 * 获取代币详细信息
 */
export async function getTokenInfo(tokenAddress: string): Promise<any> {
  try {
    const response = await fetch(
      `${DEXSCREENER_BASE_URL}/tokens/${tokenAddress}`
    );

    if (!response.ok) {
      throw new Error(`DexScreener API error: ${response.status}`);
    }

    const data = await response.json();
    const pair = data.pairs?.[0];
    
    if (!pair) {
      throw new Error('Token not found');
    }

    return {
      address: pair.baseToken?.address,
      name: pair.baseToken?.name || 'Unknown',
      symbol: pair.baseToken?.symbol || 'UNKNOWN',
      price: parseFloat(pair.priceUsd || '0'),
      priceChange24h: parseFloat(pair.priceChange?.h24 || '0'),
      priceChange6h: parseFloat(pair.priceChange?.h6 || '0'),
      priceChange1h: parseFloat(pair.priceChange?.h1 || '0'),
      marketCap: parseFloat(pair.marketCap || '0'),
      volume24h: parseFloat(pair.volume?.h24 || '0'),
      volume6h: parseFloat(pair.volume?.h6 || '0'),
      liquidity: parseFloat(pair.liquidity?.usd || '0'),
      fdv: parseFloat(pair.fdv || '0'),
      icon: pair.baseToken?.logoURI || '',
      pairAddress: pair.pairAddress,
      dexId: pair.dexId,
    };
  } catch (error) {
    console.error('Failed to fetch token info:', error);
    throw error;
  }
}

/**
 * 获取 K线数据（使用 DexScreener）
 */
export async function getKlineData(
  tokenAddress: string,
  interval: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' = '1h'
): Promise<Array<{ time: number; open: number; high: number; low: number; close: number; volume: number }>> {
  try {
    // DexScreener 不直接提供 K线 API，这里返回模拟数据
    // 实际项目中可以使用 Birdeye 或其他提供 K线数据的服务
    console.warn('Kline data not available from DexScreener, returning empty array');
    return [];
  } catch (error) {
    console.error('Failed to fetch kline data:', error);
    return [];
  }
}

/**
 * 获取钱包持有的代币列表
 */
export async function getWalletTokens(walletAddress: string): Promise<any[]> {
  try {
    // 注意：这需要 Solana RPC 节点或专门的 API
    // 可以使用 Helius API 或直接连接 Solana RPC
    console.warn('Wallet tokens API not implemented, requires Solana RPC');
    return [];
  } catch (error) {
    console.error('Failed to fetch wallet tokens:', error);
    return [];
  }
}

/**
 * 批量获取多个代币价格
 */
export async function getBatchTokenPrices(
  tokenAddresses: string[]
): Promise<Record<string, number>> {
  const prices: Record<string, number> = {};
  
  // 并发请求所有价格
  const promises = tokenAddresses.map(async (address) => {
    try {
      const price = await getTokenPrice(address);
      prices[address] = price;
    } catch (error) {
      console.error(`Failed to fetch price for ${address}:`, error);
      prices[address] = 0;
    }
  });

  await Promise.all(promises);
  return prices;
}

