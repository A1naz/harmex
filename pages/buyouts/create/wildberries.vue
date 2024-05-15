<script setup lang="tsx">
import { useNotification } from '@kyvg/vue3-notification'
import { useWindowSize } from '@vueuse/core'
import type { Rule } from '@/data/buyout/rules'
import { rules } from '@/data/buyout/rules'
import type { ISearchQueryChange } from '@/stores/wildberriesBuyout'

const closeWarningModal = ref(null) as Ref<HTMLLabelElement | null>
const closeTemplateModal = ref(null) as Ref<HTMLLabelElement | null>
const closeTemplateSelectModal = ref(null) as Ref<HTMLLabelElement | null>
const currency = useCurrency()
const isCreateButtonDisabled = ref(false)
const { width, height } = useWindowSize()
const { notify } = useNotification()

const mainStore = useMainStore()
const loadingTemplates = ref(false)
const openAll = ref(false)
const templateTitle = ref('')
const templates = ref<any>([])
const modalShow = ref(false)
const codeInput = ref()

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Добавить выкупы Wildberries',
})
let isUserWarned: any = ref(false)
onMounted(() => {
  isUserWarned.value =
    localStorage.getItem('isUserWarned') === 'true' ? true : false
  if (products.value.length === 0 && !route.query.uuid) modalShow.value = true
})

const isWarningChecked = ref(false)

const disabledCreateButton = ref(false)
const ruleModal = ref(false)
const selectedRuleProductIndex = ref(0)
const checksModal = ref(false)
const infoModal = ref<HTMLDialogElement>()
const store = useWildberriesBuyoutStore()
const infoType = ref('')
const defaultRules: Rule[] = rules
const route = useRoute()
const article = ref<string>()

const products = computed(() => store.createProducts)
// products.value.forEach((product: any, i: number) => {
//   if ( wasRuleChanged) {
//     products.value[i].rules.push({
//       category: 3,
//       description:
//         'Не выкупать если товар не найден в поисковой выдаче (не выкупать по прямой ссылке)',
//       id: 5,
//     })
//   }
// })
const loading = ref(false)

async function addProduct() {
  if (!article.value) return
  loading.value = true
  const string = article.value.toString().trim()
  if (string.includes(',')) {
    const articles = string.split(',')
    for (const item of articles) await store.addProduct(Number(item))
    loading.value = false
  } else {
    store.addProduct(Number(article.value)).finally(() => {
      loading.value = false
    })
  }
  article.value = ''
}

function ruleModalOpen(index: number) {
  ruleModal.value = true
  selectedRuleProductIndex.value = index
}
function removeSearchQuery(index: number, place: number) {
  store.removeSearchQuery(index, place)
}

function addSearchQuery(index: number) {
  store.addSearchQuery(index)
}

function onDateRangeChange(value: unknown[], index: number) {
  store.changeDateRange(value, index)
}

function onSearchQueryChange(options: ISearchQueryChange) {
  store.changeSearchQuery(options)
}

function onQuantityChange(value: number, index: number) {
  store.changeQuantity(value, index)
}

function onSizeChange(event: Event, index: number) {
  const target = event.target as HTMLInputElement
  store.changeSize(target.value, index)
}

function onSexChange(event: Event, index: number) {
  const target = event.target as HTMLInputElement
  store.changeSex(target.value, index)
}

function onRuleChange(event: Event, index: number, rule: number) {
  const target = event.target as HTMLInputElement
  store.changeRule(target.checked, index, rule)
}

function removeProduct(index: number) {
  store.removeProduct(index)
}

function handleAddress(address: string, lt: number, lg: number) {
  store.handleAddress(address, lt, lg)
}
function openInfoModal(type: string) {
  infoType.value = type
  infoModal.value?.showModal()
}

const totalSum = computed(() => {
  return products.value.reduce((acc, item) => {
    return acc + item.price * item.quantity
  }, 0)
})

const totalQuantity = computed(() => {
  return products.value.reduce((acc, item) => {
    return acc + item.quantity
  }, 0)
})

