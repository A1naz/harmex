<script setup lang="ts">
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Тарифы',
})

const tariffsValue = ref(true)
const tariffStats = ref([
  {
    icon: 'ph:wallet-fill',
    title: 'Выкупы',
    value: 20,
  },
  {
    icon: 'bxs:message-detail',
    title: 'Отзывы ',
    value: 20,
  },
  {
    icon: 'solar:heart-outline',
    title: 'Лайки',
    value: 20,
  },
  {
    icon: 'fa-solid:question-circle',
    title: 'Вопросы',
    value: 20,
  },
  {
    icon: 'solar:cart-large-minimalistic-bold',
    title: 'Корзина',
    value: 20,
  },
  {
    icon: 'mdi:account',
    title: 'Автоответы на отзывы',
    value: 20,
  },
  {
    icon: 'fa-regular:hand-pointer',
    title: 'Клики по карточке',
    value: 20,
  },
  {
    icon: 'clarity:eye-show-line',
    title: 'Выкупить в ближайшее время',
    value: 20,
  },
  {
    icon: 'solar:cart-large-minimalistic-bold',
    title: 'Конкурентов в корзине',
    value: 20,
  },
  {
    icon: 'mdi:drive-document',
    title: 'Изучение карточки 60 секунд',
    value: 20,
  },
  {
    icon: 'mdi:loudspeaker',
    title: 'Выкупы с рекламы',
    value: 20,
  },
  {
    icon: 'hugeicons:filter-vertical',
    title: 'Выкупы с сортировки',
    value: 20,
  },
])

