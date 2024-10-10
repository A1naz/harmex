<script lang="ts" setup>
type TableType = 'general' | 'expenses' | 'replenishment'
definePageMeta({
  layout: 'app',

})
interface Transaction {
  number: string
  date: string
  source: string
  direction: string
  status: string
  summ: number
  comment: string
}

interface GeneralTable {
  summ: number
  date: string
  source: string
  replenishment: string
  service: string
  partners: string
  tariff: string
  comment: string
  id: string
}

interface ReplenishmentTable {
  summ: number
  date: string
  source: string
  orderId: string
  comment: string
}

interface ExpenseTable {
  summ: number
  date: string
  source: string
  service: string
  orderId: string
}
interface Button {
  label: string
  value: TableType
}

const buttonsLine: Button[] = [
  { label: 'Общие', value: 'general' },
  { label: 'Расходы', value: 'expenses' },
  { label: 'Пополнения', value: 'replenishment' },
]

const data = ref<Transaction[]>([])
const tableData = ref<(GeneralTable | ReplenishmentTable | ExpenseTable)[]>([])
const tableType = ref<'general' | 'expenses' | 'replenishment'>('general')

interface HeaderForTable {
  value: string
  label: string
}
const headersForTable = ref<HeaderForTable[]>([])

const { data: fetchedData, error } = await useFetch<Transaction[]>('/api/finance/finance-data')

watch(
  () => fetchedData.value,
  (newData) => {
    if (newData) {
      data.value = newData
      updateTableData()
    }
  },
  { immediate: true },
)

function updateTableData() {
  switch (tableType.value) {
    case 'general':
      headersForTable.value = [
        { value: 'summ', label: 'Сумма' },
        { value: 'date', label: 'Дата' },
        { value: 'source', label: 'Источник' },
        { value: 'replenishment', label: 'Пополнение' },
        { value: 'service', label: 'Услуга' },
        { value: 'partners', label: 'Партнерка' },
        { value: 'tariff', label: 'Тариф' },
        { value: 'comment', label: 'Комментарий' },
      ]
      tableData.value = data.value.map(item => ({
        summ: item.summ,
        date: item.date,
        source: item.source,
        replenishment: item.source,
        service: item.direction,
        partners: '-',
        tariff: item.source,
        comment: item.comment,
        id: item.number,
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
      tableData.value = data.value
        .filter(item => item.source === 'Перевод')
        .map(item => ({
          summ: item.summ,
          date: item.date,
          source: item.direction,
          orderId: item.number,
          comment: item.comment,
        }))
      break

    case 'expenses':
      headersForTable.value = [
        { value: 'summ', label: 'Сумма' },
        { value: 'date', label: 'Дата' },
        { value: 'source', label: 'Источник' },
        { value: 'service', label: 'Услуга' },
        { value: 'orderId', label: 'ID заказа' },
      ]
      tableData.value = data.value
        .filter(item => item.source === 'Услуга')
        .map(item => ({
          summ: item.summ,
          date: item.date,
          source: item.source,
          service: item.direction,
          orderId: item.number,
        }))
      break
  }
}

function changeTableType(type: TableType) {
  tableType.value = type
}

watch(
  () => tableType.value,
  updateTableData,
  { immediate: true },
)
</script>

<template>
  <div class="flex flex-col sm:flex-row mt-8 gap-8">
    <FinanceDashboard
      :second-level-percent="10"
      :ref-balance="1300"
      :balance="5700"
      :ref-count="5"
      :second-level-referrals="1"
      :first-level-referrals="1"
      ref-url="http://localhost:8080/partner"
      :reward-percent="5"
      :ref-link="5"
    />
    <div class="divider bg- lg:divider-horizontal" />

    <div class="flex flex-col gap-6 w-full lg:max-w-[60vw]">
      <div class="flex gap-4 items-center flex-wrap">
        <button
          v-for="(button, index) in buttonsLine"
          :key="index"
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
