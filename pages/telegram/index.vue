<script setup lang="ts">
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'telegram',
})

const openTelegram = () => {
  window.open('https://t.me/+h1oxDt0S8ug3NmU6', '_blank')
  navigateTo('/buyouts', { external: true })
}

openTelegram()
</script>

<template>
  
</template>

<style scoped></style>
