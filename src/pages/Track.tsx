import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { useState, useEffect } from "react";
import { getAuthState, subscribeAuth } from "@/lib/authStore";
import { api, type Wallet, type WalletBalanceChange } from "@/lib/api";
import { ChevronDown, ChevronUp, Search, Settings, Bell, Volume2, ArrowUpDown, Send, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import * as gmgnApi from "@/lib/gmgnApi";

const Track = () => {
  const [activeNav, setActiveNav] = useState("track");
  const [auth, setAuth] = useState(getAuthState());
  const [useRealData, setUseRealData] = useState(false);
  const [realWallets, setRealWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [balanceChanges, setBalanceChanges] = useState<WalletBalanceChange[]>([]);

  // 加载真实钱包数据
  useEffect(() => {
    if (!auth.loggedIn || !useRealData) return;

    const loadRealWallets = async () => {
      setLoading(true);
      setError(null);
      try {
        const wallets = await gmgnApi.getGMGNTrendingWallets(20);
        setRealWallets(wallets);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error('Failed to load real wallets:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRealWallets();
  }, [auth.loggedIn, useRealData]);

  useEffect(() => {
    const unsub = subscribeAuth((state) => {
      setAuth(state);
      if (state.loggedIn) {
        loadWallets();
        loadBalanceChanges();
      }
    });
    return unsub;
  }, []);

  const loadWallets = async () => {
    try {
      const walletList = await api.getWallets();
      setWallets(walletList);
    } catch (error) {
      console.error("Failed to load wallets:", error);
    }
  };

  const loadBalanceChanges = async () => {
    try {
      const changes = await api.getBalanceChanges();
      // 按时间倒序排列
      setBalanceChanges(changes.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      console.error("Failed to load balance changes:", error);
    }
  };

  // 监听余额变动
  useEffect(() => {
    if (!auth.loggedIn) return;
    
    const handler = () => {
      loadWallets();
      loadBalanceChanges();
    };
    
    window.addEventListener("copytrade-created", handler);
    window.addEventListener("copytrade-updated", handler);
    
    // 定期刷新
    const interval = setInterval(() => {
      loadWallets();
      loadBalanceChanges();
    }, 5000);
    
    return () => {
      window.removeEventListener("copytrade-created", handler);
      window.removeEventListener("copytrade-updated", handler);
      clearInterval(interval);
    };
  }, [auth.loggedIn]);

  if (!auth.loggedIn) {
    return (
      <div className="min-h-screen bg-background text-foreground pb-16">
        <Header />
        <div className="px-3 pt-4 flex flex-col items-center justify-center text-center text-[#8b949e] space-y-4">
          <div className="mt-20" />
          <div className="text-sm">You are not logged in to GMGN</div>
          <button
            className="px-6 py-2 rounded-full border border-[#1c2128] bg-[#0f1216] text-[#e5e7eb]"
            onClick={() => {
              window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { mode: "login" } }));
            }}
          >
            Log in
          </button>
        </div>
        <BottomNav activeTab={activeNav} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <Header />
      
      {/* 数据源切换 */}
      <div className="px-3 pt-2 pb-2 flex items-center justify-end">
        <button
          onClick={() => setUseRealData(!useRealData)}
          className={`flex items-center gap-1 border rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            useRealData
              ? "bg-[#13201a] border-[#21422f] text-[#6ee7b7] hover:bg-[#1a2d22]"
              : "bg-[#0f1216] border-[#1c2128] text-[#a8b0bb] hover:bg-[#151a1f]"
          }`}
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          <span>{useRealData ? "Real Data" : "Mock Data"}</span>
        </button>
      </div>

      {/* Secondary Navigation */}
      <div className="px-3 py-2 border-b border-[#1c2128]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 text-sm text-[#e5e7eb]">
              Wallet <ChevronDown className="w-4 h-4" />
            </button>
            <button className="flex items-center gap-1 text-sm text-[#e5e7eb]">
              <span className="text-yellow-400">🪙</span> Wallet <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#8b949e]">Wallet</span>
            <span className="text-[#27c37c] font-semibold">Track</span>
            <span className="text-[#8b949e]">Monitor</span>
            <span className="text-[#8b949e]">Renames</span>
          </div>
          <div className="flex items-center gap-2">
            <ChevronUp className="w-4 h-4 text-[#8b949e]" />
            <Bell className="w-4 h-4 text-[#8b949e]" />
            <Volume2 className="w-4 h-4 text-[#8b949e]" />
            <Search className="w-4 h-4 text-[#8b949e]" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button className="px-3 py-1.5 rounded-lg bg-[#11161b] border border-[#1c2128] text-sm text-[#e5e7eb]">
            Add
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-[#11161b] border border-[#1c2128] text-sm text-[#e5e7eb]">
            Import
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-[#11161b] border border-[#1c2128] text-sm text-[#e5e7eb]">
            Export
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-[#11161b] border border-[#1c2128] text-sm text-[#e5e7eb] flex items-center gap-1">
            APP <span className="text-[#27c37c] text-xs">📱</span>
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-[#11161b] border border-[#1c2128] text-sm text-[#e5e7eb] flex items-center gap-1">
            O-Latency Alert <Send className="w-3 h-3 text-blue-400" />
          </button>
        </div>

        {/* Table Header */}
        <div className="flex items-center gap-2 mt-3 text-xs text-[#8b949e] border-b border-[#1c2128] pb-2">
          <div className="w-20 flex items-center gap-1">
            Created <ArrowUpDown className="w-3 h-3" />
          </div>
          <div className="flex-1 flex items-center gap-1">
            Wallet <ArrowUpDown className="w-3 h-3" />
          </div>
          <div className="w-24">Balance</div>
          <div className="w-20 flex items-center gap-1">
            Win rate <ArrowUpDown className="w-3 h-3" />
          </div>
          <div className="w-16">Av</div>
        </div>
      </div>

      {/* Data Display */}
      {useRealData && loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-6 h-6 animate-spin text-[#6ee7b7]" />
          <span className="ml-2 text-[#8b949e]">Loading real data...</span>
        </div>
      ) : useRealData && error ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-2">
          <div className="text-red-400 text-sm">Failed to load real data</div>
          <div className="text-[#8b949e] text-xs">{error.message}</div>
          <button
            onClick={() => setUseRealData(false)}
            className="mt-4 px-4 py-2 rounded-lg bg-[#13201a] border border-[#21422f] text-[#6ee7b7] text-sm"
          >
            Switch to Mock Data
          </button>
        </div>
      ) : useRealData && realWallets.length > 0 ? (
        <div className="px-3 space-y-2">
          {realWallets.map((wallet: any, idx: number) => (
            <div
              key={wallet.address || idx}
              className="flex items-center gap-2 py-2 border-b border-[#1c2128] text-sm"
            >
              <div className="w-20 text-[#8b949e]">
                {new Date().toLocaleDateString()}
              </div>
              <div className="flex-1 text-[#e5e7eb] truncate">
                {wallet.address || wallet.name || "Unknown"}
              </div>
              <div className="w-24 text-[#e5e7eb]">
                ${wallet.balance ? (wallet.balance * 150).toFixed(2) : "0.00"}
              </div>
              <div className="w-20 text-[#6ee7b7]">--</div>
              <div className="w-16 text-[#8b949e]">--</div>
            </div>
          ))}
        </div>
      ) : wallets.length > 0 ? (
        <div className="px-3 space-y-2">
          {wallets.map((wallet) => {
            const walletChanges = balanceChanges.filter((c) => c.walletId === wallet.id);
            const recentChanges = walletChanges.slice(0, 5); // 显示最近5条
            
            return (
              <div key={wallet.id} className="space-y-2">
                <div className="flex items-center gap-2 py-2 border-b border-[#1c2128] text-sm">
                  <div className="w-20 text-[#8b949e]">
                    {new Date(wallet.id).toLocaleDateString()}
                  </div>
                  <div className="flex-1 text-[#e5e7eb] truncate">
                    {wallet.name}
                  </div>
                  <div className="w-24 text-[#e5e7eb]">
                    {wallet.balance.toFixed(4)} SOL
                  </div>
                  <div className="w-20 text-[#6ee7b7]">
                    ${wallet.usdValue.toFixed(2)}
                  </div>
                  <div className="w-16 text-[#8b949e]">
                    {walletChanges.length}
                  </div>
                </div>
                
                {/* 显示最近的余额变动 */}
                {recentChanges.length > 0 && (
                  <div className="ml-4 space-y-1 border-l border-[#1c2128] pl-3">
                    {recentChanges.map((change) => (
                      <div key={change.id} className="flex items-center gap-2 text-xs text-[#8b949e] py-1">
                        {change.amount > 0 ? (
                          <TrendingUp className="w-3 h-3 text-[#6ee7b7]" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-[#f87171]" />
                        )}
                        <span className="flex-1 truncate">{change.description}</span>
                        <span className={`${change.amount > 0 ? "text-[#6ee7b7]" : "text-[#f87171]"}`}>
                          {change.amount > 0 ? "+" : ""}{change.amount.toFixed(4)} SOL
                        </span>
                        <span className="text-[#8b949e]">
                          {new Date(change.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="relative mb-6">
            <div className="w-32 h-32 bg-[#1c2128] rounded-lg border-2 border-[#2d3339] flex items-center justify-center relative">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#1c2128] border-2 border-[#2d3339] rounded"></div>
              <div className="text-4xl font-bold text-[#8b949e]">CLOSE</div>
            </div>
          </div>
          <div className="text-lg text-[#8b949e]">No Data</div>
        </div>
      )}

      <BottomNav activeTab={activeNav} />
    </div>
  );
};

export default Track;

