// https://nuxt.com/docs/api/configuration/nuxt-config
import process from 'node:process'

const baseUrl = process.env.NUXT_APP_BASE_URL || '/'
const description = 'Harmex'

export default defineNuxtConfig({
  app: {
    baseURL: baseUrl,
    head: {
      viewport: 'width=device-width,initial-scale=1',
      title: 'Harmex',
      link: [{ rel: 'icon', href: '/favicon.png' }],
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          'http-equiv': 'Content-Security-Policy',
          'content': 'upgrade-insecure-requests',
        },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: description },
        {
          name: 'apple-mobile-web-app-status-bar-style',
          content: 'black-translucent',
        },
        { name: 'yandex-verification', content: '8b9387e0d0a4e1a8' },
      ],
    },
  },

  colorMode: {
    preference: 'light',
    dataValue: 'theme',
    classSuffix: '',
  },

  image: {},

  lazyLoad: {
    // These are the default values
    images: true,
    videos: true,
    audios: true,
    iframes: true,
    native: false,
    directiveOnly: false,

    // To remove class set value to false
    loadingClass: 'isLoading',
    loadedClass: 'isLoaded',
    appendClass: 'lazyLoad',

    observerConfig: {
      // See IntersectionObserver documentation
    },
  },

  nitro: {
    plugins: ['~/server/index.ts'],
    preset: 'bun',
  },

  modules: [
    'nuxt-lazy-load',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    'nuxt-icon',
    '@vueuse/nuxt',
    'nuxt-security',
    '@nuxtjs/color-mode',
    '@sfxcode/nuxt-primevue',
    '@morev/vue-transitions/nuxt',
    '@nuxt/fonts',
    'nuxt-auth-utils',
    '@nuxt/image',
    'nuxt3-notifications',
    '@nuxtjs/turnstile',
    '@nuxt/scripts',
    'radix-vue/nuxt',
    'shadcn-nuxt',
    'nuxt-i18n-micro',
    '@nuxt/eslint',
    '@bg-dev/nuxt-s3',
  ],
  eslint: {
    config: {
      standalone: false, // <---
    },
  },

  turnstile: {
    siteKey: '0x4AAAAAAAw5ArLU136z91q_',
  },

  icon: {
    sources: [
      {
        src: '~/assets/icons',
        prefix: 'custom', // Префикс для кастомных иконок
      },
    ],
  },

  css: [
    'primevue/resources/primevue.css',
    'primeicons/primeicons.css',
    '@/assets/style/css/customButton.css',
    '@vuepic/vue-datepicker/dist/main.css',
  ],

  s3: {
    client: {
      credentials: {
        secretAccessKey: process.env.VK_SECRET_KEY || '',
        accessKeyId: process.env.VK_ACCESS_KEY || '',
      },
      endpoint: 'https://hb.vkcs.cloud/reviewImages/',
      region: 'ru-msk',
    },
    publicBucketUrl: `${process.env.PUBLIC_SITE_URL}/images/get/`,
    bucket: 'ozonmpportal',
    image: {
      compression: {
        maxSizeMB: 10,
        maxWidthOrHeight: 4000,
      },
    },
  },

  hooks: {
    close: () => {
      process.exit()
    },
  },

  build: {
    transpile: ['primevue', '@vuepic/vue-datepicker'],
  },

  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: 'sha',
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: './components/ui',
  },

  primevue: {
    components: {
      include: [
        'DataTable',
        'Column',
        'Chips',
        'MultiSelect',
        'Button',
        'DataView',
      ],
    },
  },

  imports: {
    dirs: ['./stores', './data', './server/lib', './server/lib/models'],
  },

  runtimeConfig: {
    public: {
      siteName: process.env.NAME,
      BOT_ID: process.env.BOT_ID,
      siteUrl: process.env.PUBLIC_SITE_URL,
      language: 'ru',
      trailingSlash: true,
      BOT_LOGIN: process.env.BOT_LOGIN,
      DOMAIN_API_IMAGES_URL: process.env.DOMAIN_API_IMAGES_URL,
      YANDEX_MAPS_API_KEY: process.env.YANDEX_MAPS_API_KEY,
    },
    turnstile: {
      secretKey: '0x4AAAAAAAw5Ajel8a_CNjT4CGlB25Geh48',
    },
    MONGODB_URI: process.env.MONGODB_URI,
    WB_DB_URI: process.env.WB_DB_URI,
    AVITO_DB_URI: process.env.AVITO_DB_URI,
    OZON_DB_URI: process.env.OZON_DB_URI,
    FLOWWOW_DB_URI: process.env.FLOWWOW_DB_URI,
    OZON_PVZ_DB_URI: process.env.OZON_PVZ_DB_URI,
    VK_ACCESS_KEY: process.env.VK_ACCESS_KEY,
    VK_SECRET_KEY: process.env.VK_SECRET_KEY,
    env: process.env.ENV_WORK,
    indexable: true,
    SECRET: process.env.SECRET,
    smtpHost: process.env.smtpHost,
    smtpPort: process.env.smtpPort,
    smtpUser: process.env.smtpUser,
    smtpPass: process.env.smtpPass,
    privateKey: process.env.privateKey,
    PUBLIC_SITE_URL: process.env.PUBLIC_SITE_URL,
    PARSER_TOKEN: process.env.PARSER_TOKEN,
  },

  security: {
    rateLimiter: {
      tokensPerInterval: 200,
      interval: 'hour',
      fireImmediately: false,
    },
    headers: false,
    xssValidator: false,
  },

  devtools: {
    enabled: true,
  },

  experimental: {
    payloadExtraction: false,
    renderJsonPayloads: true,
    typedPages: true,
  },

  i18n: {
    translationDir: 'locales',
    meta: true,
    locales: [
      {
        code: 'ru',
        dir: 'ltr',
      },
      {
        code: 'en',
        dir: 'ltr',
      },
    ],
    defaultLocale: 'ru',
  },
  ssr: true,

  compatibilityDate: '2024-10-04',
})
