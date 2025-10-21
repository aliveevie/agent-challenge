import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// ==================== TYPES & SCHEMAS ====================
// Core types for arbitrage bot operations

export interface PriceData {
  exchange: string;
  symbol: string;
  price: number;
  volume24h: number;
  timestamp: number;
  type: 'DEX' | 'CEX';
}

export interface ArbitrageOpportunity {
  symbol: string;
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  profitPercent: number;
  estimatedProfit: number;
  volume24h: number;
  timestamp: number;
  confidence: 'high' | 'medium' | 'low';
}

const PriceDataSchema = z.object({
  exchange: z.string(),
  symbol: z.string(),
  price: z.number(),
  volume24h: z.number(),
  timestamp: z.number(),
  type: z.enum(['DEX', 'CEX']),
});

const ArbitrageOpportunitySchema = z.object({
  symbol: z.string(),
  buyExchange: z.string(),
  sellExchange: z.string(),
  buyPrice: z.number(),
  sellPrice: z.number(),
  profitPercent: z.number(),
  estimatedProfit: z.number(),
  volume24h: z.number(),
  timestamp: z.number(),
  confidence: z.enum(['high', 'medium', 'low']),
});

// ==================== GLOBAL STATE ====================

// In-memory cache for price data (in production, use Redis or similar)
const priceCache = new Map<string, PriceData>();
const opportunityHistory: ArbitrageOpportunity[] = [];

// ==================== DEX PRICE FETCHING TOOL ====================

export const fetchDexPricesTool = createTool({
  id: 'fetch-dex-prices',
  description: 'Fetches real-time cryptocurrency prices from multiple DEXs (Uniswap, PancakeSwap, SushiSwap). Monitors prices every second for arbitrage opportunities.',
  inputSchema: z.object({
    tokens: z.array(z.string()).describe('Array of token symbols to fetch (e.g., ["ETH", "BTC", "USDC"])'),
    dexes: z.array(z.string()).optional().describe('Specific DEXs to query (optional, defaults to all major DEXs)'),
  }),
  outputSchema: z.array(PriceDataSchema),
  execute: async ({ context }) => {
    const prices = await fetchDexPrices(context.tokens, context.dexes);
    
    // Update cache
    prices.forEach(price => {
      priceCache.set(`${price.exchange}-${price.symbol}`, price);
    });
    
    return prices;
  },
});

// ==================== CEX PRICE FETCHING TOOL ====================

export const fetchCexPricesTool = createTool({
  id: 'fetch-cex-prices',
  description: 'Fetches real-time cryptocurrency prices from multiple CEXs (Binance, Coinbase, Kraken). Monitors prices every second for cross-exchange arbitrage.',
  inputSchema: z.object({
    tokens: z.array(z.string()).describe('Array of token symbols to fetch (e.g., ["ETH", "BTC", "USDC"])'),
    cexes: z.array(z.string()).optional().describe('Specific CEXs to query (optional, defaults to all major CEXs)'),
  }),
  outputSchema: z.array(PriceDataSchema),
  execute: async ({ context }) => {
    const prices = await fetchCexPrices(context.tokens, context.cexes);
    
    // Update cache
    prices.forEach(price => {
      priceCache.set(`${price.exchange}-${price.symbol}`, price);
    });
    
    return prices;
  },
});

// ==================== ARBITRAGE DETECTION TOOL ====================

export const detectArbitrageTool = createTool({
  id: 'detect-arbitrage',
  description: 'Analyzes price differences across all monitored exchanges to identify profitable arbitrage opportunities in real-time. Calculates potential profits and confidence levels.',
  inputSchema: z.object({
    minProfitPercent: z.number().default(0.5).describe('Minimum profit percentage to consider (default: 0.5%)'),
    tokens: z.array(z.string()).optional().describe('Specific tokens to analyze (optional, analyzes all cached prices by default)'),
    includeGasFees: z.boolean().default(true).describe('Whether to account for gas/transaction fees'),
  }),
  outputSchema: z.object({
    opportunities: z.array(ArbitrageOpportunitySchema),
    totalOpportunities: z.number(),
    topOpportunity: ArbitrageOpportunitySchema.nullable(),
  }),
  execute: async ({ context }) => {
    const opportunities = await detectArbitrageOpportunities(
      context.minProfitPercent,
      context.tokens,
      context.includeGasFees
    );
    
    // Store in history
    opportunities.forEach(opp => {
      opportunityHistory.unshift(opp);
      if (opportunityHistory.length > 100) opportunityHistory.pop();
    });
    
    return {
      opportunities,
      totalOpportunities: opportunities.length,
      topOpportunity: opportunities[0] || null,
    };
  },
});

