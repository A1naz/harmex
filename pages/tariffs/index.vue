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

const tariffs = ref([
  {
    title: 'DEMO',
    price: 7500,
    disabled: false,
  },
  {
    title: 'START',
    price: 0,
    disabled: true,
  },
  {
    title: 'PRO',
    price: 0,
    disabled: true,
  },
  {
    title: 'VIP',
    price: 0,
    disabled: true,
  },
])

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
  mp: '',
  title: '',
  type: '',
  dateRange: '',
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

    <div class="flex flex-col mt-5">
      <div class="collapse collapse-arrow bg-base-100 rounded-box z-0">
        <input v-model="ratingList" type="checkbox" />
        <div class="collapse-title relative text-xl font-medium">
          <div class="flex gap-4 text-lg font-bold">Повышение рейтинга</div>
        </div>
        <div class="collapse-content pb-0">
          <div
            v-for="tariff in ratingValue"
            class="flex flex-col md:hidden px-5 pt-5 py-1 rounded-lg w-full"
          >
            <span class="text-sm font-bold mb-1">{{ tariff.title }}</span>
            <div class="flex w-full">
              <div
                class="flex w-1/2 border-b border-[#e5e7e8] dark:border-[#1a1817]"
              >
                <Icon
                  v-if="tariff[firstTariff.toLowerCase()] === 0"
                  name="mingcute:close-line"
                  size="25"
                  class="text-[#f9654b]"
                />
                <span v-else>{{ tariff[firstTariff.toLowerCase()] }}</span>
              </div>
              <div
                class="flex w-1/2 border-b border-[#e5e7e8] dark:border-[#1a1817]"
              >
                <Icon
                  v-if="tariff[secondTariff.toLowerCase()] === 0"
                  name="mingcute:close-line"
                  size="25"
                  class="text-[#f9654b]"
                />
                <span v-else>{{ tariff[secondTariff.toLowerCase()] }}</span>
              </div>
            </div>
          </div>

          <div class="overflow-x-auto hidden md:flex">
            <table
              class="table table-zebra border-b border-[#e5e7e8] dark:border-[#1a1817]"
            >
              <tbody>
                <tr></tr>
                <tr v-for="(value, index) in ratingValue" :key="index">
                  <th
                    class="w-1/5 border-r border-[#e5e7e8] dark:border-[#1a1817]"
                  >
                    {{ value.title }}
                  </th>
                  <td
                    class="w-1/5 text-center border-r border-[#e5e7e8] dark:border-[#1a1817]"
                  >
                    {{ value.demo }}
                  </td>
                  <td
                    class="w-1/5 text-center border-r border-[#e5e7e8] dark:border-[#1a1817]"
                  >
                    <div class="flex w-full justify-center">
                      <Icon
                        v-if="value.start === 0"
                        name="mingcute:close-line"
                        size="25"
                        class="w-10 text-[#f9654b]"
                      />
                      <span v-else>
                        {{ value.start }}
                      </span>
                    </div>
                  </td>
                  <td class="w-1/5 text-center border-r-4 border-[#25ba7b]">
                    <div class="flex w-full justify-center">
                      <Icon
                        v-if="value.pro === 0"
                        name="mingcute:close-line"
                        size="25"
                        class="w-8 text-[#f9654b]"
                      />
                      <span v-else>
                        {{ value.pro }}
                      </span>
                    </div>
                  </td>
                  <td class="w-1/5 text-center border-r-4 border-[#25ba7b]">
                    <div class="flex w-full justify-center">
                      <Icon
                        v-if="value.vip === 0"
                        name="mingcute:close-line"
                        size="25"
                        class="text-[#f9654b]"
                      />
                      <span v-else>
                        {{ value.vip }}
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="collapse collapse-arrow bg-base-100 rounded-box z-0">
        <input v-model="factorsList" type="checkbox" />
        <div class="collapse-title relative text-xl font-medium">
          <div class="flex gap-4 text-lg font-bold">Поведенческие факторы</div>
        </div>
        <div class="collapse-content pb-0">
          <div
            v-for="tariff in factorsValue"
            class="flex flex-col md:hidden px-5 pt-5 py-1 rounded-lg w-full"
          >
            <span class="text-sm font-bold mb-1">{{ tariff.title }}</span>
            <div class="flex w-full">
              <div
                class="flex w-1/2 border-b border-[#e5e7e8] dark:border-[#1a1817]"
              >
                <Icon
                  v-if="tariff[firstTariff.toLowerCase()] === 0"
                  name="mingcute:close-line"
                  size="25"
                  class="text-[#f9654b]"
                />
                <span v-else>{{ tariff[firstTariff.toLowerCase()] }}</span>
              </div>
              <div
                class="flex w-1/2 border-b border-[#e5e7e8] dark:border-[#1a1817]"
              >
                <Icon
                  v-if="tariff[secondTariff.toLowerCase()] === 0"
                  name="mingcute:close-line"
                  size="25"
                  class="text-[#f9654b]"
                />
                <span v-else>{{ tariff[secondTariff.toLowerCase()] }}</span>
              </div>
            </div>
          </div>
          <div class="overflow-x-auto hidden md:flex">
            <table
              class="table table-zebra border-b border-[#e5e7e8] dark:border-[#1a1817]"
            >
              <tbody>
                <tr></tr>
                <tr v-for="(value, index) in factorsValue" :key="index">
                  <th
                    class="w-1/5 border-r border-[#e5e7e8] dark:border-[#1a1817]"
                  >
                    {{ value.title }}
                  </th>
                  <td
                    class="w-1/5 text-center border-r border-[#e5e7e8] dark:border-[#1a1817]"
                  >
                    {{ value.demo }}
                  </td>
                  <td
                    class="w-1/5 text-center border-r border-[#e5e7e8] dark:border-[#1a1817]"
                  >
                    <div class="flex w-full justify-center">
                      <Icon
                        v-if="value.start === 0"
                        name="mingcute:close-line"
                        size="25"
                        class="text-[#f9654b]"
                      />
                      <span v-else>
                        {{ value.start }}
                      </span>
                    </div>
                  </td>
                  <td class="w-1/5 text-center border-r-4 border-[#25ba7b]">
                    <div class="flex w-full justify-center">
                      <Icon
                        v-if="value.pro === 0"
                        name="mingcute:close-line"
                        size="25"
                        class="text-[#f9654b]"
                      />
                      <span v-else>
                        {{ value.pro }}
                      </span>
                    </div>
                  </td>
                  <td class="w-1/5 text-center border-r-4 border-[#25ba7b]">
                    <div class="flex w-full justify-center">
                      <Icon
                        v-if="value.vip === 0"
                        name="mingcute:close-line"
                        size="25"
                        class="text-[#f9654b]"
                      />
                      <span v-else>
                        {{ value.vip }}
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

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
