#!/usr/bin/env bun
/**
 * ============================================================
 * AURA CSS — CLI (cli/index.ts)
 * Bun-powered command line tool.
 * ============================================================
 * Usage:
 *   bunx aura init         — scaffold a new AURA project
 *   bunx aura build        — compile CSS with Lightning CSS
 *   bunx aura dev          — watch mode with HMR
 *   bunx aura migrate      — migrate from Tailwind/Bootstrap
 *   bunx aura audit        — design consistency audit
 *   bunx aura tokens       — generate/sync design tokens
 *   bunx aura themes       — list and preview themes
 * ============================================================
 */

import { parseArgs } from 'util'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs'
import { join, resolve, dirname } from 'path'

/* ──────────────────────────────────────────────────────────
   CONSTANTS
────────────────────────────────────────────────────────── */

const VERSION = '1.0.0'

const COLORS = {
  reset:   '\x1b[0m',
  bold:    '\x1b[1m',
  dim:     '\x1b[2m',
  red:     '\x1b[31m',
  green:   '\x1b[32m',
  yellow:  '\x1b[33m',
  blue:    '\x1b[34m',
  magenta: '\x1b[35m',
  cyan:    '\x1b[36m',
  white:   '\x1b[37m',
  gray:    '\x1b[90m',
} as const

/* ──────────────────────────────────────────────────────────
   LOGGER
────────────────────────────────────────────────────────── */

const log = {
  info:    (msg: string) => console.log(`${COLORS.cyan}ℹ${COLORS.reset}  ${msg}`),
  success: (msg: string) => console.log(`${COLORS.green}✓${COLORS.reset}  ${msg}`),
  warn:    (msg: string) => console.log(`${COLORS.yellow}⚠${COLORS.reset}  ${msg}`),
  error:   (msg: string) => console.error(`${COLORS.red}✗${COLORS.reset}  ${msg}`),
  step:    (msg: string) => console.log(`${COLORS.blue}→${COLORS.reset}  ${msg}`),
  label:   (label: string, msg: string) =>
    console.log(`  ${COLORS.bold}${COLORS.magenta}${label}${COLORS.reset}  ${COLORS.gray}${msg}${COLORS.reset}`),
  blank:   () => console.log(''),
}

function banner() {
  console.log(`
${COLORS.bold}${COLORS.magenta}  ✦ AURA CSS${COLORS.reset} ${COLORS.gray}v${VERSION}${COLORS.reset}
${COLORS.gray}  Adaptive Utility & Responsive Architecture${COLORS.reset}
`)
}

function success(msg: string, detail?: string) {
  console.log(`\n  ${COLORS.green}${COLORS.bold}✓ ${msg}${COLORS.reset}`)
  if (detail) console.log(`  ${COLORS.gray}${detail}${COLORS.reset}`)
  console.log()
}

/* ──────────────────────────────────────────────────────────
   COMMAND: init
────────────────────────────────────────────────────────── */

