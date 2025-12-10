import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Pencil, ExternalLink, RefreshCw, Copy, MoreVertical, UserPlus, CheckCircle2, Filter, ArrowUpDown, Star } from "lucide-react";
import { api } from "@/lib/api";
import CopyTradePanel from "@/components/CopyTradePanel";

const RankDetail = () => {
  const navigate = useNavigate();
  const { address } = useParams<{ address: string }>();
  const [activeNav, setActiveNav] = useState("copytrade");
  const [activeTab, setActiveTab] = useState<"pnl" | "holdings" | "trades" | "tokens">("trades");
  const [timeframe, setTimeframe] = useState<"1d" | "7d">("7d");
  const [isCopied, setIsCopied] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const decodedAddress = address ? decodeURIComponent(address) : "";

  useEffect(() => {
    checkCopiedStatus();
    const handler = () => checkCopiedStatus();
    window.addEventListener("copytrade-created", handler);
    window.addEventListener("copytrade-updated", handler);
    return () => {
      window.removeEventListener("copytrade-created", handler);
      window.removeEventListener("copytrade-updated", handler);
    };
  }, [decodedAddress]);

  const checkCopiedStatus = async () => {
    try {
      const trades = await api.getCopyTrades();
      // 只检查 enabled 且未停止的交易
      const copied = trades.some((t) => {
        const status = (t as any).status || (t.enabled ? "running" : "stopped");
        return t.sourceAddress === decodedAddress && t.enabled && status !== "stopped";
      });
      setIsCopied(copied);
    } catch (error) {
      console.error("Failed to check copied status:", error);
    }
  };

  const handleNavChange = (tab: string) => {
    setActiveNav(tab);
    if (tab === "copytrade") navigate("/copytrade");
    else if (tab === "trending") navigate("/trending");
    else navigate("/");
  };

  // Mock data - 实际应该从 API 获取
  const mockTrades = [
    { type: "Buy", token: "Quake", icon: "🪐", mc: "$565.4439", amount: "57M", totalUsd: "$552.1", profit: true },
    { type: "Buy", token: "RNUTMON", icon: "👑", mc: "$9.06K", amount: "8.4M", totalUsd: "$220.8", profit: true },
    { type: "Sell", token: "Quake", icon: "🪐", mc: "$27.4337", amount: "133.9M", totalUsd: "$2.03K", profit: true },
    { type: "Sell", token: "RNUTMON", icon: "👑", mc: "$9.45K", amount: "94.2M", totalUsd: "$2.57K", profit: true },
    { type: "Buy", token: "RNUTMON", icon: "👑", mc: "$11.37K", amount: "6.7M", totalUsd: "$220.8", profit: true },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <Header />

      <div className="px-3 pt-4 space-y-4">
        {/* User Profile Section */}
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-2xl">
                🐷
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">やまと (YAMA...</span>
                  <Pencil className="w-4 h-4 text-muted-foreground" />
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  <RefreshCw className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-muted-foreground">EcFpwM</span>
                  <Copy className="w-3 h-3 text-muted-foreground" />
                  <MoreVertical className="w-3 h-3 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <button className="px-2 py-1 rounded bg-muted text-xs text-foreground">X 16K</button>
                  <div className="flex items-center gap-1 px-2 py-1 rounded bg-green-500/20 text-green-500 text-xs">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>PnL 0.43X</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                  isCopied
                    ? "border border-green-500/60 bg-green-500/10 text-green-500"
                    : "border border-primary/60 bg-primary/10 text-primary"
                }`}
                onClick={() => {
                  if (!isCopied) {
                    setShowPanel(true);
                  }
                }}
              >
                {isCopied ? "Copied" : "Copy"}
              </button>
              <button className="p-2 rounded-lg bg-muted">
                <UserPlus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => setTimeframe("7d")}
              className={`px-3 py-1.5 rounded-md font-semibold ${
                timeframe === "7d" ? "bg-primary/15 text-primary" : "text-muted-foreground"
              }`}
            >
              7D PnL
            </button>
            <button className="px-3 py-1.5 rounded-md text-muted-foreground">Profit</button>
            <button className="px-3 py-1.5 rounded-md text-muted-foreground">Distribution</button>
            <button className="px-3 py-1.5 rounded-md text-muted-foreground">PNL Calendar</button>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setTimeframe("1d")}
                className={`px-2 py-1 rounded text-xs ${
                  timeframe === "1d" ? "bg-primary/15 text-primary" : "text-muted-foreground"
                }`}
              >
                1d
              </button>
              <button
                onClick={() => setTimeframe("7d")}
                className={`px-2 py-1 rounded text-xs ${
                  timeframe === "7d" ? "bg-primary/15 text-primary" : "text-muted-foreground"
                }`}
              >
                7d
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <div className="text-2xl font-bold text-green-500">+42.96% +$1.1M</div>
              <div className="text-sm text-muted-foreground">7D Realized PnL (USD)</div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-red-500 font-semibold">-$26.3M (-84.59%)</div>
                <div className="text-muted-foreground">Total PnL</div>
              </div>
              <div>
                <div className="text-red-500 font-semibold">-$27.7M</div>
                <div className="text-muted-foreground">Unrealized Profits</div>
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">91.81%</div>
              <div className="text-sm text-muted-foreground">Win Rate</div>
            </div>
          </div>
        </div>

        {/* Phishing Check */}
        <div className="rounded-xl border border-border bg-background/50 p-3 space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="text-muted-foreground">🔒</span>
            <span>Phishing check</span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-muted-foreground">Blacklist: </span>
              <span className="text-foreground">0 (0%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span className="text-muted-foreground">Didn't buy: </span>
              <span className="text-foreground">1 (0.09%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-muted-foreground">Sold &gt; Bought: </span>
              <span className="text-foreground">0 (0%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span className="text-muted-foreground">Buy/Sell in 5s: </span>
              <span className="text-foreground">20 (1.77%)</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 border-b border-border">
          <button
            onClick={() => setActiveTab("pnl")}
            className={`pb-2 text-sm ${
              activeTab === "pnl" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
            }`}
          >
            Recent PnL
          </button>
          <button
            onClick={() => setActiveTab("holdings")}
            className={`pb-2 text-sm ${
              activeTab === "holdings" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
            }`}
          >
            Holdings
          </button>
          <button
            onClick={() => setActiveTab("trades")}
            className={`pb-2 text-sm ${
              activeTab === "trades" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
            }`}
          >
            Trades
          </button>
          <button
            onClick={() => setActiveTab("tokens")}
            className={`pb-2 text-sm ${
              activeTab === "tokens" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
            }`}
          >
            Deployed Tokens
          </button>
        </div>

        {/* Trades Table */}
        {activeTab === "trades" && (
          <div className="space-y-2">
            <div className="grid grid-cols-5 gap-2 text-xs text-muted-foreground px-2 pb-2 border-b border-border">
              <div className="flex items-center gap-1">
                Type <Filter className="w-3 h-3" />
              </div>
              <div>Token</div>
              <div className="flex items-center gap-1">
                MC <ArrowUpDown className="w-3 h-3" />
              </div>
              <div>Amount</div>
              <div>Total USD</div>
            </div>
            {mockTrades.map((trade, idx) => (
              <div key={idx} className="grid grid-cols-5 gap-2 items-center px-2 py-2 rounded-lg hover:bg-muted/30">
                <div>
                  <button
                    className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 ${
                      trade.type === "Buy"
                        ? "bg-green-500/20 text-green-500"
                        : "bg-red-500/20 text-red-500"
                    }`}
                  >
                    {trade.type === "Buy" && <Star className="w-3 h-3" />}
                    {trade.type}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{trade.icon}</span>
                  <span className="text-sm font-semibold">{trade.token}</span>
                </div>
                <div className="text-sm text-muted-foreground">{trade.mc}</div>
                <div className="text-sm text-muted-foreground">{trade.amount}</div>
                <div className={`text-sm font-semibold ${trade.profit ? "text-green-500" : "text-red-500"}`}>
                  {trade.totalUsd}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Other tabs content */}
        {activeTab === "pnl" && (
          <div className="text-center text-muted-foreground py-8">Recent PnL data</div>
        )}
        {activeTab === "holdings" && (
          <div className="text-center text-muted-foreground py-8">Holdings data</div>
        )}
        {activeTab === "tokens" && (
          <div className="text-center text-muted-foreground py-8">Deployed Tokens data</div>
        )}
      </div>

      <BottomNav activeTab={activeNav} onTabChange={handleNavChange} />
      <CopyTradePanel
        open={showPanel}
        onOpenChange={(open) => {
          setShowPanel(open);
          if (!open) {
            checkCopiedStatus();
          }
        }}
        address={decodedAddress}
        sourceName={decodedAddress}
      />
    </div>
  );
};

export default RankDetail;

