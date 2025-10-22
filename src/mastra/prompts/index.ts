import { z } from 'zod';

/**
 * Dynamic Prompts for Arbitrage Bot Pro
 * 
 * These prompts provide context-aware guidance to agents based on market conditions,
 * user preferences, and system state.
 * 
 * @module prompts
 */

// ==================== MARKET CONDITION PROMPTS ====================

export const getMarketConditionPrompt = (volatility: number, volume: number) => {
  if (volatility > 5 && volume > 10000000) {
    return `⚠️ **HIGH VOLATILITY ALERT**: Market volatility is ${volatility.toFixed(2)}% with high volume. 
    Exercise caution and increase profit thresholds. Consider wider slippage tolerances. 
    Opportunities may be more profitable but carry higher risk.`;
  } else if (volatility < 1 && volume < 1000000) {
    return `📊 **LOW VOLATILITY**: Market is stable with volatility at ${volatility.toFixed(2)}%. 
    Opportunities may be limited but more reliable. Consider tighter slippage tolerances.
    Look for smaller, consistent gains.`;
  } else {
    return `✅ **NORMAL MARKET**: Volatility at ${volatility.toFixed(2)}% with moderate volume. 
    Standard risk parameters apply. Good conditions for arbitrage trading.`;
  }
};

// ==================== TRADING STRATEGY PROMPTS ====================

export const getTradingStrategyPrompt = (strategy: 'conservative' | 'moderate' | 'aggressive') => {
  const strategies = {
    conservative: {
      minProfit: 1.0,
      maxSlippage: 0.3,
      description: `🛡️ **CONSERVATIVE STRATEGY**
      - Minimum profit threshold: 1.0%
      - Maximum slippage: 0.3%
      - Focus on high-confidence opportunities
      - Prioritize stable tokens (ETH, BTC, stablecoins)
      - Avoid high-volatility windows`
    },
    moderate: {
      minProfit: 0.5,
      maxSlippage: 0.5,
      description: `⚖️ **MODERATE STRATEGY** (Recommended)
      - Minimum profit threshold: 0.5%
      - Maximum slippage: 0.5%
      - Balance between risk and reward
      - Diversify across multiple tokens
      - Monitor market conditions actively`
    },
    aggressive: {
      minProfit: 0.2,
      maxSlippage: 1.0,
      description: `🚀 **AGGRESSIVE STRATEGY**
      - Minimum profit threshold: 0.2%
      - Maximum slippage: 1.0%
      - Pursue all viable opportunities
      - Higher risk, higher potential reward
      - Requires active monitoring and quick execution`
    }
  };
  
  return strategies[strategy];
};

// ==================== TOKEN-SPECIFIC PROMPTS ====================

export const getTokenAnalysisPrompt = (token: string) => {
  const tokenProfiles: Record<string, string> = {
    'BTC': `**Bitcoin (BTC)** - Largest crypto asset
    - Highest liquidity across all exchanges
    - Lower volatility compared to altcoins
    - Best for large arbitrage volumes
    - Gas fees less impactful on profit margins`,
    
    'ETH': `**Ethereum (ETH)** - Second-largest crypto
    - Excellent liquidity on both DEXs and CEXs
    - Moderate volatility creates opportunities
    - Consider gas prices on DEX trades
    - Popular for DeFi arbitrage`,
    
    'SOL': `**Solana (SOL)** - High-performance blockchain
    - Growing liquidity across exchanges
    - Higher volatility = more opportunities
    - Lower transaction costs on Solana DEXs
    - Watch for network congestion events`,
    
    'USDC': `**USD Coin (USDC)** - Stablecoin
    - Should maintain $1.00 peg
    - Small arbitrage opportunities (0.1-0.3%)
    - High volume, low risk
    - Excellent for capital preservation`,
    
    'USDT': `**Tether (USDT)** - Largest stablecoin
    - Similar to USDC but slightly more volatile
    - Good for small, consistent gains
    - Monitor peg stability
    - High liquidity on all major CEXs`,
    
    'BNB': `**Binance Coin (BNB)** - Exchange token
    - Highly liquid on Binance and PancakeSwap
    - Moderate volatility
    - Benefits from BSC ecosystem
    - Watch for Binance-specific events`,
  };
  
  return tokenProfiles[token] || `**${token}** - General crypto asset
  - Analyze liquidity before trading
  - Higher risk with unknown tokens
  - Verify exchange support
  - Start with smaller position sizes`;
};

