import { onMounted } from 'vue';
<script setup lang="ts">
const props = defineProps({
  width: {
    type: String,
    default: '65px',
  },
  height: {
    type: String,
    default: '65px',
  },
})
const colorMode = useColorMode()
</script>

<template>
  <NuxtLink href="/buyouts" class="mr-40">
    <nuxt-img
      v-show="$colorMode.value === 'light' || colorMode.unknown"
      src="/logo/logocolor.svg"
      :width="props.width"
      :height="props.height"
      alt=""
      srcset=""
    />
    <nuxt-img
      v-show="$colorMode.value === 'dark'"
      src="/logo/logowhite.png"
      :width="props.width"
      :height="props.height"
      alt=""
      srcset=""
    />
  </NuxtLink>
</template>

<style scoped></style>
