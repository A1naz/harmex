<script setup lang="ts">
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Отзывы',
})

const mpStore = useMPStore()
const selectedMP = ref()
onMounted(async () => {
  selectedMP.value = mpStore.selectedMP || 'wildberries'
  navigateTo('/reviews/' + selectedMP.value)
})
</script>

<template>
  <div></div>
</template>

<style scoped></style>
