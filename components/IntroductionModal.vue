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

      <div class="px-0 sm:px-3">
        <p class="mt-2 text-xl">
          <strong>👋 Добро пожаловать на платформу Harmex!</strong>
        </p>

        <p class="mb-5">Мы рады, что вы с нами!
Это краткое руководство поможет вам разобраться в интерфейсе, тарифах и первых шагах по
работе с платформой.</p>
        <p class="text-xl mb-1">
          <strong>Обзор личного кабинета (60 секунд)</strong>
        </p>
        <p><strong>1. Каталог услуг</strong> — полный список актуальных предложений платформы.</p>
        <p><strong>2. Быстрый поиск</strong> — мгновенно находите нужную услугу по названию.</p>
        <p>
          <strong>3. Финансовые операции</strong> — раздел для пополнения, расходов, вывода и отчетности.
        </p>
        <p class="ml-4">
          <strong>3.1. Партнёрская программа</strong> — ваша уникальная реферальная ссылка для приглашений и бонус 250 ₽ за друга.
        </p>
        <p>
          <strong>4. Быстрое пополнение по QR-коду</strong> — моментальное пополнение личного баланса.
        </p>
        <p>
          <strong>5. Профиль</strong> — информация о вашем логине, команде и настройках доступа.
        </p>
        <p><strong>6. Обзор кабинета</strong> — сводка всех ваших действий и финансов.</p>
        <p>
          <strong>7. Услуги на маркетплейсах</strong> — быстрый доступ к заказам, отчётам и статусам выполнения.
        </p>
        <p>
          <strong>8. Служба заботы Harmex</strong> — оперативная помощь и ответы на любые вопросы.
        </p>


        <NuxtImg
          src="https://ozonmpportal.hb.vkcs.cloud/harmex/introduction/3_1.png"
          class="mx-1 my-2"
        />

        <p class="text-xl mb-2 mt-4">
          <strong>Тарифные планы Harmex</strong>
        </p>
        <ul class="list-disc ml-10 mb-3">
          <li>Стоимость указана <strong>за 1 единицу услуги</strong>.</li>
          <li>При заказе <strong>от 1 000 ед.</strong> — скидка <strong>10%</strong>.</li>
          <li><strong>Выкуп:</strong> 100 ₽/ед.</li>
        </ul>

     

        <ul class="list-disc ml-10 mb-4">
          <li><strong>Отзыв:</strong> 50 ₽/ед.</li>
          <li>Забор товара можно:
            <ul class="list-[circle] ml-6 mt-1">
              <li>выполнить самостоятельно;</li>
              <li>либо заказать <strong>услугу забора с ПВЗ нашими курьерами</strong>.</li>
            </ul>
          </li>
        </ul>

        <NuxtImg
          src="https://ozonmpportal.hb.vkcs.cloud/harmex/introduction/3_2.png"
          class="mx-1 my-2"
        />
        <hr class="my-4 border-gray-300" />
        <p class="text-xl mb-2 mt-4">
          <strong>Чек-лист для быстрого старта</strong>
        </p>
        <video
          controls
          poster="https://ozonmpportal.hb.vkcs.cloud/harmex/introduction/videoTitle.png"
          class="my-6 w-full"
        >
          <source
            src="https://ozonmpportal.hb.vkcs.cloud/harmex/introduction/video.mp4"
            type="video/mp4"
          />
          Ваш браузер не поддерживает видео.
        </video>

        <p class="text-lg mb-2">
          <strong>Шаг 1. Пополните баланс</strong>
        </p>
        <ol class="list-decimal ml-10 mb-3">
          <li>Нажмите на кнопку «+» или перейдите в меню <strong>Финансы → Пополнение</strong>.</li>
          <li>Введите сумму и <strong>email на домене .ru</strong> (зарубежные почты не принимают чеки).</li>
          <li>Сканируйте QR-код через банковское приложение и подтвердите оплату.</li>
          <li>Средства зачисляются автоматически после получения платежа банком.</li>
        </ol>

        <p class="mb-2">
          ⚠️ <strong>Важно: правила пополнения баланса</strong>
        </p>

        <p class="font-semibold mb-1">1. Пополнение с карты физического лица</p>
        <ul class="list-disc ml-10 mb-3">
          <li>Оплатить можно по QR-коду, указанному выше.</li>
          <li>После оплаты чек автоматически поступит на ваш Email.</li>
          <li>Пожалуйста, не изменяйте поле «Назначение платежа» — это важно для корректного и своевременного зачисления средств.</li>
          <li>Средства зачисляются автоматически в течение нескольких минут после получения банком.</li>
          <li>Если в течение 15 минут баланс не обновился, напишите в Службу заботы Harmex — мы поможем оперативно решить вопрос.</li>
        </ul>

        <p class="font-semibold mb-1">2. Пополнение по безналичному расчёту от организации</p>
        <ul class="list-disc ml-10 mb-4">
          <li>Доступна возможность пополнения баланса по счёту от юридического лица.</li>
          <li>После оплаты вы получаете закрывающие документы по ЭДО или на корпоративную почту.</li>
          <li>Для выставления счёта и уточнения деталей обратитесь в Службу заботы Harmex.</li>
        </ul>
        <NuxtImg
          src="https://ozonmpportal.hb.vkcs.cloud/harmex/introduction/3_3.png"
          class="mx-1 my-2"
        />
        <p class="text-lg mb-2"> <strong>Шаг 2. Выберите услугу</strong></p>
        
        <ol class="list-decimal ml-10 mb-4">
          <li>Перейдите в <strong>Каталог</strong>.</li>
          <li>Ознакомьтесь с услугами для нужного маркетплейса (например, Wildberries).</li>
          <li>Выберите услугу, например «<strong>Wildberries — Выкупы</strong>».</li>
          <li>Изучите <strong>руководство</strong> по направлению — оно открывается на странице услуги.</li>
          <li>Нажмите «<strong>Перейти</strong>», чтобы увидеть стоимость и отчетность по заказам.</li>
        </ol>
        <NuxtImg
          src="https://ozonmpportal.hb.vkcs.cloud/harmex/introduction/3_4.png"
          class="mx-1 my-2"
        />
        <hr class="my-4 border-gray-300" />
        <p class="text-lg mb-2">Процесс исполнения услуги по самовыкупам проходит в 3 этапа:</p>

        <ol class="list-decimal ml-10 mb-4">
          <li><strong>Выкупы</strong> — заказ товара на маркетплейсе и отчет по исполнению.</li>
          <li><strong>Доставка</strong> — отправка товара на ПВЗ, получение и возврат средств при отмене.</li>
          <li><strong>Отзывы</strong> — публикация оценки (текст, фото, видео) по заказанному товару.</li>
        </ol>

        <hr class="my-4 border-gray-300" />

        <p class="text-lg mb-2">
          <strong>Шаг 3. Управление кабинетом</strong>
        </p>

        <p class="mb-2">
          В разделе <strong>Профиль</strong> вы можете:
        </p>

        <ul class="list-disc ml-10 mb-3">
          <li>просмотреть логин и данные пользователя;</li>
          <li>ознакомиться с документами и соглашениями;</li>
          <li>добавить <strong>членов команды</strong> и настроить <strong>уровень доступа</strong> для каждого</li>
        </ul>
        <NuxtImg
          src="https://ozonmpportal.hb.vkcs.cloud/harmex/introduction/3_5.png"
          class="mx-1 my-2"
        />

        <p class="text-lg mb-2 mt-4">
          <strong>🍀 Поддержка и обратная связь</strong>
        </p>

        <p class="mb-2">
          Если у вас возник вопрос или требуется уточнение:
        </p>

        <ul class="list-disc ml-10 mb-4">
          <li>Напишите в <strong>службу заботы Harmex</strong> прямо из кабинета;</li>
          <li>или воспользуйтесь формой обратной связи в разделе <strong>Поддержка</strong>.</li>
        </ul>
        
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
