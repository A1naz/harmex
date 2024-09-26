<script lang="ts" setup>
definePageMeta({ auth: false, layout: 'app' })

const socialNetworks = ref([
  {
    name: 'Rutube',
    icon: '/img/catalog/rutube.png', // замените на фактический путь к иконке
    services: [
      'ИИ продвижение',
      'Запуск рекламы',
      'Подписки на аккаунт',
      'Курсы',
    ],
  },
  {
    name: 'Yappy',
    icon: '/img/catalog/yappy.png',
    services: [
      'ИИ продвижение',
      'Запуск рекламы',
      'Подписки на аккаунт',
      'Курсы',
    ],
  },
  {
    name: 'Instagram',
    icon: '/img/catalog/instagram.png',
    services: [
      'ИИ продвижение',
      'Запуск рекламы',
      'Подписки на аккаунт',
      'Курсы',
    ],
  },
  {
    name: 'Facebook',
    icon: '/img/catalog/facebook.png',
    services: [
      'ИИ продвижение',
      'Запуск рекламы',
      'Подписки на аккаунт',
      'Курсы',
    ],
  },
  {
    name: 'YouTube',
    icon: '/img/catalog/youtube.png',
    services: [
      'ИИ продвижение',
      'Запуск рекламы',
      'Подписки на аккаунт',
      'Курсы',
    ],
  },
  {
    name: 'Pinterest',
    icon: '/img/catalog/pinterest.png',
    services: [
      'ИИ продвижение',
      'Запуск рекламы',
      'Подписки на аккаунт',
      'Курсы',
    ],
  },
])
</script>

<template>
  <div class="flex">
    <CatalogLeftMenu />

    <CatalogContent :items="socialNetworks" />
  </div>
</template>

<style scoped></style>
