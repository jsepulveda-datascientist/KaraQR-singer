/* eslint-env node */

const { configure } = require('quasar/wrappers')

module.exports = configure(function (/* ctx */) {
  return {
    eslint: {
      warnings: true,
      errors: true
    },

    boot: [
      'i18n'
    ],

    css: [
      'app.scss'
    ],

    extras: [
      'roboto-font',
      'material-icons'
    ],

    build: {
      target: {
        browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
        node: 'node20'
      },

      vueRouterMode: 'history',
      vitePlugins: [
        ['@intlify/vite-plugin-vue-i18n', {
          include: './src/i18n/**'
        }]
      ]
    },

    devServer: {
      open: true,
      port: 9000
    },

    framework: {
      config: {},
      plugins: ['Notify', 'Dialog']
    },

    animations: [],

    pwa: {
      workboxMode: 'generateSW',
      injectPwaMetaTags: true,
      swFilename: 'sw.js',
      manifestFilename: 'manifest.json',
      useCredentialsForManifestTag: false,
      useFilenameHashes: true,
      extendGenerateSWOptions (cfg) {
        cfg.skipWaiting = true
        cfg.clientsClaim = true
      },
      manifest: {
        name: 'KaraQR Singer',
        short_name: 'KaraQR Singer',
        description: 'KaraQR Singer - Aplicación para cantantes',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#1976d2',
        icons: [
          {
            src: 'icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-256x256.png',
            sizes: '256x256',
            type: 'image/png'
          },
          {
            src: 'icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    },

    ssr: {
      pwa: false,
      prodPort: 3000,
      middlewares: [
        'render'
      ]
    },

    capacitor: {
      hideSplashscreen: true
    },

    electron: {
      inspectPort: 5858,

      bundler: 'packager',

      packager: {
      },

      builder: {
        appId: 'karaqr-singer'
      }
    },

    bex: {
      contentScripts: [
        'my-content-script'
      ]
    }
  }
})