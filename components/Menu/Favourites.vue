<script lang="ts" setup>
const props = defineProps({
  title: String,
  items: {
    type: Array as () => Array<any>,
   
  },
})
</script>
<template>
  <div class="w-full font-semibold text-[26px] mb-8">{{ title }}</div>
  <div class="w-full bg-[#f5f7ff] rounded-xl pt-5">
    <div
    @click="navigateTo('/catalog')"
      class="cursor-pointer text-[14px] text-[#F72585] w-full text-end pr-16"
    >
      Смотреть все
    </div>
    <div class="flex flex-wrap justify-center">
      <div
        v-for="item in items"
        class="bg-white text-[14px] w-[127px] h-[145px] ml-8 mt-5 rounded-xl mb-[15px]"
      >
        <div class="mt-[5px]">
          <NuxtImg
            :src="item.image"
            width="117px"
            height="94px"
            class="rounded-md ml-[5px] pt-[5px]"
          />
        </div>
        <div class="text-[14px] font-medium ml-[5px]">{{ item.title }}</div>
      </div>
    </div>
  </div>
</template>
