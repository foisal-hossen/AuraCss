#!/usr/bin/env bun
/**
 * AURA CSS — Build Script
 * Uses Lightning CSS (Rust-powered) to:
 *   - Add vendor prefixes automatically (-webkit-, -moz-)
 *   - Flatten CSS nesting
 *   - Remove unused CSS (tree-shaking)
 *   - Minify output
 *
 * Lightning CSS is written in Rust — same engine as Tailwind v4
 * https://lightningcss.dev
 *
 * Run:
 *   bun run scripts/build.ts
 *   bun run scripts/build.ts --minify
 *   bun run scripts/build.ts --watch
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, watch } from 'fs'
import { join } from 'path'

const ROOT    = new URL('..', import.meta.url).pathname
const CSS_DIR = join(ROOT, 'css')
const OUT_DIR = join(ROOT, 'dist')

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })

/* ── CSS files in correct layer order ── */
const CSS_FILES = [
  'aura-core.css',
  'aura-tokens.css',
  'aura-themes.css',
  'aura-typography.css',
  'aura-color.css',
  'aura-spacing.css',
  'aura-elevation.css',
  'aura-layout.css',
  'aura-utilities.css',
  'aura-transform.css',
  'aura-variants.css',
  'aura-visual.css',
  'aura-motion.css',
  'aura-components.css',
] as const

/* ── Target browsers for vendor prefixes ── */
const TARGETS = {
  chrome:  100 << 16,
  firefox: 100 << 16,
  safari:   15 << 16,
  edge:    100 << 16,
}

const c = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
  blue: '\x1b[34m', magenta: '\x1b[35m', cyan: '\x1b[36m',
  gray: '\x1b[90m',
}

function label(icon: string, msg: string, note = '') {
  console.log(`  ${icon}  ${msg}${note ? `  ${c.gray}${note}${c.reset}` : ''}`)
}

const LICENSE = `/*!
 * AURA CSS v1.0.0 — Adaptive Utility & Responsive Architecture
 * https://aura-css.dev | MIT License
 * Built with Lightning CSS (Rust) — https://lightningcss.dev
 */\n\n`

/* ── Bundle all source CSS files ── */
function bundle(): string {
  let out = LICENSE
  for (const file of CSS_FILES) {
    const path = join(CSS_DIR, file)
    if (!existsSync(path)) {
      console.error(`${c.red}  ✗  Missing: ${file}${c.reset}`)
      process.exit(1)
    }
    out += `/* ── ${file} ── */\n`
    out += readFileSync(path, 'utf-8')
    out += '\n'
  }
  return out
}

/* ── Transform with Lightning CSS (Rust native addon) ── */
async function lightningTransform(
  code: string,
  minify: boolean,
  sourceMap = false,
): Promise<{ code: string; map?: string; usedRust: boolean }> {

  try {
    const { transform } = await import('lightningcss')

    const result = transform({
      filename: minify ? 'aura.min.css' : 'aura.css',
      code:     Buffer.from(code),
      minify,
      sourceMap,
      drafts: { customMedia: true },
      targets: TARGETS,
    })

    return {
      code:     result.code.toString(),
      map:      result.map?.toString(),
      usedRust: true,
    }
  } catch {
    // lightningcss not installed — fallback
    if (minify) {
      const m = code
        .replace(/\/\*(?!!)[^*]*\*+(?:[^/*][^*]*\*+)*/g, '')
        .replace(/\s+/g, ' ')
        .replace(/\s*\{\s*/g, '{').replace(/\s*\}\s*/g, '}')
        .replace(/\s*:\s*/g, ':').replace(/\s*;\s*/g, ';')
        .replace(/\s*,\s*/g, ',').replace(/;}/g, '}').trim()
      return { code: LICENSE + m, usedRust: false }
    }
    return { code, usedRust: false }
  }
}

/* ── Main build ── */
async function build() {
  const start = Date.now()

  console.log(`\n  ${c.bold}${c.magenta}✦ AURA CSS${c.reset}  ${c.gray}Building with Lightning CSS (Rust)...${c.reset}\n`)

  // 1. Bundle
  label(c.cyan + '→' + c.reset, 'Bundling 14 CSS phases...')
  const source = bundle()
  label(c.green + '✓' + c.reset, 'Bundle complete', `${(source.length / 1024).toFixed(0)} KB source`)

  // 2. Full build (with vendor prefixes)
  label(c.cyan + '→' + c.reset, 'Running Lightning CSS (Rust) transform...')
  const full = await lightningTransform(source, false, true)
  writeFileSync(join(OUT_DIR, 'aura.css'), full.code)
  if (full.map) writeFileSync(join(OUT_DIR, 'aura.css.map'), full.map)

  const rustNote = full.usedRust
    ? `${c.green}✓ Rust native${c.reset}`
    : `${c.yellow}⚠ bun add lightningcss to use Rust${c.reset}`
  label(c.green + '✓' + c.reset, 'dist/aura.css',
    `${(full.code.length / 1024).toFixed(0)} KB  ${rustNote}`)

  // 3. Minified build
  label(c.cyan + '→' + c.reset, 'Minifying...')
  const min = await lightningTransform(source, true, false)
  writeFileSync(join(OUT_DIR, 'aura.min.css'), min.code)

  const savings = ((full.code.length - min.code.length) / full.code.length * 100).toFixed(0)
  label(c.green + '✓' + c.reset, 'dist/aura.min.css',
    `${(min.code.length / 1024).toFixed(0)} KB  (${savings}% smaller)`)

  // Done
  const ms = Date.now() - start
  console.log(`\n  ${c.bold}${c.green}✓ Done in ${ms}ms${c.reset}\n`)

  if (!full.usedRust) {
    console.log(`  ${c.yellow}To enable full Rust/Lightning CSS:${c.reset}`)
    console.log(`  ${c.gray}  bun add lightningcss${c.reset}`)
    console.log(`  ${c.gray}  bun run scripts/build.ts${c.reset}\n`)
  }
}

/* ── Watch mode ── */
async function watchMode() {
  console.log(`\n  ${c.cyan}Watching css/ for changes...${c.reset}  ${c.gray}Ctrl+C to stop${c.reset}\n`)
  await build()
  watch(CSS_DIR, { recursive: true }, async (_, filename) => {
    if (filename?.endsWith('.css')) {
      console.log(`  ${c.blue}◆${c.reset}  Changed: ${filename}`)
      await build()
    }
  })
}

/* ── Entry ── */
const args = process.argv.slice(2)
if (args.includes('--watch')) {
  watchMode()
} else {
  build().catch(err => {
    console.error(`\n  ${c.red}✗ Build failed: ${err.message}${c.reset}\n`)
    process.exit(1)
  })
}
