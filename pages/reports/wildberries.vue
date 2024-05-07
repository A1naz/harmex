<script setup lang="ts">
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Отчеты по выкупам',
})
const mpStore = useMPStore()
const store = useMainStore()
const selectedMP = ref(mpStore.selectedMP || 'wildberries')
const openAll = ref(false)
const reports = ref([]) as any
const modalInfo = reactive({
  src: '',
  code: 0,
})
const autoTarget = ref(true)
const loading = ref(false)
const router = useRouter()
const route = useRoute()
const status = computed(() => route.query?.status || 'all')

const search = reactive({
  text: '',
  loading: false,
  error: false,
  type: 'uuid',
})
const modal = ref(false)
function openModal(code: number, src: string) {
  modalInfo.src = src
  modalInfo.code = code
  modal.value = true
}
const target = ref(null)
const targetIsVisible = ref(false)
const { stop } = useIntersectionObserver(
  target,
  ([{ isIntersecting }], observerElement) => {
    targetIsVisible.value = isIntersecting
  }
)
const skip = ref(20)
const end = ref(false)
async function getReports() {
  loading.value = true
  const { data, error } = await useFetch('/api/wildberries/reports/get', {
    method: 'GET',
    query: {
      skip: 0,
      limit: 20,
      status: status.value,
    },
  })
  reports.value = data.value
  loading.value = false
}

getReports()

async function findReports(value: string, type: string) {
  if (!value) {
    autoTarget.value = true
    await getReports()
    search.loading = false
    return
  }
  const { data, error } = await useFetch('/api/wildberries/reports/search', {
    query: {
      string: value,
      type,
    },
  })
  if (data.value) reports.value = data.value

  search.loading = false
}

const findReportsDebounced = useDebounceFn(findReports, 1000)
async function onSearchInput(event: Event) {
  const newValue = (event.target as HTMLInputElement).value
  autoTarget.value = false
  search.loading = true
  findReportsDebounced(search.text, search.type)
}
function selectStatus(e: any) {
  const target = e
  router.push({
    path: '/reports/wildberries',
    query: {
      status: target.value,
    },
  })
}

watch(targetIsVisible, async (isVisible) => {
  if (isVisible && autoTarget.value && reports.value.length >= 20) {
    if (end.value) return
    const { data, error } = await useFetch('/api/wildberries/reports/get', {
      method: 'GET',
      query: {
        limit: 20,
        skip: skip.value,
        status: status.value,
      },
    })
    if ((data.value as any)?.length === 0) {
      end.value = true
      return
    }
    reports.value = [...reports.value, ...(data.value! as any)]
    skip.value += 20
  }
})

watch(
  () => status.value,
  async (newRoute) => {
    skip.value = 20
    end.value = false
    const { data } = await useFetch('/api/wildberries/reports/get', {
      method: 'GET',
      query: {
        status: status.value ?? 'all',
        limit: 20,
      },
    })
    reports.value = data.value
  },
  { deep: true, immediate: true }
)

const updateSearchType = (filter: any) => {
  search.type = filter.value
}
const codeInput = ref()
function changeFilter(e: any) {
  mpStore.selectedMP = e.value
  return navigateTo('/reports/' + e.value)
}
</script>

