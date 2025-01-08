<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core";
import { email, helpers, required } from "@vuelidate/validators";

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
    <Transition>
      <div
        v-if="props.show"
        class="modal-box rounded-[8px] w-full lg:max-w-5xl md:max-w-2xl sm:max-w-lg cursor-auto border p-3 sm:p-5 border-[#dee2e6]"
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
        <h3 class="text-xl font-bold mb-2 flex items-center gap-1 pr-3">
          Добро пожаловать на Harmex! 👋
        </h3>
        <p class="text-[17px]">Мы рады, что вы с нами!</p>
        <p class="mb-2 mt-6 text-xl font-bold">
          Ознакомьтесь с “Обзором кабинета” за 60 секунд.
        </p>
        <ol class="ml-1 mb-4 text-[#4b5563] flex flex-col gap-1">
          <li><span class="font-bold">1</span> - каталог услуг платформы.</li>
          <li><span class="font-bold">2</span> - быстрый поиск услуг.</li>
          <li>
            <span class="font-bold">3</span> - раздел Финансы, который
            предоставляет функционал управления финансовыми операциями
            (пополнение, расходы, вывод, рекомендации).
          </li>
          <li>
            <span class="font-bold">4</span> - быстрое пополнение по Qr-коду
            личного баланса.
          </li>
          <li>
            <span class="font-bold">5</span> - раздел Профиль для безопасности
            данных.
          </li>
          <li><span class="font-bold">6</span> - раздел Обзор кабинета.</li>
          <li>
            <span class="font-bold">7</span> - быстрый доступ к популярным
            услугам и всем доступным по направлению.
          </li>
          <li>
            <span class="font-bold">8</span> - окно Службы заботы по решению
            ваших задач и уточнений.
          </li>
        </ol>

        <p class="font-bold">⚠️ Важно!</p>
        <p>Стоимость услуг вы найдете нажав на кнопку Перейти.</p>

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
