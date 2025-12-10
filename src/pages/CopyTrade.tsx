import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { ClipboardList, Bell, Trash2, Power, PowerOff, Wallet, Pencil, CheckCircle2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import CopyTradePanel from "@/components/CopyTradePanel";
import { api, type CopyTradeConfig } from "@/lib/api";

const CopyTrade = () => {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("copytrade");
  const [showPanel, setShowPanel] = useState(false);
  const [copyTrades, setCopyTrades] = useState<CopyTradeConfig[]>([]);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("open") === "1") {
      setShowPanel(true);
    }
    loadCopyTrades();
    const handler = () => loadCopyTrades();
    window.addEventListener("copytrade-created", handler);
    window.addEventListener("copytrade-updated", handler);
    return () => {
      window.removeEventListener("copytrade-created", handler);
      window.removeEventListener("copytrade-updated", handler);
    };
  }, [searchParams]);

  const loadCopyTrades = async () => {
    try {
      const trades = await api.getCopyTrades();
      setCopyTrades(trades);
    } catch (error) {
      console.error("Failed to load copy trades:", error);
    }
  };

  const handleNavChange = (tab: string) => {
    setActiveNav(tab);
    if (tab === "copytrade") {
      navigate("/copytrade");
    } else if (tab === "trending") {
      navigate("/trending");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <div className="px-4 pt-4 pb-20 space-y-6">
        {/* 顶部标签与提醒 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm font-semibold">
            <button
              className="text-muted-foreground"
              onClick={() => navigate("/rank")}
            >
              Rank
            </button>
            <button className="text-primary">CopyTrade</button>
            <button className="text-muted-foreground">SnipeX</button>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 bg-muted text-sm rounded-full px-3 py-1.5">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/20">
                <Bell className="w-3.5 h-3.5 text-primary" />
              </span>
              <span>0-Latency Alert</span>
            </button>
            <button className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-lg font-semibold">
              ≡
            </button>
          </div>
        </div>

        {/* 列表或空态 */}
        {copyTrades.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center mt-8 space-y-4">
            <div className="w-28 h-28 rounded-2xl bg-muted flex items-center justify-center">
              <ClipboardList className="w-12 h-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">No CopyTrade Orders</h2>
              <p className="text-muted-foreground text-sm max-w-xs">
                Copy trade helps you instantly mirror all transactions from smart traders.
              </p>
            </div>
            <button
              onClick={() => setShowPanel(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold"
            >
              <ClipboardList className="w-4 h-4" />
              Copy
            </button>
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {/* Table Header */}
            <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground px-2 pb-2 border-b border-border">
              <div>Wallet</div>
              <div>Task</div>
              <div>Bought</div>
              <div>Sold</div>
            </div>

            {/* Table Rows */}
            {copyTrades.map((trade) => {
              const status = (trade as any).status || (trade.enabled ? "running" : "stopped");
              const isStopped = status === "stopped" || !trade.enabled;
              
              return (
                <div
                  key={trade.id}
                  className={`grid grid-cols-4 gap-2 items-center px-2 py-3 rounded-xl border border-border cursor-pointer hover:bg-muted/30 ${
                    isStopped ? "bg-background/30 opacity-60" : "bg-background/60"
                  }`}
                  onClick={() => navigate(`/copytrade/${trade.id}`)}
                >
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground truncate">Walle...</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm">
                      {trade.sourceName?.[0] || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 text-sm font-semibold">
                        <span className="truncate">{trade.sourceName || trade.sourceAddress}</span>
                        <Pencil className="w-3 h-3 text-muted-foreground" />
                        <CheckCircle2 className="w-3 h-3 text-blue-500" />
                      </div>
                    </div>
                    <div className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 ${
                      status === "running"
                        ? "bg-green-500/20 text-green-500 border border-green-500/40" 
                        : status === "paused"
                        ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/40"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        status === "running" ? "bg-green-500" : status === "paused" ? "bg-yellow-500" : "bg-muted-foreground"
                      }`} />
                      {status === "running" ? "Running" : status === "paused" ? "Paused" : "Stopped"}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {trade.bought !== undefined ? trade.bought.toFixed(2) : "--"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {trade.sold !== undefined ? trade.sold.toFixed(2) : "--"}
                  </div>
                </div>
              );
            })}

            <button
              onClick={() => setShowPanel(true)}
              className="w-full rounded-lg border border-dashed border-border bg-background/60 text-foreground py-3 font-semibold text-sm"
            >
              + Create
            </button>
          </div>
        )}
      </div>

      <BottomNav activeTab={activeNav} onTabChange={handleNavChange} />

      <CopyTradePanel
        open={showPanel}
        onOpenChange={(open) => {
          setShowPanel(open);
          if (!open) {
            loadCopyTrades();
          }
        }}
      />
    </div>
  );
};

export default CopyTrade;

