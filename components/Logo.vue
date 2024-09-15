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
  <NuxtLink href="/main" class="-mb-3">
    <!-- <nuxt-img
      v-show="$colorMode.value === 'light' || colorMode.unknown"
      src="/logo/logolight.svg"
      :width="props.width"
      :height="props.height"
      alt=""
      srcset=""
    />
    <nuxt-img
      v-show="$colorMode.value === 'dark'"
      src="/logo/logodark.png"
      :width="props.width"
      :height="props.height"
      alt=""
      srcset=""
    /> -->
    marketmonstr
  </NuxtLink>
</template>

<style scoped></style>
