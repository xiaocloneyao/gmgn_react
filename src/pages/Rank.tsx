import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import {
  Flame,
  Zap,
  Sparkles,
  Crown,
  Search,
  ChevronRight,
  Copy,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import CopyTradePanel from "@/components/CopyTradePanel";
import { api } from "@/lib/api";

type RankRow = {
  name: string;
  badge?: string;
  icon: string;
  balance: string;
  sub: string;
  highlight?: "gold" | "brown";
};

const mockData: RankRow[] = [
  { name: "7FNN...BsWp", badge: "👑", icon: "🥇", balance: "0", sub: "0", highlight: "gold" },
  { name: "4UAZ...Wyj1", icon: "🐧", balance: "0.05", sub: "0.05" },
  { name: "やまと(YAMA)", icon: "🦊", balance: "107.15", sub: "107.15", highlight: "brown" },
  { name: "Machi", icon: "🐼", balance: "35.61", sub: "35.61" },
  { name: "Vaio Voi", icon: "⚔️", balance: "68.17", sub: "68.17" },
  { name: "煜鹰资本", icon: "🪙", balance: "73.5", sub: "73.5" },
  { name: "James", icon: "😎", balance: "56", sub: "56" },
  { name: "Cented", icon: "🎯", balance: "136.33", sub: "136.33" },
  { name: "仁和(にんね)", icon: "🐸", balance: "124.26", sub: "124.26" },
];

const Rank = () => {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("copytrade");
  const [filter] = useState("All");
  const [showPanel, setShowPanel] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [selectedName, setSelectedName] = useState<string>("");
  const [copiedAddresses, setCopiedAddresses] = useState<Set<string>>(new Set());
  const [copiedTradeIds, setCopiedTradeIds] = useState<Map<string, string>>(new Map()); // address -> tradeId

  const rows = useMemo(() => mockData, []);

  useEffect(() => {
    loadCopiedAddresses();
    const handler = () => loadCopiedAddresses();
    window.addEventListener("copytrade-created", handler);
    window.addEventListener("copytrade-updated", handler);
    return () => {
      window.removeEventListener("copytrade-created", handler);
      window.removeEventListener("copytrade-updated", handler);
    };
  }, []);

  const loadCopiedAddresses = async () => {
    try {
      const trades = await api.getCopyTrades();
      // 只包含 enabled 且未停止的交易
      const activeTrades = trades.filter((t) => {
        const status = (t as any).status || (t.enabled ? "running" : "stopped");
        return t.enabled && status !== "stopped";
      });
      const addresses = new Set(activeTrades.map((t) => t.sourceAddress));
      const tradeIdMap = new Map(activeTrades.map((t) => [t.sourceAddress, t.id]));
      setCopiedAddresses(addresses);
      setCopiedTradeIds(tradeIdMap);
    } catch (error) {
      console.error("Failed to load copied addresses:", error);
    }
  };

  const handleNavChange = (tab: string) => {
    setActiveNav(tab);
    if (tab === "copytrade") navigate("/copytrade");
    else if (tab === "trending") navigate("/trending");
    else navigate("/");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <div className="px-3 pt-3 pb-20 space-y-4">
        {/* 顶部标签与提醒 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm font-semibold">
            <button className="text-primary">Rank</button>
            <button className="text-muted-foreground" onClick={() => navigate("/copytrade")}>
              CopyTrade
            </button>
            <button className="text-muted-foreground">SnipeX</button>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 bg-muted text-sm rounded-full px-3 py-1.5">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/20">
                <Flame className="w-3.5 h-3.5 text-primary" />
              </span>
              <span>0-Latency Alert</span>
            </button>
            <button className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-lg font-semibold">
              ≡
            </button>
          </div>
        </div>

        {/* tab filters */}
        <div className="grid grid-cols-5 gap-1 text-xs font-semibold">
          {["All", "Pump SM", "Smart Money", "KOL", "LIVE", "Fresh Wallet"].map((item) => (
            <button
              key={item}
              className={`rounded-md px-2 py-1.5 text-center ${
                filter === item ? "bg-primary/15 text-primary" : "bg-muted text-foreground"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* search + timeframe + sort */}
        <div className="flex items-center gap-2 text-sm">
          <div className="flex-1 flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              className="bg-transparent outline-none text-sm w-full placeholder:text-muted-foreground"
              placeholder="Search X name, address, link"
            />
          </div>
          <div className="flex items-center gap-2 bg-muted rounded-lg px-2 py-2">
            <Zap className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">X 1</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          {["1D", "7D", "30D"].map((t) => (
            <button
              key={t}
              className={`px-3 py-1.5 rounded-md ${
                t === "1D" ? "bg-primary/15 text-primary" : "bg-muted text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
          <button className="ml-auto flex items-center gap-1 bg-muted text-foreground px-3 py-1.5 rounded-md">
            <span>Wallet / SOL Bal</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* list */}
        <div className="space-y-2">
          {rows.map((row, idx) => (
            <div
              key={row.name}
              className={`rounded-xl border border-border bg-background/60 px-3 py-3 flex items-center gap-3 cursor-pointer hover:bg-muted/30 ${
                row.highlight === "gold"
                  ? "bg-yellow-500/10 border-yellow-500/40"
                  : row.highlight === "brown"
                  ? "bg-amber-800/10 border-amber-700/30"
                  : ""
              }`}
              onClick={() => navigate(`/rank/${encodeURIComponent(row.name)}`)}
            >
              <div className="w-6 text-sm text-muted-foreground">{idx + 1}</div>

              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg">
                {row.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 text-sm font-semibold">
                  <span className="truncate">{row.name}</span>
                  {row.badge && <Crown className="w-4 h-4 text-yellow-400" />}
                </div>
                <div className="text-xs text-muted-foreground">{row.sub}</div>
              </div>

              <div className="text-right mr-2">
                <div className="text-sm font-semibold text-primary">+ </div>
                <div className="text-xs text-muted-foreground">{row.balance}</div>
              </div>

              <button
                className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold ${
                  copiedAddresses.has(row.name)
                    ? "border border-green-500/60 bg-green-500/10 text-green-500"
                    : "border border-primary/60 text-primary"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (copiedAddresses.has(row.name)) {
                    // 如果已复制，跳转到详情页
                    const tradeId = copiedTradeIds.get(row.name);
                    if (tradeId) {
                      navigate(`/copytrade/${tradeId}`);
                    }
                  } else {
                    // 如果未复制，打开配置面板
                    setSelectedAddress(row.name);
                    setSelectedName(row.name);
                    setShowPanel(true);
                  }
                }}
              >
                <Copy className="w-4 h-4" />
                {copiedAddresses.has(row.name) ? "Copied" : "Copy"}
              </button>
            </div>
          ))}
        </div>
      </div>

      <BottomNav activeTab={activeNav} onTabChange={handleNavChange} />
      <CopyTradePanel
        open={showPanel}
        onOpenChange={(open) => {
          setShowPanel(open);
          if (!open) {
            loadCopiedAddresses();
          }
        }}
        address={selectedAddress}
        sourceName={selectedName}
      />
    </div>
  );
};

export default Rank;

