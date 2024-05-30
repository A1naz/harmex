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
    icon: 'mdi:account',
    title: 'Изучение карточки 60 секунд',
    value: 20,
  },
  {
    icon: 'mdi:account',
    title: 'Выкупы с рекламы',
    value: 20,
  },
  {
    icon: 'mdi:account',
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
  'wb.svg',
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
      <div v-else class="flex flex-col gap-2">
        <p class="text-xs font-light">У вас подключена подписка</p>
        <span class="flex gap-3 items-center">
          <p class="text-md text-[#558ff6] dark::text-primary">Basic</p>
          <span class="text-xs text-[#9a9aa0] font-thin"> 3 мес.</span>
        </span>
        <div class="flex flex-wrap gap-y-3.5 justify-between">
          <div
            v-for="tariff in tariffStats"
            class="flex flex-col px-5 py-1 w-[15%] bg-[#d6e0ff] dark:bg-primary dark:bg-opacity-5 rounded-lg"
          >
            <Icon
              class="w-6 h-6 text-[#6788f3] dark::text-primar"
              :name="tariff.icon"
            />
            <p class="text-xs mt-0.5 mb-2 text-[#6788f3] dark::text-primar">
              {{ tariff.title }}
            </p>
            <p class="text-lg font-bold mt-auto">{{ tariff.value }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-2.5 justify-center items-center my-7">
      <h2 class="text-xl font-bold">
        Не пропусти ни одной возможности - купи подписку на MarketMonstre
      </h2>
      <p class="text-xs font-light text-[#96959a]">
        Выбери план, который лучше всего подходит твоим потребностям
      </p>
    </div>

    <div
      class="flex flex-col gap-y-4 px-1.5 py-4 bg-gradient-to-r from-[#e9f7ff] to-[#96afff] dark:from-[#172038] dark:to-[#1b1f38] rounded-lg"
    >
      <div class="flex justify-between">
        <nuxt-img
          v-for="(image, index) in images"
          :key="index"
          class="w-36"
          :src="`/icons/figma/tariffs/${image}`"
          :alt="'mp' + (index + 1)"
        />
      </div>
      <div class="flex justify-between">
        <button
          class="btn bg-[#292930] dark:bg-[#5287e7] dark:hover:bg-base-content border-none w-[32%] text-base-100 text-lg"
        >
          Запуск
        </button>
        <button
          class="btn bg-base-100 border-none w-[32%] text-base-content text-lg"
        >
          Рост
        </button>
        <button
          class="btn bg-base-100 border-none w-[32%] text-base-content text-lg"
        >
          Поддержка
        </button>
      </div>
      <div class="flex justify-between">
        <button
          class="btn bg-[#292930] dark:bg-[#5287e7] dark:hover:bg-base-content border-none w-[49%] text-base-100 text-lg"
        >
          Базовый
        </button>
        <button
          class="btn bg-base-100 border-none w-[49%] text-base-content text-lg"
        >
          Под ключ
        </button>
      </div>
      <div class="flex justify-between">
        <button
          class="btn bg-[#292930] dark:bg-[#5287e7] dark:hover:bg-base-content border-none w-[24%] text-base-100 text-lg"
        >
          Ежемесячно
        </button>
        <button
          class="btn bg-base-100 border-none w-[24%] text-base-content text-lg"
        >
          3 месяца
          <span class="rounded-2xl bg-[#ffdc60] dark:bg-[#FF4500] py-1 px-2"
            >Рассрочка</span
          >
        </button>
        <button
          class="btn bg-base-100 border-none w-[24%] text-base-content text-lg"
        >
          6 месяцев
          <span class="rounded-2xl bg-[#ffdc60] dark:bg-[#FF4500] py-1 px-2"
            >Рассрочка</span
          >
        </button>
        <button
          class="btn bg-base-100 border-none w-[24%] text-base-content text-lg"
        >
          12 месяцев
          <span class="rounded-2xl bg-[#ffdc60] dark:bg-[#FF4500] py-1 px-2"
            >Рассрочка</span
          >
        </button>
      </div>
      <div class="flex justify-end mt-10">
        <div
          v-for="tariff in tariffs"
          class="flex flex-col px-5 mr-2 pt-5 py-1 w-[20%] rounded-lg"
          :class="{
            ' border-4 border-[#25ba7b] border-b-0 rounded-b-none':
              tariff.title == 'VIP',
          }"
        >
          <div class="flex gap-1 items-center">
            <span>{{ tariff.title }}</span>
            <span
              v-if="tariff.title == 'PRO'"
              class="rounded-lg bg-base-content text-base-100 py-1 px-2 ml-2"
              >Популярно</span
            >
            <span
              v-if="tariff.title == 'VIP'"
              class="rounded-lg bg-[#2effa9] dark:text-base-100 text-base-content py-1 px-2 ml-2"
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
          <div class="overflow-x-auto">
            <table class="table table-zebra border-b border-[#e5e7e8]">
              <tbody>
                <tr></tr>
                <tr v-for="(value, index) in ratingValue" :key="index">
                  <th class="w-1/5 border-r border-[#e5e7e8]">
                    {{ value.title }}
                  </th>
                  <td class="w-1/5 text-center border-r border-[#e5e7e8]">
                    {{ value.demo }}
                  </td>
                  <td class="w-1/5 text-center border-r border-[#e5e7e8]">
                    <div class="flex w-full justify-center">
                      <nuxt-img
                        v-if="value.start === 0"
                        class="w-4"
                        :src="`/icons/figma/tariffs/cross.svg`"
                      />
                      <span v-else>
                        {{ value.start }}
                      </span>
                    </div>
                  </td>
                  <td class="w-1/5 text-center border-r-4 border-[#25ba7b]">
                    <div class="flex w-full justify-center">
                      <nuxt-img
                        v-if="value.pro === 0"
                        class="w-4"
                        :src="`/icons/figma/tariffs/cross.svg`"
                      />
                      <span v-else>
                        {{ value.pro }}
                      </span>
                    </div>
                  </td>
                  <td class="w-1/5 text-center border-r-4 border-[#25ba7b]">
                    <div class="flex w-full justify-center">
                      <nuxt-img
                        v-if="value.vip === 0"
                        class="w-4"
                        :src="`/icons/figma/tariffs/cross.svg`"
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
          <div class="overflow-x-auto">
            <table class="table table-zebra border-b border-[#e5e7e8]">
              <tbody>
                <tr></tr>
                <tr v-for="(value, index) in factorsValue" :key="index">
                  <th class="w-1/5 border-r border-[#e5e7e8]">
                    {{ value.title }}
                  </th>
                  <td class="w-1/5 text-center border-r border-[#e5e7e8]">
                    {{ value.demo }}
                  </td>
                  <td class="w-1/5 text-center border-r border-[#e5e7e8]">
                    <div class="flex w-full justify-center">
                      <nuxt-img
                        v-if="value.start === 0"
                        class="w-4"
                        :src="`/icons/figma/tariffs/cross.svg`"
                      />
                      <span v-else>
                        {{ value.start }}
                      </span>
                    </div>
                  </td>
                  <td class="w-1/5 text-center border-r-4 border-[#25ba7b]">
                    <div class="flex w-full justify-center">
                      <nuxt-img
                        v-if="value.pro === 0"
                        class="w-4"
                        :src="`/icons/figma/tariffs/cross.svg`"
                      />
                      <span v-else>
                        {{ value.pro }}
                      </span>
                    </div>
                  </td>
                  <td class="w-1/5 text-center border-r-4 border-[#25ba7b]">
                    <div class="flex w-full justify-center">
                      <nuxt-img
                        v-if="value.vip === 0"
                        class="w-4"
                        :src="`/icons/figma/tariffs/cross.svg`"
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
    <p class="text-2xl font-bold">
      Выгодные предложения для продвижения бизнеса
    </p>
    <div
      class="mt-5 bg-[#ebf0ff] dark:bg-primary dark:bg-opacity-5 py-4 px-8 rounded-xl"
    >
      <p class="text-2xl font-bold text-[#6788f3] dark:text-primary self-end">
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
            <Icon name="carbon:checkmark" class="text-[#2bd250]" size="25" />
            <p class="font-semibold">{{ value }}</p>
          </li>
        </ul>
        
      </div>
      <div class="w-full my-4">
        <p class="text-lg font-bold">
          Выберите логистическую услугу
        </p>
        <CustomSelect :class="'w-[500px] bg-base-100'" :status-text="'Выберите услугу'" :tabs="[{title: 'Выкупо под ключ', value: 'key'}, {title: 'Выкупо с забором', value: 'pickup'}]" />
        </div>
        <div class="w-full -my-2">
          <p class="text-lg font-bold">
            Введите кол-во товаров
          </p>
          <input type="number" class="input input-sm border-none input-bordered w-full bg-base-100" />
          <p class="text-xs font-light">
            Логистика доступна для клиентов от 50 ед в неделю и/или 200 ед/мес
          </p>
        </div>

        <button class="btn btn-primary btn-sm h-[2.5rem] mt-10 w-full bg-[#6788f3] text-base-100 border-none">Купить</button>
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
