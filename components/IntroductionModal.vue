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
        class="modal-box rounded-[8px] w-full lg:max-w-5xl md:max-w-2xl sm:max-w-lg max-w-sm cursor-auto border p-3 sm:p-5 border-[#dee2e6]"
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
        <h3 class="text-xl font-bold mb-2 flex items-center gap-1">Добро пожаловать на платформу Harmex! <Icon name="noto:waving-hand" class="w-7 h-7"/></h3>
        <p class="mb-2 text-[17px]">Мы рады, что вы с нами! Чтобы начать, ознакомьтесь с простым чек-листом действий:</p>

        <p class="mt-1.5 text-[16px] flex items-center gap-1 text-[#4b5563]"><Icon name="emojione-v1:white-heavy-check-mark" class="rounded-[2px]" /> Ваш старт на платформе</p>
        <ol class="list-decimal ml-6 mb-4 text-[#4b5563]">
          <li>Ознакомьтесь с функционалом: «видео-обзор платформы ниже за 30 секунд», в нем вы найдете инструкции по работе с платформой.</li>
          <li>Пополните баланс: без этого вы не сможете активировать услуги.</li>
          <li>Выберите нужные услуги: настройте самовыкупы, управление отзывами или другие функции.</li>
          <li>Запустите первый заказ: следите за результатами в режиме реального времени.</li>
          <li>Контролируйте финансы: отчетность всегда под рукой в личном кабинете.</li>
          <li>Партнерская программа для каждого! За каждую рекомендацию платим от 500 RUB.</li>
        </ol>
        <p class="mt-1.5 text-[16px] flex items-center gap-1 text-[#4b5563]"><Icon name="emojione-v1:warning" class="w-4 h-4"/> Условия работы</p>
        <ul class="list-disc ml-6 text-[#4b5563]">
          <li>Все услуги активируются только при положительном балансе.</li>
          <li>Заказ услуг с отрицательным балансом может привести к блокировке функционала согласно Пользовательскому соглашению.</li>
          <li>Пополнения с Понедельника по Пятницу с 07:00 до 19:00.</li>
          <li>Переводы, сделанные в выходные, начисляются в Понедельник до 09:00.</li>
          <li>Финансовые средства зачисляются на баланс от 3х минут до 72 часов.</li>
          <li>Каждая платформа имеет свои уникальные особенности работы с рейтингом, и мы готовы помочь вам справиться с любыми трудностями. Просим отнестись с пониманием — мы прикладываем максимум усилий, чтобы добиться наилучших результатов для вашего успеха.</li>
        </ul>
        <p class="mb-2 text-[#4b5563] flex items-center gap-1">
          Если возникнут вопросы, наша поддержка всегда готова помочь! <Icon name="noto:bullseye" class="w-4 h-4"/> Удачных продаж!
        </p>
        <div class="flex justify-between mt-8">
          <div class="flex items-center gap-2">
            <input
              id="checkbox"
              type="checkbox"
              class="checkbox checkbox-primary"
              :checked="isChecked"
              @change="toggleCheckbox"
            />
            <label for="checkbox" class="text-sm text-gray-600">
              Больше не показывать это сообщение
            </label>
          </div>
          <button class="btn btn-sm h-[2.5rem] btn-primary" @click="closeModal">Понятно</button>
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
