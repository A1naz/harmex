<script setup lang="ts">
const items = [
  { title: 'Финансы', icon: 'solar:wallet-money-outline', path: '/finance' },
  { title: 'Партнерка', icon: 'solar:users-group-rounded-outline' },
  { title: 'Планировщик ', icon: 'solar:alarm-outline' },
  { title: 'Заказы', icon: 'solar:bag-4-outline' },
  { title: 'Каналы', icon: 'solar:plain-outline' },
  { title: 'Избранное', icon: 'solar:heart-outline' },
]
</script>
<template>
  <div class="flex justify-between w-full">
    <div class="sm:block flex flex-wrap justify-center">
      <button
        v-for="(item, index) of items"
        class="btn btn-outline border-[#1b38ca] bg-white hover:bg-white hover:text-black hover:border-[#1b38ca] hover:shadow-xl active:bg-[#1934bd] active:text-white text-[14px] py-[20px] font-medium w-[171px] mx-3.5 rounded-xl relative my-1"
      >
        <div v-if="!item.path" class="absolute left-[16px]">
          <Icon :name="item.icon" size="22px" />
          <span class="ml-3">
            {{ item.title }}
          </span>
        </div>
        <NuxtLink
          v-else
          :to="item.path"
          class="absolute left-[16px]"
        >
          <Icon :name="item.icon" size="22px" />
          <span class="ml-3">
            {{ item.title }}
          </span>
        </NuxtLink>
      </button>
    </div>

    <div>
      <button
        class="myCustomBtn text-[14px] font-medium relative my-1"
      >
        <div>
          <Icon name="solar:pen-new-square-linear" size="22px" />
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
