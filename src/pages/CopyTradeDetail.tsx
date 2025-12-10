import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Pencil, Copy, Pause, Play, X, Filter, ArrowUpDown, DollarSign, Star } from "lucide-react";
import { api, type CopyTradeConfig, type TradeHistory } from "@/lib/api";
import CopyTradePanel from "@/components/CopyTradePanel";

type CopyTradeStatus = "running" | "paused" | "stopped";

const CopyTradeDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeNav, setActiveNav] = useState("copytrade");
  const [activeTab, setActiveTab] = useState<"trades" | "failed" | "filter">("trades");
  const [copyTrade, setCopyTrade] = useState<CopyTradeConfig | null>(null);
  const [status, setStatus] = useState<CopyTradeStatus>("running");
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [tradeHistory, setTradeHistory] = useState<TradeHistory[]>([]);

  useEffect(() => {
    loadCopyTrade();
    if (id) {
      loadTradeHistory();
    }
  }, [id]);

  const loadCopyTrade = async () => {
    if (!id) return;
    try {
      const trades = await api.getCopyTrades();
      const trade = trades.find((t) => t.id === id);
      if (trade) {
        setCopyTrade(trade);
        // 根据 enabled 状态判断
        if (!trade.enabled) {
          setStatus("stopped");
        } else {
          // 可以从 trade 中读取状态，如果没有则默认为 running
          setStatus((trade as any).status || "running");
        }
      }
    } catch (error) {
      console.error("Failed to load copy trade:", error);
    }
  };

  const loadTradeHistory = async () => {
    if (!id) return;
    try {
      const history = await api.getTradeHistory(id);
      setTradeHistory(history);
    } catch (error) {
      console.error("Failed to load trade history:", error);
    }
  };

  const handlePause = async () => {
    if (!copyTrade) return;
    try {
      await api.updateCopyTrade(copyTrade.id, { status: "paused", enabled: true } as any);
      setStatus("paused");
      loadCopyTrade(); // 重新加载以更新状态
    } catch (error) {
      console.error("Failed to pause:", error);
      alert("Failed to pause copy trade");
    }
  };

  const handleRestart = async () => {
    if (!copyTrade) return;
    try {
      await api.updateCopyTrade(copyTrade.id, { status: "running", enabled: true } as any);
      setStatus("running");
      loadCopyTrade(); // 重新加载以更新状态
    } catch (error) {
      console.error("Failed to restart:", error);
      alert("Failed to restart copy trade");
    }
  };

  const handleStop = async () => {
    if (!copyTrade) return;
    try {
      await api.updateCopyTrade(copyTrade.id, { enabled: false, status: "stopped" } as any);
      // 触发刷新事件，让 Rank 和 RankDetail 页面更新状态
      window.dispatchEvent(new CustomEvent("copytrade-updated"));
      // 返回 CopyTrade 列表
      navigate("/copytrade");
    } catch (error) {
      console.error("Failed to stop:", error);
      alert("Failed to stop copy trade");
    }
  };

  const handleNavChange = (tab: string) => {
    setActiveNav(tab);
    if (tab === "copytrade") navigate("/copytrade");
    else if (tab === "trending") navigate("/trending");
    else navigate("/");
  };

  if (!copyTrade) {
    return (
      <div className="min-h-screen bg-background text-foreground pb-20">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-muted-foreground">Loading...</div>
        </div>
        <BottomNav activeTab={activeNav} onTabChange={handleNavChange} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <Header />

      <div className="px-3 pt-4 space-y-4">
        {/* Profile Section */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-2xl">
              🐸
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">{copyTrade.sourceAddress.slice(0, 6)}...{copyTrade.sourceAddress.slice(-4)}</span>
                <Pencil className="w-4 h-4 text-muted-foreground" />
                <div className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  status === "running" 
                    ? "bg-green-500/20 text-green-500 border border-green-500/40" 
                    : status === "paused"
                    ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/40"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {status === "running" ? "II Running" : status === "paused" ? "II Paused" : "Stopped"}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">{copyTrade.sourceAddress}</span>
                <Copy className="w-3 h-3 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {status === "running" ? (
              <button
                onClick={handlePause}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-green-500/20 text-green-500 border border-green-500/40 py-2.5 font-semibold"
              >
                <Pause className="w-4 h-4" />
                Pause
              </button>
            ) : status === "paused" ? (
              <button
                onClick={handleRestart}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-green-500/20 text-green-500 border border-green-500/40 py-2.5 font-semibold"
              >
                <Play className="w-4 h-4" />
                Restart
              </button>
            ) : null}
            <button
              onClick={() => setShowEditPanel(true)}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-muted text-foreground py-2.5 font-semibold"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={handleStop}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-[#1c2128] text-muted-foreground border border-[#2d3339] py-2.5 font-semibold"
            >
              <X className="w-4 h-4" />
              Stop
            </button>
          </div>
        </div>

        {/* Profit Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-background/50 p-3">
            <div className="text-sm text-muted-foreground mb-1">Tracking Profit</div>
            <div className="text-lg font-semibold">
              ${tradeHistory.reduce((sum, t) => {
                if (t.type === "sell") return sum + t.totalUsd;
                return sum - t.totalUsd;
              }, 0).toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Buy/Sell <span className="text-green-500">
                {tradeHistory.filter(t => t.type === "buy").length}/{tradeHistory.filter(t => t.type === "sell").length}
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-background/50 p-3">
            <div className="text-sm text-muted-foreground mb-1">Realized Profit</div>
            <div className="text-lg font-semibold">
              ${tradeHistory.filter(t => t.type === "sell").reduce((sum, t) => sum + t.totalUsd, 0).toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Age <span className="font-semibold">
                {tradeHistory.length > 0 
                  ? `${Math.floor((Date.now() - tradeHistory[tradeHistory.length - 1].timestamp) / 60000)}m ago`
                  : "--"
                }
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-background/50 p-3">
            <div className="text-sm text-muted-foreground mb-1">Unrealized Profit</div>
            <div className="text-lg font-semibold">
              ${(tradeHistory.filter(t => t.type === "buy").reduce((sum, t) => sum + t.totalUsd, 0) - 
                  tradeHistory.filter(t => t.type === "sell").reduce((sum, t) => sum + t.totalUsd, 0)).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 border-b border-border">
          <button
            onClick={() => setActiveTab("trades")}
            className={`pb-2 text-sm ${
              activeTab === "trades" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
            }`}
          >
            Trades
          </button>
          <button
            onClick={() => setActiveTab("failed")}
            className={`pb-2 text-sm ${
              activeTab === "failed" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
            }`}
          >
            CopyTrade Failed
          </button>
          <button
            onClick={() => setActiveTab("filter")}
            className={`pb-2 text-sm ${
              activeTab === "filter" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
            }`}
          >
            Filter List
          </button>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-6 gap-2 text-xs text-muted-foreground px-2 pb-2 border-b border-border">
          <div className="flex items-center gap-1">
            Type <Filter className="w-3 h-3" />
          </div>
          <div>Token</div>
          <div className="flex items-center gap-1">
            Total USD <DollarSign className="w-3 h-3" />
          </div>
          <div>Amount</div>
          <div>Price</div>
          <div>Trigger T</div>
        </div>

        {/* Trades List or No Data */}
        {activeTab === "trades" && (
          tradeHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="relative mb-6">
                <div className="w-32 h-32 bg-[#1c2128] rounded-lg border-2 border-[#2d3339] flex items-center justify-center relative">
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#1c2128] border-2 border-[#2d3339] rounded"></div>
                  <div className="text-4xl font-bold text-[#8b949e]">CLOSE</div>
                </div>
              </div>
              <div className="text-lg text-[#8b949e]">No Data</div>
            </div>
          ) : (
            <div className="space-y-2">
              {tradeHistory.map((trade) => (
                <div key={trade.id} className="grid grid-cols-6 gap-2 items-center px-2 py-2 rounded-lg hover:bg-muted/30">
                  <div>
                    <button
                      className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 ${
                        trade.type === "buy"
                          ? "bg-green-500/20 text-green-500"
                          : "bg-red-500/20 text-red-500"
                      }`}
                    >
                      {trade.type === "buy" && <Star className="w-3 h-3" />}
                      {trade.type === "buy" ? "Buy" : "Sell"}
                    </button>
                  </div>
                  <div className="text-sm font-semibold">{trade.token}</div>
                  <div className="text-sm text-muted-foreground">${trade.totalUsd.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">{trade.amount.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">${trade.price.toFixed(4)}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(trade.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
        {activeTab === "failed" && (
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
        {activeTab === "filter" && (
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
      </div>

      <BottomNav activeTab={activeNav} onTabChange={handleNavChange} />
      <CopyTradePanel
        open={showEditPanel}
        onOpenChange={(open) => {
          setShowEditPanel(open);
          if (!open) {
            loadCopyTrade();
          }
        }}
        address={copyTrade.sourceAddress}
        sourceName={copyTrade.sourceName}
      />
    </div>
  );
};

export default CopyTradeDetail;

