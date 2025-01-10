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

      <div>
        <p align="left" class="mt-2">
          <strong>Добро пожаловать на Harmex!</strong>👋
        </p>
        <p align="left" class="mb-2">Мы рады, что вы с нами!</p>
        <p align="left">
          <strong>Ознакомьтесь с “Обзором кабинета” за 60 секунд.</strong>
        </p>
        <p align="left"><strong>1 -</strong> каталог услуг платформы.</p>
        <p align="left"><strong>2 -</strong>быстрый поиск услуг.</p>
        <p align="left">
          <strong>3 -</strong> раздел Финансы, который предоставляет функционал
          управления финансовыми операциями (пополнение, расходы, вывод,
          рекомендации).
        </p>
        <p align="left">
          <strong>4 -</strong> быстрое пополнение по Qr-коду личного баланса.
        </p>
        <p align="left">
          <strong>5 -</strong> раздел Профиль для безопасности данных.
        </p>
        <p align="left"><strong>6 -</strong>раздел Обзор кабинета.</p>
        <p align="left">
          <strong>7 -</strong> быстрый доступ к популярным услугам и всем
          доступным по направлению.
        </p>
        <p align="left">
          <strong>8 -</strong> окно Службы заботы по решению ваших задач и
          уточнений. <br />
          <br />
        </p>
        <p align="left">
          ⚠️ <strong>Важно! <br /> </strong>Стоимость услуг вы найдете нажав на
          кнопку
          <strong> Перейти </strong>
          .
        </p>

        <NuxtImg
          src="https://ozonmpportal.hb.vkcs.cloud/harmex/introduction/2_1.png"
          class="mx-1 my-2"
        />

        <p align="left">
          Чтобы начать, ознакомьтесь с простым
          <strong>чек-листом действий:</strong>
        </p>
        <p align="left" class="mb-2">
          <strong> <br /> </strong> <strong>Шаг 1. Пополните баланс.</strong>
        </p>
        <ol>
          <li>
            <p align="left"><strong>Начните пополнение</strong>:</p>
          </li>
        </ol>
        <ol>
          <ul>
            <li>
              <p align="left">
                Нажмите на кнопку «+» или перейдите в меню
                <strong>Финансы</strong>, выбрав раздел
                <strong>Пополнение</strong>.
              </p>
            </li>
          </ul>
          <li>
            <p align="left"><strong>Укажите детали</strong>:</p>
            <ul>
              <li>
                <p align="left">
                  Введите сумму пополнения и ваш
                  <strong> Email </strong>
                  .
                </p>
              </li>
            </ul>
          </li>
          <li>
            <p align="left">
              <strong>Оплатите через банковское приложение</strong>:
            </p>
            <ul>
              <li>
                <p align="left">Откройте ваше банковское приложение.</p>
              </li>
              <li>
                <p align="left">
                  Сканируйте предоставленный
                  <strong> QR-код </strong>
                  .
                </p>
              </li>
              <li>
                <p align="left">
                  Нажмите кнопку <strong>Оплатить</strong>
                  для завершения операции.
                </p>
              </li>
            </ul>
          </li>
        </ol>
        <p align="left" class="my-3">
          ⚠️
          <strong
            >Важное напоминание! <br />
            Не вносите изменения</strong
          >
          в поле «Назначение платежа». Это поможет избежать задержек или
          трудностей с поступлением средств на ваш счёт.
        </p>
        <NuxtImg
          src="https://ozonmpportal.hb.vkcs.cloud/harmex/introduction/2_2.png"
          class="mx-1 my-2"
        />
        <p align="left">
          <strong> <br /> </strong
          ><p class="-mb-2"><strong>Шаг 2. Выберите подходящую услугу.</strong
          >
          </p>
          <strong> <br /> </strong>После пополнения баланса вам нужно выбрать
          услугу, которая соответствует вашим целям и платформе, на которой вы
          работаете. Следуйте инструкции ниже.
        </p>
        <p align="left">Как выбрать услугу:</p>
        <ol>
          <li>
            <p align="left">Перейдите в раздел <strong>«Каталог»</strong>.</p>
          </li>
          <li>
            <p align="left">
              Ознакомьтесь с перечнем доступных услуг для различных платформ
              (например, Wildberries, 2ГИС и другие).
            </p>
          </li>
          <li>
            <p align="left">
              Найдите услугу, например,
              <strong> «Wildberries — Выкупы». </strong>
            </p>
          </li>
          <li>
            <p align="left">
              Изучите руководство по направлению и услугам (отображается на
              странице услуги).
            </p>
          </li>
          <li>
            <p align="left">
              Нажмите <strong>«Перейти»</strong>, чтобы увидеть стоимость
              услуги.
            </p>
          </li>
        </ol>
        <p align="left">
          <strong>Для платформ, связанных с товарами</strong>(например,
          Wildberries, Ozon):
        </p>
        <ul>
          <li>
            <p align="left">
              Публикация отзывов доступна только после выкупа товара и его
              доставки.
            </p>
          </li>
          <li>
            <p align="left">Что нужно сделать:</p>
            <ol>
              <li>
                <p align="left">Выкупите товар.</p>
              </li>
              <li>
                <p align="left">
                  Дождитесь доставки в указанный пункт назначения.
                </p>
              </li>
              <li>
                <p align="left">Опубликуйте отзыв.</p>
              </li>
            </ol>
          </li>
        </ul>
        <p align="left">Что такое "товар" на разных платформах?</p>
        <ol>
          <li>
            <p align="left">Маркетплейсы (Wildberries, Ozon):</p>
            <ul>
              <li>
                <p align="left">
                  <strong>Физические товары</strong>: одежда, техника, книги.
                </p>
              </li>
              <li>
                <p align="left">
                  <strong>Цифровые товары</strong>: электронные книги, ПО,
                  подписки.
                </p>
              </li>
              <li>
                <p align="left">
                  <strong>Услуги</strong>: бронирование номеров, билетов.
                </p>
              </li>
            </ul>
          </li>
          <li>
            <p align="left">Биржи услуг:</p>
            <ul>
              <li>
                <p align="left">
                  <strong>Услуги специалистов</strong>: дизайн, разработка,
                  копирайтинг.
                </p>
              </li>
            </ul>
          </li>
        </ol>
        <p align="left">
          <strong>Для платформ, не связанных с товарами</strong>(например, 2ГИС,
          отзывы на услуги, отзовики):
        </p>
        <ul>
          <li>
            <p align="left">
              Отзывы можно публиковать сразу, без необходимости выкупа товаров
              или услуг.
            </p>
          </li>
        </ul>
        <p align="left">
          <strong>Использование персонального идентификатора (ID):</strong>
        </p>
        <p align="left">
          <strong>Что такое ID?</strong> <br />
          Каждая услуга, которую вы заказываете, получает уникальный
          идентификатор (ID). Это позволяет службе поддержки быстро находить ваш
          заказ и оперативно решать возникающие вопросы.
        </p>
        <p align="left">
          <strong>Как использовать ID?</strong>
        </p>
        <ul>
          <li>
            <p align="left">
              При обращении в Службу заботы укажите ID услуги (см. пример ниже
              поиска).
            </p>
          </li>
          <li>
            <p align="left">
              Это ускорит обработку вашего запроса и поможет быстро решить
              проблему.
            </p>
          </li>
        </ul>

        <NuxtImg
          src="https://ozonmpportal.hb.vkcs.cloud/harmex/introduction/2_3.png"
          class="mx-1 my-2"
        />
        <NuxtImg
          src="https://ozonmpportal.hb.vkcs.cloud/harmex/introduction/2_4.png"
          class="mx-1 my-2"
        />

        <p align="left">
          <p class="mt-3 -mb-2">
            <strong>Шаг 3. Создание заказа.</strong >
            </p>
          <strong> <br /> </strong>Чтобы оформить заявку на выполнение услуги,
          выполните простые шаги.
        </p>
        <p align="left">
          Процесс исполнения отображается в режиме реального времени, а вся
          информация о финансовых операциях доступна в разделе
          <strong> «Финансы» </strong>
          .
        </p>
        <p align="left">1. Ознакомьтесь с руководством по выбранной площадке</p>
        <ul>
          <li>
            <p align="left">
              Перейдите в раздел <strong>«Услуги»</strong> и выберите нужную
              площадку (например,
              <strong> Wildberries — Выкупы </strong>
              ).
            </p>
          </li>
          <li>
            <p align="left">
              Изучите руководство, которое содержит подробные инструкции по
              созданию заявки и выполнению услуги.
            </p>
          </li>
        </ul>
        <p align="left">2. Как создать заявку</p>
        <p align="left">После ознакомления с руководством:</p>
        <ol>
          <li>
            <p align="left">
              Нажмите <strong>«Создать заявку»</strong>(см. пример ниже).
            </p>
          </li>
          <li>
            <p align="left">
              Заполните обязательные поля (например, артикул, количество).
            </p>
          </li>
          <li>
            <p align="left">
              Подтвердите данные и нажмите <strong>«Создать»</strong>.
            </p>
          </li>
        </ol>
        <p align="left">3. Отслеживание статусов заявки</p>
        <p align="left">
          Процесс выполнения заявки отображается в режиме реального времени:
        </p>
        <ul>
          <li>
            <p align="left">
              <strong>Активен</strong> — заявка создана и ожидает исполнения.
            </p>
          </li>
          <li>
            <p align="left"><strong>В работе</strong> — услуга выполняется.</p>
          </li>
          <li>
            <p align="left">
              <strong>Завершен</strong> — выполнение завершено успешно.
            </p>
          </li>
        </ul>
        <p align="left">4. Финансовая отчетность</p>
        <p align="left">
          Вся информация о списаниях и транзакциях доступна в разделе
          <strong> «Финансы» </strong>
          . <br />
          Здесь вы можете проверить:
        </p>
        <ul>
          <li>
            <p align="left">Дату и время списания.</p>
          </li>
          <li>
            <p align="left">Сумму операции.</p>
          </li>
          <li>
            <p align="left">Детали (например, ID заявки).</p>
          </li>
        </ul>
        <p align="left">5. Пример работы с заявкой</p>
        <p align="left">
          <strong>Ситуация:</strong> Вы хотите выкупить товар на Wildberries.
        </p>
        <ul>
          <li>
            <p align="left">
              Перейдите в раздел <strong>«Маркетплейсы»</strong> и выберите
              <strong>«Wildberries — Выкупы»</strong>.
            </p>
          </li>
          <li>
            <p align="left">
              Ознакомьтесь с руководством и создайте заявку, указав артикул
              товара и его количество.
            </p>
          </li>
          <li>
            <p align="left">
              Отслеживайте статусы заявки в <strong>Услуге</strong>: Активен, В
              работе и Завершен.
            </p>
          </li>
          <li>
            <p align="left">
              Проверьте финансовые данные в разделе
              <strong> «Финансы» </strong>
              : дата, время и сумма списания.
            </p>
          </li>
          <li>
            <p align="left">
              В случае вопросов укажите
              <strong> ID заявки </strong>
              , чтобы ускорить решение через службу поддержки.
            </p>
          </li>
        </ul>

        <NuxtImg
          src="https://ozonmpportal.hb.vkcs.cloud/harmex/introduction/2_5.png"
          class="mx-1 my-2"
        />
        <NuxtImg
          src="https://ozonmpportal.hb.vkcs.cloud/harmex/introduction/2_6.png"
          class="mx-1 my-2"
        />
        <p align="left">
          <p class="mt-3 -mb-2">
          <strong 
            >Шаг 4. Защищённый и удобный личный кабинет.</strong
          >
        </p>
          <strong> <br /> </strong>В разделе «Профиль» вы найдёте:
        </p>
        <ul>
          <li>
            <p align="left">Ваш логин пользователя.</p>
          </li>
          <li>
            <p align="left">Доступ к документам и соглашениям.</p>
          </li>
          <li>
            <p align="left">
              Возможность добавить членов команды на платформу с настройкой прав
              доступа для каждого.
            </p>
          </li>
        </ul>

        <NuxtImg
          src="https://ozonmpportal.hb.vkcs.cloud/harmex/introduction/2_7.png"
          class="mx-1 my-2"
        />

        <p align="left" class="mt-3 mb-2">
          <strong>Шаг 5. Расскажите о наших решениях и получите бонус.</strong>
        </p>
        <p align="left">
          Поделитесь уникальной возможностью с вашим окружением и получите
          бонусы от Harmex!
        </p>
        <p align="left">Как это работает:</p>
        <ol>
          <li>
            <p align="left">Персональная ссылка</p>
          </li>
        </ol>
        <ul>
          <li>
            <p align="left">
              Перейдите в раздел «Финансы» и выберите вкладку «Партнерка».
            </p>
          </li>
          <li>
            <p align="left">
              Здесь вы найдете свою персональную ссылку для рекомендаций. <br />
              <br />
            </p>
          </li>
        </ul>
        <ol start="2">
          <li>
            <p align="left">Рекомендуйте нас</p>
          </li>
        </ol>
        <ul>
          <li>
            <p align="left">
              Поделитесь ссылкой с друзьями, коллегами или деловыми партнерами.
            </p>
          </li>
          <li>
            <p align="left">
              Расскажите о наших решениях, которые помогают достигать целей.
              <br />
              <br />
            </p>
          </li>
        </ul>
        <ol start="3">
          <li>
            <p align="left">Получите бонус</p>
          </li>
        </ol>
        <ul>
          <li>
            <p align="left">
              За каждую успешную регистрацию или заказ, сделанный по вашей
              ссылке, вы получите бонусы от Harmex.
            </p>
          </li>
          <li>
            <p align="left">
              Накопленные бонусы можно использовать для оплаты услуг или вывода
              средств.
            </p>
          </li>
        </ul>
        <p align="left">
          Пример использования: <br />
          Вы рекомендуете платформу другу, который регистрируется по вашей
          ссылке и начинает заказывать услуги. За это вы получаете начисления,
          которые видны в меню «Финансы».
        </p>
        <p align="left">
          Рекомендация — это простой способ не только делиться полезным
          инструментом, но и зарабатывать!
        </p>
        <p align="left" class="my-3">
          <strong>Примечания:</strong>
        </p>
        <p align="left" class="mb-3">
          🔸 <strong>Баланс и функционал <br /> </strong>Обратите внимание, что
          заказы услуг с отрицательным балансом могут привести к временной
          блокировке функционала в соответствии с
          <strong>Пользовательским соглашением</strong>. Перейти к соглашению
        </p>
        <p align="left" class="mb-3">
          ♻️ <strong>Уникальные особенности платформ <br /> </strong>Каждая
          платформа (например, Wildberries, Ozon и другие) имеет свои правила
          работы с рейтингом. Мы понимаем, что это может быть сложно, и готовы
          поддержать вас на каждом этапе для преодоления любых трудностей.
        </p>
        <p align="left" class="mb-3">
          ☑️ <strong>Поддержка и забота <br /> </strong>Если у вас возникнут
          вопросы, наша <strong>Служба заботы</strong>
          всегда рядом, чтобы помочь и обеспечить максимальную эффективность
          ваших заказов.
        </p>
        <p align="left">
          🙏 <strong>Благодарим за понимание <br /> </strong>Мы прикладываем все
          усилия, чтобы ваши цели были достигнуты максимально быстро и
          эффективно!
        </p>
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
