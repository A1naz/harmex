<script setup lang="ts">
import { ConfigTable, ItemData, ItemSearch } from '~/data/types'
import { FieldsType } from '~/data/enums'

const props = defineProps({
  endpoint: { type: String, required: true },
  config: { type: Array as PropType<ConfigTable[]>, required: true },
  useDefaultDateFilter: { type: Boolean, required: false },
  dateRange: {
    type: Object as PropType<{ from: string; to: string }>,
    default: () => ({}),
  },
})

const changePage = (numPage: number) => {
  updateFilter('skip', numPage)
}

const changeLimit = (limit: number) => {
  updateFilter('limit', limit)
}

const route = useRoute()
const { getData } = useApi()
const { width, height } = useWindowSize()
const isLoading = ref(false)
const limitList = [20, 40, 60]
const limitInit = 20

const listData = reactive<ItemData>({
  data: [],
  count: 0,
  search: {
    skip: 0,
    limit: limitInit,
    sort: { createdAt: -1 },
    filter: {},
  },
})

const _fetchData = async () => {
  listData.data = []
  const { search } = listData
  const res = await getData(props.endpoint, {
    skip: search.skip,
    limit: search.limit,
    sort: JSON.stringify(search.sort),
    filter: JSON.stringify(search.filter),
  })
  if (res && res.status == 'ok') {
    listData.data = res.data.list
    listData.count = res.data.count
  }
  isLoading.value = false
  updateInfo()
}
const _getDataDebounced = useDebounceFn(() => _fetchData(), 700)

function fetchData() {
  isLoading.value = true
  _getDataDebounced()
}
fetchData()

const pageNum = computed(() => {
  const res = listData.count / listData.search.limit
  return res == 0 ? 1 : Math.ceil(res)
})

const currentPage = computed(() => {
  return listData.search.skip == 0
    ? 1
    : listData.search.skip / listData.search.limit + 1
})
const updateInfo = () => {
  emit('updateInfo', pageNum.value, currentPage.value)
}

const displayed = computed(() => {
  const from = listData.count == 0 ? 0 : listData.search.skip + 1
  const to = listData.search.skip + listData.data.length
  return `Показано ${from}-${to} из ${listData.count}`
})

function updateFilter<T extends keyof ItemSearch>(
  key: T,
  value: ItemSearch[T]
) {
  if (key == 'skip') {
    value = listData.search.limit * (value - 1)
  }
  if (key == 'limit') {
    listData.search.skip = 0
  }
  if (key == 'sort') {
    value = { [value.sortField]: value.sortOrder }
  }

  if (key == 'filter') {
    listData.search.skip = 0
  }
  listData.search[key] = value
  listData.data = []
  fetchData()
  updateInfo()
}

const emit = defineEmits(['updateInfo'])

defineExpose({
  pageNum,
  currentPage,
  changePage,
  updateFilter,
})

</script>

<template>
  <div class="mt-7">
    <!-- <div class="flex justify-end gap-2 w-full mt-2">
            <TableDateDefaultFilter
            v-if="useDefaultDateFilter"
            @range-upd="(r: number) => updateFilter('filter', r)"
            />

            <TablePaginationPartner  
                :page-nums="pageNum"
                :current-page="currentPage"
                @change-limit="changeLimit"
                @change-page="changePage"
                />
        </div> -->

    <div
      v-if="!route.path.startsWith('/partner')"
      class="flex flex-row w-full justify-end"
    >
      <div class="self-center text-sm">{{ displayed }}</div>
    </div>
    <!-- {{ config }} -->
    <DataTable
      :value="listData.data"
      :sort-field="Object.keys(listData.search.sort)[0]"
      :sort-order="Object.values(listData.search.sort)[0]"
      @sort="(v: any) => updateFilter('sort', v)"
      class="rounded-lg overflow-hidden"
      :pt="{
        headerRow: { class: '' },
      }"
    >
      <Column
        v-for="(col, index) of config"
        sortable
        :key="col.field"
        :field="col.field"
        :header="col.header"
        class="bg-base-100"
        :class="{
          'border-r border-base-200': index < config.length - 1,
        }"
        :pt="{
          headerCell: {
            class: [
              {
                'rounded-tl-2xl': index == 0,
                'rounded-tr-2xl': index == config.length - 1,
              },
              'bg-primary bg-opacity-5 border-none text-base-content',
            ],
          },
        }"
      >
        <template v-if="col.type == FieldsType.boolean" #body="{ data }">
          <div class="text-green-400 font-bold">
            {{ data[col.field] ? 'Выполнен' : 'Активный' }}
          </div>
        </template>
        <template v-else-if="col.type == FieldsType.date" #body="{ data }">
          {{ defaultDateShort(data[col.field]) }}
        </template>
        <template v-else-if="col.type == FieldsType.datetime" #body="{ data }">
          {{ defaultDate(data[col.field]) }}
        </template>
        <template v-else-if="col.type == FieldsType.price" #body="{ data }">
          {{ Number.parseFloat(data[col.field]).toFixed(2) }} р.
        </template>
        <template v-else #body="{ data }">
          {{ data[col.field] }}
        </template>
      </Column>
    </DataTable>

    <div v-if="isLoading" class="flex justify-center mt-10">
      <span class="loading loading-spinner loading-lg text-primary" />
    </div>

    <Hero v-if="!isLoading && listData.count == 0" />

    <div v-if="!isLoading && listData.data.length > 10">
      <div class="flex flex-row w-full justify-end">
        <div class="self-center text-sm">{{ displayed }}</div>
      </div>
    </div>
  </div>
</template>

<style></style>
