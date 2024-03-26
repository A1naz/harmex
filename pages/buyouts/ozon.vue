<script setup lang="ts">
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Выкупы',
})

const { width } = useWindowSize()
const route = useRoute()
const router = useRouter()
const buyouts = ref([]) as any
const modal = ref(false)
const logModal = ref(false)
const selectedBuyout = ref({})
const selectedIndex = ref(-1)
const storeMain = useMainStore()
const mpStore = useMPStore()
const selectedPlace = ref(-1)
const status = computed(() => route.query?.status || 'all')
const loading = ref(false)


const dateFilter = ref('all')
const autoTarget = ref(true)
const search = reactive({
  text: '',
  loading: false,
  error: false,
  type: 'article',
})
function openModal(index: number) {
  selectedIndex.value = index
  selectedPlace.value = buyouts.value.length - index
  selectedBuyout.value = buyouts.value[index]
  modal.value = true
}
function openLogModal(index: number) {
  selectedIndex.value = index
  selectedPlace.value = buyouts.value.length - index
  selectedBuyout.value = buyouts.value[index]
  logModal.value = true
}
const target = ref(null)
const targetIsVisible = ref(false)
const { stop } = useIntersectionObserver(
  target,
  ([{ isIntersecting }], observerElement) => {
    targetIsVisible.value = isIntersecting
  }
)
const skip = ref(50)
const end = ref(false)
async function getBuyouts() {
  loading.value = true
  const { data } = await useFetch(() => '/api/ozon/buyout/get', {
    method: 'GET',
    query: {
      status: status.value ?? 'all',
      dateFilter: dateFilter.value,
      limit: 50,
    },
    watch: false,
  })
  buyouts.value = data.value
  loading.value = false
}

// await getBuyouts()

function removeBuyout(uuid: string) {
  buyouts.value = buyouts.value.filter((buyout: any) => buyout.uuid !== uuid)
}
function archiveBuyout(uuid: string) {
  buyouts.value = buyouts.value.map((buyout: any) => {
    if (buyout.uuid === uuid) buyout.status = 'archived'

    return buyout
  })
  if (
    route.query.status &&
    route.query?.status !== 'archived' &&
    route.query?.status !== 'all'
  )
    buyouts.value = buyouts.value.filter((buyout: any) => buyout.uuid !== uuid)
}

function unarchiveBuyout(uuid: string) {
  buyouts.value = buyouts.value.map((buyout: any) => {
    if (buyout.uuid === uuid) buyout.status = 'active'

    return buyout
  })
  if (
    route.query.status &&
    route.query?.status !== 'active' &&
    route.query?.status !== 'all'
  )
    buyouts.value = buyouts.value.filter((buyout: any) => buyout.uuid !== uuid)
}
function unpauseBuyout(uuid: string) {
  buyouts.value = buyouts.value.map((buyout: any) => {
    if (buyout.uuid === uuid) buyout.status = 'active'

    return buyout
  })
  if (
    route.query.status &&
    route.query?.status !== 'active' &&
    route.query?.status !== 'all'
  )
    buyouts.value = buyouts.value.filter((buyout: any) => buyout.uuid !== uuid)
}
function selectStatus(e: Event) {
  const target = e.target as HTMLSelectElement
  router.push({
    path: '/buyouts',
    query: {
      status: target.value,
    },
  })
}

async function selectFilterDate(e: any) {
  const target = e
  dateFilter.value = target.value
  skip.value = 50
  end.value = false
  const { data } = await useFetch('/api/ozon/buyout/get', {
    method: 'GET',
    query: {
      status: status.value || 'all',
      dateFilter: dateFilter.value,
      limit: 50,
    },
    watch: false,
  })
  buyouts.value = data.value
}
async function findBuyouts(value: string, type: string) {
  if (!value) {
    autoTarget.value = true
    search.loading = false
    getBuyouts()
    return
  }
  const { data, error } = await useFetch('/api/ozon/buyout/search', {
    query: {
      string: value,
      type,
    },
    watch: false,
  })
  if (data.value) buyouts.value = data.value

  search.loading = false
}

