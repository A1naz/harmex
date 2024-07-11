<script setup lang="tsx">
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Добавить лайки',
})

const store = useMainStore()

const mps = [
  {
    title: 'Wildberries',
    value: 'wildberries',
    category: 'товары',
  },
  {
    title: 'Ozon',
    value: 'ozon',
    category: 'товары и отели',
    awaiting: store.client.username == 'test' ? false : true,
  },
  {
    title: 'Avito',
    value: 'avito',
    category: 'товары и отели',
    awaiting: store.client.username == 'test' ? false : true,
  },
  {
    title: 'Flowwow',
    value: 'flowwow',
    category: 'товары',
    awaiting: true,
  },
  {
    title: 'Магнит Маркет',
    value: 'magnitMarket',
    category: 'товары',
    awaiting: true,
  },
  {
    title: 'Яндекс Маркет',
    value: 'yandexMarket',
    category: 'товары и отели',
    awaiting: true,
  },
  {
    title: 'СберМаркет',
    value: 'sberMarket',
    category: 'товары',
    awaiting: true,
  },
]
</script>

<template>
  <div
    class="mt-10 xl:ml-8 flex xl:gap-14 xl:justify-start justify-center flex-wrap gap-6"
  >
    <MPCard v-for="mp of mps" :info="mp" :page="'/likes/create'" />
  </div>
</template>

<style scoped>
th {
  @apply normal-case hover:text-primary hover:cursor-pointer;
}

table td,
table td * {
  vertical-align: top;
}

.b24-widget-button-wrapper {
  position: hidden;
  z-index: 0;
}

.b24-widget-button-shadow {
  position: hidden;
  z-index: 0;
}
</style>
