// API 服务层 - 模拟后端 API，使用 localStorage 持久化

export type Chain = "SOL" | "BSC" | "Base" | "Monad" | "ETH" | "Tron";

export interface Wallet {
  id: string;
  name: string;
  address: string;
  balance: number; // SOL or equivalent
  usdValue: number; // USD
  chain: Chain;
}

export interface CopyTradeConfig {
  id: string;
  sourceAddress: string; // 被复制的钱包地址
  sourceName?: string;
  buyMode: "max" | "fixed" | "ratio";
  buyAmount?: number; // SOL
  buyRatio?: number; // %
  sellMethod: "copy" | "nosell" | "tpsl" | "adv";
  tpPercent?: number; // Take Profit %
  slPercent?: number; // Stop Loss %
  advancedStrategy?: Array<{ tp: number; sell: number }>;
  slippage?: number;
  gasLimit?: number;
  enabled: boolean;
  createdAt: number;
  bought?: number; // 已买入数量
  sold?: number; // 已卖出数量
  status?: "running" | "paused" | "stopped"; // 运行状态
}

export interface TradeHistory {
  id: string;
  copyTradeId: string;
  type: "buy" | "sell";
  token: string;
  amount: number; // SOL
  price: number; // USD per token
  totalUsd: number; // Total USD value
  timestamp: number;
  sourceAddress: string;
  fee?: number; // 手续费 (SOL)
  gasFee?: number; // Gas 费用 (SOL)
}

// 钱包余额变动记录
export interface WalletBalanceChange {
  id: string;
  walletId: string;
  type: "copytrade" | "deposit" | "withdraw" | "fee" | "trade";
  amount: number; // SOL（正数为增加，负数为减少）
  balanceBefore: number; // 变动前余额
  balanceAfter: number; // 变动后余额
  timestamp: number;
  description: string;
  copyTradeId?: string; // 如果是CopyTrade相关，记录ID
  tradeId?: string; // 如果是交易相关，记录交易ID
}

// CopyTrade 历史记录（用于Portfolio History）
export interface CopyTradeHistory {
  id: string;
  copyTradeId: string;
  copyTradeName: string; // 被复制的钱包名称或地址
  startTime: number; // 开始时间
  endTime?: number; // 结束时间（如果已停止）
  totalSpent: number; // 总花费 (SOL)
  totalFees: number; // 总手续费 (SOL)
  totalTrades: number; // 总交易次数
  status: "running" | "paused" | "stopped";
}

export interface User {
  email: string;
  wallets: Wallet[];
  copyTrades: CopyTradeConfig[];
  totalBalance: number;
  totalUsdValue: number;
  tradeHistory: TradeHistory[];
  balanceChanges: WalletBalanceChange[]; // 余额变动记录
  copyTradeHistory: CopyTradeHistory[]; // CopyTrade 历史记录
}

const STORAGE_KEY = "gmgn_user_data";
// 初始余额常量 - 每个账号的初始资金
export const INITIAL_BALANCE = 1000; // 初始余额 1000 SOL
const SOL_PRICE = 150; // 假设 SOL 价格 $150

// CopyTrade 手续费常量
const COPYTRADE_FEE_RATE = 0.001; // 0.1% 手续费率
const COPYTRADE_MIN_FEE = 0.01; // 最小手续费 0.01 SOL
const COPYTRADE_GAS_FEE = 0.005; // Gas 费用 0.005 SOL（每次交易）

// 获取或创建用户数据
function getUserData(): User {
  if (typeof window === "undefined") {
    return {
      email: "",
      wallets: [],
      copyTrades: [],
      totalBalance: 0,
      totalUsdValue: 0,
    };
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }

  // 创建新用户，初始化一个默认钱包
  const defaultWallet: Wallet = {
    id: "wallet-1",
    name: "Wallet1",
    address: "0xcd...6a73",
    balance: INITIAL_BALANCE,
    usdValue: INITIAL_BALANCE * SOL_PRICE,
    chain: "SOL",
  };

  const user: User = {
    email: "",
    wallets: [defaultWallet],
    copyTrades: [],
    totalBalance: INITIAL_BALANCE,
    totalUsdValue: INITIAL_BALANCE * SOL_PRICE,
  };

  saveUserData(user);
  return user;
}

