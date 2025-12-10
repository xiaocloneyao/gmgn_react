import { Search, TrendingUp, Copy, Eye, Target, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BottomNavProps {
  activeTab: string;
  onTabChange?: (tab: string) => void;
}

const routeMap: Record<string, string> = {
  trenches: "/",
  trending: "/trending",
  copytrade: "/copytrade",
  monitor: "/monitor",
  track: "/track",
  portfolio: "/portfolio",
};

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const navItems = [
    { id: "trenches", label: "Trenches", icon: Search },
    { id: "trending", label: "Trending", icon: TrendingUp },
    { id: "copytrade", label: "CopyTrade", icon: Copy },
    { id: "monitor", label: "Monitor", icon: Eye },
    { id: "track", label: "Track", icon: Target },
    { id: "portfolio", label: "Portfolio", icon: Wallet },
  ];

  const navigate = useNavigate();

  const handleClick = (id: string) => {
    onTabChange?.(id);
    const path = routeMap[id];
    if (path) navigate(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-2 py-2 z-50">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className={`nav-item ${isActive ? "active" : ""}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
