<script setup lang="ts">
const { notify } = useNotification()

definePageMeta({
  layout: 'app',
  middleware: 'auth',
  title: 'Выкупы',
})
const removeModal = ref(false)
const { width } = useWindowSize()
const route = useRoute()
const buyouts = ref([]) as any
const modal = ref(false)
const logModal = ref(false)
const selectedBuyout = ref<any>({})
const selectedIndex = ref(-1)
const storeMain = useMainStore()
const selectedPlace = ref(-1)
const status = computed(() => route.query?.status || 'all')
const loading = ref(false)
const mpStore = useMPStore()

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
const skip = ref(50)
const end = ref(false)
async function getBuyouts() {
  loading.value = true
  const { data } = await useFetch(() => '/api/flowwow/buyout/get', {
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

function archiveBuyout(uuid: string) {
  buyouts.value = buyouts.value.map((buyout: any) => {
    if (buyout.uuid === uuid)
      buyout.status = 'archived'

    return buyout
  })
  if (
    route.query.status
    && route.query?.status !== 'archived'
    && route.query?.status !== 'all'
  ) {
    buyouts.value = buyouts.value.filter((buyout: any) => buyout.uuid !== uuid)
  }
}

function unarchiveBuyout(uuid: string) {
  buyouts.value = buyouts.value.map((buyout: any) => {
    if (buyout.uuid === uuid)
      buyout.status = 'active'

    return buyout
  })
  if (
    route.query.status
    && route.query?.status !== 'active'
    && route.query?.status !== 'all'
  ) {
    buyouts.value = buyouts.value.filter((buyout: any) => buyout.uuid !== uuid)
  }
}
function unpauseBuyout(uuid: string) {
  buyouts.value = buyouts.value.map((buyout: any) => {
    if (buyout.uuid === uuid)
      buyout.status = 'active'

    return buyout
  })
  if (
    route.query.status
    && route.query?.status !== 'active'
    && route.query?.status !== 'all'
  ) {
    buyouts.value = buyouts.value.filter((buyout: any) => buyout.uuid !== uuid)
  }
}

async function selectFilterDate(e: any) {
  const target = e
  dateFilter.value = target.value
  skip.value = 50
  end.value = false
  const { data } = await useFetch('/api/flowwow/buyout/get', {
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
  const { data } = await useFetch('/api/flowwow/buyout/search', {
    query: {
      string: value,
      type,
    },
    watch: false,
  })
  if (data.value)
    buyouts.value = data.value

  search.loading = false
}

const findBuyoutsDebounced = useDebounceFn(findBuyouts, 1000)

async function onSearchInput(_event: Event) {
  autoTarget.value = false
  search.loading = true
  findBuyoutsDebounced(search.text, search.type)
}

const activeBuyouts = computedEager(() => {
  if (!buyouts.value.length)
    return []
  const result = buyouts.value.filter(
    (buyout: any) => buyout.status === 'active',
  )
  return result
})
const availableBuyouts = computedEager(() => {
  if (!activeBuyouts.value.length)
    return null
  let balance = storeMain.client.balance
  let result = 0
  activeBuyouts.value.forEach((buyout: any) => {
    balance -= buyout.product.price * buyout.quantity
    if (balance >= 0)
      result++
  })
  return result
})
const neededDeposit = computedEager(() => {
  let result = 0
  let sum = 0
  activeBuyouts.value.forEach((buyout: any) => {
    sum += buyout.product.price * buyout.quantity
  })
  if (sum > storeMain.client.balance)
    result = sum - storeMain.client.balance

  return result
})
const formatAvailable = computedEager(() => {
  if (!availableBuyouts.value)
    return ''
  const str = availableBuyouts.value.toString()
  const lastNumber = Number(str[str.length - 1])
  if (Number(str) > 10 && Number(str) < 20)
    return 'выкупов'
  if (lastNumber === 1)
    return 'выкуп'
  if (lastNumber > 1 && lastNumber < 5)
    return 'выкупа'
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
    title: 'На паузе',
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
    title: 'Выкуп с рекламы',
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
  {
    title: 'Недостаточно средств',
    optionValue: 'nofunds',
    params: '?status=nofunds',
    queryStatus: 'nofunds',
  },
]

watch(targetIsVisible, async (isVisible) => {
  if (isVisible && autoTarget.value && buyouts.value.length >= 50) {
    if (end.value)
      return
    const { data } = await useFetch('/api/flowwow/buyout/get', {
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
    const { data } = await useFetch('/api/flowwow/buyout/get', {
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
  { deep: true, immediate: true },
)

onMounted(async () => {
  if (route.query?.uuid) {
    const uuid = route.query?.uuid
    if (buyouts.value) {
      const index = buyouts.value!.findIndex(
        (buyout: any) => buyout.uuid === uuid,
      )
      if (index !== -1) {
        openModal(index)
      }
      else {
        const { data } = await useFetch(
          '/api/flowwow/buyout/getOne',
          {
            method: 'GET',
            query: { uuid },
            watch: false,
          },
        )
        if (data.value) {
          buyouts.value = [data.value, ...buyouts.value]
          openModal(0)
        }
      }
    }
  }
})

getBuyouts()

const statusText = computed(() => {
  return filters.find((el: any) => el.queryStatus === route.query.status)?.title
})

const dropdownOpened = ref<boolean>(false)

function handleBodyClick(event: MouseEvent) {
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

const codeInput = ref()

function updateSearchType(filter: any) {
  search.type = filter.value
}
async function changeMP(e: any) {
  mpStore.changeMp(e.value, 'buyouts', route.query?.status ? `?status=${route.query.status}` : '')
}
const customLinks = filters.map(filter => ({
  title: filter.title,
  slot: '/flowwow/buyouts/',
  query: filter.params,
}))

function openRemoveModal(index: number) {
  selectedIndex.value = index
  selectedPlace.value = buyouts.value.length - index
  selectedBuyout.value = buyouts.value[index]
  removeModal.value = true
}

async function removeBuyout() {
  const { error }: any = await useFetch(
    '/api/flowwow/buyout/delete',
    {
      method: 'DELETE',
      body: {
        uuid: selectedBuyout.value.uuid,
      },
      headers: useRequestHeaders(['cookie']) as HeadersInit,
    },
  )
  if (error.value) {
    notify({
      title: 'Что-то пошло не так',
      text: error.value?.data?.message,
      type: 'error',
      duration: 3000,
    })
  }
  else {
    removeModal.value = false
    notify({
      title: 'Успешно',
      text: 'Выкуп успешно удален',
      type: 'success',
      duration: 3000,
    })
    buyouts.value = buyouts.value.filter((buyout: any) => buyout.uuid !== selectedBuyout.value.uuid)
  }
}
const orgInfo = ref({}) as any
const isVisible = ref(false)
const router = useRouter()

async function getOrgInfo() {
  const currentPath = router.currentRoute.value.path

  const pathSegments = currentPath.split('/').filter(Boolean)

  const mp = pathSegments[0]
  const serviceType = `/${pathSegments[1]}`

  const { data }: any = await useFetch('/api/catalog/getOrgInfo', {
    method: 'GET',
    query: {
      serviceType,
      mp,
    },
  })

  if (!data.value)
    return
  orgInfo.value = data.value.orgInfo
}
getOrgInfo()

async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text)
  notify({
    title: 'Успешно',
    text: 'Скопировано в буфер обмена',
  })
}
</script>

<template>
  <div>
    <div class="breadcrumbs text-sm mt-8 flex w-full justify-between flex-wrap-reverse">
      <ul class="font-medium text-[18px] text-[#909090]">
        <li class="cursor-pointer">
          <NuxtLink to="/catalog" class="cursor-pointer text-[#909090]">
            Маркетплейсы
          </NuxtLink>
        </li>
        <li class="cursor-pointer">
          <NuxtLink to="/catalog/flowwow" class="cursor-pointer text-[#909090]">
            Flowwow
          </NuxtLink>
        </li>
        <li class="cursor-pointer text-[#1e2734]">
          Выкупы
        </li>
      </ul>
      <div v-if="orgInfo && orgInfo.title" class="flex gap-3">
        <div class=" bg-white rounded-lg shadow-xs flex gap-2 items-center text-center ">
          <div class="org-name font-semibold text-gray-800">
            {{ orgInfo.title.toUpperCase() }}
          </div>

          <CustomShopTooltip :visible="isVisible" :info="orgInfo" />
          <button class="p-1 flex flex-col justify-center items-center text-center bg-gray-10 hover:bg-gray-200 rounded-lg text-[#909090]" @click="copyToClipboard(`https://app.harmex.ru/register?uuid`)">
            <Icon name="ph:share-fat-fill" size="20" />
          </button>
        </div>
      </div>
    </div>
    <div />
    <div class="flex justify-start lg:justify-between  mb-4 items-center mt-4">
      <div class="flex relative gap-2 lg:gap-3 flex-col lg:flex-row w-full lg:w-full">
        <div class="flex gap-2">
          <NuxtLink
            to="/flowwow/buyouts/create"
            class="btn btn-primary bg-[#6675ff] dark:bg-primary border-none btn-sm gap-2 font-medium normal-case"
          >
            <Icon name="fluent:add-24-filled" size="12" />
            <span class="hidden lg:inline">Выкупы</span>
          </NuxtLink>
        </div>
        <div class="w-full flex gap-1 lg:gap-2 ">
          <div class="flex gap-1  lg:gap-3 flex-nowrap whitespace-nowrap">
            <!-- <span><CustomSelect
              class="h-[2rem]  lg:min-w-[120px]"
              status-text="Wildberries"
              :tabs="storeMain.client.username === 'test' ? mpStore.sortMp('buyouts') : mpStore.sortMp('buyouts', true)"
              @change-value="changeMP"
            /></span> -->
            <span><CustomSelect
              class="h-[2rem]  min-w-[95px]"
              :status-text="statusText"
              :links="customLinks"
            /> </span>
          </div>
          <div class="flex lg:ml-auto gap-0.5 lg:gap-3">
            <CustomSelect
              class="bg-[#f4f4f4] h-[2rem]"
              :tabs="[
                { title: 'Все время', value: 'all' },
                { title: 'Сегодня', value: 'today' },
                { title: 'Вчера', value: '2days' },
                { title: '3 дня', value: '3days' },
                { title: 'Неделя', value: '7days' },
              ]"
              @change-value="selectFilterDate"
            />
            <!--
            <CustomSelect
              class="h-[2rem] bg-[#f4f4f4] min-w-[100px]"
              :tabs="[
                { title: 'Артикул', value: 'article' },
                { title: 'ID выкупа', value: 'uuid' },
                { title: 'Имя', value: 'name' },
              ]"
              @change-value="updateSearchType"
            /> -->
          </div>
          <div class="absolute right-0 top-0 w-[calc(100%-40px)] lg:w-fit lg:static">
            <label class="w-full flex bg-[#ececed] rounded-lg items-center">
              <input
                ref="codeInput"
                v-model="search.text"
                type="text"
                class="input input-sm border-none bg-transparent  dark:bg-base-300 dark:bg-opacity-40 w-full lg:w-11/12"
                placeholder="артикул, id, наименование товара"
                @input="onSearchInput()"
              >
              <span
                v-if="search.loading"
                class="loading loading-spinner loading-xs flex justify-end p-2"
              />
              <Icon
                v-else
                class="text-[#8f8e93] flex justify-end pr-2"
                name="tabler:search"
                size="30"
                @click="codeInput.focus()"
              />
            </label>
          </div>
        </div>
      </div>
    </div>

    <div v-if="buyouts.length > 0">
      <div
        v-if="
          (route.query.status === 'active' || !route.query.status)
            && activeBuyouts.length > 0
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
              neededDeposit,
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
          class="cards grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-[repeat(auto-fit,minmax(300px,1fr))] h-full"
        >
          <BuyoutFlowwowCard
            v-for="(buyout, index) of buyouts"
            :key="buyout.uuid"
            :index="index"
            :info="buyout"
            @unarchive="unarchiveBuyout"
            @archive="archiveBuyout"
            @open-modal="openModal"
            @remove-buyout="openRemoveModal"
            @unpause="unpauseBuyout"
            @open-log-modal="openLogModal"
          />
        </TransitionSlide>
      </div>
      <div ref="target" class="p-2 w-full col-span-1 h-40 md:h-10" />
    </div>

    <Hero v-else-if="!loading" />
    <div v-else class="w-full mt-5 flex justify-center items-center">
      <span class="loading loading-dots loading-lg text-primary" />
    </div>
    <BuyoutFlowwowLogModal
      v-if="logModal"
      :info="selectedBuyout"
      :index="selectedIndex"
      :state="logModal"
      @close="logModal = false"
    />
    <BuyoutFlowwowInfoModal
      v-if="modal"
      :info="selectedBuyout"
      :state="modal"
      :index="selectedIndex"
      @close="modal = false"
    />
    <BuyoutRemoveModal
      v-if="removeModal"
      :info="selectedBuyout"
      :state="removeModal"
      :index="selectedIndex"
      @remove="removeBuyout"
      @close="removeModal = false"
    />
  </div>
</template>

<style scoped></style>