async function cmdInit(flags: Record<string, unknown>) {
  banner()
  log.step('Initializing AURA CSS project...')
  log.blank()

  const cwd = process.cwd()

  // 1. Create aura.config.ts
  const configPath = join(cwd, 'aura.config.ts')
  if (!existsSync(configPath)) {
    writeFileSync(configPath, `import { defineConfig } from '@aura/core'

export default defineConfig({
  theme: 'system',       // 'light' | 'dark' | 'ocean' | 'aurora' | 'ember' | 'rose' | 'midnight'
  motion: 'smooth',      // 'smooth' | 'snappy' | 'bouncy' | 'none'
  content: [
    './src/**/*.{html,js,ts,jsx,tsx,vue,svelte}',
  ],
  extend: {
    colors: {
      // brand: 'oklch(0.55 0.22 270)',
    },
  },
})
`)
    log.success('Created aura.config.ts')
  } else {
    log.warn('aura.config.ts already exists — skipping')
  }

  // 2. Create src/styles/aura.css (entry point)
  const stylesDir = join(cwd, 'src', 'styles')
  if (!existsSync(stylesDir)) mkdirSync(stylesDir, { recursive: true })

  const entryPath = join(stylesDir, 'aura.css')
  if (!existsSync(entryPath)) {
    writeFileSync(entryPath, `/* AURA CSS — Entry Point */
@import '@aura/core/css/aura-core.css';
@import '@aura/core/css/aura-tokens.css';
@import '@aura/core/css/aura-themes.css';
@import '@aura/core/css/aura-typography.css';
@import '@aura/core/css/aura-color.css';
@import '@aura/core/css/aura-spacing.css';
@import '@aura/core/css/aura-elevation.css';
@import '@aura/core/css/aura-layout.css';
@import '@aura/core/css/aura-utilities.css';
@import '@aura/core/css/aura-transform.css';
@import '@aura/core/css/aura-variants.css';
@import '@aura/core/css/aura-visual.css';
@import '@aura/core/css/aura-motion.css';
@import '@aura/core/css/aura-components.css';

/* Your custom overrides below */
@layer aura.overrides {
  /* :root { --color-primary: oklch(0.55 0.22 310); } */
}
`)
    log.success('Created src/styles/aura.css')
  }

  // 3. Create .auraignore
  const ignorePath = join(cwd, '.auraignore')
  if (!existsSync(ignorePath)) {
    writeFileSync(ignorePath, `node_modules/
dist/
.next/
.nuxt/
*.min.css
`)
    log.success('Created .auraignore')
  }

  // 4. VS Code settings for AURA IntelliSense
  const vscodeDir = join(cwd, '.vscode')
  if (!existsSync(vscodeDir)) mkdirSync(vscodeDir, { recursive: true })

  const settingsPath = join(vscodeDir, 'settings.json')
  const settings = existsSync(settingsPath)
    ? JSON.parse(readFileSync(settingsPath, 'utf-8'))
    : {}

  settings['css.customData'] = ['.vscode/aura.css-data.json']
  settings['editor.quickSuggestions'] = { strings: true }
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2))
  log.success('Updated .vscode/settings.json for IntelliSense')

  success('AURA CSS initialized!', 'Run `bunx aura dev` to start watching.')
}

/* ──────────────────────────────────────────────────────────
   COMMAND: build
────────────────────────────────────────────────────────── */

async function cmdBuild(flags: Record<string, unknown>) {
  const start = Date.now()
  banner()
  log.step('Building with Lightning CSS...')
  log.blank()

  const cwd = process.cwd()
  const input  = (flags.input  as string) ?? 'src/styles/aura.css'
  const output = (flags.output as string) ?? 'dist/aura.css'
  const minify = (flags.minify as boolean) ?? true

  // Check input exists
  const inputPath = join(cwd, input)
  if (!existsSync(inputPath)) {
    log.error(`Input file not found: ${input}`)
    log.info('Run `bunx aura init` first.')
    process.exit(1)
  }

  // Create output dir
  const outputPath = join(cwd, output)
  const outputDir  = dirname(outputPath)
  if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true })

  try {
    // Try Lightning CSS
    const lightningcss = await import('lightningcss').catch(() => null)

    if (lightningcss) {
      const { transform } = lightningcss
      const source = readFileSync(inputPath)

      const result = transform({
        filename: inputPath,
        code: source,
        minify: minify as boolean,
        sourceMap: !minify,
        drafts: { customMedia: true },
        targets: { chrome: 115, firefox: 115, safari: 16 },
      })

      writeFileSync(outputPath, result.code)
      if (result.map) writeFileSync(outputPath + '.map', result.map)

      const originalSize = source.length
      const outputSize   = result.code.length
      const savings      = (((originalSize - outputSize) / originalSize) * 100).toFixed(1)

      log.success(`Built ${output}`)
      log.label('Input',    `${(originalSize / 1024).toFixed(1)} KB`)
      log.label('Output',   `${(outputSize / 1024).toFixed(1)} KB`)
      log.label('Savings',  `${savings}%`)
      log.label('Time',     `${Date.now() - start}ms`)
    } else {
      // Fallback — just copy
      log.warn('lightningcss not found — copying without optimization')
      log.info('Install it: bun add lightningcss')
      const source = readFileSync(inputPath)
      writeFileSync(outputPath, source)
      log.success(`Copied to ${output}`)
    }

    // Run linter after build
    if (!flags['no-lint']) {
      log.blank()
      await runLintCheck(inputPath)
    }

  } catch (err) {
    log.error(`Build failed: ${(err as Error).message}`)
    process.exit(1)
  }

  success('Build complete!', `Output: ${output}`)
}

