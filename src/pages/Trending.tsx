import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import {
  Filter,
  Zap,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Activity,
  Clock3,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { useTokenList } from "@/hooks/useRealData";
import { getSelectedChain, subscribeChain, type Chain } from "@/lib/chainStore";
import "@/lib/testApi"; // 导入测试工具，使其在控制台可用
import "@/lib/gmgnApiTest"; // 导入 GMGN API 测试工具

type TrendingRow = {
  name: string;
  icon: string;
  desc: string;
  mc: string;
  change: string;
  price: string;
};

const Trending = () => {
  const navigate = useNavigate();
  const topTabs = ["New pair", "Trending", "Surge", "xStocks", "Next"] as const;
  const timeTabs = ["1m", "5m", "1h", "6h", "24h"] as const;

  const [activeNav, setActiveNav] = useState("trending");
  const [activeTopTab, setActiveTopTab] = useState<(typeof topTabs)[number]>("Trending");
  const [activeTime, setActiveTime] = useState<(typeof timeTabs)[number]>("1h");
  const [useRealData, setUseRealData] = useState(false);
  const [selectedChain, setSelectedChain] = useState<Chain>(getSelectedChain());

  // 订阅网络变化
  useEffect(() => {
    const unsub = subscribeChain((chain) => {
      setSelectedChain(chain);
      // 切换网络时触发数据重新加载
      if (useRealData) {
        window.dispatchEvent(new CustomEvent("chain-switched", { detail: { chain } }));
      }
    });
    return unsub;
  }, [useRealData]);

  // 使用真实数据 Hook（根据 useRealData 状态动态切换）
  const { tokens: realTokens, loading: realLoading, error: realError } = useTokenList(20, useRealData);

  const baseRows: TrendingRow[] = useMemo(
    () => [
      { name: "RNUT", icon: "🐧", desc: "2h BkEv...pump", mc: "$2.3M", change: "+48%", price: "$2" },
      { name: "Frankl", icon: "🥦", desc: "8d CSrw...pump", mc: "$14.5M", change: "-6.8%", price: "$3" },
      { name: "ROCKY", icon: "🐵", desc: "2h Ep4k...pump", mc: "$418.1K", change: "+59%", price: "$9" },
      { name: "pippin", icon: "🐶", desc: "394d Dfh5...pump", mc: "$185.6M", change: "+1.8%", price: "$3" },
      { name: "Samant", icon: "🐤", desc: "18h 27Qg...pump", mc: "$269.9K", change: "-40.9%", price: "$3" },
      { name: "ROCKETO", icon: "🚀", desc: "3h 30 7g...pump", mc: "$118.1K", change: "+45.1%", price: "$1" },
      { name: "BIGQ", icon: "😎", desc: "2d 7T6Z...bonk", mc: "$889.4K", change: "-19%", price: "$5" },
      { name: "SHITCO", icon: "🦖", desc: "1d 8KYF...pump", mc: "$501.9K", change: "-15.3%", price: "$1" },
    ],
    []
  );

  const dataMap: Record<string, Record<string, TrendingRow[]>> = useMemo(
    () => ({
      Trending: {
        "1h": baseRows,
        "1m": baseRows.map((r) => ({ ...r, change: r.change.startsWith("+") ? "+5%" : "-2%" })),
        "5m": baseRows.map((r) => ({ ...r, mc: r.mc.replace("$", "$~") })),
        "6h": baseRows.map((r) => ({ ...r, desc: r.desc.replace("pump", "trend") })),
        "24h": baseRows.map((r) => ({ ...r, change: r.change.startsWith("+") ? "+120%" : "-25%" })),
      },
      "New pair": {
        default: baseRows.map((r, i) => ({
          ...r,
          name: `NEW-${i + 1}-${r.name}`,
          mc: "$" + (100 + i * 20) + "K",
          change: i % 2 ? "-8%" : "+15%",
        })),
      },
      Surge: {
        default: baseRows.map((r) => ({ ...r, change: "+80%", price: "$4" })),
      },
      xStocks: {
        default: baseRows.map((r) => ({ ...r, name: `${r.name}-X`, desc: r.desc.replace("pump", "xStock") })),
      },
      Next: {
        default: baseRows.map((r) => ({ ...r, name: `${r.name}-Next`, change: "+10%", price: "$1" })),
      },
    }),
    [baseRows]
  );

  const handleNavChange = (tab: string) => {
    setActiveNav(tab);
    if (tab === "trending") navigate("/trending");
    else if (tab === "copytrade") navigate("/copytrade");
    else navigate("/");
  };

  // 格式化市值
  const formatMarketCap = (mc: number | undefined | null): string => {
    if (!mc || isNaN(mc) || mc <= 0) {
      return "$0";
    }
    if (mc >= 1000000) {
      return `$${(mc / 1000000).toFixed(1)}M`;
    } else if (mc >= 1000) {
      return `$${(mc / 1000).toFixed(1)}K`;
    }
    return `$${mc.toFixed(2)}`;
  };

  // 根据是否使用真实数据选择数据源
  const getRows = (): TrendingRow[] => {
    try {
      // 如果使用真实数据且数据已加载
      if (useRealData && activeTopTab === "Trending") {
        // 如果正在加载，返回空数组（会显示加载状态）
        if (realLoading) {
          return [];
        }
        
        // 如果有错误，返回空数组（会显示错误状态）
        if (realError) {
          return [];
        }
        
        // 如果数据为空，返回空数组
        if (!realTokens || !Array.isArray(realTokens) || realTokens.length === 0) {
          return [];
        }
        
        // 安全地转换真实数据为 TrendingRow 格式
        return realTokens.map((token: any) => {
          try {
            const price = token.price || 0;
            const priceChange24h = token.priceChange24h || 0;
            const marketCap = token.marketCap || 0;
            const address = token.address || '';
            const symbol = token.symbol || token.name || "Unknown";
            const name = token.name || symbol;
            const age = token.age || '';
            
            // 如果没有图标，使用默认的 SOL 图标或根据代币名称生成
            let icon = token.icon || '';
            if (!icon) {
              // 尝试从代币名称或符号生成图标
              const iconMap: Record<string, string> = {
                'SOL': '🟣',
                'USDC': '💵',
                'USDT': '💵',
              };
              icon = iconMap[symbol.toUpperCase()] || '🪙';
            }
            
            return {
              name: symbol,
              icon: icon,
              desc: age && address ? `${age} ${address.slice(0, 4)}...${address.slice(-4)}` : (age || "New token"),
              mc: formatMarketCap(marketCap),
              change: priceChange24h >= 0 
                ? `+${Math.abs(priceChange24h).toFixed(2)}%` 
                : `-${Math.abs(priceChange24h).toFixed(2)}%`,
              price: `$${price.toFixed(4)}`,
              address: address,
            };
          } catch (err) {
            console.error('Error formatting token:', token, err);
            // 返回一个安全的默认值
            return {
              name: "Unknown",
              icon: "🪙",
              desc: "Error loading",
              mc: "$0",
              change: "0%",
              price: "$0",
            };
          }
        });
      }
      
      // 使用 Mock 数据
      return dataMap[activeTopTab]?.[activeTime] ??
        dataMap[activeTopTab]?.default ??
        dataMap["Trending"]["1h"] ??
        [];
    } catch (error) {
      console.error('Error in getRows:', error);
      // 如果出错，返回 Mock 数据作为降级
      return dataMap["Trending"]["1h"] || [];
    }
  };

  const rows = getRows();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <div className="px-3 pt-3 pb-20 space-y-4">
        {/* 顶部主导航 */}
        <div className="flex items-center gap-4 text-base font-semibold">
          {topTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTopTab(tab)}
              className={`transition-colors ${
                tab === activeTopTab ? "text-[#6ee7b7]" : "text-[#8b949e]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 时间粒度 */}
        <div className="grid grid-cols-5 gap-1 text-xs font-semibold">
          {timeTabs.map((item) => (
            <button
              key={item}
              onClick={() => setActiveTime(item)}
              className={`rounded-md px-2 py-1.5 text-center border ${
                item === activeTime
                  ? "bg-[#13201a] text-[#6ee7b7] border-[#21422f]"
                  : "bg-[#0f1216] text-[#a8b0bb] border-[#1c2128]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* 工具行 */}
        <div className="flex items-center gap-2 text-sm font-semibold flex-wrap">
          <button
            onClick={() => {
              console.log('Toggling real data, current state:', useRealData);
              setUseRealData(!useRealData);
            }}
            className={`flex items-center gap-1 border rounded-lg px-3 py-2 transition-colors cursor-pointer ${
              useRealData
                ? "bg-[#13201a] border-[#21422f] text-[#6ee7b7] hover:bg-[#1a2d22]"
                : "bg-[#0f1216] border-[#1c2128] text-[#a8b0bb] hover:bg-[#151a1f]"
            }`}
            title={useRealData ? "Switch to Mock Data" : "Switch to Real Data"}
          >
            <RefreshCw className={`w-4 h-4 ${useRealData && realLoading ? "animate-spin" : ""}`} />
            <span className="font-semibold">{useRealData ? "Real Data" : "Mock Data"}</span>
          </button>
          <button className="flex items-center gap-1 bg-[#0f1216] border border-[#1c2128] rounded-lg px-2 py-1.5 text-[#a8b0bb]">
            <Filter className="w-4 h-4 text-[#8b949e]" />
            <span>Filter</span>
          </button>
          <button className="flex items-center gap-1 bg-[#0f1216] border border-[#1c2128] rounded-lg px-2 py-1.5 text-[#a8b0bb]">
            <Zap className="w-4 h-4 text-[#8b949e]" />
            <span>Adv.</span>
          </button>
          <button className="flex items-center gap-1 bg-[#0f1216] border border-[#1c2128] rounded-lg px-2 py-1.5 text-[#a8b0bb]">
            <Sparkles className="w-4 h-4 text-[#8b949e]" />
            <span>0</span>
          </button>
          <button className="flex items-center gap-1 bg-[#0f1216] border border-[#1c2128] rounded-lg px-2 py-1.5 text-[#a8b0bb]">
            <span>P1</span>
          </button>
        </div>

        {/* 列头 */}
        <div className="flex items-center justify-between text-[11px] text-[#8b949e] px-1">
          <span>Token / Age</span>
          <div className="flex items-center gap-6">
            <span>MC</span>
            <span>ATI</span>
          </div>
        </div>

        {/* 列表 */}
        {useRealData && realLoading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-6 h-6 animate-spin text-[#6ee7b7]" />
            <span className="ml-2 text-[#8b949e]">Loading real data from DexScreener...</span>
          </div>
        ) : useRealData && realError ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="text-red-400 text-base font-semibold">⚠️ Failed to load real data</div>
            <div className="text-[#8b949e] text-sm text-center max-w-xs">
              {realError.message || "Unable to fetch data from DexScreener API"}
            </div>
            <div className="text-[#8b949e] text-xs text-center max-w-xs">
              This might be due to network issues or API rate limits. Please try again later.
            </div>
            <button
              onClick={() => setUseRealData(false)}
              className="mt-4 px-6 py-3 rounded-lg bg-[#13201a] border border-[#21422f] text-[#6ee7b7] text-sm font-semibold hover:bg-[#1a2d22]"
            >
              ← Switch back to Mock Data
            </button>
          </div>
        ) : useRealData && (!realTokens || realTokens.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="text-[#8b949e] text-base">No data available</div>
            <div className="text-[#8b949e] text-xs text-center max-w-xs">
              The API returned no results. Try switching back to mock data.
            </div>
            <button
              onClick={() => setUseRealData(false)}
              className="mt-4 px-6 py-3 rounded-lg bg-[#13201a] border border-[#21422f] text-[#6ee7b7] text-sm font-semibold hover:bg-[#1a2d22]"
            >
              ← Switch back to Mock Data
            </button>
          </div>
        ) : rows.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-[#8b949e]">
            No data available
          </div>
        ) : (
          <div className="space-y-2">
            {rows.map((row, index) => {
              try {
                const isUp = row.change && row.change.startsWith("+");
                const key = (row as any).address || `${row.name}-${index}`;
                return (
                <div
                  key={key}
                  className="rounded-xl border border-[#1c2128] bg-[#0f1114] px-3 py-3 flex items-center gap-3"
                >
                  <button className="text-[#6b7280]">
                    <Star className="w-4 h-4" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-[#1c2128] flex items-center justify-center text-lg">
                    {row.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 text-sm font-semibold text-[#d9dde4]">
                      <span className="truncate">{row.name}</span>
                      <span className="text-[11px] text-[#8b949e]">SOL</span>
                    </div>
                    <div className="text-xs text-[#8b949e] truncate">{row.desc}</div>
                  </div>
                  <div className="text-right mr-2">
                    <div className="text-sm font-semibold text-[#e5e7eb]">{row.mc}</div>
                    <div
                      className={`text-xs flex items-center gap-1 ${
                        isUp ? "text-[#69e07a]" : "text-[#f87171]"
                      }`}
                    >
                      {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {row.change}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold text-[#e5e7eb]">{row.price}</span>
                    <button className="w-8 h-8 rounded-lg bg-[#142116] text-[#6ee7b7] flex items-center justify-center border border-[#21422f]">
                      <Activity className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
              } catch (err) {
                console.error('Error rendering row:', row, err);
                return null;
              }
            })}
          </div>
        )}

        <div className="text-[11px] text-[#8b949e] flex items-center gap-2">
          <Clock3 className="w-3 h-3" />
          <span>
            {useRealData
              ? `Real data from DexScreener API (${rows.length} tokens)`
              : "Mock data for UI preview."}
          </span>
        </div>
      </div>

      <BottomNav activeTab={activeNav} onTabChange={handleNavChange} />
    </div>
  );
};

export default Trending;

