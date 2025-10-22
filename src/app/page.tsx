"use client";
// Arbitrage Bot Pro - Main Dashboard Component

import { useCoAgent, useCopilotAction } from "@copilotkit/react-core";
import { CopilotKitCSSProperties, CopilotSidebar } from "@copilotkit/react-ui";
import { useState, useEffect } from "react";
import { ArbitrageState as ArbitrageStateSchema } from "@/mastra/agents";
import { z } from "zod";
import { ArbitrageOpportunity, PriceData } from "@/mastra/tools";

type ArbitrageState = z.infer<typeof ArbitrageStateSchema>;

export default function ArbitrageBotPage() {
  // Theme configuration - emerald green for profit/success theme
  const [themeColor] = useState("#10b981");

  return (
    <main style={{ "--copilot-kit-primary-color": themeColor } as CopilotKitCSSProperties}>
      <ArbitrageDashboard themeColor={themeColor} />
      <CopilotSidebar
        clickOutsideToClose={false}
        defaultOpen={true}
        labels={{
          title: "🚀 Arbitrage Bot Assistant",
          initial: `🎯 **Welcome to Arbitrage Bot Pro!**

I'm your AI-powered arbitrage assistant. I monitor DEXs and CEXs 24/7 to find profitable trading opportunities.

**Quick Commands:**
- 💰 "Find arbitrage opportunities for ETH and BTC"
- 📊 "Monitor DEX prices for SOL"
- 🔄 "Scan all exchanges for the best opportunities"
- 💹 "Show my portfolio performance"
- 🚀 "Execute trade simulation"
- 📢 "Broadcast top opportunities"

**What I Do:**
✅ Real-time price monitoring across 8+ exchanges
✅ Instant arbitrage opportunity detection
✅ Risk-adjusted profit calculations
✅ Automated trade execution (with safeguards)
✅ Portfolio tracking & analytics
✅ Community opportunity sharing

**Try saying:**
- "Start monitoring ETH, BTC, and SOL"
- "What are the best arbitrage opportunities right now?"
- "Show me the most profitable trades today"`
        }}
      />
    </main>
  );
}

