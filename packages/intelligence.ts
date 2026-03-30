/**
 * AURA CSS — Intelligence Layer
 * Tools: Token Generator, WCAG Checker, Performance Analyzer, Font Pairing
 * @module @aura/intelligence
 */


/* ============================================================
 * AURA Intelligence Layer
 * ============================================================
 * AI-powered design tools built into the framework.
 * All tools work offline — no API calls needed.
 * ============================================================
 */


/* ──────────────────────────────────────────────────────────
   TOOL 1: Token Generator
   Brand color → Complete OKLCH design system
────────────────────────────────────────────────────────── */

export type OklchColor = { l: number; c: number; h: number }

export type GeneratedPalette = {
  /** Full scale 50–950 */
  scale:    Record<string, string>
  /** Semantic token map */
  semantic: Record<string, string>
  /** Dark theme overrides */
  dark:     Record<string, string>
  /** CSS variables string */
  css:      string
  /** WCAG contrast scores */
  contrast: Record<string, number>
}

/**
 * Convert hex to OKLCH
 */
export function hexToOklch(hex: string): OklchColor {
  hex = hex.replace('#', '')
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('')
  const r = parseInt(hex.slice(0, 2), 16) / 255
  const g = parseInt(hex.slice(2, 4), 16) / 255
  const b = parseInt(hex.slice(4, 6), 16) / 255

  const lin = (v: number) =>
    v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92

  const rl = lin(r), gl = lin(g), bl = lin(b)

  const l = 0.4122214708 * rl + 0.5363325363 * gl + 0.0514459929 * bl
  const m = 0.2119034982 * rl + 0.6806995451 * gl + 0.1073969566 * bl
  const s = 0.0883024619 * rl + 0.2817188376 * gl + 0.6299787005 * bl

  const l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s)

  const L =  0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_
  const a =  1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_
  const bv = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_

  return {
    l: Math.round(L * 1000) / 1000,
    c: Math.round(Math.sqrt(a * a + bv * bv) * 1000) / 1000,
    h: Math.round(((Math.atan2(bv, a) * 180) / Math.PI + 360) % 360),
  }
}

/**
 * Convert OKLCH to hex
 */
