<script setup lang="ts">
const props = defineProps({
  state: { type: Boolean, required: true },
});

const emit = defineEmits(["update:state"]);
</script>

<template>
  <div
    :class="{ 'modal-open': state }"
    class="modal cursor-pointer"
    @click="$emit('update:state', false)"
  >
    <div v-if="state" class="modal-box p-0" @click.stop>
      <div class="relative">
        <a
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 z-10 bg-white/50"
          @click="$emit('update:state', false)"
          >×</a
        >
        <slot />
      </div>
    </div>
  </div>
</template>
