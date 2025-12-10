import TokenCard from "./TokenCard";

const tokens = [
  {
    rank: 2,
    name: "RNUT",
    symbol: "RNUT",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop",
    age: "20s",
    creator: "papakobra_",
    creatorAddress: "AYTn...bonk",
    mc: "$12.6K",
    volume: "$12.3K",
    fee: "0.0,27",
    holders: "89",
    buys: 7,
    sells: 12,
    bonding: "0/0%",
    change: "$11.6K",
    txCount: 24,
    stats: {
      devHolding: "2%",
      age: "DS 82d",
      b0: "0%",
      s0: "0%",
      b5: "0%",
      s5: "3%",
      lightning: "♦",
    },
    socials: { x: true, globe: true },
  },
  {
    rank: 6,
    name: "BABYFRANK",
    symbol: "Franklin The Ba",
    image: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=100&h=100&fit=crop",
    age: "32s",
    creator: "Franklin The Baby Turtle",
    creatorAddress: "6rbB...MJv5",
    mc: "$53.5K",
    volume: "$12.7K",
    fee: "0.00067",
    holders: "39",
    buys: 8,
    sells: 8,
    bonding: "0/0%",
    change: "$12.7K",
    txCount: 57,
    stats: {
      devHolding: "75%",
      age: "74% 50m",
      b0: "0%",
      s0: "0%",
      b5: "0%",
      lightning: "6",
    },
    socials: { globe: true },
  },
  {
    rank: 382,
    name: "NVIDIA AI",
    symbol: "NVIDIA AI",
    image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=100&h=100&fit=crop",
    age: "39s",
    creator: "NVIDIAAI",
    creatorAddress: "FxMX...Zunt",
    mc: "$779.3K",
    volume: "$19.8K",
    fee: "0.00059",
    holders: "223",
    buys: 1,
    sells: 1,
    bonding: "0/0%",
    change: "$19.8K",
    txCount: 326,
    stats: {
      devHolding: "19%",
      age: "0.2% 5m",
      b0: "0%",
      s0: "0%",
      b5: "0%",
      flag: "(4",
    },
    socials: { x: true, globe: true },
  },
  {
    rank: 5,
    name: "Red Bull",
    symbol: "redbull",
    image: "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=100&h=100&fit=crop",
    age: "42s",
    creator: "redbull",
    creatorAddress: "Adko...QmRz",
    mc: "$1.3M",
    volume: "$26.7K",
    fee: "0.0024",
    holders: "234",
    buys: 24,
    sells: 24,
    bonding: "1",
    change: "$26.7K",
    txCount: 559,
    stats: {
      devHolding: "98%",
      age: "0% 6h",
      b0: "78%",
      s0: "0%",
      b5: "0%",
      flag: "7:♦",
    },
    socials: { x: true, globe: true },
  },
];

const TokenList = () => {
  return (
    <div className="px-3 pb-24 space-y-3">
      {tokens.map((token, index) => (
        <TokenCard key={index} {...token} />
      ))}
      
      {/* Franklin Preview */}
      <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted border-2 border-muted">
            <div className="w-full h-full bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center text-xs font-bold">
              Franklin
            </div>
          </div>
          <div className="token-badge text-primary text-[8px]">
            2⭘
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-foreground">Franklin</span>
            <span className="text-muted-foreground text-sm">Franklin The Turtle</span>
            <ExternalLink className="w-3 h-3 text-muted-foreground" />
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-muted-foreground">MC </span>
          <span className="text-primary font-mono font-bold">$1.5M</span>
        </div>
      </div>
    </div>
  );
};

const ExternalLink = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

export default TokenList;
