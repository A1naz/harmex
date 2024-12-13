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
        <p class="mb-2 text-[17px]">
          Чтобы начать, ознакомьтесь с простым чек-листом действий:
        </p>

        <p class="mt-1.5 text-[18px] font-bold">Шаг 1. Пополните баланс</p>

        <ul class="ml-2">
          <li>- В меню Финансы, нажмите Пополнение</li>
          <li>- Введите сумму и email</li>
          <li>- Перейдите в ваше банковское приложение</li>
          <li>- Сделайте сканирование наше Qr-кода</li>
          <li>- Нажмите кнопку Оплатить</li>
        </ul>

        <p class="mt-1">⚠️ Важно!</p>
        <p>
          Ничего не меняйте в Назначении платежа, чтобы не возникло трудностей
          при поступлении финансов
        </p>
        <NuxtImg
          class="px-2 my-2"
          src="https://ozonmpportal.hb.vkcs.cloud/harmex/introduction/1.png"
        />
        <p class="mt-3 text-[18px] font-bold">Шаг 2. Выберите нужную услугу</p>
        <p>
          После пополнения баланса, выберите услугу, которая вам необходима в
          разрезе площадки: самовыкупы, отзывы или другие функции
        </p>
        <NuxtImg
          class="px-2 my-2"
          src="https://ozonmpportal.hb.vkcs.cloud/harmex/introduction/2.png"
        />
        <p class="mt-3 text-[18px] font-bold">Шаг 3. Запустите первый заказ</p>
        <p>
          Используйте внутреннее Руководство, для создания заявки на исполнение
          услуги
        </p>
        <p>
          Следите за результатами в режиме реального времени в соответствующем
          меню Услуги, которую заказали
        </p>
        <p>Вся отчетность всегда под рукой в меню Финансы</p>
        <NuxtImg
          class="px-2 my-2"
          src="https://ozonmpportal.hb.vkcs.cloud/harmex/introduction/3.png"
        />

        <p class="mt-3 text-[18px] font-bold">
          Шаг 4. Партнерская программа для каждого
        </p>
        <p>За каждую рекомендацию платим от 500 RUB.</p>
        <p class="mt-6 text-[18px] font-bold">Шаг 5. Условия сотрудничества</p>
        <p  class="mt-2">
          🔸 Заказ услуг с отрицательным балансом может привести к блокировке
          функционала согласно Пользовательскому соглашению.
        </p>
        <p class="mt-2">
          ♻️ Каждая платформа имеет свои уникальные особенности работы с
          рейтингом, и мы готовы помочь вам справиться с любыми трудностями.
        </p>
        <p class="mt-2">
          Просим отнестись с пониманием — мы прикладываем максимум усилий, чтобы
          добиться наилучших результатов для вашего успеха.
        </p>
        <p class="mt-2">☑️ Если возникнут вопросы, наша поддержка всегда готова помочь!</p>

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
