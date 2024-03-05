<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Корзина',
})
const mpStore = useMPStore()
const selectedMP = ref()
onMounted(async () => {
  selectedMP.value = mpStore.selectedMP || 'wildberries'
  navigateTo('/cart/' + selectedMP.value)
})
</script>

<template>
  
</template>

<style scoped></style>
