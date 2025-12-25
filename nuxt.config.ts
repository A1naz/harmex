// https://nuxt.com/docs/api/configuration/nuxt-config
import process from "node:process";

const baseUrl = process.env.NUXT_APP_BASE_URL || "/";
const description = "Harmex";

export default defineNuxtConfig({
  app: {
    baseURL: baseUrl,
    head: {
      viewport: "width=device-width,initial-scale=1",
      title: "Harmex",
      link: [{ rel: "icon", href: "/img/H.svg" }],
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          "http-equiv": "Content-Security-Policy",
          content: "upgrade-insecure-requests",
        },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "description", content: description },
        {
          name: "apple-mobile-web-app-status-bar-style",
          content: "black-translucent",
        },
        { name: "yandex-verification", content: "8b9387e0d0a4e1a8" },
      ],
    },
  },

  nitro: {
    plugins: ["~/server/index.ts"],
  },

  modules: [
    "nuxt-lazy-load",
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt",
    "@pinia-plugin-persistedstate/nuxt",
    "@nuxt/icon",
    "@vueuse/nuxt",
    "nuxt-security",
    "@nuxtjs/color-mode",
    "@sfxcode/nuxt-primevue",
    "@morev/vue-transitions/nuxt",
    "@nuxt/fonts",
    "nuxt-auth-utils",
    "@nuxt/image",
    "nuxt3-notifications",
    "@nuxtjs/turnstile",
    "@nuxt/scripts",
    "radix-vue/nuxt",
    "shadcn-nuxt",
    "@nuxt/eslint",
    "@bg-dev/nuxt-s3",
    "@nuxtjs/i18n",
  ],

  lazyLoad: {
    // These are the default values
    images: true,
    videos: true,
    audios: true,
    iframes: true,
    native: false,
    directiveOnly: false,

    // To remove class set value to false
    loadingClass: "isLoading",
    loadedClass: "isLoaded",
    appendClass: "lazyLoad",

    observerConfig: {
      // See IntersectionObserver documentation
    },
  },

  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: "sha",
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: "./components/ui",
  },

  primevue: {
    components: {
      include: [
        "DataTable",
        "Column",
        "Chips",
        "MultiSelect",
        "Button",
        "DataView",
      ],
    },
  },

  imports: {
    dirs: ["./stores", "./data", "./server/lib", "./server/lib/models"],
  },

  eslint: {
    config: {
      standalone: false, // <---
    },
  },

  turnstile: {
    siteKey: "0x4AAAAAAAw5ArLU136z91q_",
  },

  colorMode: {
    preference: "light",
    dataValue: "theme",
    classSuffix: "",
  },

  icon: {
    provider: "server", // <-- this
    serverBundle: {
      collections: ["material-symbols"], // <!--- this
    },
    customCollections: [
      {
        prefix: "my-icon",
        dir: "./assets/my-icons",
      },
    ],
  },

  css: [
    "primevue/resources/primevue.css",
    "primeicons/primeicons.css",
    // '@/assets/style/css/customButton.css',
    "@vuepic/vue-datepicker/dist/main.css",
  ],

  s3: {
    driver: "s3",
    secretAccessKey: process.env.VK_SECRET_KEY || "",
    accessKeyId: process.env.VK_ACCESS_KEY || "",
    endpoint: "https://hb.vkcs.cloud",
    region: "ru-msk",
    // publicBucketUrl: `${process.env.PUBLIC_SITE_URL}/images/get/`,
    bucket: "ozonmpportal",
    image: {
      compression: {
        maxSizeMB: 10,
        maxWidthOrHeight: 4000,
      },
    },
  },

  // s3: {
  //   // driver: 's3',
  //   secretAccessKey: process.env.VK_SECRET_KEY || '',
  //   accessKeyId: process.env.VK_ACCESS_KEY || '',
  //   endpoint: 'https://hb.vkcs.cloud/reviewImages/',
  //   region: 'ru-msk',
  //   // publicBucketUrl: `${process.env.PUBLIC_SITE_URL}/images/get/`,
  //   bucket: 'ozonmpportal',
  //   image: {
  //     compression: {
  //       maxSizeMB: 10,
  //       maxWidthOrHeight: 4000,
  //     },
  //   },
  // },

  hooks: {
    close: () => {
      process.exit();
    },
  },

  build: {
    transpile: ["primevue", "@vuepic/vue-datepicker"],
  },

  security: {
    rateLimiter: {
      tokensPerInterval: 200,
      interval: "hour",
      fireImmediately: false,
    },
    headers: {
      crossOriginEmbedderPolicy: false, // Отключаем только это (конфликтует с картами)
      contentSecurityPolicy: {
        'base-uri': ["'self'"],
        'font-src': ["'self'", "https:", "data:"],
        'form-action': ["'self'"],
        'frame-ancestors': ["'self'"],
        'img-src': ["'self'", "data:", "https:", "blob:"],
        'object-src': ["'none'"],
        'script-src-attr': ["'none'"],
        'style-src': ["'self'", "https:", "'unsafe-inline'"],
        'script-src': [
          "'self'",
          "https:",
          "'unsafe-inline'",
          "'strict-dynamic'",
          "'nonce-{{nonce}}'",
        ],
        'upgrade-insecure-requests': true,
      },
    },
    xssValidator: {
      methods: ['POST', 'PUT', 'PATCH'],
      // Отключаем проверку для безопасных эндпоинтов
      excludedUrls: ['/api/auth/login', '/api/auth/register'],
    },
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
    locales: [
      { code: "en", language: "en-US", dir: "ltr", file: "en.json" },
      { code: "ru", language: "ru-RU", dir: "ltr", file: "ru.json" },
    ],
    defaultLocale: "ru",
    langDir: "locales",
    lazy: true,
  },

  runtimeConfig: {
    public: {
      siteName: process.env.NAME,
      BOT_ID: process.env.BOT_ID,
      siteUrl: process.env.PUBLIC_SITE_URL,
      language: "ru",
      trailingSlash: true,
      BOT_LOGIN: process.env.BOT_LOGIN,
      DOMAIN_API_IMAGES_URL: process.env.DOMAIN_API_IMAGES_URL,
      YANDEX_MAPS_API_KEY: process.env.YANDEX_MAPS_API_KEY,
    },
    VK_ACCESS_KEY: process.env.VK_ACCESS_KEY,
    VK_SECRET_KEY: process.env.VK_SECRET_KEY,
    env: process.env.ENV_WORK,
    indexable: true,
    MONGODB_URI: process.env.MONGODB_URI,
    WB_DB_URI: process.env.WB_DB_URI,
    AVITO_DB_URI: process.env.AVITO_DB_URI,
    OZON_DB_URI: process.env.OZON_DB_URI,
    FLOWWOW_DB_URI: process.env.FLOWWOW_DB_URI,
    OZON_PVZ_DB_URI: process.env.OZON_PVZ_DB_URI,
    BANK_DB_URI: process.env.BANK_DB_URI,
    YANDEX_MARKET_DB_URI: process.env.YANDEX_MARKET_DB_URI,
    OZON_HOTELS_DB_URI: process.env.OZON_HOTELS_DB_URI,
    SUTOCHNO_DB_URI: process.env.SUTOCHNO_DB_URI,
    GOLD_APPLE_DB_URI: process.env.GOLD_APPLE_DB_URI,
    REPORTS_DB_URI: process.env.REPORTS_DB_URI,
    SECRET: process.env.SECRET,
    smtpHost: process.env.smtpHost,
    smtpPort: process.env.smtpPort,
    smtpUser: process.env.smtpUser,
    smtpPass: process.env.smtpPass,
    dkimKey: process.env.dkimKey,
    PUBLIC_SITE_URL: process.env.PUBLIC_SITE_URL,
    BOT_TOKEN: process.env.BOT_TOKEN,
    fkSecret1: process.env.fkSecret1,
    fkSecret2: process.env.fkSecret2,
    fkApiKey: process.env.fkApiKey,
    fkID: process.env.fkID,
    SESSION_TOKEN: process.env.SESSION_TOKEN,
    serverLoadApiKey: process.env.serverLoadApiKey,
    server_ip: process.env.server_ip,
    service_id: process.env.service_id,
    CHANGING_PROXY: process.env.CHANGING_PROXY,
    SECOND_CHANGING_PROXY: process.env.SECOND_CHANGING_PROXY,
    ORGANIZATION_KEY: process.env.ORGANIZATION_KEY,
    HI_CALL_KEY: process.env.HI_CALL_KEY,
    ZVONOK_PUBLIC_KEY: process.env.ZVONOK_PUBLIC_KEY,
    ZVONOK_CAMPAIGN_ID: process.env.ZVONOK_CAMPAIGN_ID,
    DADATA_TOKEN: process.env.DADATA_TOKEN,
    DADATA_SECRET: process.env.DADATA_SECRET,
    PARSER_TOKEN: process.env.PARSER_TOKEN,
    X_API_KEY: process.env.X_API_KEY,
    RETURN_CALL_CAMPAIGN_ID: process.env.RETURN_CALL_CAMPAIGN_ID,
    RETURN_CALL_PUBLIC_KEY: process.env.RETURN_CALL_PUBLIC_KEY,
    NEUROTASK_KEY: process.env.NEUROTASK_KEY,
  },
  compatibilityDate: "2024-11-06",
  ssr: false,
});
