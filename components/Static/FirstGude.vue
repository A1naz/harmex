<script setup lang="ts">
const route = useRoute()

defineProps({
  state: { type: Boolean, required: false, default: false },
})

defineEmits(['click', 'update:state'])
</script>

<template>
  <div
    :class="{ 'modal-open': true }"
    class="modal cursor-pointer"
    @click="$emit('update:state', false)"
  >
    <div
     
      class="modal-box max-w-sm px-3 py-5 cursor-auto"
      @click.stop
    >
asdsd
</div>
  </div>
</template>

<style scoped></style>
