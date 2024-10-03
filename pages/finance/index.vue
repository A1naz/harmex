<script lang="ts" setup>
import { title } from 'process'

const { signIn } = useAuth()

definePageMeta({ auth: true, title: 'Финансы', layout: 'app' })

const buttonsLine = [
  { name: 'Общие', value: 'general' },
  { name: 'Расходы', value: 'expenses' },
  { name: 'Пополнения', value: 'replenishment' },
  { name: 'Заказы', value: 'orders' },
  { name: 'Партнерка', value: 'partner' },
  { name: 'Генеалогия', value: 'genetic' },
]

const data = ref([
  {
    number: '1',
    date: '10.10.2022',
    source: 'Тарифы',
    direction: 'Telegram',
    status: 'work',
    summ: 25000,
  },
  {
    number: '2',
    date: '11.10.2022',
    source: 'Перевод',
    direction: 'Rutube',
    status: 'work',
    summ: 18000,
  },
  {
    number: '3',
    date: '12.10.2022',
    source: 'Услуга',
    direction: 'Instagram',
    status: 'active',
    summ: 5000,
  },
  {
    number: '4',
    date: '13.10.2022',
    source: 'Вывод',
    direction: 'Кошелек',
    status: 'completed',
    summ: 30000,
  },
  {
    number: '5',
    date: '14.10.2022',
    source: 'Полный пакет',
    direction: 'Instagram',
    status: 'canceled',
    summ: 22000,
  },
  {
    number: '6',
    date: '15.10.2022',
    source: 'Тарифы',
    direction: 'Telegram',
    status: 'active',
    summ: 40000,
  },
  {
    number: '7',
    date: '16.10.2022',
    source: 'Перевод',
    direction: 'Rutube',
    status: 'completed',
    summ: 3500,
  },
  {
    number: '8',
    date: '17.10.2022',
    source: 'Вывод',
    direction: 'Кошелек',
    status: 'canceled',
    summ: 50000,
  },
  {
    number: '9',
    date: '18.10.2022',
    source: 'Услуга',
    direction: 'Instagram',
    status: 'work',
    summ: 15000,
  },
  {
    number: '10',
    date: '19.10.2022',
    source: 'Полный пакет',
    direction: 'Telegram',
    status: 'active',
    summ: 70000,
  },
  {
    number: '11',
    date: '20.10.2022',
    source: 'Тарифы',
    direction: 'Rutube',
    status: 'work',
    summ: 18000,
  },
  {
    number: '12',
    date: '21.10.2022',
    source: 'Перевод',
    direction: 'Кошелек',
    status: 'completed',
    summ: 55000,
  },
  {
    number: '13',
    date: '22.10.2022',
    source: 'Услуга',
    direction: 'Instagram',
    status: 'canceled',
    summ: 12000,
  },
  {
    number: '14',
    date: '23.10.2022',
    source: 'Вывод',
    direction: 'Telegram',
    status: 'active',
    summ: 27000,
  },
  {
    number: '15',
    date: '24.10.2022',
    source: 'Полный пакет',
    direction: 'Rutube',
    status: 'work',
    summ: 64000,
  },
  {
    number: '16',
    date: '25.10.2022',
    source: 'Тарифы',
    direction: 'Instagram',
    status: 'active',
    summ: 9000,
  },
  {
    number: '17',
    date: '26.10.2022',
    source: 'Перевод',
    direction: 'Кошелек',
    status: 'completed',
    summ: 45000,
  },
  {
    number: '18',
    date: '27.10.2022',
    source: 'Услуга',
    direction: 'Telegram',
    status: 'canceled',
    summ: 16000,
  },
  {
    number: '19',
    date: '28.10.2022',
    source: 'Вывод',
    direction: 'Rutube',
    status: 'work',
    summ: 33000,
  },
  {
    number: '20',
    date: '29.10.2022',
    source: 'Полный пакет',
    direction: 'Instagram',
    status: 'active',
    summ: 77000,
  },
  {
    number: '21',
    date: '30.10.2022',
    source: 'Тарифы',
    direction: 'Кошелек',
    status: 'completed',
    summ: 24000,
  },
  {
    number: '22',
    date: '31.10.2022',
    source: 'Перевод',
    direction: 'Telegram',
    status: 'canceled',
    summ: 19000,
  },
  {
    number: '23',
    date: '01.11.2022',
    source: 'Услуга',
    direction: 'Rutube',
    status: 'active',
    summ: 48000,
  },
  {
    number: '24',
    date: '02.11.2022',
    source: 'Вывод',
    direction: 'Instagram',
    status: 'work',
    summ: 5500,
  },
  {
    number: '25',
    date: '03.11.2022',
    source: 'Полный пакет',
    direction: 'Кошелек',
    status: 'completed',
    summ: 65000,
  },
])

const tableData = ref([]) as any
const tableType = ref('general')
const headersForTable = ref(['N', 'Дата', 'Источник', 'Направление', 'Статус', 'Сумма'])


tableData.value = data.value.map((item: any) => {
  return { ...item, comment: '-' }
})
headersForTable.value.push('Комментарии')

watch(
  () => tableType.value,
  (newVal) => {
    if (newVal === 'general') {
      tableData.value = data.value.map((item: any) => {
        return { ...item, comment: '-' }
      })
      headersForTable.value.push('Комментарии')
    } else {
      tableData.value = [...data.value]
      headersForTable.value = ['N', 'Дата', 'Источник', 'Направление', 'Статус', 'Сумма']
    }
  }
)

function changeTableType(type: string) {
  tableType.value = type
}
</script>

<template>
  <div class="flex w-full pt-[25px] px-24">
    <div class="flex w-[1/12] pr-[30px] border-r border-[#bdc8fc]">
      <FinanceDashboard
        :secondLevelPercent="10"
        :ref-balance="1300"
        :balance="5700"
        :ref-count="5"
        :second-level-referrals="1"
        :first-level-referrals="1"
        :ref-url="'http://localhost:8080/partner'"
        :reward-percent="5"
        :ref-link="5"
      />
    </div>
    <div class="flex flex-col px-[24px] gap-[30px] w-full">
      <div class="flex justify-between w-full">
        <button 
          v-for="(button, index) of buttonsLine"
          @click="changeTableType(button.value)"
          class="btn btn-outline border-[#1b38ca] px-12 bg-white hover:bg-white hover:text-black hover:border-[#1b38ca] hover:shadow-xl active:bg-[#1934bd] active:text-white text-[14px] font-medium rounded-xl relative group"
        >
          <div class="flex items-center justify-center">
            <span>{{ button.name }}</span>
          </div>
        </button>
        <button
          class="btn btn-outline border-[#1b38ca] bg-white hover:bg-white hover:text-black hover:border-[#1b38ca] hover:shadow-xl active:bg-[#1934bd] active:text-white text-[14px] font-medium rounded-xl relative group"
        >
          <div class="flex items-center justify-center">
            <Icon name="lucide:download" size="22px" />
          </div>
        </button>
      </div>
      <FinanceTable
        :tableData="tableData"
        :headers="headersForTable"
      />
    </div>
  </div>
</template>

<style scoped></style>
