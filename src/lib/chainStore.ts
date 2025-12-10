// 网络链选择状态管理

export type Chain = "SOL" | "BSC" | "Base" | "Monad" | "ETH" | "Tron";

const STORAGE_KEY = "selected_chain";

// 获取当前选择的网络
export function getSelectedChain(): Chain {
  if (typeof window === "undefined") return "SOL";
  const stored = localStorage.getItem(STORAGE_KEY);
  return (stored as Chain) || "SOL";
}

// 设置选择的网络
export function setSelectedChain(chain: Chain) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, chain);
  window.dispatchEvent(new CustomEvent("chain-changed", { detail: { chain } }));
}

// 订阅网络变化
export function subscribeChain(callback: (chain: Chain) => void) {
  const handler = (e: Event) => {
    const detail = (e as CustomEvent).detail as { chain: Chain };
    callback(detail.chain);
  };
  window.addEventListener("chain-changed", handler as EventListener);
  return () => window.removeEventListener("chain-changed", handler as EventListener);
}

// 网络信息配置
export const CHAIN_INFO: Record<Chain, { name: string; icon: string; chainId?: string }> = {
  SOL: { name: "Solana", icon: "☀️", chainId: "solana" },
  BSC: { name: "Binance Smart Chain", icon: "🟡", chainId: "bsc" },
  Base: { name: "Base", icon: "🔵", chainId: "base" },
  Monad: { name: "Monad", icon: "🟣", chainId: "monad" },
  ETH: { name: "Ethereum", icon: "💎", chainId: "ethereum" },
  Tron: { name: "Tron", icon: "🔴", chainId: "tron" },
};