// ==================== RISK MANAGEMENT PROMPTS ====================

export const getRiskAssessmentPrompt = (confidence: 'high' | 'medium' | 'low') => {
  const assessments = {
    high: `✅ **HIGH CONFIDENCE OPPORTUNITY**
    - Strong price differential (>2%)
    - High liquidity on both exchanges
    - Stable price movement
    - Recommended action: Execute trade
    - Suggested position size: Up to 100% allocation`,
    
    medium: `⚠️ **MEDIUM CONFIDENCE OPPORTUNITY**
    - Moderate price differential (1-2%)
    - Adequate liquidity
    - Some price volatility
    - Recommended action: Proceed with caution
    - Suggested position size: 50-75% allocation`,
    
    low: `⚡ **LOW CONFIDENCE OPPORTUNITY**
    - Small price differential (0.5-1%)
    - Limited liquidity or high volatility
    - Window may close quickly
    - Recommended action: Monitor or skip
    - Suggested position size: 25-50% allocation`
  };
  
  return assessments[confidence];
};

// ==================== TIME-BASED PROMPTS ====================

export const getTimeBasedPrompt = () => {
  const hour = new Date().getHours();
  
  if (hour >= 0 && hour < 6) {
    return `🌙 **OFF-PEAK HOURS (12AM-6AM UTC)**
    - Lower trading volumes typically
    - Wider spreads may exist
    - Less competition for opportunities
    - Good time for patient strategies`;
  } else if (hour >= 6 && hour < 12) {
    return `🌅 **ASIAN MARKET HOURS (6AM-12PM UTC)**
    - Asian markets most active
    - Focus on Asian CEXs (OKX, Binance)
    - Moderate volatility
    - Watch for Asia-based token movements`;
  } else if (hour >= 12 && hour < 18) {
    return `☀️ **EUROPEAN MARKET HOURS (12PM-6PM UTC)**
    - European markets driving volume
    - Overlap with Asian market close
    - Good liquidity across all exchanges
    - Prime time for arbitrage`;
  } else {
    return `🌃 **US MARKET HOURS (6PM-12AM UTC)**
    - US markets most active
    - Highest global volumes
    - Coinbase and US-based exchanges peak
    - Maximum opportunity window`;
  }
};

// ==================== BEGINNER GUIDANCE PROMPTS ====================

export const getBeginnerGuidancePrompt = () => {
  return `👋 **NEW TO ARBITRAGE? START HERE!**
  
  **What is Arbitrage?**
  Buying crypto at a lower price on one exchange and selling at a higher price on another, profiting from the difference.
  
  **Quick Start:**
  1. Say "Monitor ETH and BTC prices"
  2. Wait for the agent to detect opportunities
  3. Review the profit calculations
  4. Start with DRY RUN mode (simulated trades)
  5. Learn from the results before going live
  
  **Key Concepts:**
  - **Spread**: The price difference between exchanges
  - **Slippage**: Price changes during trade execution
  - **Gas Fees**: Transaction costs on DEXs (Ethereum network)
  - **Confidence**: Our assessment of opportunity reliability
  
  **Safety Tips:**
  - Always start with dry-run mode
  - Understand fees before executing
  - Never invest more than you can afford to lose
  - Monitor market conditions actively
  - Start with small position sizes
  
  **Try These Commands:**
  - "What are the current arbitrage opportunities?"
  - "Explain the top opportunity to me"
  - "Show my portfolio performance"
  - "What tokens should I monitor?"
  
  Need help? Just ask! I'm here to guide you. 🤝`;
};

// ==================== VIRTUAL TRADING PROMPTS ====================

