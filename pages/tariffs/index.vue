<script setup lang="ts">
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Тарифы',
})

const tariffsValue = ref(false)
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

const tariffs = ref({})

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

const firstTariff = ref('DEMO')

const secondTariff = ref('START')

async function getPrices() {
  const { data } = await useFetch('/api/prices/get', {
    method: 'GET',
  })

  if (data.value) {
    tariffs.value = data.value
  }
}
await getPrices()

const modal = ref(false)
const orderModal = ref(false)
const orderModalType = ref('credit-tinkoff')
const currentTariff = ref({})
const tariffFullName = ref('')
const tariffPrice = ref('')

function openPurchaseModal(tariffName: string) {
  currentTariff.value = tariffs.value[form.mp][form.title].type[
    form.type
  ].tariffs.find((tariff: any) => tariff.title === tariffName)

  tariffFullName.value = `${ tariffs.value[form.mp][form.title].title } ${tariffs.value[form.mp][form.title].type[form.type].title.toLowerCase()} ,
  ${
    form.dateRange.replace('months', '') == '3'
      ? '3 месяца'
      : `${form.dateRange.replace('months', '')} месяцев`
  }
  , Тарифный план "${currentTariff.value.title}"`

  tariffPrice.value = currentTariff.value.prices[form.dateRange.replace('months', '')]

  modal.value = true
}

function openOrderModal(type: string) {
  modal.value = false
  orderModalType.value = type
  orderModal.value = true
}
</script>

<template>
  <div class="my-4 bg-base-100 rounded-lg flex flex-col">

    <TariffsModal
      :state="modal"
      :tariff="currentTariff"
      :tariffName="tariffFullName"
      :tariffPrice="tariffPrice"
      :form="form"
      @close="modal = false"
      @continue="(type:string) => openOrderModal(type)"
    />
    <TariffsOrderModal
      :state="orderModal"
      :tariffName="tariffFullName"
      :tariffPrice="tariffPrice"
      :type="orderModalType"
      @close="orderModal = false"
      @change-type="(type: string) => orderModalType = type"
    />
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
      @open-modal="openPurchaseModal"
    />

    <TariffsTariffInfo
      :value="tariffs[form.mp][form.title].type[form.type]"
      :first-tariff="firstTariff"
      :second-tariff="secondTariff"
      :form="form"
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
