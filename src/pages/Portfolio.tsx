import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { useState, useEffect } from "react";
import { getAuthState, subscribeAuth } from "@/lib/authStore";
import { api, type Wallet, type CopyTradeHistory } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { getSelectedChain, subscribeChain, CHAIN_INFO, type Chain } from "@/lib/chainStore";
import { ChevronDown, Search, Settings, Share2, Pencil, Copy, Calendar, ArrowUpDown, RefreshCcw, Infinity, ArrowDownToLine, ArrowUpToLine, Clock, DollarSign, TrendingUp } from "lucide-react";

const Portfolio = () => {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("portfolio");
  const [auth, setAuth] = useState(getAuthState());
  const [activeTab, setActiveTab] = useState<"holding" | "history" | "orders">("orders");
  const [orderType, setOrderType] = useState("limit");
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [totalUsdValue, setTotalUsdValue] = useState<number>(0);
  const [copyTradeHistory, setCopyTradeHistory] = useState<CopyTradeHistory[]>([]);
  const [selectedChain, setSelectedChain] = useState<Chain>(getSelectedChain());

  useEffect(() => {
    const unsubAuth = subscribeAuth((state) => {
      setAuth(state);
      if (state.loggedIn) {
        // 确保余额已初始化
        api.getSolBalance().then(() => {
          loadWallets();
          loadCopyTradeHistory();
        });
      }
    });
    
    const unsubChain = subscribeChain((chain) => {
      setSelectedChain(chain);
      // 切换网络时重新加载数据
      if (auth.loggedIn) {
        loadWallets();
        loadCopyTradeHistory();
      }
    });
    
    // 初始加载
    if (auth.loggedIn) {
      api.getSolBalance().then(() => {
        loadWallets();
        loadCopyTradeHistory();
      });
    }
    
    return () => {
      unsubAuth();
      unsubChain();
    };
  }, []);
  
  // 当网络切换时重新加载
  useEffect(() => {
    if (auth.loggedIn) {
      loadWallets();
    }
  }, [selectedChain]);

  const loadWallets = async () => {
    try {
      const walletList = await api.getWallets();
      // 根据当前选择的网络过滤钱包
      const filteredWallets = walletList.filter((w) => w.chain === selectedChain);
      setWallets(filteredWallets.length > 0 ? filteredWallets : walletList);
      const total = filteredWallets.length > 0 
        ? filteredWallets.reduce((sum, w) => sum + w.balance, 0)
        : walletList.reduce((sum, w) => sum + w.balance, 0);
      const totalUsd = filteredWallets.length > 0
        ? filteredWallets.reduce((sum, w) => sum + w.usdValue, 0)
        : walletList.reduce((sum, w) => sum + w.usdValue, 0);
      setTotalBalance(total);
      setTotalUsdValue(totalUsd);
    } catch (error) {
      console.error("Failed to load wallets:", error);
    }
  };

  const loadCopyTradeHistory = async () => {
    try {
      const history = await api.getCopyTradeHistory();
      setCopyTradeHistory(history);
    } catch (error) {
      console.error("Failed to load copy trade history:", error);
    }
  };

  useEffect(() => {
    if (auth.loggedIn) {
      loadCopyTradeHistory();
      // 监听 CopyTrade 更新事件
      const handler = () => {
        loadWallets();
        loadCopyTradeHistory();
      };
      window.addEventListener("copytrade-created", handler);
      window.addEventListener("copytrade-updated", handler);
      return () => {
        window.removeEventListener("copytrade-created", handler);
        window.removeEventListener("copytrade-updated", handler);
      };
    }
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

      <div className="px-3 py-3 space-y-4">
        {/* SOL Wallet (1) Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-lg font-semibold text-[#e5e7eb]">
              {selectedChain} Wallet ({wallets.length})
            </div>
            <button className="flex items-center gap-1 text-sm text-[#8b949e]">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#8b949e]">Log &gt;</span>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-[#1c2128] border border-[#2d3339]"></div>
                <span className="text-yellow-400 text-xs">🪙</span>
                <div className="w-4 h-4 rounded-full bg-[#1c2128] border border-[#2d3339]"></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 rounded-lg bg-[#11161b] border border-[#1c2128] text-sm text-[#e5e7eb]">
                Import
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-[#27c37c] text-[#0b1411] text-sm font-semibold">
                + Create Wallet
              </button>
            </div>
          </div>

          {/* Wallet List */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-[#8b949e] mb-2">
              <input type="checkbox" className="w-4 h-4 rounded border-[#1c2128]" defaultChecked />
              <span>Select All</span>
            </div>
            {wallets.map((wallet) => (
              <div key={wallet.id} className="flex items-center gap-2 p-2 rounded-lg bg-[#11161b] border border-[#1c2128]">
                <input type="checkbox" className="w-4 h-4 rounded border-[#1c2128]" defaultChecked />
                <div className="flex items-center gap-1">
                  <div className="w-5 h-5 rounded bg-[#1c2128]"></div>
                  <div className="w-5 h-5 rounded bg-[#1c2128]"></div>
                  <div className="w-5 h-5 rounded-full bg-purple-400"></div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#e5e7eb]">{wallet.name}</span>
                    <Pencil className="w-3 h-3 text-[#8b949e]" />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#8b949e]">
                    <span>{wallet.address}</span>
                    <Copy className="w-3 h-3" />
                  </div>
                </div>
                <div className="text-sm text-[#e5e7eb]">${wallet.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="text-xs text-[#8b949e] flex items-center gap-1">
                  Vol <ArrowUpDown className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Wallet (1) Summary */}
        <div className="border-t border-[#1c2128] pt-3">
          <div className="flex items-center justify-between mb-3">
            <div className="text-lg font-semibold text-[#e5e7eb]">Wallet ({wallets.length})</div>
            <button className="flex items-center gap-1 text-sm text-[#8b949e]">
              <Calendar className="w-4 h-4" />
              PNL Calendar
            </button>
          </div>
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-yellow-400 text-2xl">🪙</span>
              <div>
                <div className="text-sm text-[#8b949e]">Total Value</div>
                <div className="text-lg font-semibold text-[#e5e7eb]">
                  {totalBalance.toFixed(2)} {selectedChain} ≈ ${totalUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
            <div className="text-sm">
              <span className="text-[#8b949e]">Total PnL USD: </span>
              <span className="text-[#e5e7eb]">$0 (--)</span>
            </div>
            <div className="text-sm">
              <span className="text-[#8b949e]">Unrealized Profits: </span>
              <span className="text-[#e5e7eb]">$0</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <button className="flex flex-col items-center gap-1 p-2 rounded-lg bg-[#13201a] border border-[#21422f]">
              <ArrowDownToLine className="w-5 h-5 text-[#6ee7b7]" />
              <span className="text-xs text-[#e5e7eb]">Deposit</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-2 rounded-lg bg-[#13201a] border border-[#21422f]">
              <RefreshCcw className="w-5 h-5 text-[#6ee7b7]" />
              <span className="text-xs text-[#e5e7eb]">Buy</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-2 rounded-lg bg-[#13201a] border border-[#21422f]">
              <ArrowUpToLine className="w-5 h-5 text-[#6ee7b7]" />
              <span className="text-xs text-[#e5e7eb]">Withdraw</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-2 rounded-lg bg-[#13201a] border border-[#21422f]">
              <Infinity className="w-5 h-5 text-[#6ee7b7]" />
              <span className="text-xs text-[#e5e7eb]">Convert</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 border-b border-[#1c2128]">
          <button
            onClick={() => setActiveTab("holding")}
            className={`pb-2 text-sm ${activeTab === "holding" ? "text-[#27c37c] border-b-2 border-[#27c37c]" : "text-[#8b949e]"}`}
          >
            Holding
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-2 text-sm ${activeTab === "history" ? "text-[#27c37c] border-b-2 border-[#27c37c]" : "text-[#8b949e]"}`}
          >
            History
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-2 text-sm ${activeTab === "orders" ? "text-[#27c37c] border-b-2 border-[#27c37c]" : "text-[#8b949e]"}`}
          >
            Orders
          </button>
        </div>

        {/* History Section */}
        {activeTab === "history" && (
          <div className="space-y-3">
            {copyTradeHistory.length === 0 ? (
              <div className="text-center text-sm text-[#8b949e] py-8">No CopyTrade history</div>
            ) : (
              <div className="space-y-2">
                {copyTradeHistory.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigate(`/copytrade/${item.copyTradeId}`)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#11161b] border border-[#1c2128] hover:bg-[#161c22] text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#13201a] border border-[#21422f] flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-[#6ee7b7]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-[#e5e7eb] truncate">
                          {item.copyTradeName}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          item.status === "running"
                            ? "bg-green-500/20 text-green-500 border border-green-500/40"
                            : item.status === "paused"
                            ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/40"
                            : "bg-gray-500/20 text-gray-500 border border-gray-500/40"
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-[#8b949e]">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(item.startTime).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          <span>{item.totalSpent.toFixed(4)} SOL</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>Fees: {item.totalFees.toFixed(4)} SOL</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>Trades: {item.totalTrades}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-[#8b949e] rotate-[-90deg]" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Orders Section */}
        {activeTab === "orders" && (
          <div className="space-y-3">
            {/* Order Type Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setOrderType("limit")}
                className={`px-3 py-1.5 rounded-lg text-sm ${
                  orderType === "limit"
                    ? "bg-[#27c37c] text-[#0b1411]"
                    : "bg-[#11161b] border border-[#1c2128] text-[#e5e7eb]"
                }`}
              >
                Limit
              </button>
              <button
                onClick={() => setOrderType("migrated")}
                className={`px-3 py-1.5 rounded-lg text-sm ${
                  orderType === "migrated"
                    ? "bg-[#27c37c] text-[#0b1411]"
                    : "bg-[#11161b] border border-[#1c2128] text-[#e5e7eb]"
                }`}
              >
                Migrated Sell
              </button>
              <button
                onClick={() => setOrderType("sell-dev")}
                className={`px-3 py-1.5 rounded-lg text-sm ${
                  orderType === "sell-dev"
                    ? "bg-[#27c37c] text-[#0b1411]"
                    : "bg-[#11161b] border border-[#1c2128] text-[#e5e7eb]"
                }`}
              >
                Sell on Dev Sell
              </button>
              <button
                onClick={() => setOrderType("buy-dev")}
                className={`px-3 py-1.5 rounded-lg text-sm ${
                  orderType === "buy-dev"
                    ? "bg-[#27c37c] text-[#0b1411]"
                    : "bg-[#11161b] border border-[#1c2128] text-[#e5e7eb]"
                }`}
              >
                Buy on Dev Sell
              </button>
              <button
                onClick={() => setOrderType("ac")}
                className={`px-3 py-1.5 rounded-lg text-sm ${
                  orderType === "ac"
                    ? "bg-[#27c37c] text-[#0b1411]"
                    : "bg-[#11161b] border border-[#1c2128] text-[#e5e7eb]"
                }`}
              >
                Ac
              </button>
            </div>

            {/* Active/History Tabs */}
            <div className="flex items-center gap-4">
              <button className="text-sm text-[#27c37c] border-b-2 border-[#27c37c] pb-1">Active</button>
              <button className="text-sm text-[#8b949e]">History</button>
            </div>

            <button className="w-full px-3 py-2 rounded-lg bg-[#11161b] border border-[#1c2128] text-sm text-[#e5e7eb]">
              Close All Orders
            </button>

            {/* Table Header */}
            <div className="flex items-center gap-2 text-xs text-[#8b949e] border-b border-[#1c2128] pb-2">
              <div className="w-16">Type</div>
              <div className="w-20">Token</div>
              <div className="w-20">Amount</div>
              <div className="flex-1 flex items-center gap-1">
                Trigger MC <ArrowUpDown className="w-3 h-3" />
              </div>
              <div className="flex-1 flex items-center gap-1">
                Filled MC <ArrowUpDown className="w-3 h-3" />
              </div>
              <div className="w-20">Time</div>
            </div>

            {/* Empty State */}
            <div className="text-center text-sm text-[#8b949e] py-8">No orders</div>
          </div>
        )}
      </div>

      <BottomNav activeTab={activeNav} />
    </div>
  );
};

export default Portfolio;

