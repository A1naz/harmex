<script setup lang="ts">
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Выкупы',
})

const route = useRoute()
const router = useRouter()
const buyouts = ref([]) as any
const modal = ref(false)
const logModal = ref(false)
const selectedBuyout = ref({})
const selectedIndex = ref(-1)
const storeMain = useMainStore()
const selectedPlace = ref(-1)
const status = computed(() => route.query?.status || 'all')
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
  const { data } = await useFetch(() => '/api/buyout/get', {
    method: 'GET',
    query: {
      status: status.value ?? 'all',
      dateFilter: dateFilter.value,
      limit: 50,
    },
    watch: false,
  })
  buyouts.value = data.value
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

async function selectFilterDate(e: Event) {
  const target = e.target as HTMLSelectElement
  dateFilter.value = target.value
  skip.value = 50
  end.value = false
  const { data } = await useFetch('/api/buyout/get', {
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
  const { data, error } = await useFetch('/api/buyout/search', {
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
]

watch(targetIsVisible, async (isVisible) => {
  if (isVisible && autoTarget.value && buyouts.value.length >= 50) {
    if (end.value) return
    const { data } = await useFetch('/api/buyout/get', {
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
    const { data } = await useFetch('/api/buyout/get', {
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
        const { data, error } = await useFetch('/api/buyout/getOne', {
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

await getBuyouts()

const isInfoModal = ref<boolean>(false)
const filter = {
  title: "Все выкупы"
};

const updateTitle = (title: string) => {
  filter.title = title;
};
function toggleInfoModal() {
  isInfoModal.value = !isInfoModal.value
}

</script>

<template>
  <div>
    <div class="flex items-center gap-2 mt-4">
      <h1 class="text-2xl font-bold">Выкупы</h1>
      <InfoButton @openModal="toggleInfoModal" />
    </div>

    <InfoModal
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
    </InfoModal>

    <div class="flex justify-between mb-4 items-center mt-6">
      <div class="flex gap-2 lg:gap-3 flex-col sm:flex-row w-full sm:w-max">
        <!-- <NuxtLink
            v-for="filter in filters"
            :to=" '/buyouts' + filter.params"
            :external="false"
            :class="{
                'btn-active': route.query.status === filter.queryStatus,
            }"
            class="btn btn-ghost btn-sm normal-case font-medium"
            >
          {{ filter.title }}
        </NuxtLink> -->
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
                v-model="search.text"
                type="text"
                class="input input-sm input-bordered w-full"
                placeholder="Поиск по товарам"
                @input="onSearchInput($event)"
              />
              <Icon
                v-if="!search.loading"
                class="absolute right-2 p-2"
                name="tabler:search"
                size="30"
              />
              <span
                v-if="search.loading"
                class="absolute right-2 loading loading-spinner loading-xs p-2"
              />
            </div>
        </div>
        <div clas="flex gap-2">
          
          <div class="search flex items-center gap-3">
            <details class="dropdown">
              <summary tabindex="0" class="font-medium normal-case bg-base-200 btn btn-sm">{{ filter.title }}</summary>
              <ul tabindex="0" class="shadow dropdown-content z-[1] bg-base-100 p-1 rounded-lg mt-1 max-w-[200px]">
                <li>
                  <NuxtLink
                    v-for="filter in filters"
                    :to=" '/buyouts' + filter.params"
                    :external="false"
                    :class="{
                        'btn-active': route.query.status === filter.queryStatus,
                    }"
                    
                    class="btn btn-ghost btn-xs normal-case font-medium w-full"
                    >
                  <span @click="updateTitle(filter.title)">
                    {{ filter.title }}
                  </span>
                  
                </NuxtLink>
                </li>
              </ul>
            </details>
            
            <select
              class="select select-bordered select-sm sm:hidden"
              @change="selectFilterDate"
            >
              <option value="all">За все время</option>
              <option value="today">Сегодня</option>
              <option value="3days">3 дня</option>
              <option value="7days">Неделя</option>
            </select>
            <div class="flex gap-3 items-center sm:hidden">
              <select
                v-model="search.type"
                class="select select-bordered select-sm"
              >
                <option value="article">Артикул</option>
                <option value="uuid">ID выкупа</option>
                <option value="name">Имя товара</option>
              </select>
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
      <div class="items-center flex-wrap self-start hidden sm:flex ">
        <div class="search flex items-center flex-wrap gap-3">
          <select
            class="select select-bordered select-sm"
            @change="selectFilterDate"
          >
            <option value="all">За все время</option>
            <option value="today">Сегодня</option>
            <option value="3days">3 дня</option>
            <option value="7days">Неделя</option>
          </select>
          <div class="flex gap-3 items-center ">
            <select
              v-model="search.type"
              class="select select-bordered select-sm"
            >
              <option value="article">Артикул</option>
              <option value="uuid">ID выкупа</option>
              <option value="name">Имя товара</option>
            </select>
            <div class="relative items-center flex-grow-0 w-full hidden lg:flex">
              <input
                v-model="search.text"
                type="text"
                class="input input-sm input-bordered"
                placeholder="Поиск по товарам"
                @input="onSearchInput($event)"
              />
              <Icon
                v-if="!search.loading"
                class="absolute right-2 p-2"
                name="tabler:search"
                size="30"
              />
              <span
                v-if="search.loading"
                class="absolute right-2 loading loading-spinner loading-xs p-2"
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
        class="flex justify-center py-2 rounded-lg px-2 mb-2 bg-base-100 border border-base-200"
      >
        <p
          v-if="availableBuyouts"
          :class="{
            'text-success': availableBuyouts === activeBuyouts.length,
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
          class="text-center text-warning text-sm"
        >
          Недостаточно средств для совершения выкупа, пополните баланс.
        </p>
      </div>
      <div v-else class="px-2 py-4 mb-2" />
      <div>
        <TransitionSlide
          group
          class="cards grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 h-full"
        >
          <BuyoutCard
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

    <Hero v-else />
    <BuyoutLogModal
      v-if="logModal"
      :info="selectedBuyout"
      :index="selectedIndex"
      :state="logModal"
      @close="logModal = false"
    />
    <BuyoutInfoModal
      v-if="modal"
      :info="selectedBuyout"
      :state="modal"
      :index="selectedIndex"
      @close="modal = false"
    />
  </div>
</template>

<style scoped></style>