const findBuyoutsDebounced = useDebounceFn(findBuyouts, 1000)

async function onSearchInput(event: Event) {
  const newValue = (event.target as HTMLInputElement).value
  autoTarget.value = false
  search.loading = true
  findBuyoutsDebounced(search.text, search.type)
}

const activeBuyouts = computedEager(() => {
  if (!buyouts.value.length) return []
  const result = buyouts.value.filter(
    (buyout: any) => buyout.status === 'active'
  )
  return result
})
const availableBuyouts = computedEager(() => {
  if (!activeBuyouts.value.length) return null
  let balance = storeMain.client.balance
  let result = 0
  activeBuyouts.value.forEach((buyout: any) => {
    balance -= buyout.product.price * buyout.quantity
    if (balance >= 0) result++
  })
  return result
})
const neededDeposit = computedEager(() => {
  let result = 0
  let sum = 0
  activeBuyouts.value.forEach((buyout: any) => {
    sum += buyout.product.price * buyout.quantity
  })
  if (sum > storeMain.client.balance) result = sum - storeMain.client.balance

  return result
})
const formatAvailable = computedEager(() => {
  if (!availableBuyouts.value) return ''
  const str = availableBuyouts.value.toString()
  const lastNumber = Number(str[str.length - 1])
  if (Number(str) > 10 && Number(str) < 20) return 'выкупов'
  if (lastNumber === 1) return 'выкуп'
  if (lastNumber > 1 && lastNumber < 5) return 'выкупа'
  else return 'выкупов'
})

const filters = [
  {
    title: 'Все выкупы',
    optionValue: 'all',
    params: '',
    queryStatus: undefined,
  },
  {
    title: 'В архиве',
    optionValue: 'archived',
    params: '?status=archived',
    queryStatus: 'archived',
  },
  {
    title: 'Пауза',
    optionValue: 'paused',
    params: '?status=paused',
    queryStatus: 'paused',
  },
  {
    title: 'Завершенные',
    optionValue: 'completed',
    params: '?status=completed',
    queryStatus: 'completed',
  },
  {
    title: 'Выкуплены по рекламе',
    optionValue: 'completedByAds',
    params: '?status=completedByAds',
    queryStatus: 'completedByAds',
  },
  {
    title: 'Ожидает скидку',
    optionValue: 'discountAwaiting',
    params: '?status=discountAwaiting',
    queryStatus: 'discountAwaiting',
  },
  {
    title: 'Выкуп по скидке',
    optionValue: 'completedByDiscount',
    params: '?status=completedByDiscount',
    queryStatus: 'completedByDiscount',
  },
]

watch(targetIsVisible, async (isVisible) => {
  if (isVisible && autoTarget.value && buyouts.value.length >= 50) {
    if (end.value) return
    const { data } = await useFetch('/api/ozon/buyout/get', {
      method: 'GET',
      query: {
        status: route.query?.status || 'all',
        limit: 50,
        dateFilter: dateFilter.value,
        skip: skip.value,
      },
      watch: false,
    })
    if ((data.value as any).length === 0) {
      end.value = true
      return
    }
    buyouts.value = [...buyouts.value, ...(data.value as any)]
    skip.value += 50
  }
})
watch(
  () => status.value,
  async () => {
    skip.value = 50
    end.value = false
    const { data } = await useFetch('/api/ozon/buyout/get', {
      method: 'GET',
      query: {
        status: status.value || 'all',
        dateFilter: dateFilter.value,
        limit: 50,
      },
      watch: false,
    })
    buyouts.value = data.value
  },
  { deep: true, immediate: true }
)

