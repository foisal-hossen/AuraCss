/**
 * AURA CSS — Vite Plugin
 * @module @foisal-hossen/aura-css/vite-plugin
 *
 * Usage in vite.config.ts:
 *   import aura from '@foisal-hossen/aura-css/vite-plugin'
 *   export default defineConfig({ plugins: [aura()] })
 */

import type { Plugin, ViteDevServer } from 'vite'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

export type AuraViteOptions = {
  /** Default theme applied to <html> @default 'dark' */
  theme?: 'light' | 'dark' | 'ocean' | 'aurora' | 'ember' | 'rose' | 'midnight' | 'system'
  /** Auto-inject AURA CSS into every HTML page @default true */
  inject?: boolean
  /** Enable HMR when aura.config.ts changes @default true */
  hmr?: boolean
  /** Path to aura.config.ts @default 'aura.config.ts' */
  config?: string
}

export function aura(options: AuraViteOptions = {}): Plugin {
  const {
    theme       = 'dark',
    inject      = true,
    hmr         = true,
    config: cfg = 'aura.config.ts',
  } = options

  let root = process.cwd()

  return {
    name: '@foisal-hossen/aura-css/vite-plugin',
    enforce: 'pre',

    configResolved(c) {
      root = c.root
    },

    configureServer(s: ViteDevServer) {
      if (hmr) {
        const configFile = join(root, cfg)
        if (existsSync(configFile)) s.watcher.add(configFile)
      }
    },

    handleHotUpdate({ file, server: s }: { file: string; server: ViteDevServer }) {
      if (file.endsWith('aura.config.ts') || file.endsWith('aura.config.js')) {
        s.ws.send({ type: 'full-reload' })
        return []
      }
    },

    transformIndexHtml(html: string) {
      if (!inject) return html

      const themeAttr = theme && theme !== 'system' ? ` data-theme="${theme}"` : ''

      // Inject theme restore script (prevents flash of wrong theme)
      const themeScript = `  <script>
    (function(){
      try {
        var t = localStorage.getItem('aura-theme') ||
          (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', t);
      } catch(e) {}
    })();
  </script>`

      return html
        .replace('<html', `<html${themeAttr}`)
        .replace('</head>', `${themeScript}\n</head>`)
    },

    // Resolve @foisal-hossen/aura-css/css/* imports
    resolveId(id: string) {
      if (id === '@foisal-hossen/aura-css' || id === '@foisal-hossen/aura-css/dist/aura.css') {
        return join(root, 'node_modules', '@aura', 'core', 'dist', 'aura.css')
      }
      if (id.startsWith('@foisal-hossen/aura-css/css/')) {
        const file = id.replace('@foisal-hossen/aura-css/css/', '')
        return join(root, 'node_modules', '@aura', 'core', 'css', file)
      }
    },
  }
}

export default aura
