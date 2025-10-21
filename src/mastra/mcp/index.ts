// MCP Server Configuration for Arbitrage Bot Pro
import { MCPServer } from "@mastra/mcp"
import { 
  fetchDexPricesTool, 
  fetchCexPricesTool, 
  detectArbitrageTool, 
  executeTradeTool, 
  monitorMarketTool, 
  broadcastOpportunityTool, 
  trackPortfolioTool 
} from "../tools";
import { 
  priceMonitorAgent, 
  arbitrageAnalyzerAgent, 
  tradeExecutorAgent, 
  masterArbitrageAgent 
} from "../agents";
import { 
  getBeginnerGuidancePrompt, 
  getAdvancedStrategyPrompt,
  generateContextualPrompt,
  getTradingStrategyPrompt,
  getTokenAnalysisPrompt,
} from "../prompts";

// Dynamic Prompts for Context-Aware Assistance
const promptsList = [
  {
    name: "beginner_guide",
    description: "Complete guide for users new to cryptocurrency arbitrage trading",
    arguments: [],
  },
  {
    name: "advanced_strategies",
    description: "Expert-level techniques for experienced traders",
    arguments: [],
  },
  {
    name: "conservative_strategy",
    description: "Low-risk approach focusing on high-confidence opportunities",
    arguments: [],
  },
  {
    name: "moderate_strategy",
    description: "Balanced risk-reward approach (recommended for most users)",
    arguments: [],
  },
  {
    name: "aggressive_strategy",
    description: "High-risk, high-reward approach for active traders",
    arguments: [],
  },
  {
    name: "btc_analysis",
    description: "Specific guidance for BTC arbitrage opportunities",
    arguments: [],
  },
  {
    name: "eth_analysis",
    description: "Specific guidance for ETH arbitrage opportunities",
    arguments: [],
  },
  {
    name: "sol_analysis",
    description: "Specific guidance for SOL arbitrage opportunities",
    arguments: [],
  },
  {
    name: "contextual_guidance",
    description: "Dynamic guidance based on current market conditions and user context",
    arguments: [
      { name: "strategy", description: "Trading strategy (conservative, moderate, aggressive)", required: false },
      { name: "volatility", description: "Current market volatility percentage", required: false },
    ],
  },
];

const prompts = {
  listPrompts: async () => promptsList,
  getPrompt: async (name: string, args?: Record<string, unknown>) => {
    const promptMap: Record<string, string> = {
      beginner_guide: getBeginnerGuidancePrompt(),
      advanced_strategies: getAdvancedStrategyPrompt(),
      conservative_strategy: getTradingStrategyPrompt('conservative').description,
      moderate_strategy: getTradingStrategyPrompt('moderate').description,
      aggressive_strategy: getTradingStrategyPrompt('aggressive').description,
      btc_analysis: getTokenAnalysisPrompt('BTC'),
      eth_analysis: getTokenAnalysisPrompt('ETH'),
      sol_analysis: getTokenAnalysisPrompt('SOL'),
      contextual_guidance: generateContextualPrompt({
        volatility: (args?.volatility as number) || 2.5,
        volume: 50000000,
        strategy: (args?.strategy as 'conservative' | 'moderate' | 'aggressive') || 'moderate',
        isBeginne: false,
      }),
    };
    
    return {
      description: promptsList.find(p => p.name === name)?.description || '',
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: promptMap[name] || 'Prompt not found',
          },
        },
      ],
    };
  },
};

export const server = new MCPServer({
  name: "Arbitrage Bot MCP Server",
  version: "1.0.0",
  description: "Advanced cryptocurrency arbitrage bot with real-time monitoring across DEXs and CEXs",
  tools: { 
    fetchDexPricesTool, 
    fetchCexPricesTool, 
    detectArbitrageTool, 
    executeTradeTool, 
    monitorMarketTool, 
    broadcastOpportunityTool, 
    trackPortfolioTool 
  },
  agents: { 
    priceMonitorAgent,        // ask_priceMonitorAgent
    arbitrageAnalyzerAgent,   // ask_arbitrageAnalyzerAgent
    tradeExecutorAgent,       // ask_tradeExecutorAgent
    masterArbitrageAgent,     // ask_masterArbitrageAgent
  },
  prompts, // Dynamic prompts system - 9 templates for context-aware assistance
  // workflows: {
  //   arbitrageWorkflow, // Future: run_arbitrageWorkflow
  // }
});
