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

const config = useRuntimeConfig();
</script>

<template>
  <input
    id="selectUser"
    type="checkbox"
    :checked="props.show"
    class="modal-toggle"
    :class="{ 'modal-open': props.show }"
  />
  <div
    class="modal cursor-pointer"
    @click="$emit('close')"
    style="z-index: 99999"
  >
    <div
      v-if="props.show"
      class="modal-box rounded-[8px] w-full lg:max-w-5xl md:max-w-2xl sm:max-w-lg cursor-auto border p-3 sm:p-5 border-[#dee2e6] overflow-hidden"
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
      <!-- <div :style="{ width: '1028px', height: '700px' }">
          <VPdfViewer
            src="https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf"
          />
        </div> -->
      <div class="pdf-container mt-8">
        <iframe
          src="/modals/introduction.pdf#toolbar=0&view=fitH"
          width="100%"
          height="900px"
          class="pdf-iframe"
        >
        </iframe>
      </div>
      <div class="sm:flex flex-col justify-between mt-8 mb-2">
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
