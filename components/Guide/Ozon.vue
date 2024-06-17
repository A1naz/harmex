<script setup lang="ts">
const liArchiveQuestData = []
</script>

<template>
  <div class="flex flex-col gap-4 px-7 pb-20 w-full overflow-y-auto">
    <div class="font-bold text-2xl mb-4">Ozon</div>

    <div
      tabindex="0"
      class="collapse collapse-arrow bg-[#eff0ff] dark:bg-primary dark:bg-opacity-10 rounded-box z-0 flex-none"
    >
      <div class="collapse-title relative text-xl font-medium">
        <div class="flex gap-4 text-xl font-semibold">Подписка</div>
      </div>
      <div class="collapse-content">
        <div class="flex flex-col gap-4">
          <p>
            Чтобы продлить тарифный план, выберите маркетплейс OZON, желаемые
            условия продления (направление, услугу, сроки) и оплатите любым
            удобным для вас способом
          </p>
          <p>После оплаты, ваш тарифный план обновится в течение 10-30 минут</p>
        </div>
      </div>
    </div>
    <div
      tabindex="0"
      class="collapse collapse-arrow bg-[#eff0ff] dark:bg-primary dark:bg-opacity-10 rounded-box z-0 flex-none"
    >
      <div class="collapse-title relative text-xl font-medium">
        <div class="flex gap-4 text-xl font-semibold">Пополнение баланса</div>
      </div>
      <div class="collapse-content">
        <div class="flex flex-col gap-4">
          <p>
            Чтобы пополнить баланс для совершения покупок товаров на
            маркетплейсе OZON, выполните простые рекомендации:
          </p>
          <ol class="list-decimal pl-5">
            <li>Нажмите на «+»</li>
            <li>Выберите маркетплейс OZON</li>
            <li>Введите желаемую сумму пополнения</li>
            <li>Нажмите кнопку Пополнить</li>
            <li>Заполните необходимые поля с данными</li>
            <li>Выберите приемлемый для вас способ оплаты</li>
            <li>Переведите по указанным реквизитам</li>
            <li>Ожидайте пополнения от 10 минут до 72 часов</li>
          </ol>
          <p>
            Пополнение происходит как только финансы поступают на наш расчетный
            счет
          </p>
        </div>
      </div>
    </div>
    <div
      tabindex="0"
      class="collapse collapse-arrow bg-[#eff0ff] dark:bg-primary dark:bg-opacity-10 rounded-box z-0 flex-none"
    >
      <div class="collapse-title relative text-xl font-medium">
        <div class="flex gap-4 text-xl font-semibold">
          Выкуп (товара, скидка, отель)
        </div>
      </div>
      <div class="collapse-content">
        <div class="flex flex-col gap-4">
          <p>
            Чтобы осуществить покупку товара на маркетплейсе Wildberries,
            выполните простые рекомендации:
          </p>
          <ol class="list-decimal pl-5">
            <li>Перейдите в меню Выкупы</li>
            <li>Нажмите кнопку Добавить выкуп и выберите маркетплейс OZON</li>
            <nuxt-img
              class="py-5 rounded-lg flex justify-center mx-auto"
              width="800"
              :src="`https://ozonmpportal.hb.vkcs.cloud/faqImages/wildberries/1.png`"
            />
            <li>Введите желаемый артикул (номер складского учёта товара)</li>

            <nuxt-img
              class="py-5 rounded-lg flex justify-center mx-auto"
              width="500"
              :src="`https://ozonmpportal.hb.vkcs.cloud/faqImages/wildberries/2.png`"
            />
            <li>
              Заполните данные по выкупу
              <ul class="list-disc pl-5 mt-2">
                <li>Размер</li>
                <li>Пол</li>
                <li>Поведенческие факторы</li>
                <li>Планируемое время покупки</li>
                <li>Адрес ПВЗ</li>
                <li>Размер скидки</li>
                <li>Поисковый запрос</li>
              </ul>
            </li>
            <nuxt-img
              class="py-5 rounded-lg flex justify-center mx-auto"
              width="800"
              :src="`https://ozonmpportal.hb.vkcs.cloud/faqImages/wildberries/3.png`"
            />
            <li>Создайте выкуп</li>
            <nuxt-img
              class="py-5 rounded-lg flex justify-center mx-auto"
              width="800"
              :src="`https://ozonmpportal.hb.vkcs.cloud/faqImages/ozon/1.png`"
            />
          </ol>

          <p class="font-bold">Примечания</p>
          <ol class="list-decimal pl-5">
            <li>
              Создание единоразового запроса на покупку товаров в количестве не
              более 10 ед.
            </li>
            <li>
              В целях безопасного совершения покупок, каждый запрос проверяется
              перед созданием по более 25 критериям
            </li>
            <li>Создавайте шаблоны выкупов товаров</li>
            <li>
              Подготавливайте заранее материалы для наполнения данных по выкупам
            </li>
            <li>
              Применяйте планировщик и разбивайте выкупы по часам (с 5 утра до
              23 часов)
            </li>
            <li>
              Покупка товара осуществляются в 2-х форматах (Полная цена и по
              Скидке)
            </li>
          </ol>

          <p class="font-bold">Рекомендации Покупка товаров по скидке:</p>
          <ol class="list-decimal pl-5">
            <li>Введите сумму скидки при которой совершить покупку</li>
            <li>
              После создания заявки на покупку по Скидке, выдайте скидку в
              личном кабинете OZON по ФИО и конкретной временной дате
            </li>
            <li>
              В течение 2-3 часов после одобрения скидки покупка осуществится
            </li>
          </ol>

          <p class="font-bold">Статусы по Выкупам:</p>
          <p>
            Активен - покупка товара находится в поиске свободного слота/окна
            для перехода к действиям
          </p>
          <p>В работе - покупка товара перешла в стадию осуществления заказа</p>
          <p>
            Завершен - покупка товара была осуществлена с дальнейшим переходом в
            меню Доставка (доставка на ПВЗ) и Финансы (точная дата и время
            покупки, а так же финансовые операции)
          </p>
          <p>
            В архиве - покупка товара не может осуществиться по ошибке.
            Проверьте причину нажав на 3 точки - О выкупе
          </p>
          <p>
            На паузе - покупка товара не может осуществиться по причине
            недостатка на балансе финансовых средств
          </p>
          <div class="h-1" />
        </div>
      </div>
    </div>

    <div
      tabindex="0"
      class="collapse collapse-arrow bg-[#eff0ff] dark:bg-primary dark:bg-opacity-10 rounded-box z-0 flex-none"
    >
      <div class="collapse-title relative text-xl font-medium">
        <div class="flex gap-4 text-xl font-semibold">Забор</div>
      </div>
      <div class="collapse-content">
        <div class="flex flex-col gap-4">
          <p>
            Для осуществления заборов товаров с ПВЗ, используйте меню Доставки
          </p>
          <p>
            В данном меню вы в режиме реального времени отслеживаете статусы по
            доставленным, полученным и отмененным доставкам
          </p>
          <p>
            Используйте фильтр для сортировки Доставок, а так же Excel для
            выгрузки как Готовых к выдаче товаров, так и Общую таблицу для
            сверки данных
          </p>

          <nuxt-img
            class="py-1 rounded-lg flex justify-center mx-auto"
            width="800"
            :src="`https://ozonmpportal.hb.vkcs.cloud/faqImages/wildberries/5.png`"
          />

          <p>
            Если вы используете сторонние Логистические сервисы, рекомендуем
            подключить модуль Фулфилмента для фиксации всей статистики:
          </p>

          <p>
            Выкуплено - Доставлено - Получено / Отменено - На складе фулфилмента
          </p>

          <p>
            Чтобы у вас 24/7 был план-факт по вашим товарам никто не осмелился
            ваш ввести вас в заблуждение
          </p>

          <p class="font-bold">Статусы по Доставкам:</p>
          <p>В пути - товар находится в пути на ПВЗ</p>
          <p>
            Готов к выдаче / получению - товар находится на ПВЗ и готов к
            получению
          </p>
          <p>
            Отменен - покупка была отменена на ПВЗ или магазином или
            маркетплейсом с возвратом на склад
          </p>
          <p>
            Получено - товар был получен на ПВЗ и передан курьеру /
            ответственному лицу
          </p>

          <p class="font-bold">Обращаем внимание!</p>
          <p>
            Выкупленные товары, после прибытия на ПВЗ должны быть забраны в
            течение 7 дней (внутреннее правило платформы)
          </p>
          <div class="h-1" />
        </div>
      </div>
    </div>

    <div
      tabindex="0"
      class="collapse collapse-arrow bg-[#eff0ff] dark:bg-primary dark:bg-opacity-10 rounded-box z-0 flex-none"
    >
      <div class="collapse-title relative text-xl font-medium">
        <div class="flex gap-4 text-xl font-semibold">Отзыв</div>
      </div>
      <div class="collapse-content">
        <div class="flex flex-col gap-4">
          <p>
            Для публикации отзывов на полученные товары, используйте меню Отзывы
          </p>
          <nuxt-img
            class="py-1 rounded-lg flex justify-center mx-auto"
            width="800"
            :src="`https://ozonmpportal.hb.vkcs.cloud/faqImages/wildberries/6.png`"
          />
          <p>
            В данном меню вы можете запланировать публикацию отзывов на недели и
            месяцы вперед для поддержания рейтинга и перекрытия негативных
            отзывов
          </p>

          <p>Чтобы опубликовать отзыв, выполните простые рекомендации:</p>
          <ol class="list-decimal pl-5">
            <li>Перейдите в меню Отзывы</li>
            <li>Выберите желаемый Артикул</li>
            <li>Выберите нужную Доставку</li>
            <li>Заполните поля с данными</li>
            <li>Запланируйте дату и время публикации</li>
            <li>Нажмите кнопку Отправить / Опубликовать</li>
          </ol>

          <p class="font-bold">Статусы по Отзывам:</p>
          <p>
            Опубликован - прошел модерацию маркетплейса и опубликован в списке
            Отзывов. Списание за оказанную услугу найдете в меню Финансы
          </p>
          <p>
            Отменен - не прошел модерацию маркетплейса и убран из списка в
            Ожидании. Услуга не оплачиваемая
          </p>
          <p>
            В работе - проходит модерацию маркетплейса и ожидает решения по
            публикации
          </p>
          <p>
            Активен - взят в работу и ищет свое окно для прохождения процедуры
            публикации отзыва
          </p>

          <div class="h-1" />
        </div>
      </div>
    </div>

    <div
      tabindex="0"
      class="collapse collapse-arrow bg-[#eff0ff] dark:bg-primary dark:bg-opacity-10 rounded-box z-0 flex-none"
    >
      <div class="collapse-title relative text-xl font-medium">
        <div class="flex gap-4 text-xl font-semibold">Лайки</div>
      </div>
      <div class="collapse-content">
        <div class="flex flex-col gap-4">
          <p>
            Для публикации лайков на бренд, комментарии и отзывы, используйте
            меню Лайки
          </p>
          <p>
            В данном меню вы можете запланировать публикацию лайков на недели и
            месяцы вперед для поддержания рейтинга и перекрытия негативных
            реакций
          </p>
          <p>Чтобы опубликовать Лайки, выполните простые рекомендации:</p>
          <ol class="list-decimal pl-5">
            <li>Перейдите в меню Лайки</li>
            <li>Выберите желаемый Артикул</li>
            <li>Заполните поля с данными</li>

            <li>Запланируйте дату и время публикации</li>
            <li>Нажмите кнопку Отправить / Опубликовать</li>
          </ol>
          <nuxt-img
            class="py-1 rounded-lg flex justify-center mx-auto"
            width="800"
            :src="`https://ozonmpportal.hb.vkcs.cloud/faqImages/wildberries/8.png`"
          />
        </div>
      </div>
    </div>

    <div
      tabindex="0"
      class="collapse collapse-arrow bg-[#eff0ff] dark:bg-primary dark:bg-opacity-10 rounded-box z-0 flex-none"
    >
      <div class="collapse-title relative text-xl font-medium">
        <div class="flex gap-4 text-xl font-semibold">Вопросы</div>
      </div>
      <div class="collapse-content">
        <div class="flex flex-col gap-4">
          <p>Для публикации Вопросов, используйте меню Вопросы</p>
          <p>
            В данном меню вы можете запланировать публикацию Вопросов на недели
            и месяцы вперед для поддержания рейтинга
          </p>
          <p>Чтобы опубликовать Вопросы, выполните простые рекомендации:</p>
          <ol class="list-decimal pl-5">
            <li>Перейдите в меню Вопросы</li>
            <li>Выберите желаемый Артикул</li>
            <li>Заполните поля с данными</li>

            <li>Запланируйте дату и время публикации</li>
            <li>Нажмите кнопку Отправить / Опубликовать</li>
          </ol>
          <nuxt-img
            class="py-1 rounded-lg flex justify-center mx-auto"
            width="800"
            :src="`https://ozonmpportal.hb.vkcs.cloud/faqImages/wildberries/9.png`"
          />
        </div>
      </div>
    </div>

    <div
      tabindex="0"
      class="collapse collapse-arrow bg-[#eff0ff] dark:bg-primary dark:bg-opacity-10 rounded-box z-0 flex-none"
    >
      <div class="collapse-title relative text-xl font-medium">
        <div class="flex gap-4 text-xl font-semibold">Корзина</div>
      </div>
      <div class="collapse-content">
        <div class="flex flex-col gap-4">
          <p>Для добавления товаров в Корзину, используйте меню Корзина</p>
          <p>
            В данном меню вы можете запланировать добавления в Корзину на недели
            и месяцы вперед для поддержания рейтинга
          </p>
          <p>
            Чтобы добавить товары в Корзину, выполните простые рекомендации:
          </p>
          <ol class="list-decimal pl-5">
            <li>Перейдите в меню Корзину</li>
            <li>Выберите желаемый Артикул</li>
            <li>Заполните поля с данными</li>

            <li>Запланируйте дату и время публикации</li>
            <li>Нажмите кнопку Отправить / Опубликовать</li>
          </ol>
          <nuxt-img
            class="py-1 rounded-lg flex justify-center mx-auto"
            width="800"
            :src="`https://ozonmpportal.hb.vkcs.cloud/faqImages/wildberries/10.png`"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