/* ──────────────────────────────────────────────────────────
   COMMAND: dev (watch mode)
────────────────────────────────────────────────────────── */

async function cmdDev(flags: Record<string, unknown>) {
  banner()
  log.step('Starting AURA dev server...')
  log.blank()

  const input  = (flags.input  as string) ?? 'src/styles/aura.css'
  const output = (flags.output as string) ?? 'dist/aura.css'
  const port   = (flags.port   as number) ?? 3030

  log.label('Watching', input)
  log.label('Output',   output)
  log.label('HMR port', String(port))
  log.blank()

  let buildCount = 0

  async function rebuild() {
    const start = Date.now()
    await cmdBuild({ ...flags, input, output, 'no-lint': true })
    buildCount++
    log.success(`Rebuild #${buildCount} in ${Date.now() - start}ms`)
  }

  // Initial build
  await rebuild()

  // Watch using Bun's file watcher
  const watcher = Bun.watch(['src'], { recursive: true })

  log.info(`Watching for changes... (Press Ctrl+C to stop)`)
  log.blank()

  for await (const event of watcher) {
    if (
      event.filename.endsWith('.css') ||
      event.filename.endsWith('.ts') ||
      event.filename === 'aura.config.ts'
    ) {
      log.step(`File changed: ${event.filename}`)
      try {
        await rebuild()
      } catch (err) {
        log.error(`Rebuild failed: ${(err as Error).message}`)
      }
    }
  }
}

/* ──────────────────────────────────────────────────────────
   COMMAND: migrate
────────────────────────────────────────────────────────── */

