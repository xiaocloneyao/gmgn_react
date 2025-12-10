import { Shield, Zap, Flame, Activity, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTokenList } from "@/hooks/useRealData";

type Badge = { label: string; value: string; tone?: "green" | "red" | "blue" | "yellow" | "muted" };

export type Token = {
  name: string;
  symbol?: string;
  icon: string;
  mc: string;
  vol: string;
  price?: string;
  fee?: string;
  addr?: string;
  age?: string;
  tx?: string;
  profit?: string;
  badges: Badge[];
};

const toneClass: Record<NonNullable<Badge["tone"]>, string> = {
  green: "text-[#6ee7b7] bg-[#13201a] border-[#21422f]",
  red: "text-[#f87171] bg-[#2a0f12] border-[#3d181d]",
  blue: "text-[#60a5fa] bg-[#0f1c2e] border-[#1c2c45]",
  yellow: "text-[#facc15] bg-[#2a230f] border-[#3a3217]",
  muted: "text-[#a0a8b4] bg-[#0f1216] border-[#1c2128]",
};

const renderBadge = (badge: Badge, idx: number) => {
  const cls = toneClass[badge.tone || "muted"];
  return (
    <span
      key={`${badge.label}-${idx}`}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] border ${cls}`}
    >
      {badge.label && <span>{badge.label}</span>}
      <span className="font-semibold">{badge.value}</span>
    </span>
  );
};

const newTokens: Token[] = [
  {
    name: "MOOONER",
    symbol: "MOOONER",
    icon: "🪐",
    mc: "$3.9K",
    vol: "$13.2K",
    price: "$1.34",
    fee: "0.00051",
    age: "3s",
    profit: "+$13.2K",
    tx: "TX2",
    badges: [
      { label: "👤", value: "3%", tone: "green" },
      { label: "⏱", value: "3% 28d", tone: "muted" },
      { label: "🧊", value: "0%", tone: "muted" },
      { label: "🛡", value: "0%", tone: "muted" },
      { label: "⚡", value: "0%", tone: "muted" },
      { label: "🔄", value: "0%", tone: "muted" },
    ],
  },
  {
    name: "RCS",
    symbol: "RICH SQUIRREL",
    icon: "🐿️",
    mc: "$3.7K",
    vol: "$1.34",
    price: "$1.34",
    fee: "0.00051",
    age: "5s",
    profit: "N+$1.34",
    tx: "TX2",
    badges: [
      { label: "👤", value: "0%", tone: "muted" },
      { label: "⏱", value: "0% 296d", tone: "muted" },
      { label: "🧊", value: "0%", tone: "muted" },
      { label: "🛡", value: "0%", tone: "muted" },
      { label: "⚡", value: "0%", tone: "muted" },
      { label: "🔄", value: "0%", tone: "muted" },
    ],
  },
  {
    name: "MEWTWO",
    symbol: "Mewtwo",
    icon: "🐱",
    mc: "$3.4K",
    vol: "$19.9K",
    price: "$19.91",
    fee: "0.0011",
    age: "10s",
    profit: "N+$7.18",
    tx: "TX7",
    badges: [
      { label: "👤", value: "0.3%", tone: "green" },
      { label: "⏱", value: "0.2% 10d", tone: "muted" },
      { label: "🧊", value: "0%", tone: "muted" },
      { label: "🛡", value: "0%", tone: "muted" },
      { label: "⚡", value: "0%", tone: "muted" },
      { label: "🔄", value: "0%", tone: "muted" },
    ],
  },
  {
    name: "WHEEEE",
    symbol: "WHEEE",
    icon: "🎡",
    mc: "$2.1K",
    vol: "$18.2",
    price: "$18.2",
    fee: "0.0015",
    age: "11s",
    profit: "N+$3.72",
    tx: "TX8",
    badges: [
      { label: "👤", value: "0.2%", tone: "green" },
      { label: "⏱", value: "0.2% 4m", tone: "muted" },
      { label: "🧊", value: "0%", tone: "muted" },
      { label: "🛡", value: "0%", tone: "muted" },
      { label: "⚡", value: "0%", tone: "muted" },
      { label: "🔄", value: "0%", tone: "muted" },
    ],
  },
];

const almostTokens: Token[] = [
  {
    name: "Enjin",
    symbol: "enjin",
    icon: "🅴",
    mc: "$784.9K",
    vol: "$20K",
    price: "$0.00018",
    profit: "+$19.9K",
    tx: "TX524",
    age: "6m",
    badges: [
      { label: "📈", value: "19%", tone: "green" },
      { label: "⏱", value: "DS 6m", tone: "blue" },
      { label: "🧊", value: "0%", tone: "muted" },
      { label: "🛡", value: "0%", tone: "muted" },
      { label: "⚡", value: "0%", tone: "muted" },
      { label: "🔄", value: "0%", tone: "muted" },
    ],
  },
  {
    name: "2026",
    symbol: "2026 is our year",
    icon: "2️⃣0️⃣2️⃣6️⃣",
    mc: "$673.8K",
    vol: "$18.3K",
    price: "$0.00025",
    profit: "+$18.2K",
    tx: "TX199",
    age: "3m",
    badges: [
      { label: "📈", value: "19%", tone: "green" },
      { label: "⏱", value: "DS 18d", tone: "blue" },
      { label: "🧊", value: "0%", tone: "muted" },
      { label: "🛡", value: "0%", tone: "muted" },
      { label: "⚡", value: "0%", tone: "muted" },
      { label: "🔄", value: "0%", tone: "muted" },
    ],
  },
  {
    name: "Banana",
    symbol: "Banana For Scale",
    icon: "🍌",
    mc: "$35.4K",
    vol: "$147.8K",
    price: "$0.0114",
    profit: "+$8.2K",
    tx: "TX25K",
    age: "50m",
    badges: [
      { label: "📈", value: "22%", tone: "green" },
      { label: "⏱", value: "DS 192d", tone: "blue" },
      { label: "🧊", value: "0%", tone: "muted" },
      { label: "🛡", value: "20%/38%", tone: "red" },
      { label: "⚡", value: "0%", tone: "muted" },
      { label: "🔄", value: "0%", tone: "muted" },
    ],
  },
  {
    name: "LAIKA",
    symbol: "The Space Dog",
    icon: "🐕",
    mc: "$29.2K",
    vol: "$70.3K",
    price: "$4.26",
    profit: "+$7.1K",
    tx: "TX12K",
    age: "2d",
    badges: [
      { label: "📈", value: "23%", tone: "green" },
      { label: "⏱", value: "DS 2h", tone: "blue" },
      { label: "🧊", value: "0%", tone: "muted" },
      { label: "🛡", value: "24%/24%", tone: "red" },
      { label: "⚡", value: "0%", tone: "muted" },
      { label: "🔄", value: "0%", tone: "muted" },
    ],
  },
];

const migratedTokens: Token[] = [
  {
    name: "Enjin",
    symbol: "enjin",
    icon: "🅴",
    mc: "$786.6K",
    vol: "$20K",
    price: "$0.00018",
    profit: "N+$20K",
    tx: "TX532",
    age: "9s",
    badges: [
      { label: "🩸", value: "97%", tone: "red" },
      { label: "⏱", value: "0% 7m", tone: "green" },
      { label: "🧊", value: "78%", tone: "red" },
      { label: "🛡", value: "0%", tone: "green" },
      { label: "⚡", value: "0%", tone: "green" },
      { label: "🔄", value: "0%", tone: "green" },
    ],
  },
  {
    name: "EWU",
    symbol: "EU Whales Unite",
    icon: "🇪🇺",
    mc: "$696.5K",
    vol: "$18.6K",
    price: "$0.00071",
    profit: "N+$18.6K",
    tx: "TX158",
    age: "31s",
    badges: [
      { label: "🩸", value: "100%", tone: "red" },
      { label: "⏱", value: "19% 15h", tone: "green" },
      { label: "🧊", value: "100%", tone: "red" },
      { label: "🛡", value: "0%", tone: "green" },
      { label: "⚡", value: "0%", tone: "green" },
      { label: "🔄", value: "0%", tone: "green" },
    ],
  },
  {
    name: "STRONGPAW",
    symbol: "Strong Paw Ca",
    icon: "🐾",
    mc: "$55.8K",
    vol: "$13K",
    price: "$0.00050",
    profit: "N+$13K",
    tx: "TX69",
    age: "41s",
    badges: [
      { label: "🩸", value: "75%", tone: "red" },
      { label: "⏱", value: "74% 1m", tone: "red" },
      { label: "🧊", value: "0%", tone: "green" },
      { label: "🛡", value: "0%", tone: "green" },
      { label: "⚡", value: "0%", tone: "green" },
      { label: "🔄", value: "0%", tone: "green" },
    ],
  },
  {
    name: "STOP",
    symbol: "Stop In The Name Of God",
    icon: "🛑",
    mc: "$52K",
    vol: "$12.2K",
    price: "$0.00039",
    profit: "N+$12.1K",
    tx: "TX68",
    age: "42s",
    badges: [
      { label: "🩸", value: "75%", tone: "red" },
      { label: "⏱", value: "75% 37m", tone: "red" },
      { label: "🧊", value: "0%", tone: "green" },
      { label: "🛡", value: "0%", tone: "green" },
      { label: "⚡", value: "0%", tone: "green" },
      { label: "🔄", value: "0%", tone: "green" },
    ],
  },
];

export const getTokensByTab = (tab: string): Token[] => {
  if (tab === "Almost bonded") return almostTokens;
  if (tab === "Migrated") return migratedTokens;
  return newTokens;
};

const TrenchesList = ({ activeTab, useRealData = false }: { activeTab: string; useRealData?: boolean }) => {
  const navigate = useNavigate();
  const { tokens: realTokens, loading: realLoading, error: realError } = useTokenList(20, useRealData);
  
  // 转换真实数据为 Token 格式
  const convertRealTokenToToken = (token: any): Token => {
    const formatMarketCap = (mc: number): string => {
      if (!mc || isNaN(mc) || mc <= 0) return "$0";
      if (mc >= 1000000) return `$${(mc / 1000000).toFixed(1)}M`;
      if (mc >= 1000) return `$${(mc / 1000).toFixed(1)}K`;
      return `$${mc.toFixed(2)}`;
    };
    
    const formatVolume = (vol: number): string => {
      if (!vol || isNaN(vol) || vol <= 0) return "$0";
      if (vol >= 1000000) return `$${(vol / 1000000).toFixed(1)}M`;
      if (vol >= 1000) return `$${(vol / 1000).toFixed(1)}K`;
      return `$${vol.toFixed(2)}`;
    };
    
    const iconMap: Record<string, string> = {
      'SOL': '🟣',
      'USDC': '💵',
      'USDT': '💵',
    };
    const icon = token.icon || iconMap[token.symbol?.toUpperCase() || ''] || '🪙';
    
    return {
      name: token.symbol || token.name || "Unknown",
      symbol: token.name || token.symbol,
      icon: icon,
      mc: formatMarketCap(token.marketCap || 0),
      vol: formatVolume(token.volume24h || 0),
      price: `$${token.price?.toFixed(4) || '0.0000'}`,
      addr: token.address ? `${token.address.slice(0, 4)}...${token.address.slice(-4)}` : undefined,
      age: token.age || "New",
      tx: token.txCount ? `TX${token.txCount}` : undefined,
      profit: token.priceChange24h >= 0 
        ? `+$${((token.priceChange24h / 100) * (token.marketCap || 0)).toFixed(2)}K`
        : `-$${Math.abs((token.priceChange24h / 100) * (token.marketCap || 0)).toFixed(2)}K`,
      badges: [
        { label: "👤", value: "0%", tone: "muted" },
        { label: "⏱", value: token.age || "0%", tone: "muted" },
        { label: "🧊", value: "0%", tone: "muted" },
        { label: "🛡", value: "0%", tone: "muted" },
        { label: "⚡", value: "0%", tone: "muted" },
        { label: "🔄", value: "0%", tone: "muted" },
      ],
    };
  };
  
  // 根据数据源选择列表
  const getList = (): Token[] => {
    if (useRealData && activeTab === "New") {
      if (realLoading) return [];
      if (realError) return [];
      if (!realTokens || realTokens.length === 0) return [];
      return realTokens.map(convertRealTokenToToken);
    }
    return getTokensByTab(activeTab);
  };
  
  const list = getList();
  
  if (useRealData && realLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-6 h-6 animate-spin text-[#6ee7b7]" />
        <span className="ml-2 text-[#8b949e]">Loading real data...</span>
      </div>
    );
  }
  
  if (useRealData && realError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <div className="text-red-400 text-sm">Failed to load real data</div>
        <div className="text-[#8b949e] text-xs">{realError.message}</div>
      </div>
    );
  }
  
  return (
    <div className="px-3 pb-24 space-y-3">
      {list.map((t) => (
        <div
          key={t.name}
          onClick={() =>
            navigate(`/trenches/${encodeURIComponent(t.name)}`, {
              state: t,
            })
          }
          className="rounded-2xl border border-[#1c2128] bg-[#0d0f13] px-3 py-3 shadow-sm cursor-pointer hover:border-[#2a323d]"
        >
          <div className="flex items-start gap-3">
            <div className="relative w-16 h-16 rounded-xl bg-[#161c22] flex items-center justify-center text-2xl">
              {t.icon}
              <span className="absolute -top-1 -left-1 inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#11161b] border border-[#1c2128] text-[11px] text-[#a8b0bb]">
                3
              </span>
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[#e5e7eb] font-semibold truncate">{t.name}</span>
                {t.symbol && <span className="text-[#8b949e] text-sm truncate">{t.symbol}</span>}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#8b949e]">
                {t.age && <span>{t.age}</span>}
                <Zap className="w-3 h-3 text-[#6ee7b7]" />
                <Shield className="w-3 h-3 text-[#8b949e]" />
                <Flame className="w-3 h-3 text-[#8b949e]" />
                <Activity className="w-3 h-3 text-[#8b949e]" />
                {t.addr && <span className="truncate">{t.addr}</span>}
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[#a8b0bb] flex-wrap">
                <span className="text-[#9ca3af]">MC</span>
                <span className="text-[#f5d742] font-semibold">{t.mc}</span>
                <span className="text-[#9ca3af] ml-1">V</span>
                <span className="text-[#6ee7b7] font-semibold">{t.vol}</span>
                {t.price && (
                  <>
                    <span className="text-[#9ca3af] ml-1">P</span>
                    <span className="text-[#e5e7eb]">{t.price}</span>
                  </>
                )}
                {t.fee && (
                  <>
                    <span className="text-[#9ca3af] ml-1">F</span>
                    <span className="text-[#60a5fa]">{t.fee}</span>
                  </>
                )}
                {t.profit && (
                  <span className="text-[#6ee7b7] font-semibold">N {t.profit}</span>
                )}
                {t.tx && <span className="text-[#9ca3af]">TX {t.tx}</span>}
              </div>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {t.badges.map((b, i) => renderBadge(b, i))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrenchesList;

