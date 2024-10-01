<script lang="ts" setup>
import { title } from 'process'

const { signIn } = useAuth()

definePageMeta({ auth: true, title: 'Финансы', layout: 'app' })
</script>

<template>
  <div class="flex w-full py-[25px] px-24">
    <div class="flex w-[1/12]">
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
    <div></div>
  </div>
</template>

<style scoped></style>
