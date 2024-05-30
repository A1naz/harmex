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
    <div
      class="px-3 py-2 bg-[#ebf0ff] dark:bg-primary dark:bg-opacity-10 mx-4 my-3 rounded-lg flex flex-col gap-3"
    >
      <!-- v-if="нет тарифов" -->
      <div v-if="!tariffsValue" class="flex flex-col gap-3">
        <p class="text-xs font-light">У вас нет активной подписки</p>
        <p class="text-xs font-normal">
          Выберите желаемый маркетплейс и подключите подходящий для вас пакет
          услуг.
        </p>
      </div>
      <!-- v-else -->
      <div v-else class="flex flex-col gap-2 overflow-x-auto">
        <p class="text-xs font-light">У вас подключена подписка</p>
        <span class="flex gap-3 items-center">
          <p class="text-md text-[#558ff6] dark::text-primary">Basic</p>
          <span class="text-xs text-[#9a9aa0] font-thin"> 3 мес.</span>
        </span>
        <div class=" overflow-hidden lg:overflow-x-auto">
          <div class="min-w-max grid grid-cols-6 gap-y-3.5 gap-x-3 justify-between">
            <div
              v-for="tariff in tariffStats"
              class="flex flex-col px-5 py-1 bg-[#d6e0ff] dark:bg-primary dark:bg-opacity-5 rounded-lg"
            >
              <Icon
                class="w-6 h-6 text-[#6788f3] dark:text-primar"
                :name="tariff.icon"
              />
              <p class="text-xs mt-0.5 mb-2 text-[#6788f3] dark:text-primar">
                {{ tariff.title }}
              </p>
              <p class="text-xs md:text-lg font-bold mt-auto">{{ tariff.value }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-2.5 p-5 justify-center items-center my-7">
      <h2 class="text-lg md:text-xl font-bold">
        Не пропусти ни одной возможности - купи подписку на MarketMonstr
      </h2>
      <p class="text-xs font-light text-[#96959a]">
        Выбери план, который лучше всего подходит твоим потребностям
      </p>
    </div>

    <div
      class="flex flex-col gap-y-4 px-1.5 py-4 bg-gradient-to-r from-[#e9f7ff] to-[#96afff] dark:from-[#172038] dark:to-[#1b1f38] rounded-lg"
    >
      <div class="flex justify-between">
        <div class="flex w-full space-x-4">
          <CustomSelect
            :dropdownContainer="'w-full md:hidden'"
            :class="'bg-base-100 w-full md:hidden'"
            :tabs="changeMp.pages.filter((page) => !page.test)"
            @change-value="(value) => setMp(value.value)"
          />
          <button
            v-for="(image, index) in images"
            :key="index"
            class="hidden md:flex flex-grow rounded-lg justify-center"
            :class="{
              'hover:cursor-not-allowed': !currentMp.includes(
                image.replace('.svg', '')
              ),
            }"
            @click="setMp(image.replace('.svg', ''))"
          >
            <nuxt-img
              class="p-1.5 rounded-lg"
              :class="{ 'bg-base-100': form.mp == image.replace('.svg', '') }"
              :src="`https://ozonmpportal.hb.vkcs.cloud/tariffsImages/${image}`"
              :alt="'mp' + (index + 1)"
            />
          </button>
        </div>
      </div>

      <div class="flex justify-between">
        <button
          class="btn border-none w-[32%] text-lg"
          @click="
            form.title == 'Запуск' ? (form.title = '') : (form.title = 'Запуск')
          "
          :class="{
            'bg-[#292930] dark:bg-[#5287e7] dark:hover:bg-base-100 text-base-100':
              form.title == 'Запуск',
            'bg-base-100 text-base-content': form.title != 'Запуск',
          }"
        >
          Запуск
        </button>
        <button
          class="btn border-none w-[32%] text-lg"
          @click="
            form.title == 'Рост' ? (form.title = '') : (form.title = 'Рост')
          "
          :class="{
            'bg-[#292930] dark:bg-[#5287e7] dark:hover:bg-base-100 text-base-100':
              form.title == 'Рост',
            'bg-base-100 text-base-content': form.title != 'Рост',
          }"
        >
          Рост
        </button>
        <button
          class="btn border-none w-[32%] text-lg"
          @click="
            form.title == 'Поддержка'
              ? (form.title = '')
              : (form.title = 'Поддержка')
          "
          :class="{
            'bg-[#292930] dark:bg-[#5287e7] dark:hover:bg-base-100 text-base-100':
              form.title == 'Поддержка',
            'bg-base-100 text-base-content': form.title != 'Поддержка',
          }"
        >
          Поддержка
        </button>
      </div>
      <div class="flex justify-between">
        <button
          class="btn border-none w-[49%] text-lg"
          @click="
            form.type == 'Базовый' ? (form.type = '') : (form.type = 'Базовый')
          "
          :class="{
            'bg-[#292930] dark:bg-[#5287e7] dark:hover:bg-base-100 text-base-100':
              form.type == 'Базовый',
            'bg-base-100 text-base-content': form.type != 'Базовый',
          }"
        >
          Базовый
        </button>
        <button
          class="btn border-none w-[49%] text-lg"
          @click="
            form.type == 'Под ключ'
              ? (form.type = '')
              : (form.type = 'Под ключ')
          "
          :class="{
            'bg-[#292930] dark:bg-[#5287e7] dark:hover:bg-base-100 text-base-100':
              form.type == 'Под ключ',
            'bg-base-100 text-base-content': form.type != 'Под ключ',
          }"
        >
          Под ключ
        </button>
      </div>
      <div class="flex justify-between">
        <button
          class="btn border-none w-[24%] whitespace-nowrap pt-1 md:pt-0 md:text-lg"
          @click="
            form.dateRange == 'everyMonth'
              ? (form.dateRange = '')
              : (form.dateRange = 'everyMonth')
          "
          :class="{
            'bg-[#292930] dark:bg-[#5287e7] dark:hover:bg-base-100 text-base-100':
              form.dateRange == 'everyMonth',
            'bg-base-100 text-base-content': form.dateRange != 'everyMonth',
          }"
        >
          Ежемесячно
        </button>
        <button
          class="btn border-none w-[24%] whitespace-nowrap pt-1 md:pt-0 md:text-lg relative"
          @click="
            form.dateRange == '3month'
              ? (form.dateRange = '')
              : (form.dateRange = '3month')
          "
          :class="{
            'bg-[#292930] dark:bg-[#5287e7] dark:hover:bg-base-100 text-base-100':
              form.dateRange == '3month',
            'bg-base-100 text-base-content': form.dateRange != '3month',
          }"
        >
          3 месяца
          <span
            class="absolute top-0 right-0 rounded-2xl text-xs bg-[#ffdc60] dark:bg-[#FF4500] py-0.5 px-1 text-[8px]"
          >
            Рассрочка
          </span>
        </button>

        <button
          class="btn border-none w-[24%] whitespace-nowrap pt-1 md:pt-0 md:text-lg relative"
          @click="
            form.dateRange == '6month'
              ? (form.dateRange = '')
              : (form.dateRange = '6month')
          "
          :class="{
            'bg-[#292930] dark:bg-[#5287e7] dark:hover:bg-base-100 text-base-100':
              form.dateRange == '6month',
            'bg-base-100 text-base-content': form.dateRange != '6month',
          }"
        >
          6 месяцев
          <span
            class="absolute top-0 right-0 rounded-2xl text-xs bg-[#ffdc60] dark:bg-[#FF4500] py-0.5 px-1 text-[8px]"
          >
            Рассрочка
          </span>
        </button>
        <button
          class="btn border-none w-[24%] text-xs whitespace-nowrap pt-1 md:pt-0 md:text-lg relative"
          @click="
            form.dateRange == '12month'
              ? (form.dateRange = '')
              : (form.dateRange = '12month')
          "
          :class="{
            'bg-[#292930] dark:bg-[#5287e7] dark:hover:bg-base-100 text-base-100':
              form.dateRange == '12month',
            'bg-base-100 text-base-content': form.dateRange != '12month',
          }"
        >
          12 месяцев
          <span
            class="absolute top-0 right-0 rounded-2xl text-xs bg-[#ffdc60] dark:bg-[#FF4500] py-0.5 px-1 text-[8px]"
          >
            Рассрочка
          </span>
        </button>
      </div>
      <div class="flex w-full justify-end mt-6">
        <div class="md:hidden w-full flex flex-col gap-5">
          <div class="flex w-full gap-5">     
            <CustomSelect
              :tabs="tariffs.map((tariff:any) => ({
                title: tariff.title,
                value: tariff.title 
              }))"
              :statusText="firstTariff"
              :dropdownContainer="'w-1/2'"
              :class="'w-full bg-base-100'"
              @change-value="(value) => (firstTariff = value.value)"
            />
            <CustomSelect
              :tabs="tariffs.map((tariff:any) => ({
                title: tariff.title,
                value: tariff.title 
              }))"
              :statusText="secondTariff"
              :dropdownContainer="'w-1/2'"
              :class="'w-full bg-base-100'"
              @change-value="(value) => (secondTariff = value.value)"
            />
          </div>
          <div class="flex w-full gap-5">
            <div
              class="flex flex-col px-5 pt-5 py-1  rounded-lg w-1/2"
              :class="{
                ' border-4 border-[#25ba7b] mr-2.5':
                  firstTariff == 'VIP',
              }"
            >
              <div class="flex flex-nowrap gap-1 items-center">
                <span class="mr-2">{{ tariffs.filter((tariff:any) => tariff.title == firstTariff)[0].title }}</span>
                <span
                  v-if="tariffs.filter((tariff:any) => tariff.title == firstTariff)[0].title == 'PRO'"
                  class="rounded-lg bg-base-content text-base-100 py-1 px-2"
                  >Популярно</span
                >
                <span
                  v-if="tariffs.filter((tariff:any) => tariff.title == firstTariff)[0].title == 'VIP'"
                  class="rounded-lg bg-[#2effa9] dark:text-base-100 text-base-content py-1 px-2"
                  >Рекомендуем</span
                >
              </div>
              <p class="text-lg font-bold mt-auto">{{ tariffs.filter((tariff:any) => tariff.title == firstTariff)[0].price + ' ₽' }}</p>
              <button
                :disabled="tariffs.filter((tariff:any) => tariff.title == firstTariff)[0].disabled"
                class="btn dark:disabled:bg-[#999999] disabled:bg-[#999999] disabled:text-base-100Ф bg-base-content dark:bg-[#5287e7] dark:hover:bg-base-content border-none w-full text-base-100 text-lg"
              >
                Купить
              </button>
            </div>
            <div
              class="flex flex-col px-5 pt-5 py-1  rounded-lg w-1/2"
              :class="{
                ' border-4 border-[#25ba7b] border-b-0 rounded-b-none mr-2.5':
                  secondTariff == 'VIP',
              }"
            >
              <div class="flex flex-nowrap gap-1 items-center">
                <span class="mr-2">{{ tariffs.filter((tariff:any) => tariff.title == secondTariff)[0].title }}</span>
                <span
                  v-if="tariffs.filter((tariff:any) => tariff.title == secondTariff)[0].title == 'PRO'"
                  class="rounded-lg bg-base-content text-base-100 py-1 px-2"
                  >Популярно</span
                >
                <span
                  v-if="tariffs.filter((tariff:any) => tariff.title == secondTariff)[0].title == 'VIP'"
                  class="rounded-lg bg-[#2effa9] dark:text-base-100 text-base-content py-1 px-2"
                  >Рекомендуем</span
                >
              </div>
              <p class="text-lg font-bold mt-auto">{{ tariffs.filter((tariff:any) => tariff.title == secondTariff)[0].price + ' ₽' }}</p>
              <button
                :disabled="tariffs.filter((tariff:any) => tariff.title == secondTariff)[0].disabled"
                class="btn dark:disabled:bg-[#999999] disabled:bg-[#999999] disabled:text-base-100Ф bg-base-content dark:bg-[#5287e7] dark:hover:bg-base-content border-none w-full text-base-100 text-lg"
              >
                Купить
              </button>
            </div>
          </div>
        </div>
        <div
          v-for="tariff in tariffs"
          class="hidden md:flex flex-col px-5 pt-5 py-1 w-[20%] rounded-lg"
          :class="{
            ' border-4 border-[#25ba7b] border-b-0 rounded-b-none mr-2.5':
              tariff.title == 'VIP',
          }"
        >
          <div class="flex flex-wrap gap-1 items-center">
            <span class="mr-2">{{ tariff.title }}</span>
            <span
              v-if="tariff.title == 'PRO'"
              class="rounded-lg bg-base-content text-base-100 py-1 px-2"
              >Популярно</span
            >
            <span
              v-if="tariff.title == 'VIP'"
              class="rounded-lg bg-[#2effa9] dark:text-base-100 text-base-content py-1 px-2"
              >Рекомендуем</span
            >
          </div>
          <p class="text-lg font-bold mt-auto">{{ tariff.price + ' ₽' }}</p>
          <button
            :disabled="tariff.disabled"
            class="btn dark:disabled:bg-[#999999] disabled:bg-[#999999] disabled:text-base-100Ф bg-base-content dark:bg-[#5287e7] dark:hover:bg-base-content border-none w-full text-base-100 text-lg"
          >
            Купить
          </button>
        </div>
      </div>
    </div>

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
            <div class="flex w-1/2 border-b border-[#e5e7e8] dark:border-[#1a1817]">
              <Icon
                v-if="tariff[firstTariff.toLowerCase()] === 0"
                name="mingcute:close-line"
                size="25"
                class="text-[#f9654b]"
              />
              <span v-else>{{ tariff[firstTariff.toLowerCase()] }}</span>
            </div>
            <div class="flex w-1/2 border-b border-[#e5e7e8] dark:border-[#1a1817]">
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
              <div class="flex w-1/2 border-b border-[#e5e7e8] dark:border-[#1a1817]">
                <Icon
                  v-if="tariff[firstTariff.toLowerCase()] === 0"
                  name="mingcute:close-line"
                  size="25"
                  class="text-[#f9654b]"
                />
                <span v-else>{{ tariff[firstTariff.toLowerCase()] }}</span>
              </div>
              <div class="flex w-1/2 border-b border-[#e5e7e8] dark:border-[#1a1817]">
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
              class="table table-zebra border-b border-[#e5e7e8] dark:border-[#1a1817] "
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
      <p class="text-lg md:text-2xl font-bold text-[#6788f3] dark:text-primary self-center">
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
            <div class="w-[25px]"><Icon name="carbon:checkmark" class="text-[#2bd250]" size="25" /></div>
            <p class="font-semibold md:text-md text-xs">{{ value }}</p>
          </li>
        </ul>
      </div>
      <div class="w-full my-4">
        <p class="text-sm md:text-lg font-bold">Выберите логистическую услугу</p>
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