export const getVirtualTradingPrompt = (balance: number = 10000) => {
  return `🎉 **VIRTUAL TRADING ACCOUNT GUIDE**
  
  **Your Practice Environment:**
  You have $${balance.toLocaleString()} in virtual funds to practice arbitrage trading safely!
  
  **How It Works:**
  - ✅ Real-time market data from actual exchanges
  - ✅ Authentic arbitrage opportunity detection  
  - ✅ Full trade execution simulation
  - ✅ No real money at risk - completely safe!
  - ✅ Track your performance and learn strategies
  
  **Getting Started:**
  1. Your account is activated with $${balance.toLocaleString()}
  2. Ask me to find arbitrage opportunities
  3. Review the opportunities and their profit potential
  4. Execute trades using your virtual balance
  5. Watch your balance grow (or learn from losses!)
  
  **Risk Management Tips:**
  - 💡 Start with small trades (5-10% of your balance)
  - 💡 Don't risk more than 20% on a single trade
  - 💡 Learn position sizing and risk per trade
  - 💡 Experiment with different strategies safely
  - 💡 Track what works and what doesn't
  
  **Key Concepts to Practice:**
  - **Balance Management**: Keep enough reserves for multiple trades
  - **Position Sizing**: How much to risk per opportunity
  - **Profit Taking**: When to execute profitable trades
  - **Loss Prevention**: Recognizing bad opportunities
  - **Strategy Testing**: Try conservative, moderate, and aggressive approaches
  
  **Example Commands:**
  - "Find arbitrage opportunities for ETH"
  - "Execute a $500 trade on the best opportunity"
  - "What's my current balance?"
  - "Show my trading history"
  - "What's my total profit/loss?"
  
  **Educational Focus:**
  This virtual account is designed for learning, not gambling. Focus on:
  - Understanding how arbitrage works
  - Learning to evaluate opportunities
  - Practicing risk management
  - Building confidence before considering real trading
  - Developing your own trading strategy
  
  **Important Reminders:**
  ⚠️ Virtual results may not perfectly match live trading
  ⚠️ Real trading involves real risks and real losses
  ⚠️ Always do your own research before real trading
  ⚠️ Practice until you're consistently profitable here
  ⚠️ Never trade with money you can't afford to lose
  
  **Your Next Steps:**
  1. Say "Find opportunities" to start scanning
  2. Review the opportunities I present
  3. Ask questions about anything you don't understand
  4. Execute your first virtual trade
  5. Learn from the results!
  
  Ready to start your arbitrage journey? Let's find some opportunities! 🚀`;
};

// ==================== ADVANCED STRATEGY PROMPTS ====================

export const getAdvancedStrategyPrompt = () => {
  return `🎓 **ADVANCED ARBITRAGE STRATEGIES**
  
  **1. Triangle Arbitrage**
  Trade through 3+ exchanges/tokens to exploit circular price inefficiencies.
  Example: USDC → BTC → ETH → USDC
  
  **2. Cross-Chain Arbitrage**
  Exploit price differences between chains (Ethereum vs BSC vs Polygon).
  Requires bridge fees consideration.
  
  **3. Flash Loan Arbitrage**
  Borrow capital without collateral to execute large arbitrage trades.
  Highest profit potential but requires smart contract integration.
  
  **4. Statistical Arbitrage**
  Use historical data to predict temporary price divergences.
  Currently in development for this bot.
  
  **5. Market Making Strategy**
  Provide liquidity while capturing spreads on both sides.
  Lower risk but requires more capital.
  
  **Risk Management Techniques:**
  - Position sizing based on Kelly Criterion
  - Stop-loss on volatile movements
  - Profit taking at predetermined levels
  - Portfolio diversification across tokens
  - Continuous monitoring of exchange health
  
  **Performance Optimization:**
  - Use multiple sub-accounts for parallel execution
  - Pre-approve token allowances on DEXs
  - Monitor gas prices and execute during low-cost windows
  - Set up alerts for high-confidence opportunities
  - Analyze historical performance to refine strategies
  
  **Questions to Consider:**
  - What's your risk tolerance?
  - How much capital can you deploy?
  - What's your time commitment?
  - Do you prefer automated or manual execution?
  
  Ready to level up? Ask me about any of these strategies! 🚀`;
};

// ==================== ERROR RECOVERY PROMPTS ====================