const tariffs = ref({
  wildberries: {
  startup: {
    title: 'Запуск',
    value: 'startup',
    type: [
      {
        title: 'Базовый',
        value: 'base',
        tariffs: [
          {
            title: 'DEMO',
            prices: {
              '3': 0,
              '6': 0,
              '12': 0,
            }
          },
          {
            title: 'START',
            prices: {
              '3': 40000,
              '6': 80000,
              '12': 140000,
            }
          },
          {
            title: 'PRO',
            prices: {
              '3': 80000,
              '6': 155000,
              '12': 280000,
            }
          },
          {
            title: 'VIP',
            prices: {
              '3': 160000,
              '6': 310000,
              '12': 555000,
            }
          },
        ],
      },
      {
        title: 'Под ключ',
        value: 'key',
        tariffs: [
          {
            title: 'DEMO',
            prices: {
              '3': 0,
              '6': 0,
              '12': 0,
            }
          },
          {
            title: 'START',
            prices: {
              '3': 55000,
              '6': 100000,
              '12': 185000,
            }
          },
          {
            title: 'PRO',
            prices: {
              '3': 105000,
              '6': 200000,
              '12': 370000,
            }
          },
          {
            title: 'VIP',
            prices: {
              '3': 210000,
              '6': 400000,
              '12': 740000,
            }
          },
        ],
      },
    ],
  },
  growth: {
    title: 'Рост',
    value: 'growth',
    type: [
      {
        title: 'Базовый',
        value: 'base',
        tariffs: [
          {
            title: 'DEMO',
            prices: {
              '3': 0,
              '6': 0,
              '12': 0,
            }
          },
          {
            title: 'START',
            prices: {
              '3': 135000,
              '6': 385000,
              '12': 690000,
            }
          },
          {
            title: 'PRO',
            prices: {
              '3': 405000,
              '6': 770000,
              '12': 1380000,
            }
          },
          {
            title: 'VIP',
            prices: {
              '3': 805000,
              '6': 1550000,
              '12': 2300000,
            }
          },
        ],
      },
      {
        title: 'Под ключ',
        value: 'key',
        tariffs: [
          {
            title: 'DEMO',
            prices: {
              '3': 0,
              '6': 0,
              '12': 0,
            }
          },
          {
            title: 'START',
            prices: {
              '3': 155000,
              '6': 460000,
              '12': 920000,
            }
          },
          {
            title: 'PRO',
            prices: {
              '3': 460000,
              '6': 920000,
              '12': 1840000,
            }
          },
          {
            title: 'VIP',
            prices: {
              '3': 920000,
              '6': 1840000,
              '12': 3100000,
            }
          },
        ],
      },
    ],
  },
  support: {
    title: 'Поддержка',
    value: 'support',
    type: [
      {
        title: 'Базовый',
        value: 'base',
        tariffs: [
          {
            title: 'DEMO',
            prices: {
              '3': 0,
              '6': 0,
              '12': 0,
            }
          },
          {
            title: 'START',
            prices: {
              '3': 405000,
              '6': 770000,
              '12': 1380000,
            }
          },
          {
            title: 'PRO',
            prices: {
              '3': 805000,
              '6': 1540000,
              '12': 2340000,
            }
          },
          {
            title: 'VIP',
            prices: {
              '3': 1610000,
              '6': 2600000,
              '12': 3525000,
            }
          },
        ],
      },
      {
        title: 'Под ключ',
        value: 'key',
        tariffs: [
          {
            title: 'DEMO',
            prices: {
              '3': 0,
              '6': 0,
              '12': 0,
            }
          },
          {
            title: 'START',
            prices: {
              '3': 520000,
              '6': 977000,
              '12': 1840000,
            }
          },
          {
            title: 'PRO',
            prices: {
              '3': 1035000,
              '6': 1960000,
              '12': 3120000,
            }
          },
          {
            title: 'VIP',
            prices: {
              '3': 2070000,
              '6': 3280000,
              '12': 4700000,
            }
          },
        ],
      },
    ],
  },
},

ozon: {
  startup: {
    title: 'Запуск',
    value: 'startup',
    type: [
      {
        title: 'Базовый',
        value: 'base',
        tariffs: [
          {
            title: 'DEMO',
            prices: {
              '3': 0,
              '6': 0,
              '12': 0,
            }
          },
          {
            title: 'START',
            prices: {
              '3': 46000,
              '6': 90000,
              '12': 160000,
            }
          },
          {
            title: 'PRO',
            prices: {
              '3': 92000,
              '6': 175000,
              '12': 315000,
            }
          },
          {
            title: 'VIP',
            prices: {
              '3': 184000,
              '6': 350000,
              '12': 627000,
            }
          },
        ],
      },
      {
        title: 'Под ключ',
        value: 'key',
        tariffs: [
          {
            title: 'DEMO',
            prices: {
              '3': 0,
              '6': 0,
              '12': 0,
            }
          },
          {
            title: 'START',
            prices: {
              '3': 60000,
              '6': 112000,
              '12': 21000,
            }
          },
          {
            title: 'PRO',
            prices: {
              '3': 120000,
              '6': 222000,
              '12': 420000,
            }
          },
          {
            title: 'VIP',
            prices: {
              '3': 240000,
              '6': 444000,
              '12': 840000,
            }
          },
        ],
      },
    ],
  },
  growth: {
    title: 'Рост',
    value: 'growth',
    type: [
      {
        title: 'Базовый',
        value: 'base',
        tariffs: [
          {
            title: 'DEMO',
            prices: {
              '3': 0,
              '6': 0,
              '12': 0,
            }
          },
          {
            title: 'START',
            prices: {
              '3': 155000,
              '6': 440000,
              '12': 780000,
            }
          },
          {
            title: 'PRO',
            prices: {
              '3': 455000,
              '6': 871000,
              '12': 1560000,
            }
          },
          {
            title: 'VIP',
            prices: {
              '3': 910000,
              '6': 1742000,
              '12': 2600000,
            }
          },
        ],
      },
      {
        title: 'Под ключ',
        value: 'key',
        tariffs: [
          {
            title: 'DEMO',
            prices: {
              '3': 0,
              '6': 0,
              '12': 0,
            }
          },
          {
            title: 'START',
            prices: {
              '3': 195000,
              '6': 555000,
              '12': 1040000,
            }
          },
          {
            title: 'PRO',
            prices: {
              '3': 585000,
              '6': 1105000,
              '12': 2080000,
            }
          },
          {
            title: 'VIP',
            prices: {
              '3': 1170000,
              '6': 2210000,
              '12': 4465000,
            }
          },
        ],
      },
    ],
  },
  support: {
    title: 'Поддержка',
    value: 'support',
    type: [
      {
        title: 'Базовый',
        value: 'base',
        tariffs: [
          {
            title: 'DEMO',
            prices: {
              '3': 0,
              '6': 0,
              '12': 0,
            }
          },
          {
            title: 'START',
            prices: {
              '3': 455000,
              '6': 871000,
              '12': 1560000,
            }
          },
          {
            title: 'PRO',
            prices: {
              '3': 910000,
              '6': 1741000,
              '12': 2640000,
            }
          },
          {
            title: 'VIP',
            prices: {
              '3': 182000,
              '6': 2921000,
              '12': 3975000,
            }
          },
        ],
      },
      {
        title: 'Под ключ',
        value: 'key',
        tariffs: [
          {
            title: 'DEMO',
            prices: {
              '3': 0,
              '6': 0,
              '12': 0,
            }
          },
          {
            title: 'START',
            prices: {
              '3': 585000,
              '6': 1105000,
              '12': 2080000,
            }
          },
          {
            title: 'PRO',
            prices: {
              '3': 1170000,
              '6': 2210000,
              '12': 3540000,
            }
          },
          {
            title: 'VIP',
            prices: {
              '3': 2440000,
              '6': 3706000,
              '12': 5300000,
            }
          },
        ],
      },
    ],
  },
},


})

