<script lang="ts" setup>
const { height } = useWindowSize()

definePageMeta({
  title: 'Двухфакторная аутентификация',
  auth: true,
})
</script>

<template>
  <div :class="{ mt: 100 + 'px' }" class="overflow-hidden" >
    <div class="text-center text-xl mx-4">
      Введите код с приложения Аутентификатор
    </div>
  </div>
</template>

<style scoped></style>
