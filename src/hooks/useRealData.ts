// 自定义 Hook：用于获取真实市场数据
import { useState, useEffect } from 'react';
import * as realApi from '@/lib/realApi';
import { cache } from '@/lib/cache';
import { getSelectedChain, subscribeChain, CHAIN_INFO, type Chain } from '@/lib/chainStore';

// 检查是否启用真实数据
// 可以通过环境变量或 localStorage 控制
const getUseRealData = (): boolean => {
  // 优先检查环境变量
  if (import.meta.env.VITE_USE_REAL_DATA !== undefined) {
    return import.meta.env.VITE_USE_REAL_DATA === 'true';
  }
  // 其次检查 localStorage（用于运行时切换）
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('use_real_data');
    return stored === 'true';
  }
  return false;
};

const USE_REAL_DATA = getUseRealData();

/**
 * 获取代币价格 Hook
 */
export function useTokenPrice(tokenAddress: string | null) {
  const [price, setPrice] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!tokenAddress || !USE_REAL_DATA) {
      return;
    }

    const fetchPrice = async () => {
      const cacheKey = `price_${tokenAddress}`;
      const cached = cache.get<number>(cacheKey);
      
      if (cached !== null) {
        setPrice(cached);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const tokenPrice = await realApi.getTokenPrice(tokenAddress);
        setPrice(tokenPrice);
        // 缓存 30 秒
        cache.set(cacheKey, tokenPrice, 30000);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error('Failed to fetch token price:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();

    // 每 30 秒更新一次价格
    const interval = setInterval(fetchPrice, 30000);
    return () => clearInterval(interval);
  }, [tokenAddress]);

  return { price, loading, error };
}

/**
 * 获取代币列表 Hook
 * @param limit 返回的代币数量
 * @param forceRealData 强制使用真实数据（覆盖环境变量）
 */
export function useTokenList(limit: number = 20, forceRealData?: boolean) {
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [selectedChain, setSelectedChain] = useState<Chain>(getSelectedChain());

  // 检查是否应该使用真实数据
  const shouldUseRealData = forceRealData !== undefined ? forceRealData : USE_REAL_DATA;

  // 订阅网络变化
  useEffect(() => {
    const unsub = subscribeChain((chain) => {
      setSelectedChain(chain);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!shouldUseRealData) {
      setTokens([]);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchTokens = async () => {
      const chainId = CHAIN_INFO[selectedChain].chainId || selectedChain.toLowerCase();
      const cacheKey = `tokens_list_${chainId}_${limit}`;
      
      // 切换网络时，先清除旧数据，显示加载状态
      setTokens([]);
      setLoading(true);
      setError(null);

      // 检查缓存（可选：切换网络时可以选择不使用缓存以获取最新数据）
      const cached = cache.get<any[]>(cacheKey);
      if (cached && cached.length > 0) {
        // 先显示缓存数据
        setTokens(cached);
        setLoading(false);
      }

      try {
        console.log(`[useTokenList] Fetching tokens for chain: ${chainId}, cacheKey: ${cacheKey}`);
        // 直接使用 DexScreener API
        const tokenList = await realApi.getTrendingTokens(limit, 'dexscreener', chainId);
        console.log(`[useTokenList] Received ${tokenList?.length || 0} tokens`);
        
        if (tokenList && tokenList.length > 0) {
          setTokens(tokenList);
          setError(null); // 清除之前的错误
          // 缓存 1 分钟
          cache.set(cacheKey, tokenList, 60000);
          console.log(`[useTokenList] Successfully set ${tokenList.length} tokens`);
        } else {
          // 如果没有数据且没有缓存，显示错误
          if (!cached) {
            setTokens([]);
            setError(new Error(`No tokens found for chain ${chainId}`));
            console.warn(`[useTokenList] No tokens found for chain ${chainId}`);
          } else {
            // 如果有缓存，使用缓存数据
            console.log(`[useTokenList] Using cached data`);
          }
        }
        setLoading(false);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error(`[useTokenList] Failed to fetch token list from DexScreener for chain ${chainId}:`, error);
        if (!cached) {
          setTokens([]);
        } else {
          // 如果有缓存，保持缓存数据
          console.log(`[useTokenList] Error occurred, but using cached data`);
        }
        setLoading(false);
      }
    };

    fetchTokens();

    // 每 5 分钟更新一次列表
    const interval = setInterval(fetchTokens, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [limit, shouldUseRealData, selectedChain]); // selectedChain 已在依赖数组中，切换网络时会自动重新获取

  return { tokens, loading, error };
}

/**
 * 搜索代币 Hook
 */
export function useTokenSearch(query: string) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query || query.length < 2 || !USE_REAL_DATA) {
      setResults([]);
      return;
    }

    const searchTokens = async () => {
      const cacheKey = `search_${query}`;
      const cached = cache.get<any[]>(cacheKey);
      
      if (cached) {
        setResults(cached);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const chainId = CHAIN_INFO[getSelectedChain()].chainId || getSelectedChain().toLowerCase();
        const searchResults = await realApi.searchTokens(query, 'gmgn', chainId);
        setResults(searchResults);
        // 缓存 5 分钟
        cache.set(cacheKey, searchResults, 5 * 60 * 1000);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error('Failed to search tokens:', error);
      } finally {
        setLoading(false);
      }
    };

    // 防抖：500ms 后执行搜索
    const timeoutId = setTimeout(searchTokens, 500);
    return () => clearTimeout(timeoutId);
  }, [query]);

  return { results, loading, error };
}

/**
 * 获取 SOL 价格 Hook
 */
export function useSOLPrice() {
  const [price, setPrice] = useState<number>(150); // 默认值
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!USE_REAL_DATA) {
      return;
    }

    const fetchSOLPrice = async () => {
      const cacheKey = 'sol_price';
      const cached = cache.get<number>(cacheKey);
      
      if (cached !== null) {
        setPrice(cached);
        return;
      }

      setLoading(true);

      try {
        const solPrice = await realApi.getSOLPrice();
        setPrice(solPrice);
        // 缓存 5 分钟
        cache.set(cacheKey, solPrice, 5 * 60 * 1000);
      } catch (err) {
        console.error('Failed to fetch SOL price:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSOLPrice();

    // 每 5 分钟更新一次
    const interval = setInterval(fetchSOLPrice, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { price, loading };
}

