<script setup lang="ts">
const props = defineProps({
  show: { type: Boolean, required: true },
  isChecked: { type: Boolean, required: true },
});
const emit = defineEmits(["close"]);

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
  <div
    class="modal cursor-pointer"
    @click="$emit('close')"
    style="z-index: 99999"
  >
    <div
      v-if="props.show"
      class="modal-box rounded-[8px] cursor-auto border p-3 sm:p-5 border-[#dee2e6]"
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
      <div
        class="max-w-md mx-auto p-6 rounded-2xl   bg-white text-center"
      >
        <h2 class="text-xl font-semibold mb-4 text-gray-800">
          Подтверждение номера телефона
        </h2>
        <p class="text-gray-600 mb-2">Позвоните по номеру:</p>
        <a class="text-2xl font-bold text-blue-600 mb-4" href="tel:+7 800 555-86-07">+7 800 555-86-07</a>

        <p class="text-gray-500 text-sm">
          Пожалуйста, позвоните на указанный номер с вашего телефона, чтобы
          завершить процесс подтверждения(Звонок бесплатный).
        </p>
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