const TAILWIND_TO_AURA: Record<string, string> = {
  // Layout
  'container':          'container',
  'mx-auto':            'mx-auto',
  // Flexbox
  'flex':               'flex',
  'inline-flex':        'inline-flex',
  'flex-row':           'flex-row',
  'flex-col':           'flex-col',
  'flex-wrap':          'flex-wrap',
  'flex-nowrap':        'flex-nowrap',
  'flex-1':             'flex-1',
  'flex-auto':          'flex-auto',
  'flex-none':          'flex-none',
  'flex-shrink-0':      'shrink-0',
  'flex-grow':          'grow',
  'items-start':        'items-start',
  'items-center':       'items-center',
  'items-end':          'items-end',
  'items-stretch':      'items-stretch',
  'justify-start':      'justify-start',
  'justify-center':     'justify-center',
  'justify-end':        'justify-end',
  'justify-between':    'justify-between',
  'justify-around':     'justify-around',
  'justify-evenly':     'justify-evenly',
  'self-auto':          'self-auto',
  'self-start':         'self-start',
  'self-center':        'self-center',
  'self-end':           'self-end',
  'self-stretch':       'self-stretch',
  // Grid
  'grid':               'grid',
  'inline-grid':        'inline-grid',
  'grid-cols-1':        'grid-cols-1',
  'grid-cols-2':        'grid-cols-2',
  'grid-cols-3':        'grid-cols-3',
  'grid-cols-4':        'grid-cols-4',
  'grid-cols-6':        'grid-cols-6',
  'grid-cols-12':       'grid-cols-12',
  'col-span-1':         'col-span-1',
  'col-span-2':         'col-span-2',
  'col-span-full':      'col-span-full',
  // Spacing
  'p-0':    'p-0',   'p-1':  'p-1',   'p-2':  'p-2',   'p-3':  'p-3',
  'p-4':    'p-4',   'p-5':  'p-5',   'p-6':  'p-6',   'p-8':  'p-8',
  'p-10':   'p-10',  'p-12': 'p-12',  'p-16': 'p-16',  'p-20': 'p-20',
  'px-0':   'px-0',  'px-2': 'px-2',  'px-4': 'px-4',  'px-6': 'px-6',
  'px-8':   'px-8',
  'py-0':   'py-0',  'py-2': 'py-2',  'py-4': 'py-4',  'py-6': 'py-6',
  'py-8':   'py-8',
  'pt-0':   'pt-0',  'pt-4': 'pt-4',  'pb-0': 'pb-0',  'pb-4': 'pb-4',
  'pl-0':   'pl-0',  'pl-4': 'pl-4',  'pr-0': 'pr-0',  'pr-4': 'pr-4',
  'm-0':    'm-0',   'm-1':  'm-1',   'm-2':  'm-2',   'm-4':  'm-4',
  'm-auto': 'm-auto',
  'mx-0':   'mx-0',  'mx-4': 'mx-4',  'my-0': 'my-0',  'my-4': 'my-4',
  'mt-0':   'mt-0',  'mt-4': 'mt-4',  'mb-0': 'mb-0',  'mb-4': 'mb-4',
  'ml-0':   'ml-0',  'ml-4': 'ml-4',  'mr-0': 'mr-0',  'mr-4': 'mr-4',
  'gap-0': 'gap-0',  'gap-1': 'gap-1', 'gap-2': 'gap-2', 'gap-4': 'gap-4',
  'gap-6': 'gap-6',  'gap-8': 'gap-8',
  // Width / Height
  'w-full':   'w-full',   'w-screen': 'w-screen', 'w-auto': 'w-auto',
  'h-full':   'h-full',   'h-screen': 'h-screen', 'h-auto': 'h-auto',
  'min-h-screen': 'min-h-screen',
  // Typography
  'text-xs':   'text-xs',   'text-sm': 'text-sm',
  'text-base': 'text-base', 'text-lg': 'text-lg',
  'text-xl':   'text-xl',   'text-2xl': 'text-2xl',
  'text-3xl':  'text-3xl',  'text-4xl': 'text-4xl',
  'font-thin':      'font-thin',
  'font-light':     'font-light',
  'font-normal':    'font-normal',
  'font-medium':    'font-medium',
  'font-semibold':  'font-semibold',
  'font-bold':      'font-bold',
  'font-extrabold': 'font-extrabold',
  'font-black':     'font-black',
  'leading-none':     'leading-none',
  'leading-tight':    'leading-tight',
  'leading-snug':     'leading-snug',
  'leading-normal':   'leading-normal',
  'leading-relaxed':  'leading-relaxed',
  'leading-loose':    'leading-loose',
  'tracking-tight':   'tracking-tight',
  'tracking-normal':  'tracking-normal',
  'tracking-wide':    'tracking-wide',
  'tracking-wider':   'tracking-wider',
  'tracking-widest':  'tracking-widest',
  'text-left':    'text-left',   'text-center': 'text-center',
  'text-right':   'text-right',  'text-justify': 'text-justify',
  'uppercase':    'uppercase',   'lowercase':    'lowercase',
  'capitalize':   'capitalize',  'normal-case':  'normal-case',
  'truncate':     'truncate',    'text-ellipsis':'text-ellipsis',
  'whitespace-nowrap': 'whitespace-nowrap',
  'break-words':       'break-words',
  'line-clamp-1': 'line-clamp-1', 'line-clamp-2': 'line-clamp-2',
  'line-clamp-3': 'line-clamp-3',
  // Colors
  'text-white': 'text-white',   'text-black': 'text-black',
  'bg-white':   'bg-white',     'bg-black':   'bg-black',
  'bg-transparent': 'bg-transparent',
  // Border radius
  'rounded-none': 'rounded-none', 'rounded-sm':   'rounded-sm',
  'rounded':      'rounded',      'rounded-md':   'rounded-md',
  'rounded-lg':   'rounded-lg',   'rounded-xl':   'rounded-xl',
  'rounded-2xl':  'rounded-2xl',  'rounded-3xl':  'rounded-3xl',
  'rounded-full': 'rounded-full',
  // Shadows
  'shadow-none': 'shadow-none', 'shadow-sm': 'shadow-sm',
  'shadow':      'shadow',      'shadow-md': 'shadow-md',
  'shadow-lg':   'shadow-lg',   'shadow-xl': 'shadow-xl',
  'shadow-2xl':  'shadow-2xl',
  // Position
  'static':   'static',   'fixed':    'fixed',
  'absolute': 'absolute', 'relative': 'relative',
  'sticky':   'sticky',
  'inset-0':  'inset-0',  'inset-x-0': 'inset-x-0',
  'inset-y-0':'inset-y-0',
  'top-0':    'top-0',    'bottom-0': 'bottom-0',
  'left-0':   'left-0',   'right-0':  'right-0',
  // Display
  'block':       'block',       'inline': 'inline',
  'inline-block':'inline-block','hidden': 'hidden',
  'contents':    'contents',
  // Overflow
  'overflow-hidden':   'overflow-hidden',
  'overflow-auto':     'overflow-auto',
  'overflow-scroll':   'overflow-scroll',
  'overflow-visible':  'overflow-visible',
  'overflow-x-auto':   'overflow-x-auto',
  'overflow-y-auto':   'overflow-y-auto',
  'overflow-x-hidden': 'overflow-x-hidden',
  'overflow-y-hidden': 'overflow-y-hidden',
  // Opacity
  'opacity-0':   'opacity-0',   'opacity-25': 'opacity-25',
  'opacity-50':  'opacity-50',  'opacity-75': 'opacity-75',
  'opacity-100': 'opacity-100',
  // Transform
  'transition':           'transition',
  'transition-all':       'transition-all',
  'transition-colors':    'transition-colors',
  'transition-opacity':   'transition-opacity',
  'transition-transform': 'transition-transform',
  'duration-75':   'duration-75',   'duration-100': 'duration-100',
  'duration-150':  'duration-150',  'duration-200': 'duration-200',
  'duration-300':  'duration-300',  'duration-500': 'duration-500',
  'ease-linear':   'ease-linear',   'ease-in':      'ease-in',
  'ease-out':      'ease-out',      'ease-in-out':  'ease-in-out',
  'scale-0':       'scale-0',       'scale-95':     'scale-95',
  'scale-100':     'scale-100',     'scale-105':    'scale-105',
  'scale-110':     'scale-110',
  'rotate-0':      'rotate-0',      'rotate-45':    'rotate-45',
  'rotate-90':     'rotate-90',     'rotate-180':   'rotate-180',
  // Misc
  'cursor-pointer':     'cursor-pointer',
  'cursor-not-allowed': 'cursor-not-allowed',
  'cursor-default':     'cursor-default',
  'select-none':        'select-none',
  'select-text':        'select-text',
  'select-all':         'select-all',
  'pointer-events-none':'pointer-events-none',
  'pointer-events-auto':'pointer-events-auto',
  'sr-only':            'sr-only',
  'not-sr-only':        'not-sr-only',
  'z-0':  'z-0',  'z-10': 'z-10', 'z-20': 'z-20',
  'z-30': 'z-30', 'z-40': 'z-40', 'z-50': 'z-50',
  'appearance-none': 'appearance-none',
  'outline-none':    'outline-none',
  'isolate':         'isolate',
  'will-change-transform': 'will-change-transform',
  'aspect-auto':    'aspect-auto',
  'aspect-square':  'aspect-square',
  'aspect-video':   'aspect-video',
  // Animations
  'animate-none':     'animate-none',
  'animate-spin':     'animate-spin',
  'animate-ping':     'animate-ping',
  'animate-pulse':    'animate-pulse',
  'animate-bounce':   'animate-bounce',
  // Object
  'object-cover':    'object-cover',
  'object-contain':  'object-contain',
  'object-fill':     'object-fill',
  'object-none':     'object-none',
  'object-center':   'object-center',
  // Background
  'bg-cover':       'bg-cover',
  'bg-contain':     'bg-contain',
  'bg-auto':        'bg-auto',
  'bg-center':      'bg-center',
  'bg-no-repeat':   'bg-no-repeat',
  'bg-repeat':      'bg-repeat',
  // List
  'list-none':      'list-none',
  'list-disc':      'list-disc',
  'list-decimal':   'list-decimal',
}

