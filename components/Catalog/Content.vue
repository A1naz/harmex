<script lang="ts" setup>
defineProps({
  items: {
    type: Array as () => Array<any>,
    default: () => [],
  },
  type: {
    type: String,
    default: "Маркетплейсы",
  },
});
</script>
<template>
  <main class="flex-1 mx-3">
    <h1 class="text-2xl font-bold mb-6"></h1>
    <div class="flex flex-wrap gap-5 w-full justify-start">
      <div
        v-for="(social, index) in items"
        :key="index"
        class="border rounded-lg shadow-md w-[360px] p-3"
      >
        <div class="flex">
          <div class="flex items-center justify-center">
            <NuxtImg
              :src="social.mainImage"
              :alt="social.name"
              class="w-[170px] h-[170px]"
            />
          </div>
          <div class="pl-4">
            <h2 class="text-[15px] font-semibold">{{ social.name }}</h2>
            <p class="text-[13px] font-medium">Доступные услуги:</p>
            <ul class="text-sm text-[#909090] underline text-[13px]">
              <li v-for="(service, i) in social.items" :key="i">
                {{ service }}
              </li>
            </ul>
            <NuxtLink
              :to="`/catalog/${social.slug}`"
              class="mt-2 text-[16px] absolute font-medium cursor-pointer"
              >Смотреть все
              <Icon
                class="text-[#F72585] -mt-0.5"
                name="jam:arrow-right"
                size="18px"
              ></Icon>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
