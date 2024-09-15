<script setup lang="ts">

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Доставки',
})
const mpStore = useMPStore()
const selectedMP = ref()
onMounted(async () => {
  selectedMP.value = mpStore.selectedMP || 'wildberries'
  navigateTo('/delivery/' + selectedMP.value + '?status=all')
})
</script>
<template>

</template>

<style scoped>

</style>
