<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core'
import { email, helpers, required } from '@vuelidate/validators'

const props = defineProps({
  show: { type: Boolean, required: true },
})
const emit = defineEmits(['close'])
function closeModal() {
  emit('close')
}
</script>

<template>
  <input id="selectUser" type="checkbox" :checked="props.show" class="modal-toggle" :class="{ 'modal-open': props.show }">
  <div class="modal z-[9999] cursor-pointer" @click="$emit('close')">
    <Transition>
    <div
      v-if="props.show"
      class="modal-box rounded-[8px] w-full max-w-xl cursor-auto border p-4 sm:p-8 border-[#dee2e6]"
      @click.stop>
      <form method="dialog">
        <label class="btn btn-sm btn-circle btn-ghost bg-[#e5e5e5] absolute right-2 top-2" @click="closeModal">
          ✕
        </label>
      </form>
      <h3 class="text-xl font-bold mb-4">
        Ваш баланс исчерпан.
      </h3>
      <p class="mb-4">Пополните его, чтобы продолжить пользоваться услугами.</p>
      
      <p class="mb-4">
        Обратите внимание: при заказе услуг с отрицательным балансом функционал будет заблокирован в соответствии с Пользовательским соглашением.
      </p>
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
