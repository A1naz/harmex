<script lang="ts" setup>
defineProps({
  items: {
    type: Array as () => Array<any>,
    default: () => [],
  },
})
</script>
<template>
  <main class="flex-1 p-8">
    <h1 class="text-2xl font-bold mb-6">Социальные сети</h1>
    <div class="flex flex-wrap gap-6 w-full justify-center">
      <div
        v-for="(social, index) in items"
        :key="index"
        class="border rounded-lg shadow-md w-[403px] p-3"
      >
        <div class="flex">
          <div class="flex items-center justify-center">
            <NuxtImg
              :src="social.mainImage"
              :alt="social.name"
              class="w-[192px] h-[196px]"
            />
          </div>
          <div class="pl-4">
            <h2 class="text-[19px] font-semibold">{{ social.name }}</h2>
            <p class="text-[15px] font-medium">Доступные услуги:</p>
            <ul class="text-sm text-[#909090] underline text-[15px]">
              <li v-for="(service, i) in social.items" :key="i">
                {{ service }}
              </li>
            </ul>
            <a
              class="mt-4 text-[19px] absolute font-medium cursor-pointer"
              @click="navigateTo(`/catalog/${social.slug}`)"
              >Смотреть все

              <Icon
                class="text-[#F72585] ml-1"
                name="jam:arrow-right"
                size="22px"
              ></Icon>
            </a>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
