# ✦ AURA CSS

**Adaptive Utility & Responsive Architecture**

> OKLCH-powered · Lightning CSS (Rust) · 7 themes · Zero breakpoints · Tailwind v4-compatible

---

## 🚀 CDN — Works Immediately (no install needed)

```html
<!-- jsDelivr GitHub CDN — always up to date from GitHub -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/foisal-hossen/AuraCss@main/dist/aura.min.css">

<!-- Specific version (recommended for production) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/foisal-hossen/AuraCss@v1.0.0/dist/aura.min.css">

<!-- Full version (unminified) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/foisal-hossen/AuraCss@main/dist/aura.css">
```

---

## 📦 Install via npm / bun

```bash
# bun (recommended)
bun add @foisal-hossen/aura-css

# npm
npm install @foisal-hossen/aura-css

# pnpm
pnpm add @foisal-hossen/aura-css
```

---

## Quick Start

### 1. Import CSS

```js
// main.js / main.ts
import '@foisal-hossen/aura-css'
```

```css
/* globals.css */
@import '@foisal-hossen/aura-css';
```

### 2. Set theme

```html
<html data-theme="dark">
```

### 3. Use classes

```html
<button class="btn btn--primary">Hello AURA</button>
<div class="card card--glass glow">Glass Card</div>
<h1 class="heading-hero text-gradient-aura">Big Heading</h1>
<div class="grid grid-auto-280 gap-6">...</div>
```

---

## Vite Plugin

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import aura from '@foisal-hossen/aura-css/vite-plugin'

export default defineConfig({
  plugins: [
    aura({ theme: 'dark', inject: true, hmr: true })
  ]
})
```

---

## Next.js (App Router)

```tsx
// app/layout.tsx
import '@foisal-hossen/aura-css'

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

## AURA CLI

```bash
# Initialize project
bunx @foisal-hossen/aura-css init

# Development (watch + HMR)
bunx @foisal-hossen/aura-css dev

# Production build (Lightning CSS — Rust)
bunx @foisal-hossen/aura-css build

# Migrate from Tailwind (200+ class mappings)
bunx @foisal-hossen/aura-css migrate

# Design audit
bunx @foisal-hossen/aura-css audit
```

---

## Themes

```html
<html data-theme="dark">      <!-- Deep violet dark      -->
<html data-theme="light">     <!-- Default light          -->
<html data-theme="ocean">     <!-- Deep navy, cyan        -->
<html data-theme="aurora">    <!-- Forest green, violet   -->
<html data-theme="ember">     <!-- Warm brown, amber      -->
<html data-theme="rose">      <!-- Rose/magenta, gold     -->
<html data-theme="midnight">  <!-- Pure black, electric   -->
```

```js
// Switch theme (smooth transition)
function setTheme(name) {
  document.documentElement.classList.add('aura-transitioning')
  document.documentElement.setAttribute('data-theme', name)
  localStorage.setItem('aura-theme', name)
  setTimeout(() =>
    document.documentElement.classList.remove('aura-transitioning'), 280)
}
```

---

## Configuration

```ts
// aura.config.ts
import { defineConfig } from '@foisal-hossen/aura-css/config'

export default defineConfig({
  theme: 'dark',
  motion: 'smooth',
  content: ['./src/**/*.{html,js,ts,jsx,tsx,vue,svelte}'],
  extend: {
    colors: { brand: 'oklch(0.58 0.26 290)' },
    spacing: { section: 'clamp(5rem, 10vw, 9rem)' },
  },
})
```

---

## Tree-shaking

```css
/* Only import what you need */
@import '@foisal-hossen/aura-css/css/aura-core.css';
@import '@foisal-hossen/aura-css/css/aura-tokens.css';
@import '@foisal-hossen/aura-css/css/aura-components.css';
```

---

## Class Reference

| Category     | Classes |
|---|---|
| **Buttons**  | `btn btn--primary` · `btn--ghost` · `btn--outline` · `btn--glass` |
| **Cards**    | `card card--raised` · `card--glass` · `card--glow` · `card--interactive` |
| **Grid**     | `grid grid-auto-280` · `layout-bento` · `layout-sidebar` |
| **Spacing**  | `p-4` · `px-6` · `py-8` · `p-fluid-lg` · `gap-4` |
| **Type**     | `heading-hero` · `text-gradient-aura` · `prose` · `text-eyebrow` |
| **Effects**  | `glass` · `glow` · `neon` · `shimmer` · `bg-mesh` · `border-gradient` |
| **Motion**   | `animate-fade-in-up` · `reveal-up` · `stagger` |
| **Variants** | `hover:shadow-glow` · `focus:ring-primary` · `group-hover:opacity-100` |

---

## Build from source

```bash
# Clone
git clone https://github.com/foisal-hossen/AuraCss.git
cd AuraCss

# Install (includes lightningcss — Rust native)
bun install

# Build (Lightning CSS Rust transform)
bun run build

# Watch mode
bun run build:watch
```

---

## Stack

```
css/ (Source — Vanilla CSS + CSS Custom Properties)
       ↓
scripts/build.ts
       ↓
lightningcss (Rust native binary)
  ├─ Vendor prefix (-webkit-, -moz-)
  ├─ CSS nesting flatten
  ├─ Unused CSS remove
  └─ Minify
       ↓
dist/aura.css + dist/aura.min.css
```

---

## Links

- 📦 npm: https://npmjs.com/package/@foisal-hossen/aura-css
- 🐙 GitHub: https://github.com/foisal-hossen/AuraCss
- 🌐 CDN: https://cdn.jsdelivr.net/gh/foisal-hossen/AuraCss@main/dist/aura.min.css

**MIT © 2025 Foisal Hossen**