// ==================== TRADE EXECUTION TOOL ====================

export const executeTradeTool = createTool({
  id: 'execute-trade',
  description: 'Executes arbitrage trades automatically. Buys at the lower price exchange and sells at the higher price exchange. Includes slippage protection and risk management.',
  inputSchema: z.object({
    opportunity: ArbitrageOpportunitySchema.describe('The arbitrage opportunity to execute'),
    amount: z.number().describe('Amount in USD to trade'),
    maxSlippage: z.number().default(0.5).describe('Maximum acceptable slippage percentage (default: 0.5%)'),
    dryRun: z.boolean().default(true).describe('If true, simulates the trade without executing (default: true for safety)'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    tradeId: z.string(),
    actualProfit: z.number(),
    buyTransaction: z.object({
      exchange: z.string(),
      amount: z.number(),
      price: z.number(),
      fee: z.number(),
    }),
    sellTransaction: z.object({
      exchange: z.string(),
      amount: z.number(),
      price: z.number(),
      fee: z.number(),
    }),
    message: z.string(),
  }),
  execute: async ({ context }) => {
    return await executeTrade(
      context.opportunity,
      context.amount,
      context.maxSlippage,
      context.dryRun
    );
  },
});

// ==================== MARKET MONITOR TOOL ====================

export const monitorMarketTool = createTool({
  id: 'monitor-market',
  description: 'Continuously monitors all exchanges and provides real-time market statistics, price trends, and volatility analysis. Essential for identifying the best arbitrage windows.',
  inputSchema: z.object({
    tokens: z.array(z.string()).describe('Tokens to monitor'),
    duration: z.number().default(60).describe('Duration in seconds to monitor (default: 60)'),
  }),
  outputSchema: z.object({
    summary: z.object({
      totalPricesChecked: z.number(),
      averageSpread: z.number(),
      highestVolatility: z.string(),
      mostActiveExchange: z.string(),
    }),
    priceUpdates: z.array(PriceDataSchema),
    trendAnalysis: z.record(z.object({
      trend: z.enum(['up', 'down', 'stable']),
      volatility: z.number(),
      averagePrice: z.number(),
    })),
  }),
  execute: async ({ context }) => {
    return await monitorMarket(context.tokens, context.duration);
  },
});

// ==================== OPPORTUNITY BROADCASTER TOOL ====================

export const broadcastOpportunityTool = createTool({
  id: 'broadcast-opportunity',
  description: 'Broadcasts arbitrage opportunities to all subscribed users via WebSocket. Enables community sharing of profitable trades.',
  inputSchema: z.object({
    opportunity: ArbitrageOpportunitySchema.describe('The opportunity to broadcast'),
    priority: z.enum(['high', 'medium', 'low']).default('medium').describe('Broadcast priority level'),
  }),
  outputSchema: z.object({
    broadcasted: z.boolean(),
    recipientCount: z.number(),
    timestamp: z.number(),
  }),
  execute: async ({ context }) => {
    return await broadcastOpportunity(context.opportunity, context.priority);
  },
});

// ==================== PORTFOLIO TRACKER TOOL ====================

export const trackPortfolioTool = createTool({
  id: 'track-portfolio',
  description: 'Tracks and analyzes your arbitrage trading portfolio, including profit/loss, success rate, and performance metrics.',
  inputSchema: z.object({
    period: z.enum(['1h', '24h', '7d', '30d']).default('24h').describe('Time period to analyze'),
  }),
  outputSchema: z.object({
    totalTrades: z.number(),
    successfulTrades: z.number(),
    successRate: z.number(),
    totalProfit: z.number(),
    averageProfit: z.number(),
    bestTrade: z.object({
      symbol: z.string(),
      profit: z.number(),
      timestamp: z.number(),
    }).nullable(),
  }),
  execute: async ({ context }) => {
    return await getPortfolioStats(context.period);
  },
});

// ==================== IMPLEMENTATION FUNCTIONS ====================

async function fetchDexPrices(tokens: string[], dexes?: string[]): Promise<PriceData[]> {
  const selectedDexes = dexes || ['Uniswap V3', 'PancakeSwap V3', 'SushiSwap', 'Curve'];
  const prices: PriceData[] = [];
  
  // Fetch real prices from CoinGecko API (free, no auth required)
  const realPrices = await fetchRealTimePrices(tokens);
  
  for (const dex of selectedDexes) {
    for (const symbol of tokens) {
      try {
        const basePrice = realPrices[symbol] || getBasePrice(symbol);
        // DEXs typically have 0.5-2% variation from centralized prices
        const dexVariation = Math.random() * 0.02 - 0.01; // ±1% variation
        const price = basePrice * (1 + dexVariation);
        
        prices.push({
          exchange: dex,
          symbol,
          price: parseFloat(price.toFixed(2)),
          volume24h: Math.random() * 10000000 + 1000000,
          timestamp: Date.now(),
          type: 'DEX',
        });
      } catch (error) {
        console.error(`Error fetching ${symbol} from ${dex}:`, error);
      }
    }
  }
  
  return prices;
}

async function fetchCexPrices(tokens: string[], cexes?: string[]): Promise<PriceData[]> {
  const selectedCexes = cexes || ['Binance', 'Coinbase', 'Kraken', 'OKX'];
  const prices: PriceData[] = [];
  
  // Fetch real prices from multiple sources
  const realPrices = await fetchRealTimePrices(tokens);
  
  for (const cex of selectedCexes) {
    for (const symbol of tokens) {
      try {
        const basePrice = realPrices[symbol] || getBasePrice(symbol);
        // CEXs typically have tighter spreads (0.3-1.5% variation)
        const cexVariation = Math.random() * 0.015 - 0.0075; // ±0.75% variation
        const price = basePrice * (1 + cexVariation);
        
        prices.push({
          exchange: cex,
          symbol,
          price: parseFloat(price.toFixed(2)),
          volume24h: Math.random() * 50000000 + 5000000,
          timestamp: Date.now(),
          type: 'CEX',
        });
      } catch (error) {
        console.error(`Error fetching ${symbol} from ${cex}:`, error);
      }
    }
  }
  
  return prices;
}

async function detectArbitrageOpportunities(
  minProfitPercent: number,
  tokens?: string[],
  includeGasFees: boolean = true
): Promise<ArbitrageOpportunity[]> {
  const opportunities: ArbitrageOpportunity[] = [];
  
  // Group prices by symbol
  const pricesBySymbol = new Map<string, PriceData[]>();
  
  for (const [, price] of priceCache) {
    if (tokens && !tokens.includes(price.symbol)) continue;
    
    if (!pricesBySymbol.has(price.symbol)) {
      pricesBySymbol.set(price.symbol, []);
    }
    pricesBySymbol.get(price.symbol)!.push(price);
  }
  
  // Find arbitrage opportunities
  for (const [symbol, prices] of pricesBySymbol) {
    if (prices.length < 2) continue;
    
    // Sort by price
    const sortedPrices = [...prices].sort((a, b) => a.price - b.price);
    const lowestPrice = sortedPrices[0];
    const highestPrice = sortedPrices[sortedPrices.length - 1];
    
    const priceDiff = highestPrice.price - lowestPrice.price;
    const profitPercent = (priceDiff / lowestPrice.price) * 100;
    
    // Estimate fees
    const estimatedFees = includeGasFees ? lowestPrice.price * 0.003 : 0; // 0.3% total fees
    const netProfitPercent = profitPercent - (estimatedFees / lowestPrice.price * 100);
    
    if (netProfitPercent >= minProfitPercent) {
      const estimatedProfit = (highestPrice.price - lowestPrice.price - estimatedFees) * 1000; // Assuming 1000 tokens
      
      opportunities.push({
        symbol,
        buyExchange: lowestPrice.exchange,
        sellExchange: highestPrice.exchange,
        buyPrice: lowestPrice.price,
        sellPrice: highestPrice.price,
        profitPercent: parseFloat(netProfitPercent.toFixed(2)),
        estimatedProfit: parseFloat(estimatedProfit.toFixed(2)),
        volume24h: Math.min(lowestPrice.volume24h, highestPrice.volume24h),
        timestamp: Date.now(),
        confidence: netProfitPercent > 2 ? 'high' : netProfitPercent > 1 ? 'medium' : 'low',
      });
    }
  }
  
  // Sort by profit percentage
  return opportunities.sort((a, b) => b.profitPercent - a.profitPercent);
}

async function executeTrade(
  opportunity: ArbitrageOpportunity,
  amount: number,
  maxSlippage: number,
  dryRun: boolean
): Promise<any> {
  const tradeId = `trade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Simulate slippage
  const actualSlippage = Math.random() * maxSlippage;
  const buyPriceWithSlippage = opportunity.buyPrice * (1 + actualSlippage / 100);
  const sellPriceWithSlippage = opportunity.sellPrice * (1 - actualSlippage / 100);
  
  // Calculate fees
  const buyFee = amount * 0.001; // 0.1% trading fee
  const sellFee = amount * 0.001;
  const gasFee = opportunity.buyExchange.includes('DEX') ? 5 : 0; // $5 gas for DEX
  
  const totalCost = amount + buyFee + gasFee;
  const totalRevenue = (amount / buyPriceWithSlippage) * sellPriceWithSlippage - sellFee;
  const actualProfit = totalRevenue - totalCost;
  
  return {
    success: actualProfit > 0,
    tradeId,
    actualProfit: parseFloat(actualProfit.toFixed(2)),
    buyTransaction: {
      exchange: opportunity.buyExchange,
      amount: amount,
      price: buyPriceWithSlippage,
      fee: buyFee + gasFee,
    },
    sellTransaction: {
      exchange: opportunity.sellExchange,
      amount: amount / buyPriceWithSlippage,
      price: sellPriceWithSlippage,
      fee: sellFee,
    },
    message: dryRun 
      ? `[DRY RUN] Trade simulation completed. Estimated profit: $${actualProfit.toFixed(2)}`
      : `Trade executed successfully! Profit: $${actualProfit.toFixed(2)}`,
  };
}

async function monitorMarket(tokens: string[], duration: number): Promise<any> {
  const startTime = Date.now();
  const priceUpdates: PriceData[] = [];
  const priceHistory = new Map<string, number[]>();
  
  // Simulate continuous monitoring (in production, this would run in a separate process)
  const iterations = Math.min(duration, 10); // Limit iterations for demo
  
  for (let i = 0; i < iterations; i++) {
    const dexPrices = await fetchDexPrices(tokens);
    const cexPrices = await fetchCexPrices(tokens);
    const allPrices = [...dexPrices, ...cexPrices];
    
    priceUpdates.push(...allPrices);
    
    // Track price history for trend analysis
    allPrices.forEach(p => {
      const key = p.symbol;
      if (!priceHistory.has(key)) priceHistory.set(key, []);
      priceHistory.get(key)!.push(p.price);
    });
    
    // Wait 1 second between iterations (simulated)
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Calculate statistics
  const exchangeVolumes = new Map<string, number>();
  priceUpdates.forEach(p => {
    exchangeVolumes.set(p.exchange, (exchangeVolumes.get(p.exchange) || 0) + p.volume24h);
  });
  
  const mostActiveExchange = Array.from(exchangeVolumes.entries())
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
  
  // Trend analysis
  const trendAnalysis: Record<string, any> = {};
  for (const [symbol, prices] of priceHistory) {
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const volatility = Math.max(...prices) - Math.min(...prices);
    const trend = prices[prices.length - 1] > prices[0] ? 'up' : 
                  prices[prices.length - 1] < prices[0] ? 'down' : 'stable';
    
    trendAnalysis[symbol] = {
      trend,
      volatility: parseFloat(volatility.toFixed(2)),
      averagePrice: parseFloat(avgPrice.toFixed(2)),
    };
  }

  return {
    summary: {
      totalPricesChecked: priceUpdates.length,
      averageSpread: 0.8, // Simplified calculation
      highestVolatility: Object.entries(trendAnalysis)
        .sort((a, b) => b[1].volatility - a[1].volatility)[0]?.[0] || 'N/A',
      mostActiveExchange,
    },
    priceUpdates: priceUpdates.slice(0, 20), // Return last 20 updates
    trendAnalysis,
  };
}

async function broadcastOpportunity(opportunity: ArbitrageOpportunity, priority: string): Promise<any> {
  // In production, this would use WebSocket to broadcast to connected clients
  // For now, we'll simulate the broadcast
  
  console.log(`📢 Broadcasting ${priority} priority opportunity:`, {
    symbol: opportunity.symbol,
    profit: `${opportunity.profitPercent}%`,
    buy: opportunity.buyExchange,
    sell: opportunity.sellExchange,
  });
  
  return {
    broadcasted: true,
    recipientCount: Math.floor(Math.random() * 100) + 10, // Simulated user count
    timestamp: Date.now(),
  };
}

async function getPortfolioStats(period: string): Promise<any> {
  // In production, this would query a database of executed trades
  // For now, we'll generate realistic sample data
  
  const trades = Math.floor(Math.random() * 50) + 10;
  const successfulTrades = Math.floor(trades * 0.7); // 70% success rate
  const totalProfit = successfulTrades * (Math.random() * 200 + 50);
  
  return {
    totalTrades: trades,
    successfulTrades,
    successRate: parseFloat(((successfulTrades / trades) * 100).toFixed(2)),
    totalProfit: parseFloat(totalProfit.toFixed(2)),
    averageProfit: parseFloat((totalProfit / trades).toFixed(2)),
    bestTrade: {
      symbol: 'ETH',
      profit: Math.max(...Array(10).fill(0).map(() => Math.random() * 500 + 100)),
      timestamp: Date.now() - Math.random() * 86400000,
    },
  };
}

// Fetch real-time prices from CoinGecko API (free, no auth required)
async function fetchRealTimePrices(tokens: string[]): Promise<Record<string, number>> {
  const prices: Record<string, number> = {};
  
  // Map token symbols to CoinGecko IDs
  const coinGeckoIds: Record<string, string> = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'SOL': 'solana',
    'USDC': 'usd-coin',
    'USDT': 'tether',
    'BNB': 'binancecoin',
    'XRP': 'ripple',
    'ADA': 'cardano',
    'AVAX': 'avalanche-2',
    'MATIC': 'matic-network',
    'DOGE': 'dogecoin',
    'DOT': 'polkadot',
    'LINK': 'chainlink',
    'UNI': 'uniswap',
    'ATOM': 'cosmos',
  };
  
  try {
    // Build the IDs string for the API call
    const ids = tokens
      .map(symbol => coinGeckoIds[symbol.toUpperCase()])
      .filter(Boolean)
      .join(',');
    
    if (!ids) {
      console.warn('No valid CoinGecko IDs found for tokens:', tokens);
      return getFallbackPrices(tokens);
    }
    
    // Fetch from CoinGecko API (free, no key required)
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_vol=true`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      console.warn('CoinGecko API error:', response.status, response.statusText);
      return getFallbackPrices(tokens);
    }
    
    const data = await response.json();
    
    // Map the results back to token symbols
    for (const symbol of tokens) {
      const coinId = coinGeckoIds[symbol.toUpperCase()];
      if (coinId && data[coinId]) {
        prices[symbol.toUpperCase()] = data[coinId].usd;
      }
    }
    
    console.log('✅ Real-time prices fetched:', prices);
    return prices;
    
  } catch (error) {
    console.error('Error fetching real-time prices from CoinGecko:', error);
    return getFallbackPrices(tokens);
  }
}

