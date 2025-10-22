// Mastra Instrumentation Configuration
// This file configures telemetry and observability for the Arbitrage Bot

export async function register() {
  // Disable telemetry warning
  if (typeof globalThis !== 'undefined') {
    (globalThis as any).___MASTRA_TELEMETRY___ = true;
  }

  // Optional: Add custom instrumentation here
  if (process.env.NODE_ENV === 'production') {
    // Production monitoring setup
    console.log('🔍 Mastra telemetry initialized for production');
  } else {
    // Development mode - minimal logging
    console.log('📊 Mastra running in development mode');
  }
}