export const getErrorRecoveryPrompt = (error: string) => {
  const errorGuides: Record<string, string> = {
    'insufficient_liquidity': `💧 **INSUFFICIENT LIQUIDITY**
    
    The opportunity exists but there's not enough trading volume to execute profitably.
    
    **What to do:**
    - Reduce your position size
    - Wait for liquidity to improve
    - Try a different token pair
    - Consider the impact on your overall strategy`,
    
    'high_slippage': `📉 **HIGH SLIPPAGE DETECTED**
    
    Price moved significantly during execution attempt.
    
    **What to do:**
    - Increase slippage tolerance (risky)
    - Wait for market stability
    - Split trade into smaller chunks
    - Monitor market volatility before retrying`,
    
    'price_moved': `⚡ **PRICE MOVED**
    
    The arbitrage opportunity closed before execution.
    
    **What to do:**
    - This is normal in fast markets
    - Increase execution speed settings
    - Look for more stable opportunities
    - Consider automated execution`,
    
    'exchange_error': `🔧 **EXCHANGE ERROR**
    
    The exchange API returned an error.
    
    **What to do:**
    - Check exchange status
    - Verify API credentials
    - Try a different exchange
    - Report persistent errors`,
  };
  
  return errorGuides[error] || `❌ **ERROR OCCURRED**
  
  Something went wrong. This could be due to:
  - Network connectivity issues
  - Temporary exchange problems
  - Invalid parameters
  
  **What to do:**
  - Check your connection
  - Retry the operation
  - Verify your inputs
  - Contact support if issue persists`;
};

// ==================== CELEBRATION PROMPTS ====================

export const getCelebrationPrompt = (profit: number, successRate: number) => {
  if (profit > 1000 && successRate > 80) {
    return `🎉 **EXCEPTIONAL PERFORMANCE!** 🎉
    
    You've achieved $${profit.toLocaleString()} in profits with a ${successRate}% success rate!
    You're in the top 10% of arbitrage traders. Keep up the excellent work!
    
    **Next Level:**
    - Try increasing position sizes carefully
    - Explore advanced strategies
    - Share your success in the community
    - Consider diversifying into new token pairs`;
  } else if (profit > 100 && successRate > 60) {
    return `💪 **GREAT JOB!**
    
    $${profit.toLocaleString()} profit with ${successRate}% success rate - you're getting the hang of this!
    
    **Tips to improve:**
    - Analyze your successful trades
    - Refine your entry criteria
    - Consider adjusting your strategy
    - Keep learning and practicing`;
  } else if (profit > 0) {
    return `✅ **PROFITABLE TRADING**
    
    You're in the green with $${profit.toLocaleString()} profit!
    Every journey starts with a single step. Keep going!
    
    **Keep in mind:**
    - Consistency is key
    - Learn from each trade
    - Don't chase every opportunity
    - Risk management is crucial`;
  } else {
    return `📚 **LEARNING PHASE**
    
    Remember: Every expert trader started where you are now.
    Use this experience to learn and improve.
    
    **Focus on:**
    - Understanding market dynamics
    - Practicing with dry-run mode
    - Analyzing what went wrong
    - Building your strategy
    
    You've got this! 💪`;
  }
};

// ==================== EXPORT PROMPT GENERATOR ====================

export const generateContextualPrompt = (context: {
  volatility?: number;
  volume?: number;
  strategy?: 'conservative' | 'moderate' | 'aggressive';
  token?: string;
  confidence?: 'high' | 'medium' | 'low';
  isBeginne?: boolean;
  error?: string;
  profit?: number;
  successRate?: number;
}) => {
  const prompts: string[] = [];
  
  // Add market condition context
  if (context.volatility && context.volume) {
    prompts.push(getMarketConditionPrompt(context.volatility, context.volume));
  }
  
  // Add time-based context
  prompts.push(getTimeBasedPrompt());
  
  // Add strategy context
  if (context.strategy) {
    const strategyInfo = getTradingStrategyPrompt(context.strategy);
    prompts.push(strategyInfo.description);
  }
  
  // Add token analysis
  if (context.token) {
    prompts.push(getTokenAnalysisPrompt(context.token));
  }
  
  // Add risk assessment
  if (context.confidence) {
    prompts.push(getRiskAssessmentPrompt(context.confidence));
  }
  
  // Add beginner guidance
  if (context.isBeginne) {
    prompts.push(getBeginnerGuidancePrompt());
  }
  
  // Add error recovery
  if (context.error) {
    prompts.push(getErrorRecoveryPrompt(context.error));
  }
  
  // Add celebration
  if (context.profit !== undefined && context.successRate !== undefined) {
    prompts.push(getCelebrationPrompt(context.profit, context.successRate));
  }
  
  return prompts.join('\n\n---\n\n');
};

