// GMGN API 代理客户端
// 使用 Vite 代理或后端服务来绕过 CORS

const PROXY_BASE = '/api/gmgn'; // Vite 代理路径

/**
 * 通过代理获取 GMGN 数据
 */
export async function getGMGNTrendingTokensProxy(limit: number = 20): Promise<any[]> {
  try {
    const response = await fetch(`${PROXY_BASE}/tokens/trending?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Proxy API error: ${response.status}`);
    }

    const data = await response.json();
    const tokens = data.tokens || data.data || [];
    return tokens.map((token: any) => formatGMGNToken(token));
  } catch (error) {
    console.error('Failed to fetch trending tokens via proxy:', error);
    throw error;
  }
}

/**
 * 通过代理获取热门钱包
 */
export async function getGMGNTrendingWalletsProxy(limit: number = 20): Promise<any[]> {
  try {
    const response = await fetch(`${PROXY_BASE}/wallets/trending?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Proxy API error: ${response.status}`);
    }

    const data = await response.json();
    const wallets = data.wallets || data.data || [];
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
  } catch (error) {
    console.error('Failed to fetch trending wallets via proxy:', error);
    return [];
  }
}

/**
 * 通过代理搜索代币
 */
export async function searchGMGNTokensProxy(query: string): Promise<any[]> {
  try {
    const response = await fetch(`${PROXY_BASE}/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Proxy API error: ${response.status}`);
    }

    const data = await response.json();
    const tokens = data.tokens || data.data || [];
    return tokens.map((token: any) => formatGMGNToken(token));
  } catch (error) {
    console.error('Failed to search tokens via proxy:', error);
    return [];
  }
}

/**
 * 格式化 GMGN 代币数据
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
    age: token.age || (token.created_at ? calculateAge(token.created_at) : ''),
    txCount: token.tx_count || token.transactions || 0,
    holders: token.holders || 0,
    pairAddress: token.pair_address || token.pairAddress || '',
    dex: token.dex || token.dex_id || 'Unknown',
  };
}

function calculateAge(createdAt: number | string): string {
  try {
    const created = typeof createdAt === 'string' ? new Date(createdAt).getTime() : createdAt;
    const now = Date.now();
    const diff = now - created;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days}d`;
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return hours > 0 ? `${hours}h` : 'New';
  } catch {
    return '';
  }
}

