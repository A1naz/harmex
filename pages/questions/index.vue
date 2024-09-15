<script setup lang="ts">
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Вопросы',
})
const mpStore = useMPStore()
const selectedMP = ref()
onMounted(async () => {
  selectedMP.value = mpStore.selectedMP || 'wildberries'
  navigateTo('/questions/' + selectedMP.value)
})
</script>

<template>
</template>

<style scoped>
</style>
