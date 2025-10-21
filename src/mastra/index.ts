// Main Mastra Configuration - Arbitrage Bot Pro
import { Mastra } from "@mastra/core/mastra";
import { LibSQLStore } from "@mastra/libsql";
import { 
  priceMonitorAgent, 
  arbitrageAnalyzerAgent, 
  tradeExecutorAgent, 
  masterArbitrageAgent 
} from "./agents";
import { ConsoleLogger, LogLevel } from "@mastra/core/logger";
import { server } from "./mcp";

const LOG_LEVEL = process.env.LOG_LEVEL as LogLevel || "info";

export const mastra = new Mastra({
  agents: {
    priceMonitorAgent,
    arbitrageAnalyzerAgent,
    tradeExecutorAgent,
    masterArbitrageAgent,
  },
  mcpServers: {
    server
  },
  storage: new LibSQLStore({
    url: ":memory:"
  }),
  logger: new ConsoleLogger({
    level: LOG_LEVEL,
  }),
});