// Regex patterns for Tailwind color classes → AURA equivalents
const COLOR_PATTERNS: Array<[RegExp, (match: string, ...groups: string[]) => string]> = [
  [/\bbg-gray-(\d+)\b/g,   (_, n) => `bg-neutral-${n}`],
  [/\bbg-slate-(\d+)\b/g,  (_, n) => `bg-neutral-${n}`],
  [/\btext-gray-(\d+)\b/g, (_, n) => `text-neutral-${n}`],
  [/\bborder-gray-(\d+)\b/g,(_, n) => `border-neutral-${n}`],
  [/\btext-blue-(\d+)\b/g,  () => 'text-info'],
  [/\btext-red-(\d+)\b/g,   () => 'text-danger'],
  [/\btext-green-(\d+)\b/g, () => 'text-success'],
  [/\btext-yellow-(\d+)\b/g,() => 'text-warning'],
  [/\bbg-blue-(\d+)\b/g,    () => 'bg-info-subtle'],
  [/\bbg-red-(\d+)\b/g,     () => 'bg-danger-subtle'],
  [/\bbg-green-(\d+)\b/g,   () => 'bg-success-subtle'],
  [/\bbg-yellow-(\d+)\b/g,  () => 'bg-warning-subtle'],
  [/\bdark:(.+?)(?=\s|$)/g, (_, cls) => `dark\\:${TAILWIND_TO_AURA[cls] ?? cls}`],
  [/\bhover:(.+?)(?=\s|$)/g,(_, cls) => `hover\\:${TAILWIND_TO_AURA[cls] ?? cls}`],
  [/\bfocus:(.+?)(?=\s|$)/g,(_, cls) => `focus\\:${TAILWIND_TO_AURA[cls] ?? cls}`],
]

