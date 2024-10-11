<script lang="ts" setup>
defineProps({
  title: String,
  items: {
    type: Array as () => Array<any>,
  },
});
</script>
<template>
  <div class="w-full font-semibold text-[26px] mb-8">{{ title }}</div>
  <div class="w-full bg-[#f5f7ff] rounded-xl pt-5">
    <div class="w-full text-end pr-12">
      <NuxtLink to="/favourites" class="cursor-pointer text-[14px] text-[#F72585]">
        Смотреть все
      </NuxtLink>
    </div>
    <div class="flex flex-wrap justify-center">
      <div
        v-for="item in items"
        class="bg-white text-[14px] w-[110px] h-[125px] ml-8 mt-5 rounded-xl mb-[15px]"
      >
        <div class="mt-[5px] flex justify-center">
          <NuxtImg
            :src="item.image"
            width="95px"
            height="75px"
            class="rounded-xl"
          />
        </div>
        <div class="text-sm font-medium ml-[5px]">{{ item.title }}</div>
      </div>
    </div>
  </div>
</template>
