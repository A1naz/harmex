<script lang="ts" setup>
definePageMeta({ auth: false, layout: 'app' })

const menuItems = ref(['Маркетплейсы', 'Отели'])
const selectedType = ref('Маркетплейсы')
const socialNetworks = ref([])
const loading = ref(true)

async function getServices() {
  loading.value = true
  const { data }: any = await useFetch('/api/catalog/get', {
    method: 'GET',
    params: {
      type: selectedType.value,
    },
  })

  if (data.value) {
    socialNetworks.value = data.value.services
  }
  loading.value = false
}

getServices()
const bouncedGet = useDebounceFn(getServices, 250)
watch(selectedType, () => {
  bouncedGet()
})
</script>

<template>
  <div class="flex mt-4">
    <div class="left-menu">
      <CatalogLeftMenu v-model:selected-type="selectedType" :items="menuItems" />
    </div>
    <div v-if="loading" class="hero -mt-80 text-[#bdc8fc]">
      <span class="loading loading-dots loading-lg text-primary" />
    </div>

    <div class="px-10">
      <div class="breadcrumbs text-sm ml-3">
        <ul class="font-medium text-[18px] text-[#909090]">
          <li class="cursor-pointer">
            Каталог
          </li>
        </ul>
      </div>
      <CatalogContent v-if="!loading" :items="socialNetworks" />
    </div>
  </div>
</template>

<style scoped>
.left-menu {
  width: 240px;
}
</style>
