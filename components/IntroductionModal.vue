<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core";
import { email, helpers, required } from "@vuelidate/validators";

const props = defineProps({
  show: { type: Boolean, required: true },
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
  <div class="modal z-[9999] cursor-pointer" @click="$emit('close')">
    <Transition>
      <div
        v-if="props.show"
        class="modal-box rounded-[8px] w-full max-w-4xl cursor-auto border p-4 sm:p-8 border-[#dee2e6]"
        @click.stop
      >
        <form method="dialog">
          <label
            class="btn btn-sm btn-circle btn-ghost bg-[#e5e5e5] absolute right-2 top-2"
            @click="closeModal"
          >
            ✕
          </label>
        </form>
        <h3 class="text-xl font-bold mb-2">Введение</h3>
        <p class="mb-2 text-[17px]">С чего начать?</p>

        <p class="mb-2 italic">Добро пожаловать на платформу Harmex! 👋</p>
        <p class="mb-1 mt-1 text-[16px]">✅ Ваш старт на платформе</p>
        <p class="mb-2 italic">
          Ознакомьтесь с функционалом: «видео-обзор платформы ниже за 30
          секунд», в нем вы найдете инструкции по работе с платформой. Пополните
          баланс: без этого вы не сможете активировать услуги. Выберите нужные
          услуги: настройте самовыкупы, управление отзывами или другие функции.
          Запустите первый заказ: следите за результатами в режиме реального
          времени. Контролируйте финансы: отчетность всегда под рукой в личном
          кабинете. Партнерская программа для каждого! За каждую рекомендацию
          платим от 500 RUB
        </p>
        <p class="mb-1 mt-1 text-[16px]">⚠️ Условия работы</p>
        <p class="mb-2 italic">
          Все услуги активируются только при положительном балансе. Заказ услуг
          с отрицательным балансом может привести к блокировке функционала
          согласно Пользовательскому соглашению. Пополнения с Понедельника по
          Пятницу с 07:00 до 19:00. Переводы, сделанные в выходные, начисляются
          в Понедельник до 09:00. Финансовые средства зачисляются на баланс от
          3х минут до 72 часов. Каждая платформа имеет свои уникальные
          особенности работы с рейтингом, и мы готовы помочь вам справиться с
          любыми трудностями. Просим отнестись с пониманием — мы прикладываем
          максимум усилий, чтобы добиться наилучших результатов для вашего
          успеха.
        </p>
        <p class="mb-2 italic">
          Если возникнут вопросы, наша поддержка всегда готова помочь! 🎯 Удачных продаж!
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