const pickpoints = shallowRef()
const modalOpen = ref(false)
function closeModal() {
  modalOpen.value = false
}

async function openChecksModal() {
  const productCountsByAddress: any = {}

  if (!isUserWarned.value) {
    const { data, error }: any = await useFetch(
      '/api/wildberries/buyout/checkPVZRestrictions',
      {
        method: 'GET',
      }
    )

    if (data.value) {
      const productsForTest = [...products.value, ...data.value.lastBuyouts]

      for (const item of productsForTest) {
        const dateStart: any = new Date(item.dateRange[0])
        const dateEnd: any = new Date(item.dateRange[1])
        const timeDiff = dateEnd - dateStart
        const millisecondsPerDay = 24 * 60 * 60 * 1000
        const daysBetween = Math.ceil(timeDiff / millisecondsPerDay)

        productCountsByAddress[`${item.adress}:${item.article} `] =
          (productCountsByAddress[`${item.adress}:${item.article} `] || 0) +
          item.quantity
        if (
          Math.ceil(productCountsByAddress[`${item.adress}:${item.article} `]) /
            daysBetween >
          3
        ) {
          closeWarningModal.value?.click()
          return
        }
      }
    }
  }

  let valid = true
  let errorMsg = ''
  products.value.forEach((item) => {
    if (!item.adress) {
      valid = false
      errorMsg = 'Не у всех товаров указан адрес доставки'
    }
    if (!item.dateRange[0] || !item.dateRange[1]) {
      valid = false
      errorMsg = 'Не у всех товаров указаны даты выкупов'
    }
    if (!item.searchQuery[0].value) {
      valid = false
      errorMsg = 'Не у всех товаров указан поисковый запрос'
    }
    if (!item.selectedSize) item.selectedSize = 'none'
  })
  if (!valid) {
    notify({
      title: 'Что-то пошло не так',
      text: errorMsg,
      type: 'error',
      duration: 3000,
    })
    return
  }
  checksModal.value = true
}

async function createBuyout() {
  isCreateButtonDisabled.value = true
  const userOffsetMinutes = new Date().getTimezoneOffset()
  const userTimezoneOffsetHours = -userOffsetMinutes / 60
  const userTimezoneOffsetMinutesRemainder = -userOffsetMinutes % 60
  disabledCreateButton.value = true
  const { data, error } = await useFetch('/api/wildberries/buyout/create', {
    method: 'POST',
    watch: false,
    body: JSON.stringify(products.value),
    query: {
      userTimezoneOffsetHours,
      userOffsetMinutes: userTimezoneOffsetMinutesRemainder,
    },
  })
  disabledCreateButton.value = false
  if (error.value) {
    notify({
      title: 'Что-то пошло не так',
      text: error.value?.data.message,
      type: 'error',
      duration: 3000,
    })
    isCreateButtonDisabled.value = false
  } else if (data.value!.status === 'ok') {
    notify({
      title: 'Выкуп успешно создан',
      type: 'success',
      duration: 3000,
    })

    store.createProducts = []
    navigateTo({ path: '/buyouts/wildberries' })
  }
}

watch(products.value, (old, value) => {
  value.forEach((item, index) => {
    if (item.quantity < 1) products.value[index].quantity = 1

    if (item.quantity > 1000) products.value[index].quantity = 1000
  })
})

async function getPickpoints() {
  try {
    const data = await $fetch('/api/wildberries/buyout/pickpoints', {
      method: 'GET',
    })
    pickpoints.value = (data as any).points
  } catch (e: any) {
    notify({
      title: 'Что-то пошло не так',
      text: e?.message,
      type: 'error',
      duration: 3000,
    })
  }
}

async function pointModalOpen(index: number) {
  if (!pickpoints.value) loading.value = true

  store.selectedItem = index
  modalOpen.value = true
}

onMounted(async () => {
  getPickpoints()
  if (route.query.uuid) {
    loading.value = true
    await store.cloneBuyout(route.query.uuid.toString())
    loading.value = false
  }
})
onKeyStroke('Escape', (e) => {
  e.preventDefault()
  ruleModal.value = false
  infoModal.value?.close()
})

