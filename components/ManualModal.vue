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
        class="modal-box rounded-[8px] bg-white w-full lg:max-w-5xl md:max-w-2xl sm:max-w-lg cursor-auto border p-3 sm:p-8 border-[#dee2e6]"
        @click.stop
      >
        <form method="dialog">
          <label
            class="btn btn-sm btn-circle btn-ghost bg-transparent absolute right-2 top-2 text-[#9ca3af] text-xl"
            @click="closeModal"
          >
            ✕
          </label>
        </form>
        <slot></slot>
        <div class="flex justify-between mt-8">
          <div class="flex items-center gap-2">
            <input
              id="checkbox"
              type="checkbox"
              class="checkbox checkbox-primary"
              :checked="isChecked"
              @change="toggleCheckbox"
            />
            <label for="checkbox" class="text-sm text-gray-600 cursor-pointer">
              Больше не показывать это сообщение
            </label>
          </div>
          <button class="btn btn-sm h-[2.5rem] btn-primary" @click="closeModal">
            Понятно
          </button>
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
