<script setup lang="ts">
const props = defineProps({
  show: { type: Boolean, required: true },
  isChecked: { type: Boolean, required: true },
});
const emit = defineEmits(["close", "checkboxToggle"]);

function toggleCheckbox() {
  emit("checkboxToggle");
}

function closeModal() {
  emit("close");
}
</script>

<template>
  <input
    id="selectUser"
    type="checkbox"
    :checked="props.show"
    class="modal-toggle"
    :class="{ 'modal-open': props.show }"
  />
  <div class="modal z-[9999] cursor-pointer" @click="$emit('close')">
    <Transition>
      <div
        v-if="props.show"
        class="modal-box rounded-[8px] bg-white w-full lg:max-w-5xl md:max-w-2xl sm:max-w-lg max-h-[85vh] overflow-y-auto cursor-auto border p-3 sm:p-8 border-[#dee2e6]"
        @click.stop
      >
        <div class="sticky top-0 z-10 flex justify-end">
          <label
            class="btn btn-sm btn-circle btn-ghost bg-transparent text-[#9ca3af] text-xl"
            @click="closeModal"
          >
            ✕
          </label>
        </div>

        <div class="px-0 sm:px-3 -mt-10">
          <slot></slot>
        </div>
        
        <div class="sticky bottom-0 bg-white py-4 mt-8 z-10 border-t border-gray-200 w-52 rounded-lg">
          <div class="flex items-center gap-2">
            <input
              id="checkbox"
              type="checkbox"
              class="checkbox checkbox-primary"
              :checked="isChecked"
              @change="toggleCheckbox"
            />
            <label for="checkbox" class="text-sm text-gray-600 cursor-pointer">
              Больше не показывать
            </label>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