onMounted(async () => {
  if (route.query?.uuid) {
    const uuid = route.query?.uuid
    if (buyouts.value) {
      const index = buyouts.value!.findIndex(
        (buyout: any) => buyout.uuid === uuid
      )
      if (index !== -1) {
        openModal(index)
      } else {
        const { data, error } = await useFetch('/api/ozon/buyout/getOne', {
          method: 'GET',
          query: { uuid },
          watch: false,
        })
        if (data.value) {
          buyouts.value = [data.value, ...buyouts.value]
          openModal(0)
        }
      }
    }
  }
})

getBuyouts()

const isInfoModal = ref<boolean>(false)

const statusText = computed(() => {
  return filters.find((el: any) => el.queryStatus === route.query.status)?.title
})

const dropdownOpened = ref<boolean>(false)

const handleBodyClick = (event: MouseEvent) => {
  const dropdown = document.querySelector('.dropdown')
  if (dropdown && !dropdown.contains(event.target as Node)) {
    dropdownOpened.value = false
  }
}

onMounted(() => {
  document.body.addEventListener('click', handleBodyClick)
})

onUnmounted(() => {
  document.body.removeEventListener('click', handleBodyClick)
})

function toggleInfoModal() {
  isInfoModal.value = !isInfoModal.value
}

const codeInput = ref()

const updateSearchType = (filter: any) => {
  search.type = filter.value
}

async function changeMP(e: any) {
  return navigateTo(
    '/buyouts/' +
      e.value +
      (route.query?.status ? '?status=' + route.query.status : '')
  )
}
const customLinks = filters.map((filter) => ({
  title: filter.title,
  slot: '/buyouts/wildberries',
  query: filter.params,
}))
</script>