function saveUserData(user: User) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

// 获取当前登录用户的邮箱
function getCurrentEmail(): string {
  // 从 localStorage 获取登录状态中的邮箱
  const authEmail = localStorage.getItem("auth_email");
  return authEmail || "";
}

// 根据邮箱获取或创建用户数据
function getUserByEmail(email: string): User {
  const allUsersKey = "gmgn_all_users";
  if (typeof window === "undefined") {
    return getUserData();
  }

  let allUsers: Record<string, User> = {};
  const stored = localStorage.getItem(allUsersKey);
  if (stored) {
    allUsers = JSON.parse(stored);
  }

  if (!allUsers[email]) {
    // 创建新用户
    const defaultWallet: Wallet = {
      id: `wallet-${Date.now()}`,
      name: "Wallet1",
      address: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
      balance: INITIAL_BALANCE,
      usdValue: INITIAL_BALANCE * SOL_PRICE,
      chain: "SOL",
    };

        allUsers[email] = {
          email,
          wallets: [defaultWallet],
          copyTrades: [],
          totalBalance: INITIAL_BALANCE,
          totalUsdValue: INITIAL_BALANCE * SOL_PRICE,
          tradeHistory: [],
          balanceChanges: [],
          copyTradeHistory: [],
        };
    localStorage.setItem(allUsersKey, JSON.stringify(allUsers));
  }

  return allUsers[email];
}

// API 方法

