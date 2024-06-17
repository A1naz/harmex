<script setup lang="ts">
const emit = defineEmits(['openModal'])
const store = useMainStore()
const route = useRoute()
</script>

<template>
  <div class="flex items-center gap-4">
    <!-- @click="store.faqModal = true" -->
    <!-- <button class="btn bg-base-100 btn-xs border-none">
      FAQ
    </button> -->
    <!-- <button class="relative btn bg-base-100 btn-xs btn-circle border-none" @click="emit('openModal')"> -->
    <!-- <button class="relative btn bg-base-100 btn-xs btn-circle border-none">
      <IconCSS size="18" class="h-8 w-8" name="fa-solid:play-circle" />
      
    </button> -->
    <button class="relative bg-base-100 btn btn-xs btn-circle border-none">
      <IconCSS size="18" class="h-8 w-8" name="fontisto:bell-alt" />
      
    </button>

    <NuxtLink
      to="/guide"
      class="relative bg-base-100 btn btn-xs btn-circle border-none"
    >
      <IconCSS name="fa-solid:question-circle" size="20" />
    </NuxtLink>
    <NuxtLink
      
      to="/profile"
      class="relative bg-base-100 btn btn-xs btn-circle border-none"
    >
      <IconCSS name="ic:sharp-account-circle" size="24" />
    </NuxtLink>
  </div>
</template>

<style scoped>

</style>
