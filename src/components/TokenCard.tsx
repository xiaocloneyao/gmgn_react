import { ExternalLink, Copy, X, Globe, MessageCircle, Users } from "lucide-react";

interface TokenCardProps {
  rank?: number;
  name: string;
  symbol: string;
  image: string;
  age: string;
  creator: string;
  creatorAddress: string;
  mc: string;
  volume: string;
  fee: string;
  holders: string;
  buys: number;
  sells: number;
  bonding: string;
  change: string;
  txCount: number;
  stats: {
    devHolding?: string;
    age?: string;
    b0?: string;
    s0?: string;
    b5?: string;
    s5?: string;
    flag?: string;
    lightning?: string;
  };
  socials?: {
    x?: boolean;
    globe?: boolean;
    telegram?: boolean;
  };
}

const TokenCard = ({
  rank,
  name,
  symbol,
  image,
  age,
  creator,
  creatorAddress,
  mc,
  volume,
  fee,
  holders,
  buys,
  sells,
  bonding,
  change,
  txCount,
  stats,
  socials,
}: TokenCardProps) => {
  return (
    <div className="bg-card border border-border rounded-xl p-3 space-y-2 card-hover">
      {/* Top Row */}
      <div className="flex items-start gap-3">
        {/* Token Image */}
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted">
            <img src={image} alt={name} className="w-full h-full object-cover" />
          </div>
          {rank && (
            <div className="token-badge text-primary">
              {rank}
              <span className="text-[8px]">⭘</span>
            </div>
          )}
        </div>

        {/* Token Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="font-bold text-foreground truncate">{name}</span>
            <span className="text-muted-foreground text-sm">{symbol}</span>
            <ExternalLink className="w-3 h-3 text-muted-foreground flex-shrink-0" />
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <span className="text-primary font-mono">{age}</span>
            {socials?.x && <X className="w-3 h-3" />}
            {socials?.globe && <Globe className="w-3 h-3" />}
            {socials?.telegram && <MessageCircle className="w-3 h-3" />}
          </div>

          <div className="flex items-center gap-1 text-xs">
            <Users className="w-3 h-3 text-muted-foreground" />
            <span className="text-primary">@{creator}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <span className="text-muted-foreground">💬</span>
              <span>0</span>
            </span>
            <span className="flex items-center gap-1">
              <span>📁</span>
              <span>{buys}/{sells}</span>
            </span>
            <span className="flex items-center gap-1">
              <span>👥</span>
              <span>{holders}</span>
            </span>
            <span className="flex items-center gap-1">
              <span>⭕</span>
              <span>{bonding}</span>
            </span>
            <span className="flex items-center gap-1 text-primary">
              N +{change}
            </span>
            <span className="text-muted-foreground">
              TX <span className="text-warning">{txCount}</span>
            </span>
          </div>
        </div>

        {/* Right Stats */}
        <div className="text-right flex-shrink-0">
          <div className="text-xs text-muted-foreground">MC</div>
          <div className="text-primary font-mono font-bold">{mc}</div>
          <div className="text-xs text-muted-foreground mt-1">V</div>
          <div className="text-primary font-mono text-sm">{volume}</div>
          <div className="text-xs text-muted-foreground mt-1">F</div>
          <div className="text-secondary font-mono text-sm">{fee}</div>
        </div>
      </div>

      {/* Address Row */}
      <div className="text-xs text-muted-foreground truncate">
        {creatorAddress}
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {stats.devHolding && (
          <span className="badge-stat bg-pink-500/20 text-pink-400">
            <Users className="w-3 h-3" />
            {stats.devHolding}
          </span>
        )}
        {stats.age && (
          <span className="badge-stat bg-primary/20 text-primary">
            <span>◐</span>
            {stats.age}
          </span>
        )}
        {stats.b0 && (
          <span className="badge-stat bg-muted text-muted-foreground">
            <span>🅑</span>
            {stats.b0}
          </span>
        )}
        {stats.s0 && (
          <span className="badge-stat bg-muted text-muted-foreground">
            <span>💎</span>
            {stats.s0}
          </span>
        )}
        {stats.b5 && (
          <span className="badge-stat bg-muted text-muted-foreground">
            <span>🅑</span>
            {stats.b5}
          </span>
        )}
        {stats.s5 && (
          <span className="badge-stat bg-muted text-muted-foreground">
            <span>🗣</span>
            {stats.s5}
          </span>
        )}
        {stats.flag && (
          <span className="badge-stat bg-muted text-muted-foreground">
            <span>🚩</span>
            {stats.flag}
          </span>
        )}
        {stats.lightning && (
          <span className="badge-stat bg-muted text-yellow-500">
            <span>⚡</span>
            {stats.lightning}
          </span>
        )}
      </div>
    </div>
  );
};

export default TokenCard;
