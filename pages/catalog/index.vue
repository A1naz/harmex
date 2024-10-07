<script lang="ts" setup>
definePageMeta({ auth: false, layout: 'app' })

const socialNetworks = ref([
])
const loading = ref(true)

async function getServices() {
  loading.value = true
  const { data }: any = await useFetch('/api/catalog/get')

  if (data.value) {
    socialNetworks.value = data.value.services
  }
  loading.value = false
}

getServices()
</script>

<template>
  <div class="hero mt-20" v-if="loading">
    <span class="loading loading-dots loading-lg text-[#bdc8fc]"></span>
  </div>
  <div class="flex">
    <CatalogLeftMenu />
    <CatalogContent :items="socialNetworks" v-if="!loading" />
  </div>
</template>

<style scoped></style>
