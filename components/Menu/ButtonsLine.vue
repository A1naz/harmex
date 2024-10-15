<script setup lang="ts">
defineProps({
  quickAccesses: { type: Object, required: true },
  items: { type: Object, required: true },
})
defineEmits(['editClick'])
// const quickAccesses = computed(() => {
//   if (props.quickAccesses && props.quickAccesses?.length > 0) {
//     return items.filter((item) => props.quickAccesses?.includes(item.path))
//   }
//   return items
// })
</script>

<template>
  <div class="flex w-full flex-col items-center justify-between gap-4 md:flex-row">
    <div class="flex w-full flex-col flex-wrap justify-start gap-4 md:flex-row">
      <NuxtLink
        v-for="item of quickAccesses.length > 0 ? quickAccesses : items" :key="item.path" :to="item.value ? item.path : '/'"
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
      <button class="myCustomBtn relative my-1 text-[14px] font-medium" @click="$emit('editClick')">
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