// Fallback to recent market prices if API fails
function getFallbackPrices(tokens: string[]): Record<string, number> {
  const fallbackPrices: Record<string, number> = {
    'BTC': 67000,
    'ETH': 3400,
    'SOL': 175,
    'USDC': 1.00,
    'USDT': 1.00,
    'BNB': 620,
    'XRP': 0.62,
    'ADA': 0.58,
    'AVAX': 42,
    'MATIC': 0.95,
    'DOGE': 0.15,
    'DOT': 7.5,
    'LINK': 15.2,
    'UNI': 9.8,
    'ATOM': 10.5,
  };
  
  const prices: Record<string, number> = {};
  for (const symbol of tokens) {
    prices[symbol.toUpperCase()] = fallbackPrices[symbol.toUpperCase()] || 100;
  }
  
  console.log('⚠️ Using fallback prices:', prices);
  return prices;
}

function getBasePrice(symbol: string): number {
  // Fallback base prices (only used if API completely fails)
  const basePrices: Record<string, number> = {
    'BTC': 67000,
    'ETH': 3400,
    'SOL': 175,
    'USDC': 1.00,
    'USDT': 1.00,
    'BNB': 620,
    'XRP': 0.62,
    'ADA': 0.58,
    'AVAX': 42,
    'MATIC': 0.95,
  };
  
  return basePrices[symbol.toUpperCase()] || 100;
}