export function oklchToHex(L: number, C: number, H: number): string {
  const h = (H * Math.PI) / 180
  const a = C * Math.cos(h)
  const b = C * Math.sin(h)

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b

  const lv = l_ ** 3, mv = m_ ** 3, sv = s_ ** 3

  let rr = +4.0767416621 * lv - 3.3077115913 * mv + 0.2309699292 * sv
  let rg = -1.2684380046 * lv + 2.6097574011 * mv - 0.3413193965 * sv
  let rb = -0.0041960863 * lv - 0.7034186147 * mv + 1.7076147010 * sv

  const srgb = (v: number) =>
    Math.max(0, Math.min(1, v > 0.0031308 ? 1.055 * v ** (1 / 2.4) - 0.055 : 12.92 * v))

  rr = srgb(rr); rg = srgb(rg); rb = srgb(rb)

  return '#' + [rr, rg, rb]
    .map(v => Math.round(v * 255).toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Generate a complete OKLCH-based design system from a single brand color.
 */
export function generateTokens(brandHex: string): GeneratedPalette {
  const { l: baseL, c: baseC, h: H } = hexToOklch(brandHex)

  // Full scale stops: lightness, chroma multipliers
  const stops = [
    { name: '50',  l: 0.970, cm: 0.08 },
    { name: '100', l: 0.930, cm: 0.17 },
    { name: '200', l: 0.870, cm: 0.32 },
    { name: '300', l: 0.780, cm: 0.55 },
    { name: '400', l: 0.680, cm: 0.77 },
    { name: '500', l: Math.max(0.35, baseL), cm: 1.00 },
    { name: '600', l: Math.max(0.28, baseL * 0.85), cm: 0.92 },
    { name: '700', l: Math.max(0.21, baseL * 0.70), cm: 0.80 },
    { name: '800', l: Math.max(0.15, baseL * 0.55), cm: 0.65 },
    { name: '900', l: Math.max(0.10, baseL * 0.40), cm: 0.48 },
    { name: '950', l: Math.max(0.07, baseL * 0.28), cm: 0.32 },
  ]

  const scale: Record<string, string> = {}
  for (const s of stops) {
    scale[s.name] = `oklch(${s.l.toFixed(3)} ${(baseC * s.cm).toFixed(4)} ${Math.round(H)})`
  }

  // Semantic tokens
  const semantic: Record<string, string> = {
    '--color-primary':          scale['500'],
    '--color-primary-hover':    scale['600'],
    '--color-primary-active':   scale['700'],
    '--color-primary-subtle':   scale['100'],
    '--color-primary-muted':    scale['200'],
    '--color-on-primary':       'oklch(1 0 0)',
    '--color-secondary':        `oklch(${Math.max(0.35, baseL)} ${Math.min(baseC, 0.22)} ${(H + 60) % 360})`,
    '--color-accent':           `oklch(0.72 0.185 ${(H + 180) % 360})`,
  }

  // Dark theme adjustments
  const dark: Record<string, string> = {
    '--color-primary':       scale['400'],
    '--color-primary-hover': scale['300'],
    '--color-primary-subtle':scale['900'],
    '--color-primary-muted': scale['800'],
  }

  // WCAG luminance contrast check
  function wcagContrast(hex1: string, hex2: string): number {
    const lum = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255
      const g = parseInt(hex.slice(3, 5), 16) / 255
      const b = parseInt(hex.slice(5, 7), 16) / 255
      const lin = (v: number) => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
      return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
    }
    const l1 = lum(hex1), l2 = lum(hex2)
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
  }

  const contrast: Record<string, number> = {}
  const white = '#ffffff', black = '#000000'
  for (const [stop, value] of Object.entries(scale)) {
    try {
      const hex = oklchToHex(...(value.match(/[\d.]+/g)!.map(Number) as [number, number, number]))
      contrast[`${stop}-on-white`] = Math.round(wcagContrast(hex, white) * 10) / 10
      contrast[`${stop}-on-black`] = Math.round(wcagContrast(hex, black) * 10) / 10
    } catch { /* skip */ }
  }

  // Generate CSS string
  const css = [
    ':root {',
    ...Object.entries(scale).map(([k, v]) => `  --brand-${k}: ${v};`),
    '',
    ...Object.entries(semantic).map(([k, v]) => `  ${k}: ${v};`),
    '}',
    '',
    '[data-theme="dark"] {',
    ...Object.entries(dark).map(([k, v]) => `  ${k}: ${v};`),
    '}',
  ].join('\n')

  return { scale, semantic, dark, css, contrast }
}


/* ──────────────────────────────────────────────────────────
   TOOL 2: Design Linter
   Validates CSS against AURA token system
────────────────────────────────────────────────────────── */

export type LintIssue = {
  line:     number
  col:      number
  severity: 'error' | 'warning' | 'info'
  rule:     string
  message:  string
  fix?:     string
  context:  string
}

export type LintResult = {
  file:   string
  issues: LintIssue[]
  score:  number  // 0–100
}

const LINT_RULES = [
  {
    id: 'no-hardcoded-color',
    severity: 'warning' as const,
    pattern: /(?<![a-zA-Z-])#[0-9a-fA-F]{3,8}(?![\da-fA-F])/g,
    message: (match: string) => `Hardcoded color "${match}" — use CSS token instead`,
    fix: (match: string) => {
      const lower = match.toLowerCase()
      if (lower === '#fff' || lower === '#ffffff') return 'oklch(1 0 0)'
      if (lower === '#000' || lower === '#000000') return 'oklch(0 0 0)'
      return 'var(--color-primary) or define a token in aura.config.ts'
    },
    skip: (line: string) => line.trim().startsWith('*') || line.trim().startsWith('//')
  },
  {
    id: 'no-hardcoded-spacing',
    severity: 'warning' as const,
    pattern: /(?:margin|padding|gap|top|right|bottom|left)\s*:\s*((?:\d+px\s*)+)(?!.*var\(--space)/g,
    message: (match: string) => `Hardcoded spacing "${match.trim()}" — use --space-* token`,
    fix: () => 'e.g. var(--space-4) for ~16px',
    skip: (line: string) => line.includes('var(--') || line.trim().startsWith('@')
  },
  {
    id: 'no-important',
    severity: 'error' as const,
    pattern: /!important/g,
    message: () => '!important detected — use @layer for specificity control',
    fix: () => 'Move rule to higher layer in @layer stack',
    skip: (line: string) => line.trim().startsWith('//')
  },
  {
    id: 'no-hardcoded-font-size',
    severity: 'warning' as const,
    pattern: /font-size\s*:\s*\d+(?:px|rem|em)(?!.*var\(--text)/g,
    message: (match: string) => `Hardcoded font-size "${match.trim()}" — use --text-* token`,
    fix: () => 'e.g. var(--text-sm), var(--text-base)',
    skip: (line: string) => line.includes('var(--text')
  },
  {
    id: 'no-hardcoded-border-radius',
    severity: 'info' as const,
    pattern: /border-radius\s*:\s*\d+px(?!.*var\(--radius)/g,
    message: (match: string) => `Hardcoded border-radius "${match.trim()}" — use --radius-* token`,
    fix: () => 'e.g. var(--radius-md), var(--radius-lg)',
    skip: (line: string) => line.includes('var(--radius')
  },
  {
    id: 'no-z-index-magic-number',
    severity: 'warning' as const,
    pattern: /z-index\s*:\s*(?!0\b|1\b)-?\d+(?!.*var\(--z)/g,
    message: (match: string) => `Magic z-index number "${match.trim()}" — use semantic z-index token`,
    fix: () => 'e.g. var(--z-modal), var(--z-dropdown)',
    skip: (line: string) => line.includes('var(--z')
  },
]

/**
 * Lint a CSS string for AURA token violations.
 */
export function lintCSS(css: string, filename = 'unknown.css'): LintResult {
  const lines = css.split('\n')
  const issues: LintIssue[] = []

  lines.forEach((line, lineIdx) => {
    for (const rule of LINT_RULES) {
      if (rule.skip?.(line)) continue

      let match: RegExpExecArray | null
      rule.pattern.lastIndex = 0

      while ((match = rule.pattern.exec(line)) !== null) {
        const context = line.trim().slice(0, 80)
        if (!context || context.startsWith('/*') || context.startsWith('*')) continue

        issues.push({
          line:     lineIdx + 1,
          col:      match.index + 1,
          severity: rule.severity,
          rule:     rule.id,
          message:  rule.message(match[0]),
          fix:      rule.fix?.(match[0]),
          context,
        })
      }
    }
  })

  // Score: 100 = perfect, penalize by issue severity
  const penalty = issues.reduce((acc, i) => {
    if (i.severity === 'error')   return acc + 5
    if (i.severity === 'warning') return acc + 2
    return acc + 0.5
  }, 0)

  const score = Math.max(0, Math.round(100 - penalty))

  return { file: filename, issues, score }
}

/**
 * Format lint results for console output.
 */
export function formatLintResult(result: LintResult): string {
  const COLORS = {
    red: '\x1b[31m', yellow: '\x1b[33m', blue: '\x1b[34m',
    green: '\x1b[32m', gray: '\x1b[90m', reset: '\x1b[0m', bold: '\x1b[1m',
  }

  const lines: string[] = [
    `\n  ${COLORS.bold}${result.file}${COLORS.reset} — Score: ${
      result.score >= 90 ? COLORS.green : result.score >= 70 ? COLORS.yellow : COLORS.red
    }${result.score}/100${COLORS.reset}`,
  ]

  if (result.issues.length === 0) {
    lines.push(`  ${COLORS.green}✓ No issues${COLORS.reset}`)
  } else {
    for (const issue of result.issues.slice(0, 15)) {
      const icon =
        issue.severity === 'error'   ? `${COLORS.red}✗` :
        issue.severity === 'warning' ? `${COLORS.yellow}⚠` :
        `${COLORS.blue}ℹ`

      lines.push(
        `  ${icon}${COLORS.reset} ${COLORS.gray}${result.file}:${issue.line}:${issue.col}${COLORS.reset} ${issue.message}`,
      )
      if (issue.fix) {
        lines.push(`     ${COLORS.gray}→ ${issue.fix}${COLORS.reset}`)
      }
    }
    if (result.issues.length > 15) {
      lines.push(`  ${COLORS.gray}... and ${result.issues.length - 15} more${COLORS.reset}`)
    }
  }

  return lines.join('\n')
}


/* ──────────────────────────────────────────────────────────
   TOOL 3: Performance Optimizer
   Analyzes CSS for performance hints
────────────────────────────────────────────────────────── */

export type PerformanceHint = {
  type:    'content-visibility' | 'will-change' | 'layer-promotion' | 'animation' | 'layout'
  element: string
  message: string
  fix:     string
  impact:  'high' | 'medium' | 'low'
}

/**
 * Analyze HTML/CSS and suggest performance improvements.
 */
export function analyzePerformance(html: string): PerformanceHint[] {
  const hints: PerformanceHint[] = []

  // Check for long lists without content-visibility
  const listMatches = html.matchAll(/<(?:ul|ol|tbody)[^>]*>([\s\S]*?)<\/(?:ul|ol|tbody)>/gi)
  for (const match of listMatches) {
    const items = (match[1].match(/<(?:li|tr)/g) ?? []).length
    if (items > 20 && !match[0].includes('content-visibility')) {
      hints.push({
        type:    'content-visibility',
        element: match[0].slice(0, 60) + '...',
        message: `List with ${items} items — consider content-visibility: auto`,
        fix:     'Add class="content-auto" to the list element',
        impact:  items > 100 ? 'high' : 'medium',
      })
    }
  }

  // Check for CSS animations without will-change
  const animMatches = html.matchAll(/class="([^"]*animate-[^"]*)"/g)
  for (const match of animMatches) {
    if (!match[1].includes('will-change')) {
      hints.push({
        type:    'will-change',
        element: match[0].slice(0, 60),
        message: 'Animated element missing will-change hint',
        fix:     'Add will-change-transform or will-change-opacity',
        impact:  'low',
      })
    }
  }

  // Check for large images without lazy loading
  const imgMatches = html.matchAll(/<img(?![^>]*loading=)[^>]*>/gi)
  for (const match of imgMatches) {
    if (!match[0].includes('loading=')) {
      hints.push({
        type:    'layout',
        element: match[0].slice(0, 60),
        message: 'Image without loading="lazy"',
        fix:     'Add loading="lazy" to below-the-fold images',
        impact:  'medium',
      })
    }
  }

  return hints.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 }
    return order[a.impact] - order[b.impact]
  })
}


/* ──────────────────────────────────────────────────────────
   TOOL 4: Font Pairing Engine
   Suggests scientifically matched font combinations
────────────────────────────────────────────────────────── */

export type FontPairPersonality =
  | 'modern'
  | 'bold'
  | 'elegant'
  | 'tech'
  | 'friendly'
  | 'editorial'
  | 'minimal'

export type FontPair = {
  display:     string
  body:        string
  mono?:       string
  description: string
  tag:         string
  googleFonts: string
  css:         string
}

const FONT_PAIRS: Record<FontPairPersonality, FontPair[]> = {
  modern: [
    {
      display: 'DM Sans',
      body:    'DM Mono',
      description: 'Clean, geometric. SaaS product এর জন্য perfect।',
      tag:     'SaaS / Product',
      googleFonts: 'DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@300;400;500',
      css: '--font-display: "DM Sans", sans-serif;\n  --font-sans: "DM Sans", sans-serif;\n  --font-mono: "DM Mono", monospace;',
    },
    {
      display: 'Plus Jakarta Sans',
      body:    'Plus Jakarta Sans',
      description: 'Friendly, versatile. Dashboard, B2B applications।',
      tag:     'Dashboard / B2B',
      googleFonts: 'Plus+Jakarta+Sans:wght@300;400;500;600;700',
      css: '--font-display: "Plus Jakarta Sans", sans-serif;\n  --font-sans: "Plus Jakarta Sans", sans-serif;',
    },
  ],
  bold: [
    {
      display: 'Syne',
      body:    'Instrument Sans',
      description: 'Strong personality। Startup, portfolio, agency।',
      tag:     'Agency / Portfolio',
      googleFonts: 'Syne:wght@400;600;700;800&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400',
      css: '--font-display: "Syne", sans-serif;\n  --font-sans: "Instrument Sans", sans-serif;',
    },
    {
      display: 'Bricolage Grotesque',
      body:    'Bricolage Grotesque',
      description: 'Expressive, character-rich। Creative agency, brand।',
      tag:     'Creative / Brand',
      googleFonts: 'Bricolage+Grotesque:wght@300;400;500;600;700;800',
      css: '--font-display: "Bricolage Grotesque", sans-serif;\n  --font-sans: "Bricolage Grotesque", sans-serif;',
    },
  ],
  elegant: [
    {
      display: 'Playfair Display',
      body:    'Lato',
      description: 'Classic luxury। Fashion, jewelry, premium brands।',
      tag:     'Luxury / Fashion',
      googleFonts: 'Playfair+Display:ital,wght@0,400;0,500;0,700;1,400&family=Lato:wght@300;400;700',
      css: '--font-display: "Playfair Display", serif;\n  --font-sans: "Lato", sans-serif;',
    },
    {
      display: 'Cormorant Garamond',
      body:    'Jost',
      description: 'Refined sophistication। High-end ecommerce, editorial।',
      tag:     'Premium / Editorial',
      googleFonts: 'Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=Jost:wght@300;400;500',
      css: '--font-display: "Cormorant Garamond", serif;\n  --font-sans: "Jost", sans-serif;',
    },
  ],
  tech: [
    {
      display: 'Space Grotesk',
      body:    'Space Grotesk',
      mono:    'JetBrains Mono',
      description: 'Developer-first। Dev tools, technical docs।',
      tag:     'Dev Tools / Tech',
      googleFonts: 'Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500',
      css: '--font-display: "Space Grotesk", sans-serif;\n  --font-sans: "Space Grotesk", sans-serif;\n  --font-mono: "JetBrains Mono", monospace;',
    },
    {
      display: 'Exo 2',
      body:    'Exo 2',
      mono:    'Fira Code',
      description: 'Futuristic feel। Fintech, cybersecurity, gaming।',
      tag:     'Fintech / Security',
      googleFonts: 'Exo+2:wght@300;400;500;600;700&family=Fira+Code:wght@300;400;500',
      css: '--font-display: "Exo 2", sans-serif;\n  --font-sans: "Exo 2", sans-serif;\n  --font-mono: "Fira Code", monospace;',
    },
  ],
  friendly: [
    {
      display: 'Nunito',
      body:    'Nunito Sans',
      description: 'Approachable, warm। EdTech, health, consumer apps।',
      tag:     'EdTech / Health',
      googleFonts: 'Nunito:wght@300;400;500;600;700;800&family=Nunito+Sans:wght@300;400;600',
      css: '--font-display: "Nunito", sans-serif;\n  --font-sans: "Nunito Sans", sans-serif;',
    },
    {
      display: 'Fredoka',
      body:    'Nunito',
      description: 'Playful energy। Games, kids apps, fun brands।',
      tag:     'Gaming / Consumer',
      googleFonts: 'Fredoka:wght@300;400;500;600;700&family=Nunito:wght@400;500',
      css: '--font-display: "Fredoka", sans-serif;\n  --font-sans: "Nunito", sans-serif;',
    },
  ],
  editorial: [
    {
      display: 'Fraunces',
      body:    'Libre Baskerville',
      description: 'Optical size display. Magazines, long-form content।',
      tag:     'Editorial / Magazine',
      googleFonts: 'Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400',
      css: '--font-display: "Fraunces", serif;\n  --font-sans: "Libre Baskerville", serif;',
    },
  ],
  minimal: [
    {
      display: 'Inter',
      body:    'Inter',
      mono:    'JetBrains Mono',
      description: 'Neutral, universal। Utility apps, documentation।',
      tag:     'Utility / Docs',
      googleFonts: 'Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400',
      css: '--font-display: "Inter", sans-serif;\n  --font-sans: "Inter", sans-serif;\n  --font-mono: "JetBrains Mono", monospace;',
    },
  ],
}

/**
 * Get font pair suggestions for a given brand personality.
 */
export function suggestFontPairs(personality: FontPairPersonality): FontPair[] {
  return FONT_PAIRS[personality] ?? FONT_PAIRS.modern
}

/**
 * Generate CSS @import for Google Fonts + CSS variables.
 */
export function generateFontCSS(pair: FontPair): string {
  return [
    `/* Google Fonts import */`,
    `@import url('https://fonts.googleapis.com/css2?family=${pair.googleFonts}&display=swap');`,
    ``,
    `/* AURA font tokens */`,
    `:root {`,
    `  ${pair.css}`,
    `}`,
  ].join('\n')
}