async function cmdMigrate(flags: Record<string, unknown>) {
  banner()
  const from = (flags.from as string) ?? 'tailwind'
  const dry  = flags['dry-run'] as boolean ?? false

  log.step(`Migrating from ${from} to AURA CSS...`)
  if (dry) log.info('Dry run mode — no files will be modified.')
  log.blank()

  const { glob } = await import('glob')
  const patterns = (flags.pattern as string) ?? '**/*.{html,jsx,tsx,vue,svelte}'
  const files = await glob(patterns, {
    ignore: ['node_modules/**', 'dist/**', '.next/**'],
    cwd: process.cwd(),
  })

  if (files.length === 0) {
    log.warn(`No files matched: ${patterns}`)
    return
  }

  let totalMigrated = 0
  let totalWarnings = 0
  const report: Array<{ file: string; changes: number; warnings: string[] }> = []

  for (const file of files) {
    const filePath = join(process.cwd(), file)
    let content = readFileSync(filePath, 'utf-8')
    const original = content
    let changes = 0
    const warnings: string[] = []

    // 1. Direct class replacements
    for (const [tailwindClass, auraClass] of Object.entries(TAILWIND_TO_AURA)) {
      if (tailwindClass === auraClass) continue
      const regex = new RegExp(`\\b${tailwindClass}\\b`, 'g')
      const before = content
      content = content.replace(regex, auraClass)
      if (content !== before) changes++
    }

    // 2. Color pattern replacements
    for (const [pattern, replacer] of COLOR_PATTERNS) {
      const before = content
      content = content.replace(pattern, replacer as any)
      if (content !== before) changes++
    }

    // 3. Detect unmigrated patterns and warn
    const unmigrated = [
      ...content.matchAll(/\btw-[a-z-]+\b/g),
      ...content.matchAll(/\bclass(?:Name)?="[^"]*(?:bg|text|border)-(?:purple|pink|indigo|teal|lime|orange|fuchsia|violet)-\d+[^"]*"/g),
    ]

    for (const match of unmigrated) {
      warnings.push(`Unmigrated class: ${match[0].slice(0, 60)}`)
      totalWarnings++
    }

    // 4. Write changes
    if (changes > 0 || warnings.length > 0) {
      if (!dry && changes > 0) writeFileSync(filePath, content)
      report.push({ file, changes, warnings })
      totalMigrated += changes
    }
  }

  // Print report
  log.blank()
  log.success(`Scanned ${files.length} files`)
  log.label('Migrated', `${totalMigrated} class replacements`)
  log.label('Warnings', `${totalWarnings} items need manual review`)
  log.blank()

  if (report.length > 0) {
    console.log(`  ${COLORS.bold}Files changed:${COLORS.reset}`)
    for (const r of report.slice(0, 20)) {
      console.log(`  ${COLORS.gray}${r.file}${COLORS.reset}  ${COLORS.green}+${r.changes}${COLORS.reset}`)
      for (const w of r.warnings.slice(0, 3)) {
        console.log(`    ${COLORS.yellow}⚠ ${w}${COLORS.reset}`)
      }
    }
    if (report.length > 20) {
      console.log(`  ${COLORS.gray}... and ${report.length - 20} more${COLORS.reset}`)
    }
  }

  if (flags.report) {
    const reportPath = join(process.cwd(), 'aura-migration-report.json')
    writeFileSync(reportPath, JSON.stringify(report, null, 2))
    log.blank()
    log.success(`Report saved: aura-migration-report.json`)
  }

  success('Migration complete!', dry ? 'Run without --dry-run to apply changes.' : 'Review the warnings above manually.')
}