function warned() {
  isUserWarned.value = true
  if (isWarningChecked.value == true) {
    localStorage.setItem('isUserWarned', 'true')
  }
  openChecksModal()
}

const isCreatingTemplatesDisabled = ref(false)
async function createTemplate() {
  isCreatingTemplatesDisabled.value = true

  const { data, error } = await useFetch(
    '/api/wildberries/buyout/createBuyoutTemplate',
    {
      method: 'POST',
      query: {
        title: templateTitle,
      },
      body: products.value,
      watch: false,
    }
  )

  if (data.value) {
    store.createProducts = []
    notify({
      title: 'Шаблон выкупа создан',
      type: 'success',
    })

    closeTemplateModal.value?.click()
    isCreatingTemplatesDisabled.value = false
  }
}

async function getTemplates() {
  loadingTemplates.value = true
  const { data, error }: any = await useFetch(
    '/api/wildberries/buyout/templates'
  )
  if (data.value) {
    templates.value = data.value.templates
  }
  loadingTemplates.value = false
}

function deleteTemplate(uuid: any) {
  templates.value = templates.value.filter((item: any) => {
    return item.uuid !== uuid
  })
}

function closeTemplateModalFN() {
  closeTemplateSelectModal.value?.click()
}
function modalAddProduct(changedArticle: any) {
  article.value = changedArticle
  addProduct()
}
</script>

