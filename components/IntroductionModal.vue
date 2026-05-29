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

function openWithdraw() {
  emit("close");
  navigateTo("/paymenthistory?withdraw=true");
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
      class="modal-box rounded-[8px] w-full lg:max-w-2xl md:max-w-xl sm:max-w-lg max-h-[85vh] overflow-y-auto cursor-auto border p-6 sm:p-8 border-[#dee2e6]"
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

      <div class="px-0 sm:px-2 -mt-8">

        <!-- Заголовок -->
        <div class="flex items-center gap-3 mb-6">
          <div class="w-1 h-10 bg-error rounded-full flex-shrink-0"></div>
          <h2 class="text-xl font-bold text-error leading-tight">
            Важное уведомление
          </h2>
        </div>

        <!-- Основной текст -->
        <div class="bg-error/5 border border-error/20 rounded-xl p-5 mb-6">
          <p class="text-base leading-relaxed mb-3">
            Уважаемые клиенты!
          </p>
          <p class="text-base leading-relaxed mb-3">
            Сообщаем вам, что с сегодняшнего дня компания <strong>Harmex</strong> приостанавливает
            фактическую деятельность по оказанию всех услуг самовыкупов на товарах маркетплейсов.
          </p>
          <p class="text-base leading-relaxed font-semibold">
            Заберите оставшиеся товары на ПВЗ и опубликуйте все отзывы.
          </p>
        </div>

        <!-- Вывод средств -->
        <div class="bg-base-200 rounded-xl p-5 mb-6">
          <p class="text-base leading-relaxed mb-4">
            В связи с этим для вывода оставшихся финансовых средств необходимо пройти процедуру
            <button
              class="text-primary underline underline-offset-2 font-semibold hover:text-primary/80 transition-colors cursor-pointer"
              @click="openWithdraw"
            >
              оформления заявки на вывод
            </button>.
          </p>

          <p class="text-sm font-semibold text-base-content/70 uppercase tracking-wide mb-3">
            Порядок действий:
          </p>
          <ol class="space-y-2">
            <li class="flex gap-3">
              <span class="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-content text-xs font-bold flex items-center justify-center mt-0.5">1</span>
              <span>Заполнить форму заявки на вывод финансовых средств.</span>
            </li>
            <li class="flex gap-3">
              <span class="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-content text-xs font-bold flex items-center justify-center mt-0.5">2</span>
              <span>Подготовить подтверждающий документ.</span>
            </li>
            <li class="flex gap-3">
              <span class="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-content text-xs font-bold flex items-center justify-center mt-0.5">3</span>
              <span>Отправить заявку и документы в техническую поддержку.</span>
            </li>
          </ol>
        </div>

        <!-- Нижний блок -->
        <div class="text-center text-sm text-base-content/60 mb-2">
          После получения обращения средства будут выведены по мере возможности и в порядке обработки заявок.
        </div>

        <div class="text-center text-sm text-base-content/50">
          Благодарим вас за сотрудничество, понимание и доверие.
        </div>

        <!-- Кнопка вывода -->
        <div class="mt-6">
          <button
            class="btn btn-primary w-full"
            @click="openWithdraw"
          >
            Оформить заявку на вывод средств
          </button>
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
