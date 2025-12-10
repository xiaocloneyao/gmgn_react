import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import TrenchesHeader from "@/components/TrenchesHeader";
import TrenchesList from "@/components/TrenchesList";
import BottomNav from "@/components/BottomNav";
import { RefreshCw } from "lucide-react";
import { getSelectedChain, subscribeChain, type Chain } from "@/lib/chainStore";

const Index = () => {
  const [activeTab, setActiveTab] = useState("New");
  const [activeNav, setActiveNav] = useState("trenches");
  const [useRealData, setUseRealData] = useState(false);
  const [selectedChain, setSelectedChain] = useState<Chain>(getSelectedChain());
  const navigate = useNavigate();

  // 订阅网络变化
  useEffect(() => {
    const unsub = subscribeChain((chain) => {
      setSelectedChain(chain);
      // 切换网络时，如果使用真实数据，需要重新加载
      if (useRealData) {
        // 触发数据重新加载（通过 key 变化）
        window.dispatchEvent(new CustomEvent("chain-switched", { detail: { chain } }));
      }
    });
    return unsub;
  }, [useRealData]);

  const handleNavChange = (tab: string) => {
    setActiveNav(tab);
    if (tab === "copytrade") {
      navigate("/copytrade");
    } else if (tab === "trending") {
      navigate("/trending");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <TrenchesHeader activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* 数据源切换按钮 */}
      <div className="px-3 pt-2 pb-2">
        <div className="flex items-center justify-end">
          <button
            onClick={() => setUseRealData(!useRealData)}
            className={`flex items-center gap-1 border rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              useRealData
                ? "bg-[#13201a] border-[#21422f] text-[#6ee7b7] hover:bg-[#1a2d22]"
                : "bg-[#0f1216] border-[#1c2128] text-[#a8b0bb] hover:bg-[#151a1f]"
            }`}
          >
            <RefreshCw className={`w-3 h-3 ${useRealData ? "animate-spin" : ""}`} />
            <span>{useRealData ? "Real Data" : "Mock Data"}</span>
          </button>
        </div>
      </div>
      
      <TrenchesList activeTab={activeTab} useRealData={useRealData} />
      <BottomNav activeTab={activeNav} onTabChange={handleNavChange} />
    </div>
  );
};

export default Index;
