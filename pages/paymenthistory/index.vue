<!-- eslint-disable ts/ban-ts-comment -->
<script lang="ts" setup>
definePageMeta({
  layout: 'app',
  middleware: 'auth',
})

const buttonsLine: Array<{ label: string, value: string }> = [
  { label: 'Общее', value: 'general' },
  { label: 'Пополнение', value: 'replenishment' },
  { label: 'Расходы', value: 'expenses' },
  { label: 'Партнерка', value: 'partner' },
  { label: 'Генеалогия', value: 'genealogy' },
]

const tableData = ref<any>([])
const fetchedData = ref<any>([])
const tableType = ref('general')

const headersForTable = ref<any>([])

async function getData() {
  const { data } = await useFetch(
    '/api/finance/finance-data',
    /* @ts-ignore */
    {
      method: 'GET',
      query: {
        tableType: tableType.value,
      },
      watch: false,
    },
  )
  fetchedData.value = data.value
}
getData()

// watch(
//   () => fetchedData.value,
//   (newData) => {
//     if (newData) {
//       data.value = newData
//       updateTableData()
//     }
//   },
//   { immediate: true },
// )

async function updateTableData() {
  tableData.value = []
  await getData()

  switch (tableType.value) {
    case 'general':
      headersForTable.value = [
        { value: 'summ', label: 'Сумма' },
        { value: 'date', label: 'Дата' },
        { value: 'source', label: 'Источник' },
        { value: 'service', label: 'Услуга' },
        { value: 'article', label: 'Артикул' },
        { value: 'orderId', label: 'ID заказа' },
        { value: 'comment', label: 'Комментарий' },
      ]
      tableData.value = fetchedData.value.map((item: any) => ({
        summ: item.summ,
        date: item.date,
        source: item.source,
        service: item.service,
        article: item.article,
        orderId: item.orderId,
        comment: item.comment,
      }))
      break

    case 'replenishment':
      headersForTable.value = [
        { value: 'summ', label: 'Сумма' },
        { value: 'date', label: 'Дата' },
        { value: 'source', label: 'Источник' },
        { value: 'orderId', label: 'ID заказа' },
        { value: 'comment', label: 'Комментарий' },
      ]
      tableData.value = fetchedData.value
        .map((item: any) => ({
          summ: item.summ,
          date: item.date,
          source: item.source,
          orderId: item.orderId,
          comment: item.comment,
        }))
      break

    case 'expenses':
      headersForTable.value = [
        { value: 'summ', label: 'Сумма' },
        { value: 'date', label: 'Дата' },
        { value: 'source', label: 'Источник' },
        { value: 'service', label: 'Услуга' },
        { value: 'article', label: 'Артикул' },
        { value: 'orderId', label: 'ID заказа' },
      ]
      tableData.value = fetchedData.value
        .map((item: any) => ({
          summ: item.summ,
          date: item.date,
          source: item.source,
          service: item.service,
          orderId: item.orderId,
          article: item.article,
        }))
      break

    case 'partner':
      headersForTable.value = [
        { value: 'summ', label: 'Сумма' },
        { value: 'date', label: 'Дата' },
        { value: 'source', label: 'Источник' },
        { value: 'service', label: 'Услуга' },
      ]
      tableData.value = fetchedData.value
        .map((item: any) => ({
          summ: item.summ,
          date: item.date,
          source: item.source,
          service: item.service,
          orderId: item.orderId,
          article: item.article,
        }))
      break

    case 'genealogy':
      headersForTable.value = [
        { value: 'commission', label: 'Комиссионнные' },
        { value: 'username', label: 'Логин реферала' },
        { value: 'date', label: 'Дата добавления в рефералы' },
      ]
      tableData.value = fetchedData.value
        .map((item: any) => ({
          commission: item.commission,
          username: item.username,
          date: item.date,
        }))
      break
  }
}

function changeTableType(type: string) {
  tableType.value = type
}

watch(() => tableType.value, updateTableData, { immediate: true })
</script>

<template>
  <div class="flex flex-col sm:flex-row mt-8 gap-8">
    <FinanceDashboard
      :second-level-percent="10" :ref-balance="1300" :balance="5700" :ref-count="5"
      :second-level-referrals="1" :first-level-referrals="1" ref-url="http://localhost:8080/partner" :reward-percent="5"
      :ref-link="5"
    />
    <div class="divider bg- lg:divider-horizontal" />

    <div class="flex flex-col gap-6 w-full lg:max-w-[60vw]">
      <div class="flex gap-4 items-center flex-wrap">
        <button
          v-for="(button, index) in buttonsLine" :key="index"
          class="btn btn-sm btn-outline border-blue-800 px-12 bg-white hover:bg-white hover:text-black hover:border-blue-800 hover:shadow-xl active:bg-[#1934bd] active:text-white font-medium rounded-xl relative group"
          @click="changeTableType(button.value)"
        >
          <div class="flex items-center justify-center">
            {{ button.label }}
          </div>
        </button>
        <button
          class="btn btn-sm btn-outline lg:ml-auto border-blue-800 bg-white hover:bg-white hover:text-black hover:border-blue-800 hover:shadow-xl active:bg-[#1934bd] active:text-white font-medium rounded-xl relative group"
        >
          <div class="flex items-center justify-center">
            <Icon name="lucide:download" size="22px" />
          </div>
        </button>
      </div>
      <FinanceTable :table-data="tableData" :headers="headersForTable" />
    </div>
  </div>
</template>
