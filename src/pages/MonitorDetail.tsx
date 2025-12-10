import Header from "@/components/Header";
import { useState, useMemo, useCallback } from "react";
import { Zap, Shield, Flame, Activity } from "lucide-react";
import type React from "react";

const timeframes = ["1s", "15s", "30s", "1m", "5m", "15m", "1h"] as const;

const MonitorDetail = () => {
  const [activeTf, setActiveTf] = useState<(typeof timeframes)[number]>("1s");
  const [zoom, setZoom] = useState(1);

  const priceBase = 0.0024;
  const seriesLength: Record<(typeof timeframes)[number], number> = {
    "1s": 120,
    "15s": 140,
    "30s": 160,
    "1m": 180,
    "5m": 200,
    "15m": 220,
    "1h": 260,
  };

  const prices = useMemo(() => {
    const len = seriesLength[activeTf] || 180;
    const pts: number[] = [];
    let v = priceBase;
    for (let i = 0; i < len; i++) {
      const drift = Math.sin(i / 10) * 0.00005;
      const noise = (Math.random() - 0.5) * 0.00008;
      v = Math.max(0.00005, v + drift + noise);
      pts.push(v);
    }
    return pts;
  }, [activeTf]);

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const lastPrice = prices[prices.length - 1];

  const windowed = useMemo(() => {
    const span = Math.max(40, Math.floor(prices.length / zoom));
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

  const trades = [
    { age: "18s", type: "Buy", mc: "$24.1K", amt: "20.6M" },
    { age: "56s", type: "Sell", mc: "$22.9K", amt: "1.9M" },
    { age: "16m", type: "Buy", mc: "$23.0K", amt: "1.2M" },
    { age: "17m", type: "Sell", mc: "$22.8K", amt: "41.05K" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <Header />

      <div className="px-3 pt-2 space-y-3">
        {/* Top token info */}
        <div className="flex items-start gap-2 text-sm">
          <div className="w-12 h-12 rounded-xl bg-[#161c22] flex items-center justify-center text-xl">
            🎨
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-[#e5e7eb]">
              <span className="font-semibold">hello</span>
              <span className="text-xs text-[#8b949e]">1d DS 54d 0x1...444</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#8b949e] flex-wrap">
              <span className="text-[#6ee7b7]">$0.0241</span>
              <span className="text-[#8b949e]">MC $2411K</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#8b949e] flex-wrap">
              <Zap className="w-3 h-3 text-[#6ee7b7]" />
              <Shield className="w-3 h-3 text-[#6ee7b7]" />
              <Flame className="w-3 h-3 text-[#6ee7b7]" />
              <Activity className="w-3 h-3 text-[#6ee7b7]" />
            </div>
          </div>
        </div>

        {/* small tags row */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-1 rounded-md bg-[#13201a] text-[#6ee7b7] border border-[#21422f]">1m +0%</span>
          <span className="px-2 py-1 rounded-md bg-[#13201a] text-[#6ee7b7] border border-[#21422f]">5m +5.66%</span>
          <span className="px-2 py-1 rounded-md bg-[#2a0f12] text-[#f87171] border border-[#3d181d]">6h -12.55%</span>
          <span className="px-2 py-1 rounded-md bg-[#13201a] text-[#6ee7b7] border border-[#21422f]">24h -37.5%</span>
        </div>

        {/* timeframe tabs */}
        <div className="flex items-center gap-2 text-sm text-[#8b949e]">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setActiveTf(tf)}
              className={`px-2 py-1 rounded-md ${
                tf === activeTf ? "bg-[#13201a] text-[#6ee7b7]" : "bg-[#0f1216] text-[#8b949e]"
              }`}
            >
              {tf}
            </button>
          ))}
          <span className="ml-2 text-[#8b949e]">Price/MCAP</span>
        </div>

        {/* chart */}
        <div className="rounded-2xl border border-[#1c2128] bg-[#0d0f13] p-2">
          <div className="relative" onWheel={handleWheel}>
            <svg viewBox="0 0 320 200" className="w-full h-52 select-none">
              <defs>
                <linearGradient id="areaFill2" x1="0" x2="0" y1="0" y2="1">
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
                      const scale = (p: number) => h - ((p - minPrice) / (maxPrice - minPrice || 1)) * h;
                      const ys = windowed.map((p) => scale(p));
                      const pts = xs.map((x, i) => `${x},${ys[i]}`).join(" ");
                      return `M0,${h} L ${pts} L${w},${h} Z`;
                    })()}
                    fill="url(#areaFill2)"
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
                  {/* volume bars */}
                  {windowed.map((p, i) => {
                    const x = (i / (windowed.length - 1)) * 320;
                    const vol = (i % 5 === 0 ? 40 : 15) + (Math.random() * 20);
                    return (
                      <rect
                        key={i}
                        x={x}
                        y={200 - vol}
                        width="2"
                        height={vol}
                        fill={i % 3 === 0 ? "#6ee7b7" : "#f87171"}
                        opacity="0.5"
                      />
                    );
                  })}
                </>
              )}
            </svg>
            <div className="absolute right-2 top-2 text-sm text-[#6ee7b7] font-semibold">
              {lastPrice.toFixed(6)}
            </div>
          </div>
        </div>

        {/* Trades table */}
        <div className="rounded-2xl border border-[#1c2128] bg-[#0d0f13]">
          <div className="flex items-center gap-4 px-4 py-3 text-sm text-[#e5e7eb] border-b border-[#1c2128]">
            <span className="text-[#6ee7b7]">Trades</span>
            <span className="text-[#8b949e]">Positions</span>
            <span className="text-[#8b949e]">Orders</span>
          </div>
          <div className="px-4 py-2 text-[11px] text-[#8b949e] grid grid-cols-4">
            <span>Age</span>
            <span>Type</span>
            <span>MC</span>
            <span>Amount</span>
          </div>
          {trades.map((t, i) => (
            <div key={i} className="px-4 py-2 grid grid-cols-4 text-[11px] border-t border-[#1c2128]">
              <span className="text-[#8b949e]">{t.age}</span>
              <span className={t.type === "Buy" ? "text-[#6ee7b7]" : "text-[#f87171]"}>{t.type}</span>
              <span className="text-[#e5e7eb]">{t.mc}</span>
              <span className="text-[#e5e7eb]">{t.amt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fixed bar */}
      <div className="fixed left-0 right-0 bottom-0 border-t border-[#1c2128] bg-[#0d0f13] grid grid-cols-4 text-center text-sm text-[#8b949e]">
        <button className="py-3 text-[#e5e7eb]">Buy</button>
        <button className="py-3 text-[#e5e7eb]">Sell</button>
        <button className="py-3 text-[#e5e7eb]">Audit</button>
        <button className="py-3 text-[#e5e7eb]">Info</button>
      </div>
    </div>
  );
};

export default MonitorDetail;

