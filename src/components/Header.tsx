import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Settings,
  ChevronDown,
  Menu,
  ChevronUp,
  X,
  Wallet,
  ArrowDownToLine,
  ArrowUpToLine,
  RefreshCcw,
  Gift,
  Shield,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useEffect } from "react";
import { getAuthState, setAuthState, subscribeAuth } from "@/lib/authStore";
import { api } from "@/lib/api";
import { getSelectedChain, setSelectedChain, subscribeChain, CHAIN_INFO, type Chain } from "@/lib/chainStore";

const Header = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [authModal, setAuthModal] = useState<"login" | "signup" | null>(null);
  const [auth, setAuth] = useState(getAuthState());
  const [balance, setBalance] = useState<number>(0);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedChain, setSelectedChainState] = useState<Chain>(getSelectedChain());
  const [showChainDropdown, setShowChainDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = subscribeAuth((state) => {
      setAuth(state);
      if (state.loggedIn) {
        // 登录后加载余额
        api.getTotalBalance().then(setBalance);
      } else {
        setBalance(0);
      }
    });
    return unsub;
  }, []);

  // 订阅网络变化
  useEffect(() => {
    const unsub = subscribeChain((chain) => {
      setSelectedChainState(chain);
      // 切换网络时触发数据更新事件
      window.dispatchEvent(new CustomEvent("chain-switched", { detail: { chain } }));
    });
    return unsub;
  }, []);

  // 定期更新余额
  useEffect(() => {
    if (!auth.loggedIn) return;
    const interval = setInterval(() => {
      api.getTotalBalance().then(setBalance);
    }, 5000); // 每5秒更新一次
    return () => clearInterval(interval);
  }, [auth.loggedIn]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { mode?: "login" | "signup" };
      setAuthModal(detail?.mode || "login");
    };
    window.addEventListener("open-auth-modal", handler as EventListener);
    return () => window.removeEventListener("open-auth-modal", handler as EventListener);
  }, []);

  // 搜索功能
  const handleSearch = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      // 使用真实 API 搜索（优先 GMGN，失败则 DexScreener）
      const { searchTokens } = await import('@/lib/realApi');
      const results = await searchTokens(query);
      
      // 格式化搜索结果
      const formatted = results.slice(0, 10).map((token: any) => ({
        address: token.address || token.baseToken?.address || '',
        name: token.name || token.baseToken?.name || 'Unknown',
        symbol: token.symbol || token.baseToken?.symbol || 'UNKNOWN',
        price: token.price || parseFloat(token.priceUsd || '0'),
        icon: token.icon || token.baseToken?.logoURI || token.logoURI || '🪙',
        marketCap: token.marketCap || parseFloat(token.marketCap || '0'),
        volume24h: token.volume24h || parseFloat(token.volume?.h24 || '0'),
      }));
      
      setSearchResults(formatted);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // 点击外部关闭搜索框和网络下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showSearch && !target.closest('.relative')) {
        setShowSearch(false);
      }
      if (showChainDropdown && !target.closest('.relative')) {
        setShowChainDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSearch, showChainDropdown]);

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        {/* Logo */}
        <button
          className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center overflow-hidden"
          onClick={() => navigate("/")}
        >
          <img 
            src="/alligator-icon.svg" 
            alt="Alligator" 
            className="w-full h-full object-cover"
            style={{ imageRendering: 'pixelated' }}
            onError={(e) => {
              // 如果图片加载失败，显示默认表情符号
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              if (!target.parentElement?.querySelector('.fallback-icon')) {
                const fallback = document.createElement('span');
                fallback.className = 'fallback-icon text-lg';
                fallback.textContent = '🐊';
                target.parentElement?.appendChild(fallback);
              }
            }}
          />
        </button>

        {/* Center Controls */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowChainDropdown(!showChainDropdown)}
              className="flex items-center gap-1 bg-muted rounded-full px-3 py-1.5 text-sm font-medium hover:bg-muted/80"
            >
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-[10px]">
                {CHAIN_INFO[selectedChain].icon}
              </div>
              <span>{selectedChain}</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>
            
            {/* Chain Dropdown */}
            {showChainDropdown && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-[#0f1216] border border-[#1c2128] rounded-xl shadow-2xl z-50 overflow-hidden">
                {Object.entries(CHAIN_INFO).map(([chain, info]) => (
                  <button
                    key={chain}
                    onClick={() => {
                      setSelectedChain(chain as Chain);
                      setShowChainDropdown(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#161c22] transition-colors ${
                      selectedChain === chain ? "bg-[#13201a]" : ""
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-xs">
                      {info.icon}
                    </div>
                    <span className="text-sm text-[#e5e7eb]">{chain}</span>
                    {selectedChain === chain && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-[#6ee7b7]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button 
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
              onClick={() => setShowSearch(!showSearch)}
            >
              <Search className="w-4 h-4 text-muted-foreground" />
            </button>
            
            {/* 搜索下拉框 */}
            {showSearch && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-[#0f1216] border border-[#1c2128] rounded-xl shadow-2xl z-50">
                <div className="p-3 border-b border-[#1c2128]">
                  <div className="flex items-center gap-2 bg-[#161c22] rounded-lg px-3 py-2">
                    <Search className="w-4 h-4 text-[#8b949e]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        handleSearch(e.target.value);
                      }}
                      placeholder="Search token name, symbol, address..."
                      className="flex-1 bg-transparent outline-none text-sm text-[#e5e7eb] placeholder:text-[#8b949e]"
                      autoFocus
                    />
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setSearchResults([]);
                        }}
                        className="text-[#8b949e] hover:text-[#e5e7eb]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                {/* 搜索结果 */}
                <div className="max-h-96 overflow-y-auto">
                  {searchLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="w-5 h-5 animate-spin text-[#6ee7b7]" />
                      <span className="ml-2 text-sm text-[#8b949e]">Searching...</span>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="p-2 space-y-1">
                      {searchResults.map((token, index) => (
                        <button
                          key={token.address || index}
                          onClick={() => {
                            setShowSearch(false);
                            setSearchQuery("");
                            // 导航到代币详情页
                            navigate(`/trenches/${encodeURIComponent(token.symbol || token.name)}`, {
                              state: token,
                            });
                          }}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#161c22] text-left"
                        >
                          <div className="w-10 h-10 rounded-full bg-[#1c2128] flex items-center justify-center text-lg">
                            {token.icon || "🪙"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-[#e5e7eb] truncate">
                              {token.symbol || token.name}
                            </div>
                            <div className="text-xs text-[#8b949e] truncate">
                              {token.address ? `${token.address.slice(0, 6)}...${token.address.slice(-4)}` : token.name}
                            </div>
                          </div>
                          {token.price && (
                            <div className="text-sm font-semibold text-[#6ee7b7]">
                              ${token.price.toFixed(4)}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : searchQuery.length >= 2 ? (
                    <div className="flex items-center justify-center py-8 text-sm text-[#8b949e]">
                      No results found
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8 text-sm text-[#8b949e]">
                      Type at least 2 characters to search
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <button className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <Settings className="w-4 h-4 text-muted-foreground" />
          </button>

          <button className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1.5 text-sm">
            <div className="w-4 h-4 rounded bg-secondary/20 flex items-center justify-center">
              <span className="text-secondary text-xs">≡</span>
            </div>
            <span className="font-mono">0</span>
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {!auth.loggedIn && (
            <>
              <button
                className="px-3 py-1.5 rounded-lg bg-[#11161b] border border-[#1c2128] text-sm text-[#e5e7eb]"
                onClick={() => setAuthModal("signup")}
              >
                Sign Up
              </button>
              <button
                className="px-3 py-1.5 rounded-lg bg-[#0f1216] border border-[#1c2128] text-sm text-[#e5e7eb]"
                onClick={() => setAuthModal("login")}
              >
                Log In
              </button>
            </>
          )}
          <button className="w-8 h-8 flex items-center justify-center" onClick={() => setShowMenu(true)}>
            <Menu className="w-5 h-5 text-muted-foreground" />
          </button>
          <button className="w-6 h-6 flex items-center justify-center">
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {showMenu && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/60" onClick={() => setShowMenu(false)}>
          <div
            className="w-full h-[85vh] max-h-[600px] mx-auto rounded-t-2xl bg-[#0d0f13] border border-[#1c2128] shadow-2xl overflow-hidden flex flex-col animate-[slideUp_0.18s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1c2128] flex-shrink-0">
              <div className="text-sm text-[#8b949e]">sol Balance (USD)</div>
              <button className="w-8 h-8 flex items-center justify-center" onClick={() => setShowMenu(false)}>
                <X className="w-5 h-5 text-[#8b949e]" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-3 space-y-3">
              <div className="text-2xl font-semibold text-[#e5e7eb] pt-2">≈${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="grid grid-cols-4 gap-3 text-[12px] text-[#e5e7eb]">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-[#13201a] border border-[#21422f] flex items-center justify-center text-[#6ee7b7]">
                    <ArrowDownToLine className="w-5 h-5" />
                  </div>
                  <span>Deposit</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-[#13201a] border border-[#21422f] flex items-center justify-center text-[#6ee7b7]">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <span>Buy</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-[#13201a] border border-[#21422f] flex items-center justify-center text-[#6ee7b7]">
                    <ArrowUpToLine className="w-5 h-5" />
                  </div>
                  <span>Withdraw</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-[#13201a] border border-[#21422f] flex items-center justify-center text-[#6ee7b7]">
                    <RefreshCcw className="w-5 h-5" />
                  </div>
                  <span>Convert</span>
                </div>
              </div>

              <div className="text-sm text-[#e5e7eb] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-[#8b949e]" />
                    Portfolio
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#8b949e]" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#8b949e]" />
                    Security <span className="text-red-400 text-xs ml-1">Not Bound</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#8b949e]" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-[#8b949e]" />
                    Referral
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#8b949e]" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#13201a] border border-[#21422f]" />
                    Watchlist
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#8b949e]" />
                </div>
              </div>

              <div className="rounded-xl overflow-hidden border border-[#1c2128]">
                <div className="bg-gradient-to-r from-[#1f9bdd] to-[#1fdb91] text-[#e5e7eb] text-sm px-3 py-2">
                  GMGN Contest S9
                </div>
              </div>

              <button
                className="w-full rounded-lg border border-[#1c2128] bg-[#12161c] text-[#e5e7eb] py-2.5 flex items-center justify-center gap-2 text-sm font-medium"
                onClick={() => {
                  api.clearCurrentEmail();
                  setAuthState({ loggedIn: false });
                  setShowMenu(false);
                  navigate("/");
                }}
              >
                <LogOut className="w-4 h-4 text-[#8b949e]" />
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {authModal && (
        <AuthModal mode={authModal} onClose={() => setAuthModal(null)} onSwitch={setAuthModal} />
      )}
    </header>
  );
};

const AuthModal = ({
  mode,
  onClose,
  onSwitch,
}: {
  mode: "login" | "signup";
  onClose: () => void;
  onSwitch: (m: "login" | "signup") => void;
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-sm mx-auto rounded-2xl bg-[#0d0f13] border border-[#1c2128] shadow-2xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xl font-semibold text-[#e5e7eb]">
            {mode === "login" ? "Log In" : "Sign Up"}
          </div>
          <button className="w-8 h-8 flex items-center justify-center" onClick={onClose}>
            <X className="w-5 h-5 text-[#8b949e]" />
          </button>
        </div>

        <div className="text-sm text-[#8b949e]">
          {mode === "login" ? (
            <>
              Don&apos;t have an account yet?{" "}
              <button className="text-[#6ee7b7]" onClick={() => onSwitch("signup")}>
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button className="text-[#6ee7b7]" onClick={() => onSwitch("login")}>
                Log In
              </button>
            </>
          )}
        </div>

        <AuthForm mode={mode} onSuccess={onClose} />
      </div>
    </div>
  );
};

const AuthForm = ({ mode, onSuccess }: { mode: "login" | "signup"; onSuccess: () => void }) => {
  const [step, setStep] = useState<"email" | "password" | "code">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const canNextEmail = email.trim().length > 0;
  const canNextPassword = password.trim().length > 0;
  const canSubmitCode = code.trim().length > 0;

  const goNext = () => {
    if (step === "email" && canNextEmail) {
      setStep("password");
    } else if (step === "password" && canNextPassword) {
      setStep("code");
    } else if (step === "code" && canSubmitCode) {
      // 保存邮箱并初始化用户数据
      api.setCurrentEmail(email);
      setAuthState({ loggedIn: true });
      onSuccess();
    }
  };

  return (
    <>
      <div className="space-y-3">
        <div className="text-sm text-[#8b949e]">Email</div>
        <input
          className="w-full rounded-lg bg-[#11161b] border border-[#1c2128] px-3 py-2 text-sm text-[#e5e7eb] placeholder:text-[#4b5563] outline-none"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {mode === "signup" && (
          <>
            <div className="text-sm text-[#8b949e]">Invite Code (Optional)</div>
            <input
              className="w-full rounded-lg bg-[#11161b] border border-[#1c2128] px-3 py-2 text-sm text-[#e5e7eb] placeholder:text-[#4b5563] outline-none"
              placeholder="Invite Code"
            />
            <div className="text-[11px] text-[#8b949e]">
              The invite code cannot be changed after binding. Please ensure the correct invite code is entered.
            </div>
          </>
        )}
        {step !== "email" && (
          <>
            <div className="text-sm text-[#8b949e]">Password</div>
            <input
              type="password"
              className="w-full rounded-lg bg-[#11161b] border border-[#1c2128] px-3 py-2 text-sm text-[#e5e7eb] placeholder:text-[#4b5563] outline-none"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </>
        )}
        {step === "code" && (
          <>
            <div className="text-sm text-[#8b949e]">Email Code</div>
            <input
              type="password"
              className="w-full rounded-lg bg-[#11161b] border border-[#1c2128] px-3 py-2 text-sm text-[#e5e7eb] placeholder:text-[#4b5563] outline-none"
              placeholder="Enter Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </>
        )}

        <button
          className="w-full rounded-lg bg-[#27c37c] text-[#0b1411] py-3 font-semibold text-sm disabled:opacity-60"
          onClick={goNext}
          disabled={
            (step === "email" && !canNextEmail) ||
            (step === "password" && !canNextPassword) ||
            (step === "code" && !canSubmitCode)
          }
        >
          {step === "code" ? (mode === "login" ? "Log In" : "Sign Up") : "Next"}
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs text-[#8b949e]">
        <span className="flex-1 h-px bg-[#1c2128]" />
        <span>{mode === "login" ? "OR" : "OR Sign Up"}</span>
        <span className="flex-1 h-px bg-[#1c2128]" />
      </div>

      <div className="grid grid-cols-4 gap-3 text-center text-xs text-[#e5e7eb]">
        <div className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-[#0f1216] border border-[#1c2128] flex items-center justify-center">
            <span role="img" aria-label="telegram">
              📩
            </span>
          </div>
          <span>Telegram</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-[#0f1216] border border-[#1c2128] flex items-center justify-center">
            <span role="img" aria-label="phantom">
              👻
            </span>
          </div>
          <span>Phantom</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-[#0f1216] border border-[#1c2128] flex items-center justify-center">
            <span role="img" aria-label="metamask">
              🦊
            </span>
          </div>
          <span>MetaMask</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-[#0f1216] border border-[#1c2128] flex items-center justify-center">
            <span role="img" aria-label="qr">
              📷
            </span>
          </div>
          <span>APP Scan</span>
        </div>
      </div>

      <div className="text-center text-sm text-[#e5e7eb]">Connect with extension wallet →</div>

      <div className="text-center text-[11px] text-[#8b949e] space-x-3">
        <span>Terms of Service</span>
        <span>Privacy Policy</span>
      </div>
    </>
  );
};

export default Header;
