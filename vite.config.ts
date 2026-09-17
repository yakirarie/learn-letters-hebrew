import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages serves project sites from https://<user>.github.io/<repo>/.
// Deriving the repo name means the base path can never drift from the remote.
// Local dev stays at "/" so `npm run dev` behaves normally.
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]
const base = process.env.GITHUB_ACTIONS && repo ? `/${repo}/` : '/'

export default defineConfig({
  base,
  build: {
    outDir: 'dist',
    target: 'es2020',
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // Replaces the old hand-rolled sw.js at the same URL (sw.js), so the
      // existing "letters-v6" registration is taken over rather than orphaned.
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        // `svg` is deliberately excluded: icon.svg is only the source for the
        // generated PNGs and is never requested at runtime, so precaching it
        // would ship dead weight to every install.
        globPatterns: ['**/*.{js,css,html,png,ico,webmanifest}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
      manifest: {
        name: 'לומדים עברית - Learning Hebrew',
        short_name: 'עברית',
        description: 'An interactive app to learn Hebrew letters, numbers, and games.',
        lang: 'he',
        dir: 'rtl',
        // Relative URLs resolve against the manifest location, so these
        // stay correct under any base path.
        start_url: '.',
        scope: '.',
        display: 'standalone',
        orientation: 'any',
        background_color: '#fff9f0',
        theme_color: '#2196F3',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
})
