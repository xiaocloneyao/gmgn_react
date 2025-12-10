import { useLocation, useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Token, getTokensByTab } from "@/components/TrenchesList";
import { Shield, Zap, Flame, Activity, Star } from "lucide-react";
import { useMemo, useState, useCallback } from "react";
import type React from "react";

const findToken = (name?: string, fallback?: Token): Token | null => {
  if (fallback) return fallback;
  if (!name) return null;
  const tabs = ["New", "Almost bonded", "Migrated"];
  for (const tab of tabs) {
    const found = getTokensByTab(tab).find((t) => t.name === name);
    if (found) return found;
  }
  return null;
};

const TrenchDetail = () => {
  const navigate = useNavigate();
  const { name } = useParams();
  const location = useLocation();
  const tokenState = location.state as Token | undefined;
  const token = useMemo(() => findToken(name, tokenState), [name, tokenState]);
  const timeframes = ["1s", "15s", "30s", "1m", "5m", "15m", "1h"] as const;
  const [activeTf, setActiveTf] = useState<(typeof timeframes)[number]>("15m");
  const [activePanel, setActivePanel] = useState<"buy" | "sell" | "info">("buy");
  const [zoom, setZoom] = useState(1);

  const priceBase = 0.0045;
  const seriesLength: Record<(typeof timeframes)[number], number> = {
    "1s": 40,
    "15s": 60,
    "30s": 80,
    "1m": 100,
    "5m": 140,
    "15m": 180,
    "1h": 220,
  };

  const prices = useMemo(() => {
    const len = seriesLength[activeTf] || 120;
    const pts: number[] = [];
    let v = priceBase;
    for (let i = 0; i < len; i++) {
      const drift = Math.sin(i / 8) * 0.00005;
      const noise = (Math.random() - 0.5) * 0.00008;
      v = Math.max(0.0001, v + drift + noise);
      pts.push(v);
    }
    return pts;
  }, [activeTf]);

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const lastPrice = prices[prices.length - 1];

  const windowed = useMemo(() => {
    const span = Math.max(20, Math.floor(prices.length / zoom));
    return prices.slice(-span);
  }, [prices, zoom]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY;
    setZoom((z) => {
      const next = delta > 0 ? Math.max(1, z - 0.3) : Math.min(6, z + 0.3);
      return parseFloat(next.toFixed(2));
    });
  }, []);

  if (!token) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="space-y-3 text-center">
          <p className="text-lg">Token not found</p>
          <button
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground"
            onClick={() => navigate("/")}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <Header />

      <div className="px-3 pt-3 pb-28 space-y-4">
        {/* Top summary */}
        <div className="rounded-2xl border border-[#1c2128] bg-[#0d0f13] p-3 space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative w-14 h-14 rounded-xl bg-[#161c22] flex items-center justify-center text-2xl">
              {token.icon}
              <span className="absolute -top-1 -left-1 inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#11161b] border border-[#1c2128] text-[11px] text-[#a8b0bb]">
                8⭘
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-base font-semibold text-[#e5e7eb]">
                <span className="truncate">{token.name}</span>
                {token.symbol && <span className="text-sm text-[#8b949e]">{token.symbol}</span>}
                <Star className="w-3 h-3 text-[#8b949e]" />
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#8b949e] flex-wrap">
                <span>2h</span>
                <span>DS 2h</span>
                <span>5xb...ump</span>
                <span>Taxes</span>
                <span className="text-[#6ee7b7]">1.25%</span>
                <span className="flex items-center gap-1 text-[#6ee7b7]">
                  <Zap className="w-3 h-3" />
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[#6ee7b7] text-xl font-bold">$0.00123</div>
              <div className="text-xs text-[#8b949e]">MC {token.mc}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#8b949e] flex-wrap">
            <span className="text-[#6ee7b7]">1m +7.7%</span>
            <span className="text-[#f87171]">5m -23.16%</span>
            <span className="text-[#6ee7b7]">1h +127.4%</span>
            <span className="text-[#6ee7b7]">24h +1060.4%</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#8b949e] flex-wrap">
            <span>🔍 Name</span>
            <span>⚡ CA</span>
            <span>🛡 DEV</span>
            <span className="text-[#6ee7b7]">B. Curve 93.1%</span>
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-[#6ee7b7]" />
              <Zap className="w-3 h-3 text-[#6ee7b7]" />
              <Flame className="w-3 h-3 text-[#6ee7b7]" />
              <Activity className="w-3 h-3 text-[#6ee7b7]" />
            </span>
          </div>
        </div>

        {/* Chart */}
        <div className="rounded-2xl border border-[#1c2128] bg-[#0d0f13] p-3 space-y-2">
          <div className="flex items-center gap-2 text-[11px] text-[#8b949e] flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-[#6ee7b7] font-semibold text-lg">$0.0451</span>
              <span className="text-[#8b949e] text-xs">Price/MCAP</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#8b949e] mb-1">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => setActiveTf(tf)}
                className={`px-2 py-1 rounded-md border transition-colors ${
                  tf === activeTf
                    ? "bg-[#13201a] text-[#6ee7b7] border-[#21422f]"
                    : "bg-[#0f1216] text-[#8b949e] border-[#1c2128]"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="rounded-lg bg-[#0a0c10] border border-[#1c2128] p-2">
            <div className="flex gap-2">
              <div className="flex-1 relative" onWheel={handleWheel}>
                <svg viewBox="0 0 320 200" className="w-full h-48 select-none">
                  <defs>
                    <linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#6ee7b7" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {windowed.length > 1 && (
                    <>
                      <path
                        d={(() => {
                          const w = 320;
                          const h = 200;
                          const xs = windowed.map((_, i) => (i / (windowed.length - 1)) * w);
                          const scale = (p: number) =>
                            h - ((p - minPrice) / (maxPrice - minPrice || 1)) * h;
                          const ys = windowed.map((p) => scale(p));
                          const pts = xs.map((x, i) => `${x},${ys[i]}`).join(" ");
                          return `M0,${h} L ${pts} L${w},${h} Z`;
                        })()}
                        fill="url(#areaFill)"
                      />
                      <polyline
                        fill="none"
                        stroke="#6ee7b7"
                        strokeWidth="2"
                        points={windowed
                          .map((p, i) => {
                            const x = (i / (windowed.length - 1)) * 320;
                            const y = 200 - ((p - minPrice) / (maxPrice - minPrice || 1)) * 200;
                            return `${x},${y}`;
                          })
                          .join(" ")}
                      />
                    </>
                  )}
                </svg>
                <div className="absolute right-2 top-2 text-sm text-[#6ee7b7] font-semibold">
                  {lastPrice.toFixed(6)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main lower content: buy/sell/info */}
        {activePanel === "buy" && (
          <div className="rounded-2xl border border-[#1c2128] bg-[#0d0f13] p-3 space-y-3">
            <div className="text-sm text-[#e5e7eb] font-semibold">Buy</div>
            <div className="flex items-center gap-2 text-xs text-[#8b949e]">
              <span className="px-2 py-1 rounded-md bg-[#13201a] text-[#6ee7b7] border border-[#21422f]">Market</span>
              <span className="px-2 py-1 rounded-md bg-[#0f1216] text-[#8b949e] border border-[#1c2128]">Limit</span>
            </div>
            <div className="rounded-lg border border-[#1c2128] bg-[#11161b] text-[#e5e7eb]">
              <div className="flex items-center justify-between px-3 py-2 text-sm">
                <span>Amount</span>
                <span className="text-[#8b949e]">SOL</span>
              </div>
              <div className="grid grid-cols-4 text-center text-sm border-t border-[#1c2128]">
                {["0.01", "0.1", "0.5", "1"].map((v) => (
                  <button key={v} className="py-2 text-[#e5e7eb] hover:bg-[#1a2027]">
                    {v}
                  </button>
                ))}
              </div>
              <div className="px-3 py-2 text-[11px] text-[#8b949e] border-t border-[#1c2128]">
                1 SOL ≈ 3.4M LAIKA
              </div>
            </div>
            <div className="text-xs text-[#8b949e]">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" className="accent-[#6ee7b7]" />
                <span>Advanced Trading Strategy</span>
              </label>
            </div>
            <button className="w-full rounded-lg bg-[#1c2d20] text-[#6ee7b7] py-3 font-semibold">
              At least select 1 wallet
            </button>
            <div className="flex items-center gap-2 text-[11px] text-[#8b949e]">
              <span>⚙ Auto</span>
              <span>0.0003</span>
              <span>0.0041</span>
              <span>Red.</span>
            </div>
          </div>
        )}

        {activePanel === "sell" && (
          <div className="rounded-2xl border border-[#1c2128] bg-[#0d0f13] p-3 space-y-3">
            <div className="text-sm text-[#e5e7eb] font-semibold">Sell</div>
            <div className="flex items-center gap-2 text-xs text-[#8b949e]">
              <span className="px-2 py-1 rounded-md bg-[#13201a] text-[#6ee7b7] border border-[#21422f]">Market</span>
              <span className="px-2 py-1 rounded-md bg-[#0f1216] text-[#8b949e] border border-[#1c2128]">Limit</span>
            </div>
            <div className="rounded-lg border border-[#1c2128] bg-[#11161b] text-[#e5e7eb]">
              <div className="flex items-center justify-between px-3 py-2 text-sm">
                <span>Amount</span>
                <span className="text-[#8b949e]">LAIKA</span>
              </div>
              <div className="grid grid-cols-4 text-center text-sm border-t border-[#1c2128]">
                {["10%", "25%", "50%", "100%"].map((v) => (
                  <button key={v} className="py-2 text-[#e5e7eb] hover:bg-[#1a2027]">
                    {v}
                  </button>
                ))}
              </div>
              <div className="px-3 py-2 text-[11px] text-[#8b949e] border-t border-[#1c2128]">
                3.5M LAIKA ≈ 1 SOL
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#8b949e]">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" className="accent-[#6ee7b7]" />
                <span>Advanced Trading Strategy</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" className="accent-[#6ee7b7]" />
                <span>Migrated Sell</span>
              </label>
            </div>
            <button className="w-full rounded-lg bg-[#2a0f12] text-[#f87171] py-3 font-semibold">
              At least select 1 wallet
            </button>
            <div className="flex items-center gap-2 text-[11px] text-[#8b949e]">
              <span>⚙ Auto</span>
              <span>0.0002</span>
              <span>0.0041</span>
              <span>Red.</span>
            </div>
          </div>
        )}

        {activePanel === "info" && (
          <div className="rounded-2xl border border-[#1c2128] bg-[#0d0f13] p-3 space-y-3">
            <div className="text-sm text-[#e5e7eb] font-semibold">Dynamic BC Pool info</div>
            <div className="space-y-2 text-[12px] text-[#e5e7eb]">
              <div className="flex justify-between">
                <span>Total liq</span>
                <span>$0.004 (0.14318 SOL)</span>
              </div>
              <div className="flex justify-between">
                <span>Pair</span>
                <span className="text-[#8b949e]">SPINIT / SOL</span>
              </div>
              <div className="flex justify-between">
                <span>Liq/Initial</span>
                <span>484.1K / 1B (100%)</span>
              </div>
              <div className="flex justify-between">
                <span>Value</span>
                <span>$308.15 / $0.002</span>
              </div>
              <div className="flex justify-between">
                <span>DEV</span>
                <span className="text-[#6ee7b7]">8mdP...vbq4</span>
              </div>
              <div className="flex justify-between">
                <span>Funding</span>
                <span className="text-[#6ee7b7]">BTnh...uP4Y · 16h</span>
              </div>
              <div className="flex justify-between">
                <span>Market cap</span>
                <span>$636.5K</span>
              </div>
              <div className="flex justify-between">
                <span>Holders</span>
                <span>7</span>
              </div>
              <div className="flex justify-between">
                <span>Total supply</span>
                <span>1B</span>
              </div>
              <div className="flex justify-between">
                <span>Pair</span>
                <span>4eGX...vmvk</span>
              </div>
              <div className="flex justify-between">
                <span>Token created</span>
                <span>12/09/2025 21:54:55</span>
              </div>
              <div className="flex justify-between">
                <span>Pool created</span>
                <span>12/09/2025 21:54:55</span>
              </div>
            </div>

            <div className="text-sm text-[#e5e7eb] font-semibold pt-2">Token Audit</div>
            <div className="space-y-1 text-[12px] text-[#e5e7eb]">
              <div className="flex items-center gap-2">
                <span>NoMint</span>
                <span className="text-[#6ee7b7]">✔</span>
              </div>
              <div className="flex items-center gap-2">
                <span>No Blacklist</span>
                <span className="text-[#6ee7b7]">✔</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Burnt</span>
                <span className="text-[#6ee7b7]">✔</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom action bar for Buy/Sell/Info */}
      <div className="fixed left-0 right-0 bottom-2 px-3">
        <div className="rounded-2xl border border-[#1c2128] bg-[#0d0f13] grid grid-cols-3 divide-x divide-[#1c2128]">
          {(["buy", "sell", "info"] as const).map((key) => (
            <button
              key={key}
              onClick={() => setActivePanel(key)}
              className={`py-3 text-sm font-semibold transition-colors ${
                activePanel === key ? "text-[#6ee7b7]" : "text-[#e5e7eb]"
              }`}
            >
              {key === "buy" ? "Buy" : key === "sell" ? "Sell" : "Info"}
            </button>
          ))}
        </div>
      </div>

      {/* 无底部全局导航，保持与参考图一致 */}
    </div>
  );
};

export default TrenchDetail;

