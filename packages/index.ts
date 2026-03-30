/**
 * AURA CSS v1.0.0
 * @module @aura/core
 */

// Re-export vite plugin
export { aura, default } from './vite-plugin/index.js'
export type { AuraViteOptions } from './vite-plugin/index.js'

// Re-export config helpers
export { defineConfig, createPlugin } from './aura.config.js'
export type { AuraConfig, AuraPlugin, AuraTheme } from './aura.config.js'

// Re-export intelligence tools
export {
  generateTokens,
  lintCSS,
  formatLintResult,
  analyzePerformance,
  suggestFontPairs,
  generateFontCSS,
  hexToOklch,
  oklchToHex,
} from './intelligence.js'