<template>
  <div>
    <!-- <h1 class="text-2xl font-bold mt-4">
      Отчеты по выкупам
    </h1> -->
    <!-- <p class="text-xs font-light mt-4 lg:text-sm">
      В этом разделе можно посмотреть как производились выкупы
    </p> -->
    <div class="relative flex lg:hidden items-center w-full mt-6">
      <input
        ref="codeInput"
        v-model="search.text"
        type="text"
        class="input input-sm bg-base-300 bg-opacity-40 text-gray-500 w-full"
        placeholder="Поиск"
        @input="onSearchInput($event)"
      />
      <span
        v-if="search.loading"
        class="absolute right-2 loading loading-spinner loading-xs p-2"
      />
      <Icon
        v-else
        class="absolute right-0.5 p-2 my-auto text-gray-500"
        name="tabler:search"
        size="35"
        @click="codeInput.focus()"
      />
    </div>
    <div class="flex lg:justify-between mb-8 mt-2 lg:mt-6 gap-2">
      <div class="flex justify-between md:justify-normal gap-2">
        <CustomSelect
          class=""
          :class="'sm:min-w-[120px]'"
          :status-text="'Wildberries'"
          :tabs="mpStore.MPTabsTest"
          @change-value="changeFilter"
        />
        <CustomSelect
          :class="'bg-[#f4f4f4] sm:min-w-[120px]'"
          :tabs="[
            { title: 'Все отчеты', value: 'all' },
            { title: 'Сегодня', value: 'today' },
            { title: '3 дня', value: '3days' },
            { title: 'Неделя', value: '7days' },
          ]"
          @change-value="selectStatus"
        />
        <!-- <select class="select select-bordered select-sm w-1/2 md:w-auto" @change="selectStatus">
          <option value="all" :selected="route.query.status === undefined">
            Все отчеты
          </option>
          <option value="today" :selected="route.query.status === 'today'">
            Сегодня
          </option>
          <option value="3days" :selected="route.query.status === '3days'">
            3 дня
          </option>
          <option value="7days" :selected="route.query.status === '7days'">
            7 дней
          </option>
        </select> -->
        <!-- <div class="flex items-center mt-0">
          <input id="openAll" v-model="openAll" type="checkbox" class="checkbox checkbox-primary checkbox-sm">
          <label for="openAll" class="cursor-pointer select-none ml-2">Развернуть все</label>
        </div> -->
      </div>
      <div
        class="flex flex-wrap-reverse justify-start md:flex-row gap-2 md:flex-wrap"
      >
        <div class="flex gap-2 md:mt-0 items-center">
          <CustomSelect
            :class="'bg-[#f4f4f4] '"
            :tabs="[{ title: 'Основание/ID', value: 'uuid' }]"
            @change-value="updateSearchType"
          />
          <!-- <select v-model="search.type" disabled class="select select-bordered select-sm">
            <option value="uuid">
              ID
            </option>
          </select> -->
          <div class="relative hidden lg:flex items-center flex-grow-0 w-full">
            <input
              ref="codeInput"
              v-model="search.text"
              type="text"
              class="input input-sm bg-base-300 bg-opacity-40 text-gray-500"
              placeholder="Поиск"
              @input="onSearchInput($event)"
            />
            <span
              v-if="search.loading"
              class="absolute right-2 loading loading-spinner loading-xs p-2"
            />
            <Icon
              v-else
              class="absolute right-0.5 p-2 my-auto text-gray-500"
              name="tabler:search"
              size="35"
              @click="codeInput.focus()"
            />
          </div>
          <!-- <div
            class="bg-primary bg-opacity-10 px-2 py-1 rounded-lg cursor-not-allowed"
          >
            XLS
          </div> -->
          <!-- <ExportXls 
                api="/api/wildberries/reports/export"
                fileName="Отчет по выкупам MARKETMONSTR.xlsx"
                :isVisible="reports.length ? true : false"
            /> -->
        </div>
      </div>
    </div>

    <div v-if="reports?.length">
      <TransitionSlide group class="grid grid-cols-1 gap-3">
        <ReportExpand
          v-for="(item, index) in reports"
          :key="index"
          :state="openAll"
          :info="item"
        />
        <div
          ref="target"
          class="flex justify-center items-center h-40 md:h-10"
        />
      </TransitionSlide>
    </div>
    <Hero v-else-if="!loading" />
    <div v-else class="w-full flex justify-center items-center mt-20">
      <span class="loading loading-dots loading-lg text-primary"></span>
    </div>
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease-in-out;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
</style>
