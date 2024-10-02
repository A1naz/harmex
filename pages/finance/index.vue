<script lang="ts" setup>
import { title } from 'process'

const { signIn } = useAuth()

definePageMeta({ auth: true, title: 'Финансы', layout: 'app' })

const buttonsLine = [
  {title: 'Общие', value: 'general'},
  {title: 'Расходы', value: 'expenses'},
  {title: 'Пополнения', value: 'replenishment'},
  {title: 'Заказы', value: 'orders'},
  {title: 'Партнерка', value: 'partner'},
  {title: 'Генеалогия', value: 'genetic'},
]
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
    <div class="flex flex-col px-[24px]">
      <div class="flex gap-5">
        <button
          v-for="(button, index) of buttonsLine"
          class="btn btn-outline border-[#1b38ca] bg-white hover:bg-white hover:text-black hover:border-[#1b38ca] hover:shadow-xl active:bg-[#1934bd] active:text-white text-[14px] font-medium px-[25px] rounded-xl relative group"
        >
          <div class="flex items-center justify-center">
            <span>{{ button.title }}</span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