const images = [
  'wildberries.svg',
  'ozon.svg',
  'avito.svg',
  'yandexMarket.svg',
  'flowwow.svg',
  'uzum.svg',
  'magnitMarket.svg',
  'sberMarket.svg',
]

const ratingList = ref(true)
const ratingValue = ref([
  {
    title: 'Покупка товаров, шт.',
    demo: 25,
    start: 0,
    pro: 0,
    vip: 0,
  },

  {
    title: 'Публикация отзывов, шт.',
    demo: 5,
    start: 0,
    pro: 0,
    vip: 0,
  },

  {
    title: 'Лайки на бренд, шт.',
    demo: 25,
    start: 0,
    pro: 0,
    vip: 0,
  },

  {
    title: 'Вопросы бренду / товару, шт.',
    demo: 10,
    start: 0,
    pro: 0,
    vip: 0,
  },

  {
    title: 'Добавление в корзину, шт.',
    demo: 25,
    start: 0,
    pro: 0,
    vip: 0,
  },

  {
    title: 'Автоответы на отзывы, SKU',
    demo: 1,
    start: 0,
    pro: 0,
    vip: 0,
  },
])

const factorsList = ref(true)
const factorsValue = ref([
  {
    title: 'Клики по карточке, шт.',
    demo: 50,
    start: 0,
    pro: 0,
    vip: 0,
  },

  {
    title: 'Выкуп в ближайшее время, шт.',
    demo: 10,
    start: 0,
    pro: 0,
    vip: 0,
  },

  {
    title: 'Добавление конкурентов в корзину, шт.',
    demo: 15,
    start: 0,
    pro: 0,
    vip: 0,
  },

  {
    title: 'Изучение карточки 60 секунд, шт.',
    demo: 5,
    start: 0,
    pro: 0,
    vip: 0,
  },

  {
    title: 'Выкупить с рекламы, шт.',
    demo: 15,
    start: 0,
    pro: 0,
    vip: 0,
  },

  {
    title: 'Выкупить с сортировки, шт.',
    demo: 10,
    start: 0,
    pro: 0,
    vip: 0,
  },
])

const liValues = [
  'Конкурентная аналитика',
  'Создание стратегии продвижения',
  'Подбор поисковых запросов',
  'Выкуп товара тех специалистом',
  'Отправка курьера на ПВЗ',
  'Публикация отзывов (с предоставлением данных)',
  'Сортировка на складе ФФ',
  'Упаковка товара к отгрузке',
  'Отправка товара на склад маркетплейса / фф заказчика',
  'Отслеживание и контроль на всех этапах действий',
  'Автоматизированный дашборд показателей',
]

const productCount = ref(0)
const logicService = ref('')
const form = reactive({
  mp: 'wildberries',
  title: 'startup',
  type: 'base',
  dateRange: '3months',
})

const changeMp = useMPChange()
const currentMp = changeMp.pages.map((page) => (!page.test ? page.value : null))
function setMp(mp: string) {
  if (!currentMp.includes(mp)) return
  form.mp = mp
}