function ArbitrageDashboard({ themeColor }: { themeColor: string }) {
  // Shared State with Master Arbitrage Agent
  const { state, setState } = useCoAgent<ArbitrageState>({
    name: "masterArbitrageAgent",
    initialState: {
      monitoredTokens: ['ETH', 'BTC', 'SOL', 'USDC', 'BNB'],
      activeOpportunities: [],
      totalProfitToday: 0,
      tradesExecutedToday: 0,
      isMonitoring: false,
      lastUpdateTimestamp: Date.now(),
      // Virtual Trading Account
      virtualBalance: 10000,
      isVirtualTradingActive: false,
      virtualTrades: [],
      totalVirtualProfit: 0,
    },
  });

  const [livePrices, setLivePrices] = useState<PriceData[]>([]);
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);

  // Simulate real-time updates every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (state.isMonitoring) {
        setState({
          ...state,
          lastUpdateTimestamp: Date.now(),
        });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [state, setState]);

  // Generative UI: DEX Price Fetch
  useCopilotAction({
    name: "fetchDexPricesTool",
    description: "Fetches prices from DEXs",
    available: "frontend",
    parameters: [
      { name: "tokens", type: "string[]", required: true },
    ],
    render: ({ args, result, status }) => {
      if (status === "complete" && result) {
        setTimeout(() => setLivePrices(prev => [...result, ...prev].slice(0, 20)), 0);
      }
      return <PriceUpdateCard
        type="DEX"
        tokens={args.tokens}
        prices={result}
        status={status}
        themeColor={themeColor}
      />;
    },
  });

  // Generative UI: CEX Price Fetch
  useCopilotAction({
    name: "fetchCexPricesTool",
    description: "Fetches prices from CEXs",
    available: "frontend",
    parameters: [
      { name: "tokens", type: "string[]", required: true },
    ],
    render: ({ args, result, status }) => {
      if (status === "complete" && result) {
        setTimeout(() => setLivePrices(prev => [...result, ...prev].slice(0, 20)), 0);
      }
      return <PriceUpdateCard
        type="CEX"
        tokens={args.tokens}
        prices={result}
        status={status}
        themeColor={themeColor}
      />;
    },
  });

  // Generative UI: Arbitrage Detection
  useCopilotAction({
    name: "detectArbitrageTool",
    description: "Detects arbitrage opportunities",
    available: "frontend",
    parameters: [
      { name: "minProfitPercent", type: "number", required: false },
    ],
    render: ({ result, status }) => {
      if (status === "complete" && result) {
        setTimeout(() => {
          setOpportunities(result.opportunities || []);
          setState({
            ...state,
            activeOpportunities: result.opportunities || [],
          });
        }, 0);
      }
      return <ArbitrageDetectionCard
        result={result}
        status={status}
        themeColor={themeColor}
      />;
    },
  });

  // Generative UI: Trade Execution
  useCopilotAction({
    name: "executeTradeTool",
    description: "Executes an arbitrage trade",
    available: "frontend",
    parameters: [
      { name: "opportunity", type: "object", required: true },
      { name: "amount", type: "number", required: true },
      { name: "dryRun", type: "boolean", required: false },
    ],
    render: ({ args, result, status }) => {
      return <TradeExecutionCard
        opportunity={args.opportunity}
        amount={args.amount}
        result={result}
        status={status}
        themeColor={themeColor}
      />;
    },
  });

  // Generative UI: Portfolio Tracking
  useCopilotAction({
    name: "trackPortfolioTool",
    description: "Shows portfolio statistics",
    available: "frontend",
    parameters: [],
    render: ({ result, status }) => {
      return <PortfolioCard
        stats={result}
        status={status}
        themeColor={themeColor}
      />;
    },
  });

  // Generative UI: Market Monitor
  useCopilotAction({
    name: "monitorMarketTool",
    description: "Monitors market trends",
    available: "frontend",
    parameters: [
      { name: "tokens", type: "string[]", required: true },
    ],
    render: ({ result, status }) => {
      return <MarketMonitorCard
        data={result}
        status={status}
        themeColor={themeColor}
      />;
    },
  });

  // Generative UI: Start Virtual Trading
  useCopilotAction({
    name: "startVirtualTradingTool",
    description: "Activates virtual trading with $10,000 balance",
    available: "frontend",
    parameters: [
      { name: "initialBalance", type: "number", required: false },
      { name: "riskLevel", type: "string", required: false },
    ],
    render: ({ args, result, status }) => {
      if (status === "complete" && result) {
        setState({
          ...state,
          virtualBalance: result.balance,
          isVirtualTradingActive: true,
        });
      }
      return <VirtualTradingActivationCard result={result} status={status} />;
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                <span className="text-xl">💰</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  Arbitrage Bot Pro
                </h1>
                <p className="text-xs text-gray-400">Real-time DEX & CEX Arbitrage</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-emerald-400">
                  ${state.totalProfitToday.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">Profit Today</div>
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-emerald-500 flex items-center justify-center relative">
                {state.isMonitoring && (
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-500 animate-ping"></div>
                )}
                <span className="text-xl">{state.isMonitoring ? '🟢' : '⚪'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Live Opportunities */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Virtual Trading Account Banner */}
            {state.isVirtualTradingActive && (
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 border border-emerald-400">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-emerald-100 mb-1">💼 Virtual Trading Account</div>
                    <div className="text-3xl font-bold text-white">
                      ${state.virtualBalance.toLocaleString()}
                    </div>
                    <div className="text-xs text-emerald-100 mt-1">
                      Profit/Loss: <span className={state.totalVirtualProfit >= 0 ? 'text-white' : 'text-red-200'}>
                        ${state.totalVirtualProfit.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-emerald-100">Virtual Trades</div>
                    <div className="text-2xl font-bold text-white">{state.virtualTrades.length}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-4">
              <StatCard
                icon="📊"
                label="Monitored Tokens"
                value={state.monitoredTokens.length}
                color="from-blue-500 to-cyan-500"
              />
              <StatCard
                icon="🎯"
                label="Active Opportunities"
                value={state.activeOpportunities.length}
                color="from-emerald-500 to-teal-500"
              />
              <StatCard
                icon="🔄"
                label="Trades Today"
                value={state.tradesExecutedToday}
                color="from-purple-500 to-pink-500"
              />
            </div>

            {/* Live Opportunities Feed */}
            <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  Live Arbitrage Opportunities
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  Real-time
                </div>
              </div>
              
              {opportunities.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {opportunities.slice(0, 5).map((opp, idx) => (
                    <OpportunityCard key={idx} opportunity={opp} rank={idx + 1} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <span className="text-4xl mb-2 block">🔍</span>
                  <p>Scanning for opportunities...</p>
                  <p className="text-sm mt-1">Ask the agent to detect arbitrage opportunities!</p>
                </div>
              )}
            </div>

            {/* Monitored Tokens */}
            <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">🪙</span>
                Monitored Tokens
              </h2>
              <div className="flex flex-wrap gap-2">
                {state.monitoredTokens.map((token, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-gray-700 to-gray-600 
                    border border-gray-500 flex items-center gap-2 hover:scale-105 transition-transform"
                  >
                    <span className="font-bold">{token}</span>
                    <span className="text-xs text-gray-400">Live</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Live Prices Feed */}
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">💹</span>
                Live Price Feed
              </h2>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {livePrices.length > 0 ? (
                  livePrices.map((price, idx) => (
                    <PriceTicker key={idx} price={price} />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <span className="text-3xl block mb-2">📡</span>
                    <p className="text-sm">Waiting for price data...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== UI COMPONENTS ====================
// Component: Stat Card
function StatCard({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) {
    return (
    <div className={`bg-gradient-to-br ${color} p-4 rounded-xl shadow-lg`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="text-sm text-white/80">{label}</div>
        </div>
  );
}

// Component: Opportunity Card
function OpportunityCard({ opportunity, rank }: { opportunity: ArbitrageOpportunity; rank: number }) {
  const confidenceColors = {
    high: 'from-emerald-500 to-green-500',
    medium: 'from-yellow-500 to-orange-500',
    low: 'from-gray-500 to-gray-600',
  };

  return (
    <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600 hover:border-emerald-500 transition-all hover:scale-[1.02]">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gray-400">#{rank}</span>
          <div>
            <div className="font-bold text-lg">{opportunity.symbol}</div>
            <div className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${confidenceColors[opportunity.confidence]} text-white inline-block`}>
              {opportunity.confidence.toUpperCase()}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-emerald-400">+{opportunity.profitPercent}%</div>
          <div className="text-xs text-gray-400">${opportunity.estimatedProfit.toLocaleString()}</div>
        </div>
            </div>
      <div className="grid grid-cols-2 gap-2 text-sm mt-3 pt-3 border-t border-gray-600">
            <div>
          <div className="text-gray-400 text-xs">Buy at</div>
          <div className="font-semibold text-blue-400">{opportunity.buyExchange}</div>
          <div className="text-xs text-gray-500">${opportunity.buyPrice}</div>
            </div>
            <div>
          <div className="text-gray-400 text-xs">Sell at</div>
          <div className="font-semibold text-emerald-400">{opportunity.sellExchange}</div>
          <div className="text-xs text-gray-500">${opportunity.sellPrice}</div>
        </div>
      </div>
    </div>
  );
}

// Component: Price Ticker
function PriceTicker({ price }: { price: PriceData }) {
  const typeColor = price.type === 'DEX' ? 'text-purple-400' : 'text-blue-400';
  
  return (
    <div className="bg-gray-700/30 rounded-lg p-3 flex items-center justify-between hover:bg-gray-700/50 transition-colors">
      <div className="flex items-center gap-2">
        <span className={`text-xs font-bold ${typeColor}`}>{price.type}</span>
        <span className="font-bold">{price.symbol}</span>
        <span className="text-xs text-gray-400">{price.exchange}</span>
      </div>
      <div className="text-right">
        <div className="font-bold">${price.price.toLocaleString()}</div>
        <div className="text-xs text-gray-400">{new Date(price.timestamp).toLocaleTimeString()}</div>
      </div>
    </div>
  );
}

// Component: Price Update Card (Generative UI)
function PriceUpdateCard({ type, tokens, prices, status, themeColor }: any) {
  if (status !== "complete") {
    return (
      <div className="rounded-xl bg-gray-800 border border-gray-700 p-4 max-w-md">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-500 border-t-transparent"></div>
          <span>Fetching {type} prices for {tokens?.join(', ')}...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500 p-4 max-w-md">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">✅</span>
        <span className="font-bold">{type} Prices Updated</span>
      </div>
      <div className="text-sm text-gray-300">
        Fetched {prices?.length || 0} prices from {type}s
      </div>
    </div>
  );
}

// Component: Arbitrage Detection Card (Generative UI)
function ArbitrageDetectionCard({ result, status, themeColor }: any) {
  if (status !== "complete") {
    return (
      <div className="rounded-xl bg-gray-800 border border-gray-700 p-4">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-500 border-t-transparent"></div>
          <span>🔍 Scanning for arbitrage opportunities...</span>
        </div>
      </div>
    );
  }

  const topOpp = result?.topOpportunity;

  return (
    <div className="rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500 p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">🎯</span>
        <span className="font-bold">Found {result?.totalOpportunities || 0} Opportunities!</span>
      </div>
      {topOpp && (
        <div className="mt-3 pt-3 border-t border-yellow-500/30">
          <div className="text-sm">
            <span className="text-gray-300">Top: </span>
            <span className="font-bold text-emerald-400">{topOpp.symbol} +{topOpp.profitPercent}%</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Component: Trade Execution Card (Generative UI)
function TradeExecutionCard({ opportunity, amount, result, status, themeColor }: any) {
  if (status !== "complete") {
    return (
      <div className="rounded-xl bg-gray-800 border border-gray-700 p-4">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
          <span>🔄 Executing trade...</span>
        </div>
      </div>
    );
  }

  const isSuccess = result?.success;

  return (
    <div className={`rounded-xl ${isSuccess ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-emerald-500' : 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500'} border p-4`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{isSuccess ? '✅' : '❌'}</span>
        <span className="font-bold">Trade {isSuccess ? 'Successful' : 'Failed'}</span>
      </div>
      <div className="text-sm space-y-1">
        <div>Trade ID: <span className="text-gray-400">{result?.tradeId}</span></div>
        {isSuccess && (
          <div className="text-emerald-400 font-bold">Profit: ${result?.actualProfit}</div>
        )}
        <div className="text-xs text-gray-400">{result?.message}</div>
      </div>
    </div>
  );
}

// Component: Portfolio Card (Generative UI)
function PortfolioCard({ stats, status, themeColor }: any) {
  if (status !== "complete") {
    return (
      <div className="rounded-xl bg-gray-800 border border-gray-700 p-4">
        <div className="animate-pulse">Loading portfolio...</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">💼</span>
        <span className="font-bold">Portfolio Performance</span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-gray-400 text-xs">Total Trades</div>
          <div className="text-xl font-bold">{stats?.totalTrades}</div>
        </div>
        <div>
          <div className="text-gray-400 text-xs">Success Rate</div>
          <div className="text-xl font-bold text-emerald-400">{stats?.successRate}%</div>
        </div>
        <div>
          <div className="text-gray-400 text-xs">Total Profit</div>
          <div className="text-xl font-bold text-emerald-400">${stats?.totalProfit}</div>
        </div>
        <div>
          <div className="text-gray-400 text-xs">Avg Profit</div>
          <div className="text-xl font-bold">${stats?.averageProfit}</div>
        </div>
      </div>
    </div>
  );
}

// Component: Market Monitor Card (Generative UI)
function MarketMonitorCard({ data, status, themeColor }: any) {
  if (status !== "complete") {
    return (
      <div className="rounded-xl bg-gray-800 border border-gray-700 p-4">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-cyan-500 border-t-transparent"></div>
          <span>📊 Monitoring market...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500 p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">📊</span>
        <span className="font-bold">Market Analysis Complete</span>
      </div>
      <div className="text-sm space-y-1">
        <div>Prices Checked: <span className="font-bold">{data?.summary?.totalPricesChecked}</span></div>
        <div>Most Active: <span className="font-bold text-blue-400">{data?.summary?.mostActiveExchange}</span></div>
        <div>Highest Volatility: <span className="font-bold text-yellow-400">{data?.summary?.highestVolatility}</span></div>
      </div>
    </div>
  );
}

// Component: Virtual Trading Activation Card (Generative UI)
function VirtualTradingActivationCard({ result, status }: any) {
  if (status !== "complete") {
    return (
      <div className="rounded-xl bg-gray-800 border border-gray-700 p-4">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-500 border-t-transparent"></div>
          <span>🎉 Activating your virtual trading account...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500 p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">🎉</span>
        <span className="font-bold text-lg">Virtual Trading Activated!</span>
      </div>
      <div className="bg-gray-900/50 rounded-lg p-4 mb-3">
        <div className="text-center mb-2">
          <div className="text-sm text-gray-400">Starting Balance</div>
          <div className="text-3xl font-bold text-emerald-400">${result?.balance?.toLocaleString()}</div>
        </div>
        <div className="text-xs text-center text-gray-400">
          Risk Level: <span className="text-emerald-300 font-semibold">{result?.riskLevel}</span>
        </div>
      </div>
      <div className="text-sm text-gray-300 mb-3">{result?.message}</div>
      {result?.tips && result.tips.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs font-semibold text-emerald-400 mb-2">💡 Trading Tips:</div>
          {result.tips.map((tip: string, idx: number) => (
            <div key={idx} className="text-xs text-gray-300 flex items-start gap-2">
              <span className="text-emerald-500">•</span>
              <span>{tip.replace(/^[💡📊⚠️🎯📈]\s*/, '')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