/* ──────────────────────────────────────────────────────────
   COMMAND: audit
────────────────────────────────────────────────────────── */

async function runLintCheck(filePath: string) {
  const content = readFileSync(filePath, 'utf-8')
  const issues: Array<{ type: 'error' | 'warning'; msg: string; line?: number }> = []

  const lines = content.split('\n')

  lines.forEach((line, i) => {
    const lineNum = i + 1
    // Hardcoded colors
    const hexColors = line.match(/#[0-9a-fA-F]{3,8}\b/g)
    if (hexColors && !line.trim().startsWith('/*') && !line.includes('--')) {
      hexColors.forEach(hex => {
        if (!line.includes('@keyframes') && !line.includes('background-image')) {
          issues.push({ type: 'warning', msg: `Hardcoded color ${hex} — use token`, line: lineNum })
        }
      })
    }
    // Hardcoded px spacing (not tokens)
    if (/:\s*\d+px/.test(line) && !line.includes('var(--') && !line.trim().startsWith('//')) {
      issues.push({ type: 'warning', msg: `Hardcoded px value — use spacing token`, line: lineNum })
    }
    // !important usage
    if (line.includes('!important') && !line.trim().startsWith('/*')) {
      issues.push({ type: 'error', msg: `!important found — use @layer instead`, line: lineNum })
    }
  })

  if (issues.length > 0) {
    log.blank()
    console.log(`  ${COLORS.bold}Lint issues (${issues.length}):${COLORS.reset}`)
    for (const issue of issues.slice(0, 10)) {
      const icon = issue.type === 'error' ? `${COLORS.red}✗` : `${COLORS.yellow}⚠`
      const line = issue.line ? `${COLORS.gray}:${issue.line}` : ''
      console.log(`  ${icon} ${COLORS.reset}${issue.msg}${line}${COLORS.reset}`)
    }
    if (issues.length > 10) {
      console.log(`  ${COLORS.gray}... and ${issues.length - 10} more${COLORS.reset}`)
    }
  } else {
    log.success('No lint issues found')
  }

  return issues
}

async function cmdAudit(flags: Record<string, unknown>) {
  banner()
  log.step('Running design consistency audit...')
  log.blank()

  const target = (flags.target as string) ?? 'src'
  const { glob } = await import('glob')
  const files = await glob(`${target}/**/*.css`, {
    ignore: ['node_modules/**', 'dist/**'],
    cwd: process.cwd(),
  })

  if (files.length === 0) {
    log.warn('No CSS files found to audit.')
    return
  }

  let totalIssues = 0
  for (const file of files) {
    const issues = await runLintCheck(join(process.cwd(), file))
    totalIssues += issues.length
  }

  log.blank()
  log.label('Files audited', String(files.length))
  log.label('Total issues', String(totalIssues))

  success(
    totalIssues === 0 ? 'Perfect score! All tokens used correctly.' : `Audit complete — ${totalIssues} issue${totalIssues !== 1 ? 's' : ''} found.`,
    totalIssues > 0 ? 'Fix the issues above to improve consistency.' : undefined
  )
}

/* ──────────────────────────────────────────────────────────
   COMMAND: themes
────────────────────────────────────────────────────────── */

async function cmdThemes() {
  banner()
  const themes = [
    { name: 'light',    desc: 'Default light theme',              primary: 'oklch(0.55 0.22 270)' },
    { name: 'dark',     desc: 'Deep violet-tinted dark',          primary: 'oklch(0.65 0.22 270)' },
    { name: 'ocean',    desc: 'Deep navy, cyan accents',          primary: 'oklch(0.68 0.19 215)' },
    { name: 'aurora',   desc: 'Forest green, violet accents',     primary: 'oklch(0.70 0.20 150)' },
    { name: 'ember',    desc: 'Warm brown, amber accents',        primary: 'oklch(0.72 0.19 55)' },
    { name: 'rose',     desc: 'Rose/magenta, gold accents',       primary: 'oklch(0.68 0.24 340)' },
    { name: 'midnight', desc: 'Pure black, electric blue',        primary: 'oklch(0.65 0.25 240)' },
  ]

  console.log(`  ${COLORS.bold}Available AURA Themes:${COLORS.reset}\n`)
  for (const t of themes) {
    log.label(t.name.padEnd(12), `${t.desc}  ${COLORS.gray}${t.primary}${COLORS.reset}`)
  }

  log.blank()
  log.info('Set theme in aura.config.ts:')
  console.log(`  ${COLORS.gray}export default defineConfig({ theme: 'ocean' })${COLORS.reset}\n`)
  log.info('Or switch at runtime:')
  console.log(`  ${COLORS.gray}document.documentElement.setAttribute('data-theme', 'ocean')${COLORS.reset}\n`)
}

/* ──────────────────────────────────────────────────────────
   MAIN — parse commands
────────────────────────────────────────────────────────── */

async function main() {
  const { values, positionals } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      input:     { type: 'string',  short: 'i' },
      output:    { type: 'string',  short: 'o' },
      from:      { type: 'string',  short: 'f' },
      pattern:   { type: 'string',  short: 'p' },
      port:      { type: 'string' },
      target:    { type: 'string',  short: 't' },
      minify:    { type: 'boolean', short: 'm', default: true },
      'no-lint': { type: 'boolean', default: false },
      'dry-run': { type: 'boolean', default: false },
      report:    { type: 'boolean', default: false },
      help:      { type: 'boolean', short: 'h' },
      version:   { type: 'boolean', short: 'v' },
    },
    allowPositionals: true,
    strict: false,
  })

  const command = positionals[0]
  const flags: Record<string, unknown> = { ...values }

  if (flags.version) {
    console.log(`AURA CSS v${VERSION}`)
    process.exit(0)
  }

  if (flags.help || !command) {
    banner()
    console.log(`  ${COLORS.bold}Usage:${COLORS.reset}  bunx aura <command> [options]\n`)
    console.log(`  ${COLORS.bold}Commands:${COLORS.reset}`)
    log.label('init',    'Scaffold a new AURA project')
    log.label('build',   'Compile CSS with Lightning CSS  [-i input] [-o output] [--no-lint]')
    log.label('dev',     'Watch mode with auto-rebuild     [-i input] [-o output] [--port]')
    log.label('migrate', 'Migrate from Tailwind/Bootstrap  [--from tailwind] [--dry-run] [--report]')
    log.label('audit',   'Design consistency audit         [--target src]')
    log.label('themes',  'List available themes')
    console.log()
    process.exit(0)
  }

  switch (command) {
    case 'init':    await cmdInit(flags);    break
    case 'build':   await cmdBuild(flags);   break
    case 'dev':     await cmdDev(flags);     break
    case 'migrate': await cmdMigrate(flags); break
    case 'audit':   await cmdAudit(flags);   break
    case 'themes':  await cmdThemes();       break
    default:
      log.error(`Unknown command: ${command}`)
      log.info('Run `bunx aura --help` for usage.')
      process.exit(1)
  }
}

main().catch(err => {
  console.error(`\n  ${COLORS.red}Fatal error:${COLORS.reset} ${err.message}\n`)
  process.exit(1)
})
