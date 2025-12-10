import { useState, useEffect } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { ChevronDown, ChevronRight, Zap, Flame, Shield, TrendingUp, Activity, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as gmgnApi from "@/lib/gmgnApi";

type WalletRow = {
  name: string;
  bal: string;
  inflow: string;
  age: string;
  action?: string;
};

type Card = {
  title: string;
  subtitle: string;
  mc: string;
  change: string;
  inflow: string;
  tx: string;
  wallets: WalletRow[];
};

const cards: Card[] = [
  {
    title: "赏金猎人",
    subtitle: "1m 0xc8...4444",
    mc: "$5.6K",
    change: "+2.73%",
    inflow: "24h Smart Inflow",
    tx: "⚙ 10 24h V $6.1K",
    wallets: [
      { name: "发财日记 B...", bal: "$1", inflow: "+$16", age: "14s", action: "Sell All" },
      { name: "绿头青蛙", bal: "$1", inflow: "-$9.3", age: "20s", action: "Sell All" },
    ],
  },
  {
    title: "杀马特帽子",
    subtitle: "1m 0x18...4444",
    mc: "$5.2K",
    change: "-11.52%",
    inflow: "24h Smart Inflow",
    tx: "⚙ 2 24h V $3.5K",
    wallets: [
      { name: "星屿 Golden.S", bal: "$1", inflow: "+$21.32", age: "15s", action: "Sell All" },
      { name: "Lkun", bal: "$1", inflow: "-$21.9", age: "45s", action: "Sell All" },
    ],
  },
];

const Monitor = () => {
  const [activeNav, setActiveNav] = useState("monitor");
  const [topTab, setTopTab] = useState("Smart");
  const [timeTab, setTimeTab] = useState("24h");
  const [useRealData, setUseRealData] = useState(false);
  const [realWallets, setRealWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  // 加载真实钱包数据
  useEffect(() => {
    if (!useRealData) return;

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
  }, [useRealData, topTab, timeTab]);

  const handleNavChange = (tab: string) => {
    setActiveNav(tab);
    if (tab === "copytrade") navigate("/copytrade");
    else if (tab === "trending") navigate("/trending");
    else navigate("/");
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <Header />

      <div className="px-3 pt-2 space-y-3">
        {/* 数据源切换 */}
        <div className="flex items-center justify-end mb-2">
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

        {/* Top Tabs */}
        <div className="flex items-center gap-4 text-base font-semibold">
          {["Track", "Smart", "KOL"].map((t) => (
            <button
              key={t}
              className={`pb-1 ${t === topTab ? "text-[#e5e7eb]" : "text-[#8b949e]"}`}
              onClick={() => setTopTab(t)}
            >
              {t}
            </button>
          ))}
          <span className="text-xs text-[#e11d48]">6</span>
          <div className="ml-auto flex items-center gap-3 text-sm text-[#8b949e]">
            <span>1m</span>
            <span>5m</span>
            <span>15m</span>
            <span>1h</span>
            <span>6h</span>
            <button
              className={`px-2 py-1 rounded-md border text-[#e5e7eb] ${
                timeTab === "24h" ? "bg-[#13201a] border-[#21422f]" : "bg-[#0f1216] border-[#1c2128]"
              }`}
              onClick={() => setTimeTab("24h")}
            >
              24h
            </button>
          </div>
        </div>

        {/* Filters row */}
        <div className="flex items-center justify-between text-sm text-[#8b949e]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <ChevronDown className="w-3 h-3" />
              All
            </span>
            <span className="flex items-center gap-1">
              <ChevronDown className="w-3 h-3" />
              Adv.
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#6ee7b7]" />
              <span className="w-2 h-2 rounded-full bg-[#6ee7b7]" />
            </span>
          </div>
          <button className="flex items-center gap-1 text-[#e5e7eb] bg-[#13201a] border border-[#21422f] px-2 py-1 rounded">
            P1
          </button>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-6 h-6 animate-spin text-[#6ee7b7]" />
            <span className="ml-2 text-[#8b949e]">Loading real data...</span>
          </div>
        ) : error ? (
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
          <div className="space-y-4">
            {realWallets.slice(0, 10).map((wallet: any, idx: number) => (
              <div
                key={wallet.address || idx}
                className="rounded-2xl border border-[#1c2128] bg-[#0d0f13] overflow-hidden"
                onClick={() => navigate("/monitor/detail")}
              >
                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-[#e5e7eb]">
                    <div className="w-10 h-10 rounded-xl bg-[#161c22] flex items-center justify-center text-lg">
                      {wallet.icon || "💰"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold truncate">{wallet.name || wallet.address?.slice(0, 6) || "Unknown"}</span>
                        <span className="text-xs text-[#8b949e]">{wallet.address ? `${wallet.address.slice(0, 4)}...${wallet.address.slice(-4)}` : ""}</span>
                      </div>
                      <div className="text-xs text-[#8b949e]">
                        Balance: ${wallet.balance ? (wallet.balance * 150).toFixed(2) : "0.00"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {cards.map((card, idx) => (
            <div
              key={card.title}
              className="rounded-2xl border border-[#1c2128] bg-[#0d0f13] overflow-hidden"
              onClick={() => navigate("/monitor/detail")}
            >
              <div className="p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm text-[#e5e7eb]">
                  <div className="w-10 h-10 rounded-xl bg-[#161c22] flex items-center justify-center text-lg">
                    {idx === 0 ? "💰" : "🎩"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold truncate">{card.title}</span>
                      <span className="text-xs text-[#8b949e]">{card.subtitle}</span>
                      <Shield className="w-3 h-3 text-[#6ee7b7]" />
                      <Zap className="w-3 h-3 text-[#6ee7b7]" />
                      <Flame className="w-3 h-3 text-[#6ee7b7]" />
                    </div>
                    <div className="text-xs text-[#8b949e]">
                      {card.tx} MC {card.mc} <span className={card.change.startsWith("+") ? "text-[#6ee7b7]" : "text-[#f87171]"}>{card.change}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${card.change.startsWith("+") ? "text-[#6ee7b7]" : "text-[#f87171]"}`}>
                      {card.change}
                    </div>
                    <div className="text-xs text-[#8b949e]">{card.inflow}</div>
                  </div>
                </div>

                <div className="text-xs text-[#8b949e] flex items-center gap-2">
                  <span>👥 2</span>
                  <span>24h Smart Inflow</span>
                  <span className="ml-auto flex items-center gap-1 text-[#6ee7b7]">
                    <TrendingUp className="w-3 h-3" />
                    x1?
                  </span>
                </div>
              </div>

              <div className="border-t border-[#1c2128] px-3 py-2 space-y-1">
                <div className="text-xs text-[#8b949e]">Wallet</div>
                {card.wallets.map((w, i) => (
                  <div key={i} className="flex items-center text-[12px] text-[#e5e7eb] py-1">
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#161c22]" />
                      <span className="truncate">{w.name}</span>
                    </div>
                    <div className="w-14 text-right text-[#e5e7eb]">{w.bal}</div>
                    <div className={`w-16 text-right ${w.inflow.startsWith("+") ? "text-[#6ee7b7]" : "text-[#f87171]"}`}>
                      {w.inflow}
                    </div>
                    <div className="w-12 text-right text-[#8b949e]">{w.age}</div>
                    {w.action && (
                      <div className="w-14 text-right text-[#8b949e]">{w.action}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      <BottomNav activeTab={activeNav} onTabChange={handleNavChange} />
    </div>
  );
};

export default Monitor;

