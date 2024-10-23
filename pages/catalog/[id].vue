<script lang="ts" setup>
definePageMeta({ auth: false, layout: 'app' })
const route: any = useRoute()
const id = route.params.id
const loading = ref(true)
const item = ref({} as any)
const sellLeaders = ref([] as any)

async function getService() {
  loading.value = true
  const { data }: any = await useFetch('/api/catalog/info', {
    params: {
      slug: id,
    },
  })

  if (data.value) {
    item.value = data.value.service
    loading.value = false
  }
}
async function getLeaders() {
  loading.value = true
  const { data }: any = await useFetch('/api/catalog/sellLeaders', {
    params: {
      slug: id,
    },
  })

  if (data.value) {
    sellLeaders.value = data.value
    loading.value = false
  }
}

getService()

function navigateToCatalog() {
  navigateTo('/catalog')
}
</script>

<template>
  <div class="mx-12 mt-7">
    <div class="breadcrumbs text-sm">
      <ul class="font-medium text-[18px] text-[#909090]">
        <li class="cursor-pointer" @click="navigateToCatalog">
          Маркетплейсы
        </li>
        <li class="text-[#212121]">
          {{ id[0].toUpperCase() + id.slice(1) }}
        </li>
      </ul>
    </div>
    <div class="flex overflow-x-auto">
      <div v-if="loading" class="hero mt-20">
        <span class="loading loading-dots loading-lg text-primary" />
      </div>
      <div v-for="(service, index) in item.items" v-else class="flex mt-8">
        <CatalogServiceCard :item="item" :index="index" class="mr-5" />
      </div>
    </div>
    <div class="mt-8 text-[18px] font-semibold">
      Лидеры продаж
    </div>
    <div class="flex overflow-x-auto">
      <div v-if="loading" class="hero mt-20">
        <span class="loading loading-dots loading-lg text-primary" />
      </div>
      <div v-for="(service, index) in item.items" v-else class="flex mt-8">
        <CatalogServiceCard :item="item" :index="index" class="mr-5" />
      </div>
    </div>
  </div>
</template>
