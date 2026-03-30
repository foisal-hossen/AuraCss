/**
 * ============================================================
 * AURA CSS — aura.config.ts
 * Type-safe configuration schema for the AURA framework.
 * ============================================================
 * Usage:
 *   import { defineConfig } from '@aura/core'
 *
 *   export default defineConfig({
 *     theme: 'dark',
 *     extend: {
 *       colors: { brand: 'oklch(0.55 0.22 270)' }
 *     }
 *   })
 * ============================================================
 */

/* ──────────────────────────────────────────────────────────
   TYPES
────────────────────────────────────────────────────────── */

export type AuraTheme =
  | 'light'
  | 'dark'
  | 'ocean'
  | 'aurora'
  | 'ember'
  | 'rose'
  | 'midnight'
  | 'system'    // follows OS preference
  | (string & {}) // allow custom theme names

export type AuraMotionPreset = 'smooth' | 'snappy' | 'bouncy' | 'none'

export type AuraColorFormat = 'oklch' | 'hsl' | 'hex' | 'rgb'

export type AuraBorderRadiusScale = {
  none?: string
  xs?:   string
  sm?:   string
  md?:   string
  lg?:   string
  xl?:   string
  '2xl'?: string
  '3xl'?: string
  '4xl'?: string
  full?:  string
  [key: string]: string | undefined
}

export type AuraSpacingScale = {
  [key: string]: string
}

export type AuraColorToken = {
  primary?:   string
  secondary?: string
  accent?:    string
  success?:   string
  warning?:   string
  danger?:    string
  info?:      string
  [key: string]: string | undefined
}

export type AuraTypographyConfig = {
  fontSans?:    string | string[]
  fontDisplay?: string | string[]
  fontMono?:    string | string[]
  fontSerif?:   string | string[]
  /** Base font size — default '1rem' */
  baseFontSize?: string
  /** Type scale multiplier — default 1.25 (Major Third) */
  scaleRatio?: number
}

export type AuraBreakpoints = {
  sm?:  string
  md?:  string
  lg?:  string
  xl?:  string
  '2xl'?: string
  [key: string]: string | undefined
}

export type AuraPlugin = {
  name: string
  handler: (ctx: AuraPluginContext) => void | AuraPluginResult
}

export type AuraPluginContext = {
  /** Add new CSS utilities */
  addUtilities: (utilities: Record<string, Record<string, string>>) => void
  /** Add new component styles */
  addComponents: (components: Record<string, Record<string, string>>) => void
  /** Add base/reset styles */
  addBase: (base: Record<string, Record<string, string>>) => void
  /** Access resolved config */
  config: AuraResolvedConfig
  /** Access token values */
  tokens: Record<string, string>
}

export type AuraPluginResult = {
  css?: string
}

export type AuraLintRule = {
  id: string
  severity: 'error' | 'warning' | 'info'
  message: string
  fix?: string
}

export type AuraLintConfig = {
  /** Enable/disable the linter */
  enabled?: boolean
  /** Custom lint rules */
  rules?: AuraLintRule[]
  /** Properties that must use design tokens */
  enforceTokens?: Array<'color' | 'spacing' | 'typography' | 'shadow' | 'radius'>
  /** Fail build on lint errors */
  failOnError?: boolean
}

export type AuraMigrationConfig = {
  /** Framework to migrate from */
  from?: 'tailwind' | 'bootstrap' | 'material-ui' | 'chakra'
  /** Output format after migration */
  outputFormat?: 'aura' | 'mixed'
  /** Keep original comments */
  keepComments?: boolean
  /** Generate a migration report */
  report?: boolean
}

export type AuraFigmaConfig = {
  /** Figma file key */
  fileKey?: string
  /** Figma personal access token */
  accessToken?: string
  /** Auto-sync on build */
  autoSync?: boolean
  /** Token mapping strategy */
  mapping?: 'auto' | 'manual' | Record<string, string>
}