<template>
  <div>
    <!-- <InfoModal
      :isModal="isInfoModal"
      title="Выкупы"
      ytSrc="https://www.youtube.com/embed/YNFKOAgRAuU?si=bwAzeSLOmprr3NFe"
      @changeVisibility="toggleInfoModal"
    >
      <div class="flex flex-col gap-2">
        <p>
          Здесь формируются и оплачиваются выкупы на OZON. Для добавления
          нажмите на кнопку "Добавить выкупы".
        </p>
        <p>
          Стоимость одного выкупа -
          <span class="font-bold"
            >{{ storeMain.tariffString('buyouts') }}.</span
          >
          Все услуги оказываются по Московскому времени.
        </p>
        <p
          v-if="route.query.status === 'archived'"
          class="text-xs font-light mt-1 lg:text-sm"
        >
          Выкупы в архиве удаляются через 10 дней.
        </p>
      </div>
    </InfoModal> -->

    <div></div>
    <div class="flex justify-between mb-4 items-center mt-4">
      <div class="flex gap-2 lg:gap-3 flex-col lg:flex-row w-full lg:w-max">
        <div class="flex gap-2">
          <NuxtLink
            to="/buyouts/create"
            class="btn btn-primary btn-sm gap-2 font-medium normal-case"
          >
            <Icon name="fluent:add-24-filled" size="12" />
            <span class="hidden lg:inline">Выкупы</span>
          </NuxtLink>
          <div class="relative flex items-center flex-grow-0 w-full lg:hidden">
            <input
              ref="codeInput"
              v-model="search.text"
              type="text"
              class="input input-sm border-none w-full bg-base-300 bg-opacity-40"
              placeholder="Поиск по товарам"
              @input="onSearchInput($event)"
            />
            <span
              v-if="search.loading"
              class="absolute right-2 loading loading-spinner loading-xs p-2"
            />
            <Icon
              v-else
              class="absolute right-2 p-2 text-base-content text-opacity-50"
              name="tabler:search"
              size="35"
              @click="codeInput.focus()"
            />
          </div>
        </div>

        <div clas="flex gap-2 flex-wrap">
          <div
            class="search flex items-center gap-1 lg:gap-3"
            :class="{
              'flex-wrap': width < 335,
            }"
          >
            <CustomSelect
              class=""
              :class="'lg:min-w-[120px]'"
              :status-text="'Ozon'"
              :tabs="mpStore.MPTabs"
              @change-value="changeMP"
            />
            <CustomSelect
              class=""
              :class="'navbar:min-w-[120px]'"
              :links="customLinks"
            />
            <!-- <div
              class="dropdown group relative"
              @click="dropdownOpened = !dropdownOpened"
              @click.stop
            >
              <div
                class="font-normal normal-case btn-primary bg-opacity-20 border-none text-base-content btn btn-sm w-[120px] lg:w-[120px] flex items-center justify-between px-2 flex-nowrap"
              >
                <span>{{ statusText }}</span>
                <Icon v-if="dropdownOpened" name="formkit:up" size="18" />
                <Icon v-else name="formkit:down" size="18" />
              </div>
              <ul
                class="absolute shadow z-[1] bg-base-100 p-1 rounded-lg max-w-[200px] mt-2"
                v-if="dropdownOpened"
              >
                <li>
                  <NuxtLink
                    v-for="filter in filters"
                    :to="'/buyouts/ozon' + filter.params"
                    :external="false"
                    :class="{
                      'bg-primary bg-opacity-20':
                        route.query.status === filter.queryStatus,
                    }"
                    class="btn btn-ghost btn-xs normal-case font-normal w-full hover:bg-primary hover:bg-opacity-20"
                  >
                    <span>
                      {{ filter.title }}
                    </span>
                  </NuxtLink>
                </li>
              </ul>
            </div> -->

            <CustomSelect
            :class="'bg-base-300'"
              class="lg:hidden"
              :tabs="[
                { title: 'За все время', value: 'all' },
                { title: 'Сегодня', value: 'today' },
                { title: 'Вчера', value: '2days' },
                { title: '3 дня', value: '3days' },
                { title: 'Неделя', value: '7days' },
              ]"
              @change-value="selectFilterDate"
            />

            <div class="flex gap-3 items-center lg:hidden">
              <CustomSelect
              :class="'bg-base-300'"
                :tabs="[
                  { title: 'Артикул', value: 'article' },
                  { title: 'ID выкупа', value: 'uuid' },
                  { title: 'Имя', value: 'name' },
                ]"
                @change-value="updateSearchType"
              />
            </div>
          </div>
        </div>

        <!-- <select class="select select-bordered select-sm" @change="selectStatus">
          <option
            v-for="filter in filters"
            :value="filter.optionValue"
            :selected="route.query.status === filter.queryStatus"
          >
            {{ filter.title }}
          </option>
        </select> -->
      </div>
      <!-- <select
        class="select select-bordered select-sm lg:hidden"
        @change="selectStatus"
      >
      <option 
        v-for="filter in filters"
        :value="filter.optionValue" 
        :selected="route.query.status === filter.queryStatus"
        >
        {{ filter.title }}
        </option>
      </select> -->
      <div class="items-center flex-wrap self-start hidden lg:flex">
        <div class="search flex items-center flex-wrap gap-3">
          <CustomSelect
          :class="'bg-base-300'"
            :tabs="[
              { title: 'За все время', value: 'all' },
              { title: 'Сегодня', value: 'today' },
              { title: 'Вчера', value: '2days' },
              { title: '3 дня', value: '3days' },
              { title: 'Неделя', value: '7days' },
            ]"
            @change-value="selectFilterDate"
          />
          <!-- <select
            class="select select-bordered select-sm"
            @change="selectFilterDate"
          >
            <option value="all">За все время</option>
            <option value="today">Сегодня</option>
            <option value="3days">3 дня</option>
            <option value="7days">Неделя</option>
          </select> -->
          <div class="flex items-center justify-between gap-3">
            <CustomSelect
            :class="'bg-base-300'"
              class="min-w-[100px]"
              :tabs="[
                { title: 'Артикул', value: 'article' },
                { title: 'ID выкупа', value: 'uuid' },
                { title: 'Имя', value: 'name' },
              ]"
              @change-value="updateSearchType"
            />

            <!-- <select
              v-model="search.type"
              class="select select-bordered select-sm"
            >
              <option value="article">Артикул</option>
              <option value="uuid">ID выкупа</option>
              <option value="name">Имя товара</option>
            </select> -->
            <div class="relative justify-end flex-grow-0 w-full hidden lg:flex">
              <input
                ref="codeInput"
                v-model="search.text"
                type="text"
                class="input input-sm bg-base-300 bg-opacity-40"
                placeholder="Поиск по товарам"
                @input="onSearchInput($event)"
              />
              <span
                v-if="search.loading"
                class="absolute right-2 loading loading-spinner loading-xs p-2 mt-2"
              />
              <Icon
                v-else
                class="absolute right-2 p-2 text-base-content text-opacity-50"
                name="tabler:search"
                size="35"
                @click="codeInput.focus()"
              />
            </div>
          </div>
        </div>
        <!-- <a
          href="info/Информационная таблица по выкупам.xlsx"
          class="btn btn-sm btn-primary hidden lg:flex lg:items-center"
        >
          Скачать шаблон
        </a> -->
        <!-- <NuxtLink
          to="/buyouts/create"
          class="btn btn-primary btn-sm gap-2 font-medium normal-case self-end"
        >
          <Icon name="fluent:add-24-filled" size="24" />
          Добавить выкупы
        </NuxtLink> -->
      </div>
    </div>

    <div v-if="buyouts.length > 0">
      <div
        v-if="
          (route.query.status === 'active' || !route.query.status) &&
          activeBuyouts.length > 0
        "
        class="flex justify-center py-2 rounded-lg px-2 mb-2 bg-base-200 border border-base-300"
      >
        <p
          v-if="availableBuyouts"
          :class="{
            'text-green-500': availableBuyouts === activeBuyouts.length,
          }"
          class="text-sm"
        >
          {{
            availableBuyouts === activeBuyouts.length
              ? 'Баланса хватит на все выкупы'
              : `Баланса хватит на ${availableBuyouts} ${formatAvailable} из ${activeBuyouts.length}.`
          }}
          <span v-if="neededDeposit > 0">{{
            `Пополните баланс на ${Math.round(
              neededDeposit
            )} для выполнения всех выкупов.`
          }}</span>
        </p>
        <p
          v-if="availableBuyouts === 0 && activeBuyouts.length > 0"
          class="text-center text-orange-400 text-sm"
        >
          Недостаточно средств для совершения выкупа, пополните баланс.
        </p>
      </div>
      <div v-else class="px-2 py-4 mb-2" />
      <div>
        <TransitionSlide
          group
          class="cards grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4 h-full"
        >
          <BuyoutOzonCard
            v-for="(buyout, index) of buyouts"
            :key="buyout.uuid"
            :index="index"
            :info="buyout"
            @unarchive="unarchiveBuyout"
            @archive="archiveBuyout"
            @open-modal="openModal"
            @remove="removeBuyout"
            @unpause="unpauseBuyout"
            @open-log-modal="openLogModal"
          />
        </TransitionSlide>
      </div>
      <div ref="target" class="p-2 w-full col-span-1 h-40 md:h-10" />
    </div>

    <Hero v-else-if="!loading" />
    <div v-else class="w-full mt-5 flex justify-center items-center">
      <span class="loading loading-dots loading-lg text-primary"></span>
    </div>
    <BuyoutOzonLogModal
      v-if="logModal"
      :info="selectedBuyout"
      :index="selectedIndex"
      :state="logModal"
      @close="logModal = false"
    />
    <BuyoutOzonInfoModal
      v-if="modal"
      :info="selectedBuyout"
      :state="modal"
      :index="selectedIndex"
      @close="modal = false"
    />
  </div>
</template>

<style scoped></style>