<template>
  <div>
    <!-- <h1 class="text-2xl font-bold mt-4">Добавить выкупы</h1>
    <p class="text-xs text-gray-500 font-light mt-1 lg:text-sm">
      Создайте новые выкупы. Введите артикулы товаров и заполните необходимые
      данные.
    </p> -->
    <div class="flex flex-col md:flex-row md:justify-between">
      <div class="mt-6 md:flex items-center gap-2.5 w-full">
        <div
          class="relative flex justify-end items-center flex-grow-0 md:w-80 gap-2.5 w-full"
        >
          <input
            ref="codeInput"
            v-model="article"
            placeholder="Артикул"
            class="input input-sm w-full mb-2 md:mb-0 bg-base-300 border-base-300 bg-opacity-30 border-opacity-30"
            @keydown.enter="addProduct"
          />
          <Icon
            class="absolute right-2 mb-2 md:mb-0 p-2 text-base-content text-opacity-50"
            name="tabler:search"
            size="35"
            @click="codeInput.focus()"
          />
        </div>
        <div class="flex gap-2.5">
          <button
            class="btn btn-primary bg-[#d8dcff] dark:bg-primary dark:bg-opacity-20 hover:bg-[#6675ff] dark:hover:bg-primary hover:text-base-100 btn-sm normal-case border-none text-base-content font-normal"
            @click="addProduct"
          >
            Добавить
          </button>
          <label
            for="template-select-modal"
            @click="getTemplates"
            class="btn btn-sm btn-primary normal-case bg-[#d8dcff] dark:bg-primary dark:bg-opacity-20 border-none text-base-content mr-0 md:mr-1 mb-2 md:mb-0 font-normal hover:bg-[#6675ff] dark:hover:bg-primary hover:text-base-100"
            >Шаблоны</label
          >
          <label
            v-if="store.createProducts.length > 0"
            class="btn btn-sm text-red-400 bg-base-200 normal-case flex md:hidden"
            for="removeAllModelCreateProducts"
            >Удалить все</label
          >
        </div>
      </div>
      <div class="flex self-end">
        <label
          v-if="store.createProducts.length > 0"
          class="btn btn-sm text-red-400 bg-base-200 normal-case self-end hidden md:flex"
          for="removeAllModelCreateProducts"
          >Удалить все</label
        >
        <!-- <label
        v-if="store.createProducts.length > 0"
        class="btn btn-sm btn-error bg-red-400 normal-case mt-6 mr-2 hidden md:flex"
        for="removeAllModelCreateProducts"
        >Удалить все</label
        > -->
      </div>
    </div>
    <div class="flex gap-2 mt-4">
      <div class="text-sm">
        <span class="text-gray-500">Товаров: </span>
        <span>{{ totalQuantity }} шт.</span>
      </div>
      <div class="text-sm">
        <span class="text-gray-500">Сумма: </span>
        <span>{{ currency.format(totalSum) }}</span>
      </div>
    </div>

    <ClientOnly>
      <div
        v-if="width < 1600"
        class="products-card grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 mt-4"
      >
        <BuyoutWildberriesCreateCard
          v-for="(product, index) in products"
          :key="index"
          :loading="!pickpoints?.length"
          :product="product"
          :index="index"
          @point-modal-open="pointModalOpen"
          @rule-modal-open="ruleModalOpen"
        />
      </div>
      <div
        v-else
        class="products-table scrollbar-thumb-primary scrollbar-track-base-200 scrollbar-thin"
      >
        <table class="table table-xs w-full mt-4">
          <thead class="relative mb-2 text-sm text-base-content">
            <tr class="bg-[#f1f2ff] dark:bg-primary dark:bg-opacity-10">
              <!-- <th class="hidden 3xl:block">№</th> -->
              <th
                class="w-12 text-center p-2 font-normal"
                @click="openInfoModal('picture')"
              >
                <!-- <IconCSS name="material-symbols:image-outline" size="20" /> -->
                Фото
              </th>
              <th class="w-36 3xl:w-48 text-center font-normal">Название</th>
              <th
                @click="openInfoModal('price')"
                class="text-center font-normal"
              >
                <div class="flex w-full items-center justify-center">
                  <span> Цена </span>
                  <!-- <span class="rounded-lg bg-base-200 px-1 text-xs"> ? </span> -->
                </div>
              </th>

              <th @click="openInfoModal('size')" class="font-normal">
                <!-- <div class="flex justify-between w-full gap-1 items-center"> -->
                <div class="text-center">
                  <span> Размер </span>
                  <!-- <span class="rounded-lg bg-base-200 px-1 text-xs"> ? </span> -->
                </div>
              </th>
              <th @click="openInfoModal('sex')" class="font-normal">
                <!-- <div class="flex justify-between w-full gap-1 items-center"> -->
                <div class="text-center">
                  <span> Пол </span>
                  <!-- <span class="rounded-lg bg-base-200 px-1 text-xs"> ? </span> -->
                </div>
              </th>

              <th @click="openInfoModal('rules')" class="font-normal">
                <!-- <div class="flex justify-between w-full gap-1 items-center"> -->
                <div class="text-center">
                  <span> Правила </span>
                  <!-- <span class="rounded-lg bg-base-200 px-1 text-xs"> ? </span> -->
                </div>
              </th>
              <th @click="openInfoModal('dates')" class="font-normal">
                <!-- <div class="flex justify-between w-full gap-1 items-center"> -->
                <div class="text-center">
                  <span> Даты выкупов </span>
                  <!-- <span class="rounded-lg bg-base-200 px-1 text-xs"> ? </span> -->
                </div>
              </th>

              <th class="min-w-40 font-normal" @click="openInfoModal('adress')">
                <!-- <div class="flex justify-between w-full gap-1 items-center"> -->
                <div class="text-center">
                  <span> Адрес </span>
                  <!-- <span class="rounded-lg bg-base-200 px-1 text-xs"> ? </span> -->
                </div>
              </th>
              <th
                @click="openInfoModal('search')"
                class="font-normal text-base-content"
              >
                <div class="flex justify-center items-center gap-1">
                  <span>Поисковые запросы</span>
                  <!-- <span class="rounded-lg bg-base-200 px-1 text-xs">?</span> -->
                </div>
              </th>

              <th class="text-base-content" />
            </tr>
            <progress
              v-show="loading"
              class="progress absolute bottom-[-2] mb-2 z-10 progress-primary w-full"
            />
          </thead>

          <tbody>
            <BuyoutWildberriesCreateTableRow
              v-for="(product, index) in products"
              :key="index"
              :product="product"
              :index="index"
              :loading="!pickpoints?.length"
              @rule-modal-open="ruleModalOpen"
              @point-modal-open="pointModalOpen"
            />
          </tbody>
        </table>
      </div>
      <BuyoutWildberriesSelectPointModal
        v-if="modalOpen"
        :state="modalOpen"
        :pickpoints="pickpoints"
        @callback="handleAddress"
        @close="closeModal"
      />
    </ClientOnly>
    <div
      v-show="products.length"
      class="mt-6 md:flex justify-start lg:justify-end"
    >
      <div class="m-5">
        <!-- <label
          v-if="store.createProducts.length > 0"
          class="btn btn-sm btn-error bg-red-400 normal-case mt-1 ml-0 md:mt-0 md:ml-2 z-0"
          for="removeAllModelCreateProducts"
          >Удалить все</label
        > -->
        <label
          class="btn btn-sm btn-primary normal-case border-none text-base-content mt-2 md:mt-0 ml-1 md:ml-2 px-6 font-normal bg-[#d8dcff] dark:bg-primary dark:bg-opacity-20 hover:bg-[#6675ff] dark:hover:bg-primary hover:text-base-100"
          for="template-modal"
        >
          Шаблон
        </label>

        <button
          class="btn btn-sm btn-primary normal-case border-none text-base-content mt-1 ml-2 font-normal bg-[#d8dcff] dark:bg-primary dark:bg-opacity-20 hover:bg-[#6675ff] dark:hover:bg-primary hover:text-base-100"
          :disabled="disabledCreateButton"
          @click="openChecksModal"
        >
          <!-- {{
            products.length > 1
              ? `Создать
          выкупы`
              : `Создать выкуп`
          }} -->
          Создать
        </button>
      </div>
    </div>

    <div v-if="ruleModal">
      <input id="ruleModal" type="checkbox" class="modal-toggle" />
      <label
        for="ruleModal"
        class="modal modal-open modal-bottom sm:modal-middle"
      >
        <label for="" class="modal-box relative">
          <label
            for="ruleModal"
            class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            @click="ruleModal = false"
            >✕</label
          >
          <h3 class="font-bold text-lg mb-2">
            Выберите нужные правила для этого выкупа
          </h3>
          <div v-for="rule of defaultRules" :key="rule.id" class="">
            <div
              v-if="rule.id === 1"
              class="label cursor-pointer flex gap-4 items-start justify-between"
            >
              <span class="label-text">{{
                'Выкупить товар(-ы) прямо сейчас '
              }}</span>
              <div class="flex gap-4">
                <div
                  class="bg-primary bg-opacity-5 text-primary cursor-default rounded-full px-4"
                >
                  0р.
                </div>
                <input
                  type="checkbox"
                  v-model="products[selectedRuleProductIndex].purchaseSoon"
                  class="checkbox checkbox-primary border-base-content"
                />
              </div>
            </div>
            <div
              v-if="rule.id === 1 && mainStore.client.username == 'test'"
              class="label cursor-pointer flex gap-4 items-start justify-between"
            >
              <span class="label-text">{{ 'Выкуп под ключ ' }}</span>
              <div class="flex gap-4">
                <div
                  class="bg-primary bg-opacity-5 text-primary cursor-default rounded-full px-4"
                >
                  0р.
                </div>
                <input
                  type="checkbox"
                  v-model="products[selectedRuleProductIndex].key"
                  class="checkbox checkbox-primary border-base-content"
                />
              </div>
            </div>
            <div
              class="label cursor-pointer flex gap-4 items-start justify-around"
            >
              <span class="label-text"
                >{{ rule.id }}. {{ rule.description }}</span
              >
              <div
                class="bg-primary bg-opacity-5 text-primary cursor-default rounded-full px-4"
              >
                0р.
              </div>
              <input
                :disabled="
                  !!store.createProducts[selectedRuleProductIndex].rules.find(
                    (item) =>
                      item.category === rule.category && item.id !== rule.id
                  ) ||
                  !!store.createProducts[selectedRuleProductIndex].rules.find(
                    (item) => item.id === rule?.relies
                  )
                "
                type="checkbox"
                class="checkbox checkbox-primary border-base-content"
                :checked="
                  !!store.createProducts[selectedRuleProductIndex].rules.find(
                    (item) => item.id === rule.id
                  )
                "
                @change="
                  onRuleChange($event, selectedRuleProductIndex, rule.id)
                "
              />
            </div>
          </div>
        </label>
      </label>
    </div>
    <dialog id="infoModal" ref="infoModal" class="modal">
      <form method="dialog" class="modal-box p-4">
        <h3 class="font-bold text-lg">Информация</h3>
        <div class="py-4 flex flex-col gap-2">
          <p v-if="infoType === 'picture'">
            <span class="font-bold"> Изображение </span>
            - Увеличивайте изображение товара просто наводя на него курсором
          </p>
          <p v-if="infoType === 'price'">
            <span class="font-bold"> Цена </span>
            - Цена товара указана без СПП
          </p>

          <p v-if="infoType === 'size'">
            <span class="font-bold"> Размер </span>
            - Выберите желаемый размер товара
          </p>
          <p v-if="infoType === 'sex'">
            <span class="font-bold"> Пол </span>
            - Выберите желаемый Пол для выкупов
          </p>
          <div v-if="infoType === 'search'">
            <div>
              <span class="font-bold"> Поисковые запросы </span>
              - Введите поисковые запросы, чем больше, тем лучше нажимая на "+"
            </div>
            <div class="text-sm">
              Например, при указании 5 поисковых запросов - каждый будет
              выкупаться по своему запросу, если по данному запросу товар не
              найден, то запрос игнорируется.
            </div>
          </div>
          <p v-if="infoType === 'adress'">
            <span class="font-bold"> Адрес </span>
            - Добавьте Адрес желаемого ПВЗ от куда вы будете забирать товар
          </p>
          <p v-if="infoType === 'dates'">
            <span class="font-bold"> Даты выкупов </span>
            - Выберите желаемый диапазон дат и времени для выкупов
          </p>
          <p v-if="infoType === 'rules'">
            <span class="font-bold"> Правила </span>
            - Используйте Правила для создания дополнительной безопасности ваших
            выкупов
          </p>
        </div>
        <div class="modal-action mt-0">
          <button class="btn btn-sm">Закрыть</button>
        </div>
      </form>
    </dialog>
    <BuyoutWildberriesCreateChecksModal
      v-if="checksModal"
      :isCreateButtonDisabled="isCreateButtonDisabled"
      :state="checksModal"
      @create="createBuyout"
      @close="checksModal = false"
    />

    <input id="warning-modal" type="checkbox" class="modal-toggle" />
    <div class="modal">
      <div class="modal-box">
        <label
          ref="closeWarningModal"
          for="warning-modal"
          class="btn btn-sm btn-circle btn-ghost absolute right-1 top-1"
          >✕</label
        >
        <h3 class="font-bold text-lg">Принимаете ли вы риски штрафа?</h3>
        <p class="py-4">
          Мы рекомендуем ограничить количество заказываемых товаров на один
          артикул на один пункт выдачи до 3 единиц в день.
        </p>
        <div class="modal-action flex justify-between">
          <div class="form-control md:block flex-row">
            <label class="label cursor-pointer md:mt-0 mt-16">
              <input
                type="checkbox"
                v-model="isWarningChecked"
                class="checkbox checkbox-primary"
              />
              <span class="label-text ml-2">Запомнить</span>
            </label>
          </div>
          <div class="flex flex-col lg:flex-row">
            <label
              for="warning-modal"
              class="btn btn-ghost my-2 md:my-0"
              @click=""
              >Отмена</label
            >

            <label for="warning-modal" class="btn btn-primary" @click="warned"
              >Принимаю</label
            >
          </div>
        </div>
      </div>
    </div>
    <input id="template-modal" type="checkbox" class="modal-toggle" />
    <div class="modal">
      <div class="modal-box max-w-md py-3">
        <label
          ref="closeTemplateModal"
          for="template-modal"
          class="btn btn-sm btn-circle btn-ghost absolute right-1 top-1"
          >✕</label
        >
        <h3 class="font-semibold text-lg text-bas mr-4">
          Введите название шаблона
        </h3>
        <input
          v-model="templateTitle"
          type="text"
          @keyup.enter="createTemplate"
          :disabled="isCreatingTemplatesDisabled"
          placeholder="Название шаблона"
          class="input input-bordered w-full mt-2 bg-base-200 placeholder-base-content placeholder-opacity-50 border-base-200"
        />
        <div class="modal-action flex self-end">
          <label
            for="template-modal"
            class="btn btn-ghost my-2 md:my-0 w-[30%]"
            @click=""
            >Отмена</label
          >

          <button
            class="btn btn-primary w-[30%]"
            :disabled="isCreatingTemplatesDisabled"
            @click="createTemplate"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
    <input id="template-select-modal" type="checkbox" class="modal-toggle" />
    <div class="modal" style="z-index: 9999">
      <div class="modal-box max-w-7xl min-h-[300px]">
        <label
          ref="closeTemplateSelectModal"
          for="template-select-modal"
          class="btn btn-sm btn-circle btn-ghost absolute right-1 top-1"
          >✕</label
        >
        <h3 class="font-bold text-lg mr-4 mb-4">
          {{ templates.length > 0 ? 'Выберите шаблон' : '' }}
        </h3>
        <div v-if="templates.length > 0" class="flex items-center">
          <input
            id="openAll"
            v-model="openAll"
            type="checkbox"
            class="checkbox checkbox-primary checkbox-sm"
          />
          <label for="openAll" class="cursor-pointer select-none ml-2"
            >Развернуть все</label
          >
        </div>
        <div v-else-if="!loadingTemplates" class="hero">
          <Hero />
        </div>
        <div class="hero mt-20" v-else>
          <span class="loading loading-spinner loading-lg"></span>
        </div>
        <div class="mb-10"></div>
        <BuyoutWildberriesTemplateExpand
          v-for="template in templates"
          :key="template.uuid"
          class="mt-1"
          @getTemplates="deleteTemplate"
          @closeModal="closeTemplateModalFN"
          :uuid="template.uuid"
          :opened="openAll"
          :info="template"
        ></BuyoutWildberriesTemplateExpand>
        <div class="modal-action flex justify-between"></div>
      </div>
    </div>
  </div>

  <input
    type="checkbox"
    id="removeAllModelCreateProducts"
    class="modal-toggle"
  />
  <div class="modal backdrop-filter backdrop-blur-sm">
    <div class="modal-box max-w-xs">
      <h3 class="font-normal text-lg">
        Вы уверенны что хотите удалить все товары?
      </h3>
      <div class="modal-action flex justify-around">
        <label
          for="removeAllModelCreateProducts"
          class="btn btn-sm h-[2.5rem] w-[45%] btn-ghost hover:bg-[#6675FF] hover:dark:bg-[#6467F2] hover:text-base-100 px-6"
          >Отмена</label
        >
        <label
          for="removeAllModelCreateProducts"
          class="btn btn-sm btn-primary h-[2.5rem] border-none text-base-content bg-opacity-20 w-[45%] hover:bg-[#6675FF] hover:dark:bg-[#6467F2] hover:text-base-100 px-6"
          @click="store.createProducts = []"
          >Удалить</label
        >
      </div>
    </div>
  </div>
  <BuyoutWildberriesCreateModal
    :show="modalShow"
    :add-product="modalAddProduct"
    @close-modal="modalShow = false"
  />
</template>

<style scoped>
th {
  @apply normal-case hover:text-primary hover:cursor-pointer;
}

table td,
table td * {
  vertical-align: top;
}

.b24-widget-button-wrapper {
  position: hidden;
  z-index: 0;
}

.b24-widget-button-shadow {
  position: hidden;
  z-index: 0;
}
</style>