export type AuraExtendConfig = {
  /** Extend or override color tokens */
  colors?: AuraColorToken & Record<string, string>
  /** Extend or override spacing tokens */
  spacing?: AuraSpacingScale
  /** Extend or override border radius */
  borderRadius?: AuraBorderRadiusScale
  /** Extend or override typography */
  typography?: AuraTypographyConfig
  /** Extend or override breakpoints */
  breakpoints?: AuraBreakpoints
  /** Add custom keyframes */
  keyframes?: Record<string, Record<string, Record<string, string>>>
  /** Add custom animation utilities */
  animation?: Record<string, string>
  /** Add custom CSS variables */
  variables?: Record<string, string>
}

export type AuraConfig = {
  /**
   * Default theme to apply.
   * @default 'system'
   */
  theme?: AuraTheme

  /**
   * Themes to include in output.
   * Set to specific array to tree-shake unused themes.
   * @default 'all'
   */
  themes?: AuraTheme[] | 'all'

  /**
   * Motion preset — controls default animation feel.
   * @default 'smooth'
   */
  motion?: AuraMotionPreset

  /**
   * Preferred color format for generated values.
   * @default 'oklch'
   */
  colorFormat?: AuraColorFormat

  /**
   * Layers to include — omit for smaller bundles.
   * @default 'all'
   */
  layers?: Array<
    | 'reset'
    | 'tokens'
    | 'theme'
    | 'base'
    | 'layout'
    | 'typography'
    | 'utilities'
    | 'components'
    | 'visual'
    | 'motion'
    | 'variants'
    | 'overrides'
  > | 'all'

  /**
   * Content paths for class scanning (used for purging).
   * @example ['./src/**\/*.{html,js,ts,jsx,tsx,vue,svelte}']
   */
  content?: string[]

  /**
   * Output configuration.
   */
  output?: {
    /** Output file path */
    file?: string
    /** Minify output */
    minify?: boolean
    /** Generate source maps */
    sourcemap?: boolean
    /** Include CSS variable documentation comments */
    comments?: boolean
  }

  /**
   * Extend or override design tokens.
   */
  extend?: AuraExtendConfig

  /**
   * Override tokens completely (no merge).
   */
  override?: AuraExtendConfig

  /**
   * Plugin system.
   */
  plugins?: AuraPlugin[]

  /**
   * Design linter configuration.
   */
  lint?: AuraLintConfig

  /**
   * Tailwind migration configuration.
   */
  migration?: AuraMigrationConfig

  /**
   * Figma sync configuration.
   */
  figma?: AuraFigmaConfig

  /**
   * Prefix for all AURA CSS variables.
   * @default 'aura'
   * @example 'my-app' → --my-app-color-primary
   */
  prefix?: string

  /**
   * Important modifier — wraps all utilities in :where()
   * to boost specificity without using !important.
   * @default false
   */
  important?: boolean | string

  /**
   * Separator for variant prefixes.
   * @default ':'
   * @example '\\:' for Tailwind-style escaping
   */
  separator?: string

  /**
   * Experimental features.
   */
  experimental?: {
    /** Use @scope for better style encapsulation */
    cssScope?: boolean
    /** Enable CSS nesting (requires Lightning CSS) */
    cssNesting?: boolean
    /** Enable P3 wide-gamut colors */
    p3Colors?: boolean
    /** Use @starting-style for entry animations */
    startingStyle?: boolean
  }
}

/* ──────────────────────────────────────────────────────────
   RESOLVED CONFIG
   Internal type after merging user config with defaults.
────────────────────────────────────────────────────────── */

export type AuraResolvedConfig = Required<
  Omit<AuraConfig, 'extend' | 'override' | 'plugins'>
> & {
  extend: AuraExtendConfig
  override: AuraExtendConfig
  plugins: AuraPlugin[]
  /** Resolved token map after merging base + extend + override */
  _tokens: Record<string, string>
  /** Resolved theme CSS variable map */
  _themeVars: Record<AuraTheme, Record<string, string>>
}

