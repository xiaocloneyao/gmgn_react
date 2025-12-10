import { ChevronDown, Filter, Bookmark, Grid3X3 } from "lucide-react";

interface TrenchesHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TrenchesHeader = ({ activeTab, onTabChange }: TrenchesHeaderProps) => {
  const tabs = ["New", "Almost bonded", "Migrated"];

  return (
    <div className="px-3 py-2 space-y-3">
      {/* Top Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-sm font-medium">
            <span className="text-primary">⊠</span>
            <span>Trenches</span>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </button>
          
          <div className="flex items-center gap-1">
            <button className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary text-xs">$</span>
            </button>
            <button className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-xs">👤</span>
            </button>
            <button className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-xs">😊</span>
            </button>
            <button className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-xs">◉</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="w-6 h-6 flex items-center justify-center">
            <Grid3X3 className="w-4 h-4 text-muted-foreground" />
          </button>
          <button className="w-6 h-6 flex items-center justify-center">
            <Bookmark className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`tab-pill ${activeTab === tab ? "active" : "text-muted-foreground"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 text-sm text-muted-foreground">
            <span className="w-4 h-4 rounded bg-muted flex items-center justify-center text-xs">📁</span>
            <span>0</span>
            <ChevronDown className="w-3 h-3" />
          </button>
          <button className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span>Adv.</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Migrated</span>
        <div className="flex-1 flex items-center gap-2">
          <div className="flex items-center bg-muted rounded-lg px-2 py-1.5 gap-1">
            <Search className="w-3 h-3 text-muted-foreground" />
            <input
              type="text"
              placeholder="Keyword1, K..."
              className="bg-transparent text-xs w-20 outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center bg-muted rounded-lg px-2 py-1.5 gap-1">
            <span className="text-secondary text-xs">≡</span>
            <span className="text-xs text-muted-foreground">0</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="px-2 py-1 rounded bg-primary/20 text-primary text-xs font-medium">P1</button>
          <button className="px-2 py-1 rounded text-muted-foreground text-xs">P2</button>
          <button className="px-2 py-1 rounded text-muted-foreground text-xs">P3</button>
          <button className="w-6 h-6 rounded flex items-center justify-center">
            <Filter className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

const Search = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

export default TrenchesHeader;
