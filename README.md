# ✦ AURA CSS

**Adaptive Utility & Responsive Architecture**

> OKLCH-powered · Lightning CSS · 7 themes · Zero breakpoints · Tailwind v4-compatible

[![npm](https://img.shields.io/npm/v/@aura/core)](https://npmjs.com/package/@aura/core)
[![license](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

---

## Installation

```bash
# bun (recommended — ultra-fast)
bun add @aura/core

# npm
npm install @aura/core

# pnpm
pnpm add @aura/core

# yarn
yarn add @aura/core
```

---

## Quick Start

### 1. Import CSS

```js
// main.js / main.ts / app.js
import '@aura/core'
```

```css
/* globals.css / main.css */
@import '@aura/core';
```

### 2. Set theme on `<html>`

```html
<html data-theme="dark">
```

### 3. Use classes

```html
<button class="btn btn--primary">Hello AURA</button>
<div class="card card--glass glow">Glass Card</div>
<div class="grid grid-auto-280 gap-6">...</div>
```

---

## CDN (no install)

```html
<!-- Full -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@aura/core@1.0.0/dist/aura.css">

<!-- Minified (recommended for production) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@aura/core@1.0.0/dist/aura.min.css">

<!-- unpkg -->
<link rel="stylesheet" href="https://unpkg.com/@aura/core@1.0.0/dist/aura.min.css">
```

---

## AURA CLI (bunx)

```bash
# Initialize project
bunx aura init

# Development (watch + HMR)
bunx aura dev

# Production build (Lightning CSS)
bunx aura build

# Migrate from Tailwind
bunx aura migrate

# Design audit
bunx aura audit

# List themes
bunx aura themes
```

---

## Vite Plugin

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import aura from '@aura/vite-plugin'

export default defineConfig({
  plugins: [
    aura({
      theme: 'dark',   // default theme
      inject: true,    // auto theme-restore from localStorage
      hmr: true,       // hot-reload on aura.config.ts change
    })
  ]
})
```

---

## Next.js

```tsx
// app/layout.tsx
import '@aura/core'

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var t = localStorage.getItem('aura-theme') ||
                (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
              document.documentElement.setAttribute('data-theme', t);
            } catch(e) {}
          })();
        `}} />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

---

## Configuration

```ts
// aura.config.ts
import { defineConfig } from '@aura/core/config'

export default defineConfig({
  theme: 'dark',
  motion: 'smooth',    // 'smooth' | 'snappy' | 'bouncy' | 'none'
  content: ['./src/**/*.{html,js,ts,jsx,tsx,vue,svelte}'],
  extend: {
    colors: {
      brand: 'oklch(0.58 0.26 290)',
    },
    spacing: {
      section: 'clamp(5rem, 10vw, 9rem)',
    },
  },
  lint: {
    enabled: true,
    enforceTokens: ['color', 'spacing'],
  },
})
```

---

## Themes

```html
<!-- Built-in themes -->
<html data-theme="dark">      <!-- Deep violet dark      -->
<html data-theme="light">     <!-- Default light          -->
<html data-theme="ocean">     <!-- Deep navy, cyan        -->
<html data-theme="aurora">    <!-- Forest green, violet   -->
<html data-theme="ember">     <!-- Warm brown, amber      -->
<html data-theme="rose">      <!-- Rose/magenta, gold     -->
<html data-theme="midnight">  <!-- Pure black, electric   -->
```

```js
// Switch at runtime (smooth transition)
function setTheme(name) {
  document.documentElement.classList.add('aura-transitioning')
  document.documentElement.setAttribute('data-theme', name)
  localStorage.setItem('aura-theme', name)
  setTimeout(() => document.documentElement.classList.remove('aura-transitioning'), 280)
}
```

```html
<!-- Scoped theme — only this element is dark -->
<html data-theme="light">
  <aside data-theme="dark">Dark sidebar!</aside>
  <main>Light content</main>
</html>
```

---

## Tree-shaking (individual imports)

```css
/* Only import what you need */
@import '@aura/core/css/aura-core.css';
@import '@aura/core/css/aura-tokens.css';
@import '@aura/core/css/aura-themes.css';
@import '@aura/core/css/aura-components.css';
```

---

## Intelligence Tools

```ts
import { generateTokens, lintCSS, suggestFontPairs } from '@aura/core/intelligence'

// Brand color → full OKLCH palette
const palette = generateTokens('#6B4EFF')
console.log(palette.css) // CSS variables ready to use

// Lint your CSS
const result = lintCSS(myCSSString, 'globals.css')
console.log(`Score: ${result.score}/100`)

// Font pairing suggestions
const pairs = suggestFontPairs('bold')
```

---

## Class Reference

| Category | Classes |
|---|---|
| **Buttons** | `btn btn--primary` · `btn--ghost` · `btn--outline` · `btn--glass` · `btn--sm/lg` |
| **Cards** | `card card--raised` · `card--glass` · `card--glow` · `card--interactive` |
| **Grid** | `grid grid-auto-280` · `layout-bento` · `layout-sidebar` |
| **Spacing** | `p-4` · `px-6` · `py-8` · `p-fluid-lg` · `gap-4` |
| **Typography** | `heading-hero` · `text-gradient-aura` · `prose` · `text-eyebrow` |
| **Effects** | `glass` · `glow` · `neon` · `shimmer` · `bg-mesh` · `border-gradient` |
| **Motion** | `animate-fade-in-up` · `reveal-up` · `stagger` · `animate-spin` |
| **Variants** | `hover:shadow-glow` · `focus:ring-primary` · `group-hover:opacity-100` |
| **3D** | `rotate-x-45` · `perspective-lg` · `transform-3d` · `backface-hidden` |
| **Responsive** | `@sm:flex` · `@lg:grid-cols-3` (container queries) |

---

## Stack

```
Source CSS (Vanilla CSS + CSS Custom Properties)
       ↓
Lightning CSS (Rust) ← bunx aura build
  ├── CSS nesting flatten
  ├── Vendor prefix add
  ├── Unused CSS remove (tree-shaking)
  └── Minify
       ↓
Output: dist/aura.min.css

TypeScript (CLI + Config + Plugins)
  ├── aura.config.ts parse
  ├── Theme tokens inject
  └── Figma / Tailwind migration handle

Bun (Runtime)
  ├── CLI চালায় (ultra-fast)
  └── Package manager
```

---

## Tailwind Migration

```bash
bunx aura migrate --dry-run   # preview
bunx aura migrate             # apply
bunx aura migrate --report    # detailed report
```

200+ class mappings automatic। 95%+ classes identical।

---

## Links

- 📖 Docs: https://aura-css.dev/docs
- ▶ Playground: https://aura-css.dev/play
- 🐙 GitHub: https://github.com/aura-css/aura

**MIT © AURA CSS**
# AuraCss