/* ──────────────────────────────────────────────────────────
   DEFAULT CONFIGURATION
────────────────────────────────────────────────────────── */

export const defaultConfig: Required<
  Pick<AuraConfig,
    'theme' | 'themes' | 'motion' | 'colorFormat' |
    'layers' | 'content' | 'prefix' | 'important' | 'separator'
  >
> = {
  theme:       'system',
  themes:      'all',
  motion:      'smooth',
  colorFormat: 'oklch',
  layers:      'all',
  content:     [],
  prefix:      'aura',
  important:   false,
  separator:   ':',
}

/* ──────────────────────────────────────────────────────────
   PLUGIN HELPERS
────────────────────────────────────────────────────────── */

/**
 * Create a type-safe AURA plugin.
 *
 * @example
 * const myPlugin = createPlugin('my-plugin', ({ addUtilities }) => {
 *   addUtilities({
 *     '.text-rainbow': {
 *       'background': 'linear-gradient(to right, red, orange, yellow, green, blue, violet)',
 *       '-webkit-background-clip': 'text',
 *       '-webkit-text-fill-color': 'transparent',
 *     }
 *   })
 * })
 */
export function createPlugin(
  name: string,
  handler: AuraPlugin['handler']
): AuraPlugin {
  return { name, handler }
}

/* ──────────────────────────────────────────────────────────
   DEFINE CONFIG — main export
────────────────────────────────────────────────────────── */

/**
 * Define a type-safe AURA configuration.
 *
 * @example
 * export default defineConfig({
 *   theme: 'dark',
 *   extend: {
 *     colors: {
 *       brand: 'oklch(0.55 0.22 270)',
 *     }
 *   },
 *   plugins: [auraMotion(), auraGlass()],
 * })
 */
export function defineConfig(config: AuraConfig): AuraConfig {
  return config
}

/* ──────────────────────────────────────────────────────────
   BUILT-IN PLUGIN FACTORIES
────────────────────────────────────────────────────────── */

/**
 * Built-in typography plugin.
 * Adds .prose variants for blog/docs content.
 */
export function auraTypography(options?: {
  className?: string
  modifiers?: string[]
}): AuraPlugin {
  return createPlugin('@aura/typography', ({ addComponents }) => {
    // Prose styles are already in aura-typography.css
    // This plugin adds extra modifiers
    const className = options?.className ?? 'prose'
    addComponents({
      [`.${className}-primary a`]: { color: 'var(--color-primary)' },
      [`.${className}-primary li::marker`]: { color: 'var(--color-primary)' },
    })
  })
}

/**
 * Built-in forms plugin.
 * Resets native form elements to a neutral baseline.
 */
export function auraForms(): AuraPlugin {
  return createPlugin('@aura/forms', ({ addBase }) => {
    addBase({
      '[type="text"], [type="email"], [type="url"], textarea, select': {
        '-webkit-appearance': 'none',
        'appearance': 'none',
        'background-color': 'var(--surface-sunken)',
        'border': '1px solid var(--surface-border)',
        'border-radius': 'var(--radius-input)',
        'font-family': 'var(--font-sans)',
      },
      '[type="checkbox"], [type="radio"]': {
        'appearance': 'none',
        '-webkit-appearance': 'none',
        'accent-color': 'var(--color-primary)',
      },
    })
  })
}

/**
 * Built-in motion plugin.
 * Extra keyframes and animation presets.
 */
export function auraMotion(options?: {
  /** Include 3D animations */
  '3d'?: boolean
  /** Include page transition helpers */
  pageTransitions?: boolean
}): AuraPlugin {
  return createPlugin('@aura/motion', () => {
    // Motion styles are in aura-motion.css
    // This plugin adds runtime JS helpers
  })
}

/* ──────────────────────────────────────────────────────────
   TYPE EXPORTS
────────────────────────────────────────────────────────── */

export type {
  AuraConfig as Config,
  AuraResolvedConfig as ResolvedConfig,
  AuraPlugin as Plugin,
  AuraTheme as Theme,
}

export default defineConfig
