import { useMemo, useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  ShieldCheck,
  Sparkles,
  LockKeyhole,
  X,
  Wallet,
  ChevronDown,
  Info,
  Settings2,
  TrendingUp,
  Zap,
  Clock3,
} from "lucide-react";
import { api, type CopyTradeConfig } from "@/lib/api";
import { useNavigate } from "react-router-dom";

type SellMethod = "copy" | "nosell" | "tpsl" | "adv";
type BuyMode = "max" | "fixed" | "ratio";

export interface CopyTradePanelProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  address?: string;
  sourceName?: string;
}

const CopyTradePanel = ({ open, onOpenChange, address = "EcFp...Qk", sourceName }: CopyTradePanelProps) => {
  const navigate = useNavigate();
  const [sellMethod, setSellMethod] = useState<SellMethod>("copy");
  const [buyMode, setBuyMode] = useState<BuyMode>("ratio");
  const [buyAmount, setBuyAmount] = useState<string>("50");
  const [buyRatio, setBuyRatio] = useState<string>("10");
  const [tpPercent, setTpPercent] = useState<string>("");
  const [slPercent, setSlPercent] = useState<string>("");
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [sourceAddress, setSourceAddress] = useState<string>(address);
  const [sourcePercent, setSourcePercent] = useState<string>("44.02");
  const [sourceValue, setSourceValue] = useState<string>("1.1M");
  const [winRate, setWinRate] = useState<string>("92.45");
  const [timeAgo, setTimeAgo] = useState<string>("1m");
  const [slippage, setSlippage] = useState<string>("0.0014");
  const [gasLimit, setGasLimit] = useState<string>("0.001");
  const presets = useMemo(() => ["10", "25", "50", "100"], []);

  useEffect(() => {
    if (open && address) {
      setSourceAddress(address);
    }
  }, [open, address]);

  useEffect(() => {
    if (open) {
      api.getSolBalance().then(setBalance);
    }
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-screen sm:max-w-md h-full bg-[#0e0f11] text-foreground px-4 pb-6 pt-3 overflow-y-auto"
      >
        <SheetHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="px-2 py-1 rounded-md bg-muted text-foreground">W1</span>
              <span className="text-[#e5e7eb]">0</span>
            </div>
            <SheetTitle className="text-lg font-semibold">CopyTrade</SheetTitle>
            <div className="flex items-center gap-3 text-muted-foreground text-sm">
              <button className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                <span>W1</span>
              </button>
              <button className="flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                <span>0</span>
              </button>
              <button className="flex items-center gap-1">
                <LockKeyhole className="w-4 h-4" />
                <span>0</span>
              </button>
              <button className="w-4 h-4" onClick={() => onOpenChange(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <SheetDescription className="text-xs text-muted-foreground">
            Configure your copy settings before confirming.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-3 space-y-4">
          {/* Copy From card */}
          <div className="rounded-xl border border-border bg-background/50 p-3 space-y-2">
            <div className="text-[13px] text-muted-foreground">Copy From</div>
            <div className="rounded-lg bg-muted/40 px-3 py-2.5 text-sm text-[#e5e7eb] flex items-center justify-between">
              <input
                type="text"
                value={sourceAddress}
                onChange={(e) => setSourceAddress(e.target.value)}
                className="flex-1 bg-transparent outline-none text-[#e5e7eb]"
                placeholder="Enter wallet address"
              />
              <span className="text-[#8b949e] text-xs">⏷</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#8b949e]">
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={sourcePercent}
                  onChange={(e) => setSourcePercent(e.target.value)}
                  className="w-12 bg-[#11161b] border border-[#1c2128] rounded px-1 py-0.5 text-right text-[#6ee7b7] text-[11px] outline-none"
                />
                <span className="text-[#6ee7b7]">% ($</span>
                <input
                  type="text"
                  value={sourceValue}
                  onChange={(e) => setSourceValue(e.target.value)}
                  className="w-12 bg-[#11161b] border border-[#1c2128] rounded px-1 py-0.5 text-right text-[#6ee7b7] text-[11px] outline-none"
                />
                <span className="text-[#6ee7b7]">)</span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={winRate}
                  onChange={(e) => setWinRate(e.target.value)}
                  className="w-12 bg-[#11161b] border border-[#1c2128] rounded px-1 py-0.5 text-right text-[#8b949e] text-[11px] outline-none"
                />
                <span>% 7D WinRate</span>
              </div>
              <input
                type="text"
                value={timeAgo}
                onChange={(e) => setTimeAgo(e.target.value)}
                className="w-12 bg-[#11161b] border border-[#1c2128] rounded px-1 py-0.5 text-right text-[#8b949e] text-[11px] outline-none"
              />
            </div>
          </div>

          {/* Buy mode tabs */}
          <div className="grid grid-cols-3 rounded-xl border border-border bg-background/50 overflow-hidden text-sm font-semibold">
            <button
              onClick={() => setBuyMode("max")}
              className={`py-2.5 ${buyMode === "max" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
            >
              Max Buy Amount
            </button>
            <button
              onClick={() => setBuyMode("fixed")}
              className={`py-2.5 border-x border-border ${buyMode === "fixed" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
            >
              Fixed Buy
            </button>
            <button
              onClick={() => setBuyMode("ratio")}
              className={`py-2.5 ${buyMode === "ratio" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
            >
              Fixed Ratio
            </button>
          </div>

          {/* Buy mode fields */}
          {buyMode === "max" && (
            <div className="rounded-xl border border-border bg-background/50 px-4 py-3 text-sm text-muted-foreground">
              Max Buy Amount: Use maximum available balance
            </div>
          )}
          {buyMode === "fixed" && (
            <div className="rounded-xl border border-border bg-background/50">
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-muted-foreground">Fixed Buy Amount</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                    className="w-20 bg-[#11161b] border border-[#1c2128] rounded px-2 py-1 text-right text-[#e5e7eb]"
                    placeholder="0"
                  />
                  <span className="text-muted-foreground">SOL</span>
                </div>
              </div>
            </div>
          )}
          {buyMode === "ratio" && (
            <div className="rounded-xl border border-border bg-background/50">
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-muted-foreground">Fixed Ratio</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={buyRatio}
                    onChange={(e) => setBuyRatio(e.target.value)}
                    className="w-20 bg-[#11161b] border border-[#1c2128] rounded px-2 py-1 text-right text-[#e5e7eb]"
                    placeholder="10"
                  />
                  <span className="text-[#6ee7b7]">%</span>
                </div>
              </div>
            </div>
          )}

          {/* Amount */}
          <div className="rounded-xl border border-border bg-background/50">
            <div className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="text-muted-foreground">Amount</span>
              <span className="flex items-center gap-1 text-muted-foreground">
                SOL <ChevronDown className="w-3 h-3" />
              </span>
            </div>
            <div className="grid grid-cols-5 divide-x divide-border border-t border-border text-sm text-center">
              {[10, 25, 50, 100, "✎"].map((v) => (
                <button
                  key={v}
                  onClick={() => {
                    if (v !== "✎") {
                      setBuyAmount(v.toString());
                    } else {
                      const input = prompt("Enter amount (SOL):");
                      if (input) setBuyAmount(input);
                    }
                  }}
                  className={`py-3 hover:bg-muted/30 text-[#e5e7eb] ${
                    buyAmount === v.toString() ? "bg-primary/10" : ""
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground border-t border-border">
              <span>≈${(parseFloat(buyAmount || "0") * 150).toLocaleString()}</span>
              <span>Bal ≈ {balance.toFixed(2)} SOL</span>
            </div>
          </div>

          {/* Sell Method */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#e5e7eb]">
              <span>Sell Method</span>
              <Info className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="grid grid-cols-4 gap-2 text-sm">
              <button
                onClick={() => setSellMethod("copy")}
                className={`rounded-lg border py-2 ${
                  sellMethod === "copy"
                    ? "border-primary/60 bg-primary/10 text-primary"
                    : "border-border bg-muted text-foreground"
                }`}
              >
                Copy Sell
              </button>
              <button
                onClick={() => setSellMethod("nosell")}
                className={`rounded-lg border py-2 ${
                  sellMethod === "nosell"
                    ? "border-primary/60 bg-primary/10 text-primary"
                    : "border-border bg-muted text-foreground"
                }`}
              >
                Not Sell
              </button>
              <button
                onClick={() => setSellMethod("tpsl")}
                className={`rounded-lg border py-2 ${
                  sellMethod === "tpsl"
                    ? "border-primary/60 bg-primary/10 text-primary"
                    : "border-border bg-muted text-foreground"
                }`}
              >
                TP & SL
              </button>
              <button
                onClick={() => setSellMethod("adv")}
                className={`rounded-lg border py-2 ${
                  sellMethod === "adv"
                    ? "border-primary/60 bg-primary/10 text-primary"
                    : "border-border bg-muted text-foreground"
                }`}
              >
                Adv Strategy
              </button>
            </div>
          </div>

          {/* TP & SL fields */}
          {sellMethod === "tpsl" && (
            <div className="grid grid-cols-2 gap-2 text-xs text-[#8b949e]">
              <div className="rounded-lg border border-[#1c2128] bg-[#11161b] px-3 py-2 flex items-center justify-between">
                <span>Please enter the Take Profit</span>
                <input
                  type="text"
                  value={tpPercent}
                  onChange={(e) => setTpPercent(e.target.value)}
                  className="w-16 bg-transparent border-b border-[#1c2128] text-right text-[#6ee7b7] outline-none"
                  placeholder="0"
                />
                <span className="text-[#6ee7b7]">%</span>
              </div>
              <div className="rounded-lg border border-[#1c2128] bg-[#11161b] px-3 py-2 flex items-center justify-between">
                <span>Please enter the Stop Loss</span>
                <input
                  type="text"
                  value={slPercent}
                  onChange={(e) => setSlPercent(e.target.value)}
                  className="w-16 bg-transparent border-b border-[#1c2128] text-right text-[#6ee7b7] outline-none"
                  placeholder="0"
                />
                <span className="text-[#6ee7b7]">%</span>
              </div>
              <div className="text-[#8b949e]">Estimated Profit --</div>
              <div className="text-[#8b949e]">Estimated Loss --</div>
              <div className="flex items-center gap-2 text-[#8b949e]">
                Trailing Stop Loss
                <span className="ml-auto inline-flex items-center justify-center w-10 h-5 rounded-full bg-[#1c2128] text-[#6ee7b7] text-[10px]">
                  OFF
                </span>
              </div>
            </div>
          )}

          {/* Adv Strategy section */}
          {sellMethod === "adv" && (
            <div className="space-y-3 text-sm text-[#e5e7eb]">
              <div className="flex items-center justify-between">
                <span className="text-[#8b949e]">Copy Sells</span>
                <span className="inline-flex items-center justify-center w-10 h-5 rounded-full bg-[#13201a] border border-[#21422f] text-[#6ee7b7] text-[11px]">
                  ON
                </span>
              </div>
              <div className="text-[12px] text-[#8b949e]">
                Sell according to the selling ratio of the copy wallet
              </div>

              <div className="space-y-2">
                <div className="text-[#8b949e] text-xs">Quick Trade Setting</div>
                {[{ tp: "100", sell: "50" }, { tp: "300", sell: "100" }, { tp: "-50", sell: "100" }].map(
                  (row, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-2 gap-2 items-center text-[12px] text-[#e5e7eb]"
                    >
                      <div className="flex items-center gap-1 rounded-lg border border-[#1c2128] bg-[#11161b] px-2 py-2">
                        <span className="text-[#8b949e] w-6">TP</span>
                        <input
                          readOnly
                          value={row.tp}
                          className="flex-1 bg-transparent outline-none text-right"
                        />
                        <span className="text-[#6ee7b7]">%</span>
                      </div>
                      <div className="flex items-center gap-1 rounded-lg border border-[#1c2128] bg-[#11161b] px-2 py-2">
                        <span className="text-[#8b949e] w-8">Sell</span>
                        <input
                          readOnly
                          value={row.sell}
                          className="flex-1 bg-transparent outline-none text-right"
                        />
                        <span className="text-[#6ee7b7]">%</span>
                      </div>
                    </div>
                  )
                )}
                <button className="w-full rounded-lg border border-dashed border-[#1c2128] text-[#8b949e] py-2 text-sm">
                  + Add
                </button>
              </div>
            </div>
          )}

          {/* Advanced settings */}
          <div className="space-y-3 rounded-xl border border-border bg-background/50 p-3">
            <div className="flex items-center justify-between text-sm font-semibold">
              <div className="flex items-center gap-2">
                <span>Advanced Settings</span>
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-primary/10 text-primary text-xs">
                  1
                </span>
                <button className="text-muted-foreground text-xs">Clear</button>
              </div>
              <Settings2 className="w-4 h-4 text-muted-foreground" />
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Zap className="w-4 h-4" />
                <span>Auto</span>
                <Clock3 className="w-4 h-4" />
                <input
                  type="text"
                  value={slippage}
                  onChange={(e) => setSlippage(e.target.value)}
                  className="w-16 bg-[#11161b] border border-[#1c2128] rounded px-2 py-1 text-right text-[#e5e7eb] text-sm outline-none"
                />
                <TrendingUp className="w-4 h-4" />
                <input
                  type="text"
                  value={gasLimit}
                  onChange={(e) => setGasLimit(e.target.value)}
                  className="w-16 bg-[#11161b] border border-[#1c2128] rounded px-2 py-1 text-right text-[#e5e7eb] text-sm outline-none"
                />
                <span className="text-red-400">Red.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <button
            className="w-full rounded-lg bg-[#27c37c] text-[#0b1411] py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !sourceAddress.trim()}
            onClick={async () => {
              setLoading(true);
              try {
                // 检查登录状态
                const email = localStorage.getItem("auth_email");
                if (!email) {
                  alert("请先登录");
                  setLoading(false);
                  return;
                }

                console.log("Creating copy trade with config:", {
                  sourceAddress: sourceAddress.trim(),
                  buyMode,
                  buyAmount,
                  buyRatio,
                  sellMethod,
                });

                const config: Omit<CopyTradeConfig, "id" | "createdAt"> = {
                  sourceAddress: sourceAddress.trim(),
                  sourceName: sourceName || sourceAddress.trim(),
                  buyMode,
                  buyAmount: buyMode === "fixed" ? parseFloat(buyAmount || "0") : undefined,
                  buyRatio: buyMode === "ratio" ? parseFloat(buyRatio || "0") : undefined,
                  sellMethod,
                  tpPercent: sellMethod === "tpsl" ? parseFloat(tpPercent || "0") : undefined,
                  slPercent: sellMethod === "tpsl" ? parseFloat(slPercent || "0") : undefined,
                  slippage: parseFloat(slippage || "0"),
                  gasLimit: parseFloat(gasLimit || "0"),
                  enabled: true,
                  bought: 0,
                  sold: 0,
                  status: "running",
                };

                const result = await api.createCopyTrade(config);
                console.log("Copy trade created successfully:", result);
                
                // 如果配置了买入金额，模拟执行一次买入交易（可选）
                // 这里可以根据实际需求决定是否立即执行交易
                // 暂时注释掉，等待实际交易触发时再执行
                // if (result.buyAmount && result.buyAmount > 0) {
                //   try {
                //     await api.executeCopyTrade(result.id, "buy", "TOKEN", result.buyAmount, 0.01);
                //   } catch (error) {
                //     console.error("Failed to execute initial trade:", error);
                //   }
                // }
                
                onOpenChange(false);
                // 触发刷新事件
                window.dispatchEvent(new CustomEvent("copytrade-created"));
                navigate("/copytrade");
              } catch (error) {
                console.error("Failed to create copy trade - Full error:", error);
                console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
                const errorMessage = error instanceof Error ? error.message : "Failed to create copy trade configuration";
                alert(`错误: ${errorMessage}\n\n请检查浏览器控制台获取更多信息。`);
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? "Creating..." : "Confirm"}
          </button>
          <p className="text-[11px] text-muted-foreground text-center">
            Note: Ensure your account has enough balance for auto trading to run smoothly.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CopyTradePanel;