export const api = {
  // 获取用户钱包列表
  getWallets(): Promise<Wallet[]> {
    return new Promise((resolve) => {
      const email = getCurrentEmail();
      if (!email) {
        resolve([]);
        return;
      }
      const user = getUserByEmail(email);
      resolve(user.wallets);
    });
  },

  // 获取总余额（USD）
  getTotalBalance(): Promise<number> {
    return new Promise((resolve) => {
      const email = getCurrentEmail();
      if (!email) {
        resolve(0);
        return;
      }
      const user = getUserByEmail(email);
      resolve(user.totalUsdValue);
    });
  },

  // 获取 SOL 余额（或当前网络的余额）
  getSolBalance(): Promise<number> {
    return new Promise((resolve) => {
      const email = getCurrentEmail();
      if (!email) {
        resolve(0);
        return;
      }
      const user = getUserByEmail(email);
      // 确保用户有余额，如果没有钱包或余额为0，初始化默认钱包
      if (!user.wallets || user.wallets.length === 0) {
        // 获取当前选择的网络
        const { getSelectedChain } = require('./chainStore');
        const currentChain = getSelectedChain();
        const defaultWallet: Wallet = {
          id: `wallet-${Date.now()}`,
          name: "Wallet1",
          address: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
          balance: INITIAL_BALANCE,
          usdValue: INITIAL_BALANCE * SOL_PRICE,
          chain: currentChain,
        };
        user.wallets = [defaultWallet];
        user.totalBalance = INITIAL_BALANCE;
        user.totalUsdValue = INITIAL_BALANCE * SOL_PRICE;
        const allUsersKey = "gmgn_all_users";
        const allUsers: Record<string, User> = JSON.parse(localStorage.getItem(allUsersKey) || "{}");
        allUsers[email] = user;
        localStorage.setItem(allUsersKey, JSON.stringify(allUsers));
        resolve(INITIAL_BALANCE);
        return;
      }
      
      // 获取当前选择的网络
      const { getSelectedChain } = require('./chainStore');
      const currentChain = getSelectedChain();
      
      // 计算当前网络的余额
      const chainWallets = user.wallets.filter((w) => w.chain === currentChain);
      const totalSol = chainWallets.length > 0
        ? chainWallets.reduce((sum, w) => sum + w.balance, 0)
        : user.wallets.reduce((sum, w) => sum + w.balance, 0);
      
      // 如果当前网络没有钱包或余额为0，创建默认钱包
      if (chainWallets.length === 0 || totalSol === 0) {
        const defaultWallet: Wallet = {
          id: `wallet-${Date.now()}`,
          name: `Wallet1 (${currentChain})`,
          address: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
          balance: INITIAL_BALANCE,
          usdValue: INITIAL_BALANCE * SOL_PRICE,
          chain: currentChain,
        };
        user.wallets.push(defaultWallet);
        user.totalBalance = user.wallets.reduce((sum, w) => sum + w.balance, 0);
        user.totalUsdValue = user.wallets.reduce((sum, w) => sum + w.usdValue, 0);
        const allUsersKey = "gmgn_all_users";
        const allUsers: Record<string, User> = JSON.parse(localStorage.getItem(allUsersKey) || "{}");
        allUsers[email] = user;
        localStorage.setItem(allUsersKey, JSON.stringify(allUsers));
        resolve(INITIAL_BALANCE);
        return;
      }
      
      resolve(totalSol);
    });
  },

  // 创建钱包
  createWallet(name: string, address: string, chain: Chain = "SOL"): Promise<Wallet> {
    return new Promise((resolve) => {
      const email = getCurrentEmail();
      if (!email) {
        throw new Error("Not logged in");
      }

      const allUsersKey = "gmgn_all_users";
      const allUsers: Record<string, User> = JSON.parse(localStorage.getItem(allUsersKey) || "{}");
      const user = allUsers[email];

      const newWallet: Wallet = {
        id: `wallet-${Date.now()}`,
        name,
        address,
        balance: 0,
        usdValue: 0,
        chain,
      };

      user.wallets.push(newWallet);
      allUsers[email] = user;
      localStorage.setItem(allUsersKey, JSON.stringify(allUsers));

      resolve(newWallet);
    });
  },

  // 获取 CopyTrade 配置列表
  getCopyTrades(): Promise<CopyTradeConfig[]> {
    return new Promise((resolve) => {
      const email = getCurrentEmail();
      if (!email) {
        resolve([]);
        return;
      }
      const user = getUserByEmail(email);
      resolve(user.copyTrades);
    });
  },

  // 创建 CopyTrade 配置
  createCopyTrade(config: Omit<CopyTradeConfig, "id" | "createdAt">): Promise<CopyTradeConfig> {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined") {
        reject(new Error("Not in browser environment"));
        return;
      }

      try {
        const email = getCurrentEmail();
        if (!email) {
          reject(new Error("Not logged in. Please log in first."));
          return;
        }

        const allUsersKey = "gmgn_all_users";
        let allUsers: Record<string, User> = {};
        
        try {
          const stored = localStorage.getItem(allUsersKey);
          if (stored) {
            allUsers = JSON.parse(stored);
          }
        } catch (parseError) {
          console.error("Failed to parse stored users:", parseError);
          allUsers = {};
        }

        // 确保用户存在
        if (!allUsers[email]) {
          const defaultWallet: Wallet = {
            id: `wallet-${Date.now()}`,
            name: "Wallet1",
            address: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
            balance: INITIAL_BALANCE,
            usdValue: INITIAL_BALANCE * SOL_PRICE,
            chain: "SOL",
          };

          allUsers[email] = {
            email,
            wallets: [defaultWallet],
            copyTrades: [],
            totalBalance: INITIAL_BALANCE,
            totalUsdValue: INITIAL_BALANCE * SOL_PRICE,
            tradeHistory: [],
            balanceChanges: [],
            copyTradeHistory: [],
          };
        }

        const user = allUsers[email];

        // 确保数组存在
        if (!user.copyTrades) user.copyTrades = [];
        if (!user.balanceChanges) user.balanceChanges = [];
        if (!user.copyTradeHistory) user.copyTradeHistory = [];

        const newConfig: CopyTradeConfig = {
          ...config,
          id: `copytrade-${Date.now()}`,
          createdAt: Date.now(),
          status: config.enabled ? "running" : "stopped",
        };

        user.copyTrades.push(newConfig);
        
        // 创建 CopyTrade 历史记录
        const copyTradeHistory: CopyTradeHistory = {
          id: `ct-history-${newConfig.id}`,
          copyTradeId: newConfig.id,
          copyTradeName: config.sourceName || config.sourceAddress.slice(0, 8) + "...",
          startTime: Date.now(),
          totalSpent: 0,
          totalFees: 0,
          totalTrades: 0,
          status: newConfig.enabled ? "running" : "stopped",
        };
        user.copyTradeHistory.push(copyTradeHistory);
        
        allUsers[email] = user;
        
        try {
          localStorage.setItem(allUsersKey, JSON.stringify(allUsers));
          resolve(newConfig);
        } catch (storageError) {
          console.error("Failed to save to localStorage:", storageError);
          reject(new Error("Failed to save copy trade configuration"));
        }
      } catch (error) {
        console.error("Error in createCopyTrade:", error);
        reject(error instanceof Error ? error : new Error("Unknown error occurred"));
      }
    });
  },

  // 更新 CopyTrade 配置
  updateCopyTrade(id: string, updates: Partial<CopyTradeConfig>): Promise<CopyTradeConfig> {
    return new Promise((resolve, reject) => {
      const email = getCurrentEmail();
      if (!email) {
        reject(new Error("Not logged in"));
        return;
      }

      const allUsersKey = "gmgn_all_users";
      const allUsers: Record<string, User> = JSON.parse(localStorage.getItem(allUsersKey) || "{}");
      const user = allUsers[email];

      // 确保数组存在
      if (!user.copyTradeHistory) user.copyTradeHistory = [];

      const index = user.copyTrades.findIndex((ct) => ct.id === id);
      if (index === -1) {
        reject(new Error("CopyTrade not found"));
        return;
      }

      user.copyTrades[index] = { ...user.copyTrades[index], ...updates };
      
      // 如果状态更新为 stopped，更新历史记录的结束时间
      if (updates.status === "stopped" || (updates.enabled === false && user.copyTrades[index].status !== "stopped")) {
        const historyIndex = user.copyTradeHistory.findIndex((h) => h.copyTradeId === id);
        if (historyIndex !== -1) {
          user.copyTradeHistory[historyIndex].endTime = Date.now();
          user.copyTradeHistory[historyIndex].status = "stopped";
        }
        user.copyTrades[index].status = "stopped";
      } else if (updates.status === "paused") {
        const historyIndex = user.copyTradeHistory.findIndex((h) => h.copyTradeId === id);
        if (historyIndex !== -1) {
          user.copyTradeHistory[historyIndex].status = "paused";
        }
      } else if (updates.status === "running") {
        const historyIndex = user.copyTradeHistory.findIndex((h) => h.copyTradeId === id);
        if (historyIndex !== -1) {
          user.copyTradeHistory[historyIndex].status = "running";
        }
      }
      
      allUsers[email] = user;
      localStorage.setItem(allUsersKey, JSON.stringify(allUsers));

      resolve(user.copyTrades[index]);
    });
  },

  // 删除 CopyTrade 配置
  deleteCopyTrade(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const email = getCurrentEmail();
      if (!email) {
        reject(new Error("Not logged in"));
        return;
      }

      const allUsersKey = "gmgn_all_users";
      const allUsers: Record<string, User> = JSON.parse(localStorage.getItem(allUsersKey) || "{}");
      const user = allUsers[email];

      const index = user.copyTrades.findIndex((ct) => ct.id === id);
      if (index === -1) {
        reject(new Error("CopyTrade not found"));
        return;
      }

      user.copyTrades.splice(index, 1);
      allUsers[email] = user;
      localStorage.setItem(allUsersKey, JSON.stringify(allUsers));

      resolve();
    });
  },

  // 设置用户邮箱（登录时调用）
  setCurrentEmail(email: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_email", email);
    }
  },

  // 清除用户邮箱（登出时调用）
  clearCurrentEmail() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_email");
    }
  },

  // 计算 CopyTrade 手续费
  calculateCopyTradeFee(amount: number): number {
    const fee = Math.max(amount * COPYTRADE_FEE_RATE, COPYTRADE_MIN_FEE);
    return fee;
  },

  // 记录余额变动
  recordBalanceChange(
    walletId: string,
    type: WalletBalanceChange["type"],
    amount: number,
    description: string,
    copyTradeId?: string,
    tradeId?: string
  ): Promise<WalletBalanceChange> {
    return new Promise((resolve, reject) => {
      try {
        const email = getCurrentEmail();
        if (!email) {
          reject(new Error("Not logged in"));
          return;
        }

        const allUsersKey = "gmgn_all_users";
        const allUsers: Record<string, User> = JSON.parse(localStorage.getItem(allUsersKey) || "{}");
        const user = allUsers[email];

        if (!user) {
          reject(new Error("User not found"));
          return;
        }

        const wallet = user.wallets.find((w) => w.id === walletId);
        if (!wallet) {
          reject(new Error("Wallet not found"));
          return;
        }

        const balanceBefore = wallet.balance;
        wallet.balance += amount;
        wallet.usdValue = wallet.balance * SOL_PRICE;
        const balanceAfter = wallet.balance;

        // 更新总余额
        user.totalBalance = user.wallets.reduce((sum, w) => sum + w.balance, 0);
        user.totalUsdValue = user.wallets.reduce((sum, w) => sum + w.usdValue, 0);

        // 创建余额变动记录
        if (!user.balanceChanges) {
          user.balanceChanges = [];
        }

        const change: WalletBalanceChange = {
          id: `change-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          walletId,
          type,
          amount,
          balanceBefore,
          balanceAfter,
          timestamp: Date.now(),
          description,
          copyTradeId,
          tradeId,
        };

        user.balanceChanges.push(change);

        // 保存更新
        allUsers[email] = user;
        localStorage.setItem(allUsersKey, JSON.stringify(allUsers));

        resolve(change);
      } catch (error) {
        console.error("Error in recordBalanceChange:", error);
        reject(error instanceof Error ? error : new Error("Unknown error occurred"));
      }
    });
  },

  // 执行 CopyTrade 交易（模拟，包含手续费）
  executeCopyTrade(copyTradeId: string, type: "buy" | "sell", token: string, amount: number, price: number): Promise<TradeHistory> {
    return new Promise(async (resolve, reject) => {
      try {
        const email = getCurrentEmail();
        if (!email) {
          reject(new Error("Not logged in"));
          return;
        }

        const allUsersKey = "gmgn_all_users";
        const allUsers: Record<string, User> = JSON.parse(localStorage.getItem(allUsersKey) || "{}");
        const user = allUsers[email];

        if (!user) {
          reject(new Error("User not found"));
          return;
        }

        // 确保数组存在
        if (!user.balanceChanges) user.balanceChanges = [];
        if (!user.copyTradeHistory) user.copyTradeHistory = [];

        const copyTrade = user.copyTrades.find((ct) => ct.id === copyTradeId);
        if (!copyTrade) {
          reject(new Error("CopyTrade not found"));
          return;
        }

        const wallet = user.wallets[0]; // 使用第一个钱包
        if (!wallet) {
          reject(new Error("No wallet found"));
          return;
        }

        // 计算手续费
        const tradeAmountSol = amount * price / SOL_PRICE; // 转换为 SOL
        const fee = api.calculateCopyTradeFee(tradeAmountSol);
        const gasFee = COPYTRADE_GAS_FEE;
        const totalFee = fee + gasFee;

        // 如果是买入，检查余额并扣款（包含手续费）
        if (type === "buy") {
          const totalCostSol = tradeAmountSol + totalFee;

          // 检查钱包余额
          if (wallet.balance < totalCostSol) {
            reject(new Error("Insufficient balance"));
            return;
          }

          // 扣除交易金额
          await api.recordBalanceChange(
            wallet.id,
            "copytrade",
            -tradeAmountSol,
            `CopyTrade Buy: ${token} (${amount} @ $${price})`,
            copyTradeId
          );

          // 扣除手续费
          await api.recordBalanceChange(
            wallet.id,
            "fee",
            -fee,
            `CopyTrade Fee: ${token}`,
            copyTradeId
          );

          // 扣除 Gas 费用
          await api.recordBalanceChange(
            wallet.id,
            "fee",
            -gasFee,
            `CopyTrade Gas Fee: ${token}`,
            copyTradeId
          );

          // 更新 CopyTrade 的 bought 数量
          copyTrade.bought = (copyTrade.bought || 0) + amount;

          // 更新 CopyTrade 历史记录
          const history = user.copyTradeHistory.find((h) => h.copyTradeId === copyTradeId);
          if (history) {
            history.totalSpent += tradeAmountSol;
            history.totalFees += totalFee;
            history.totalTrades += 1;
          }
        } else if (type === "sell") {
          // 卖出时增加余额（扣除手续费）
          const revenueSol = tradeAmountSol - totalFee;

          // 增加交易收入
          await api.recordBalanceChange(
            wallet.id,
            "copytrade",
            revenueSol,
            `CopyTrade Sell: ${token} (${amount} @ $${price})`,
            copyTradeId
          );

          // 扣除手续费
          await api.recordBalanceChange(
            wallet.id,
            "fee",
            -fee,
            `CopyTrade Fee: ${token}`,
            copyTradeId
          );

          // 扣除 Gas 费用
          await api.recordBalanceChange(
            wallet.id,
            "fee",
            -gasFee,
            `CopyTrade Gas Fee: ${token}`,
            copyTradeId
          );

          // 更新 CopyTrade 的 sold 数量
          copyTrade.sold = (copyTrade.sold || 0) + amount;

          // 更新 CopyTrade 历史记录
          const history = user.copyTradeHistory.find((h) => h.copyTradeId === copyTradeId);
          if (history) {
            history.totalFees += totalFee;
            history.totalTrades += 1;
          }
        }

        // 创建交易历史记录
        const tradeHistory: TradeHistory = {
          id: `trade-${Date.now()}`,
          copyTradeId,
          type,
          token,
          amount,
          price,
          totalUsd: amount * price,
          timestamp: Date.now(),
          sourceAddress: copyTrade.sourceAddress,
          fee: api.calculateCopyTradeFee(tradeAmountSol),
          gasFee: COPYTRADE_GAS_FEE,
        };

        // 确保 tradeHistory 数组存在
        if (!user.tradeHistory) {
          user.tradeHistory = [];
        }

        user.tradeHistory.push(tradeHistory);

        // 保存更新
        allUsers[email] = user;
        localStorage.setItem(allUsersKey, JSON.stringify(allUsers));

        resolve(tradeHistory);
      } catch (error) {
        console.error("Error in executeCopyTrade:", error);
        reject(error instanceof Error ? error : new Error("Unknown error occurred"));
      }
    });
  },

  // 获取交易历史记录
  getTradeHistory(copyTradeId?: string): Promise<TradeHistory[]> {
    return new Promise((resolve) => {
      const email = getCurrentEmail();
      if (!email) {
        resolve([]);
        return;
      }

      const allUsersKey = "gmgn_all_users";
      const allUsers: Record<string, User> = JSON.parse(localStorage.getItem(allUsersKey) || "{}");
      const user = allUsers[email];

      if (!user || !user.tradeHistory) {
        resolve([]);
        return;
      }

      if (copyTradeId) {
        resolve(user.tradeHistory.filter((t) => t.copyTradeId === copyTradeId));
      } else {
        resolve(user.tradeHistory);
      }
    });
  },

  // 获取余额变动记录
  getBalanceChanges(walletId?: string): Promise<WalletBalanceChange[]> {
    return new Promise((resolve) => {
      const email = getCurrentEmail();
      if (!email) {
        resolve([]);
        return;
      }

      const allUsersKey = "gmgn_all_users";
      const allUsers: Record<string, User> = JSON.parse(localStorage.getItem(allUsersKey) || "{}");
      const user = allUsers[email];

      if (!user || !user.balanceChanges) {
        resolve([]);
        return;
      }

      if (walletId) {
        resolve(user.balanceChanges.filter((c) => c.walletId === walletId));
      } else {
        resolve(user.balanceChanges);
      }
    });
  },

  // 获取 CopyTrade 历史记录
  getCopyTradeHistory(): Promise<CopyTradeHistory[]> {
    return new Promise((resolve) => {
      const email = getCurrentEmail();
      if (!email) {
        resolve([]);
        return;
      }

      const allUsersKey = "gmgn_all_users";
      const allUsers: Record<string, User> = JSON.parse(localStorage.getItem(allUsersKey) || "{}");
      const user = allUsers[email];

      if (!user || !user.copyTradeHistory) {
        resolve([]);
        return;
      }

      resolve(user.copyTradeHistory);
    });
  },
};

