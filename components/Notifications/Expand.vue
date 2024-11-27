<script setup lang="ts">
import { notify } from "@kyvg/vue3-notification";

const props = defineProps({
  info: {
    type: Object as any,
    required: true,
  },
  state: {
    type: Boolean,
  },
});

const opened = ref();

watch(
  () => props.state,
  (newState) => {
    opened.value = newState;
  }
);
</script>

<template>
 
</template>

<style scoped>
</style>
