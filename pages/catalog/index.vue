<script lang="ts" setup>
definePageMeta({ auth: false, layout: 'app' })

const socialNetworks = ref([
  {
    name: 'Rutube',
    slug: 'rutube',
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
    slug: 'yappy',
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
    slug: 'instagram',
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
    slug: 'facebook',
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
    slug: 'youtube',
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
    slug: 'pinterest',
    icon: '/img/catalog/pinterest.png',
    services: [
      'ИИ продвижение',
      'Запуск рекламы',
      'Подписки на аккаунт',
      'Курсы',
    ],
  },
])

async function getServices() {
  const { data }: any = await useFetch('/api/catalog/get')

  if (data.value) {
    socialNetworks.value = data.value
  }
}
</script>

<template>
  <div class="hero">
    <span class="loading loading-ball loading-lg text-[#bdc8fc]"></span>
    
  </div>
  <div class="flex">
    <CatalogLeftMenu />

    <CatalogContent :items="socialNetworks" />
  </div>
</template>

<style scoped></style>
