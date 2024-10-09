<script lang="ts" setup>
definePageMeta({ auth: false, layout: "app" });

const menuItems = ref(["Маркетплейсы", "Отели"]);
const selectedType = ref("Маркетплейсы");
const socialNetworks = ref([]);
const loading = ref(true);

async function getServices() {
  loading.value = true;
  const { data }: any = await useFetch("/api/catalog/get", {
    method: "GET",
    params: {
      type: selectedType.value,
    },
  });

  if (data.value) {
    socialNetworks.value = data.value.services;
  }
  loading.value = false;
}

getServices();
const bouncedGet = useDebounceFn(getServices, 250);
watch(selectedType, () => {
  bouncedGet();
});
</script>

<template>
  <div class="flex">
    <CatalogLeftMenu :items="menuItems" v-model:selectedType="selectedType" />
    <div class="hero -mt-80" v-if="loading">
      <span class="loading loading-dots loading-lg text-[#bdc8fc]"></span>
    </div>
    <CatalogContent v-else :items="socialNetworks" />
  </div>
</template>

<style scoped></style>
