<script setup lang="ts">
const items: Array<{ title: string; icon: string; path?: string }> = [
  { title: "Финансы", icon: "solar:wallet-money-outline", path: "/finance" },
  { title: "Партнерка", icon: "solar:users-group-rounded-outline" },
  { title: "Планировщик ", icon: "solar:alarm-outline" },
  { title: "Заказы", icon: "solar:bag-4-outline" },
  { title: "Каналы", icon: "solar:plain-outline" },
  { title: "Избранное", icon: "solar:heart-outline" },
];
</script>
<template>
  <div
    class="flex flex-col md:flex-row gap-4 justify-between items-center w-full"
  >
    <div class="flex md:flex-row flex-col flex-wrap w-full justify-start gap-4">
      <NuxtLink
        :to="item.path || '/'"
        v-for="item of items"
        class="myCustomBtn md:min-w-40"
      >
        <div class="flex items-center justify-center">
          <Icon :name="item.icon" size="19px" />
          <span class="ml-3">
            {{ item.title }}
          </span>
        </div>
      </NuxtLink>
    </div>

    <div>
      <button class="myCustomBtn text-[14px] font-medium relative my-1">
        <div>
          <Icon name="solar:pen-new-square-linear" size="19px" />
        </div>
      </button>
    </div>
  </div>
</template>

<style>
.btn:hover {
  box-shadow: 0 8px 20px rgb(181, 183, 189);
}
</style>
