<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useFetch } from '@vueuse/core'

const props = defineProps({
  path: {
    type: String,
    default: '/icons/home.svg', // Путь к иконке (например, '/icons/home.svg')
  },
  size: {
    type: [String, Number],
    default: 24, // Размер иконки по умолчанию
  },
  color: {
    type: String,
    default: 'currentColor', // Цвет иконки по умолчанию
  },
})

const svgContent: any = ref<string | null>(null) // Для хранения содержимого SVG

const svgStyles = ref({
  fill: props.color,
})

const loadSvg = async () => {
  const { data } = await useFetch(props.path).get().json()
  svgContent.value = data
}

watch(() => props.path, loadSvg, { immediate: true })
</script>

<template>
  <svg
    :width="size"
    :height="size"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    :style="svgStyles"
    v-html="svgContent"
    aria-hidden="true"
  />
</template>

<style scoped>
svg {
  display: inline-block;
  vertical-align: middle;
}
</style>