const { width } = useWindowSize()
const tableForm = ref(width.value < 768 ? true : false)
watch(width, () => {
  if (width.value < 768) {
    tableForm.value = true
  } else {
    tableForm.value = false
  }
})

const firstTariff = ref('DEMO')

const secondTariff = ref('START')

</script>

<template>
  <div class="my-4 bg-base-100 rounded-lg flex flex-col">
    <TariffsUserSubscription
      :tariffs-value="tariffsValue"
      :tariff-stats="tariffStats"
    />

    <div class="flex flex-col gap-2.5 p-5 justify-center items-center my-7">
      <h2 class="text-lg md:text-xl font-bold">
        Не пропусти ни одной возможности - купи подписку на MarketMonstr
      </h2>
      <p class="text-xs font-light text-[#96959a]">
        Выбери план, который лучше всего подходит твоим потребностям
      </p>
    </div>

    <TariffsTariffSettings
      :mp-array="changeMp"
      :current-mp="currentMp"
      :form="form"
      :tariffs="tariffs"
      :first-tariff="firstTariff"
      :second-tariff="secondTariff"
      :images="images"
      @set-mp="setMp"
      @set-first-tariff="(value) => (firstTariff = value.value)"
      @set-second-tariff="(value) => (secondTariff = value.value)"
    />

    <TariffsTarriffsInfo
      :rating-list="ratingList"
      :factors-list="factorsList"
      :rating-value="ratingValue"
      :factors-value="factorsValue"
      :first-tariff="firstTariff"
      :second-tariff="secondTariff"
    />

    <div class="h-2" />
  </div>

  <div class="flex flex-col justify-center items-center bg-base-100 mt-5 p-7">
    <p class="text-lg md:text-2xl font-bold">
      Выгодные предложения для продвижения бизнеса
    </p>
    <div
      class="mt-5 bg-[#ebf0ff] dark:bg-primary dark:bg-opacity-5 py-4 px-8 rounded-xl flex flex-col"
    >
      <p
        class="text-lg md:text-2xl font-bold text-[#6788f3] dark:text-primary self-center"
      >
        Комплексное продвижение
      </p>
      <div
        class="flex flex-col gap-3 mt-5 bg-[#d6e0ff] dark:bg-primary dark:bg-opacity-10 rounded-lg p-3"
      >
        <ul class="flex flex-col gap-3">
          <li
            v-for="(value, index) in liValues"
            :key="index"
            class="flex gap-3 items-center"
          >
            <div class="w-[25px]">
              <Icon name="carbon:checkmark" class="text-[#2bd250]" size="25" />
            </div>
            <p class="font-semibold md:text-md text-xs">{{ value }}</p>
          </li>
        </ul>
      </div>
      <div class="w-full my-4">
        <p class="text-sm md:text-lg font-bold">
          Выберите логистическую услугу
        </p>
        <CustomSelect
          :dropdownContainer="'w-full'"
          :class="'w-full bg-base-100'"
          @change-value="(value) => (logicService = value)"
          :status-text="'Выберите услугу'"
          :tabs="[
            { title: 'Выкупо под ключ', value: 'key' },
            { title: 'Выкупо с забором', value: 'pickup' },
          ]"
        />
      </div>
      <div class="w-full -my-2">
        <p class="text-sm md:text-lg font-bold">Введите кол-во товаров</p>
        <input
          type="number"
          v-model="productCount"
          class="input input-sm border-none input-bordered w-full bg-base-100"
        />
        <p class="text-xs font-light">
          Логистика доступна для клиентов от 50 ед в неделю и/или 200 ед/мес
        </p>
      </div>

      <button
        class="btn btn-primary btn-sm h-[2.5rem] mt-10 w-full bg-[#6788f3] text-base-100 border-none"
      >
        Купить
      </button>
    </div>
    <div class="h-28" />
  </div>
</template>

<style scoped>
.collapse[open] :where(.collapse-content),
.collapse-open :where(.collapse-content),
.collapse:focus:not(.collapse-close) :where(.collapse-content),
.collapse:not(.collapse-close)
  :where(input[type='checkbox']:checked ~ .collapse-content),
.collapse:not(.collapse-close)
  :where(input[type='radio']:checked ~ .collapse-content) {
  padding-bottom: 0;
}
</style>
