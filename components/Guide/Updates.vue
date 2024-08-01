<script setup lang="ts">
const emit = defineEmits(['openModal'])
const store = useMainStore()
const route = useRoute()


const inputs = reactive<any>({
  first: false,
  second: false,
  third: false,
  fourth: false,
  fifth: false,
  sixth: false,
  seventh: false,
  eighth: false,
})

const closeOtherInputs = (input: string) => {
  Object.keys(inputs).forEach((key: any) => {
    if (key !== input) {
      inputs[key] = false
    }
  })
}

</script>

<template>
  <div class="flex flex-col gap-4 px-7 pb-20 w-full overflow-y-auto">
    <div class="font-bold text-2xl mb-4">Обзор кабинета</div>
    <div
      tabindex="0"
      class="collapse collapse-arrow bg-[#eff0ff] dark:bg-primary dark:bg-opacity-10 rounded-box z-0 flex-none"
      @click="closeOtherInputs('first')"
    >
      <input tabindex="0" type="checkbox" v-model="inputs.first" />

      <div class="collapse-title relative text-xl font-medium">
        <div class="flex gap-4 text-xl font-semibold">Условия пользования платформой</div>
      </div>
      <div class="collapse-content">
        <div class="flex flex-col gap-4">
          <p>
            Чтобы продлить тарифный план, выберите маркетплейс,
            желаемые условия продления (направление, услугу, сроки) и оплатите
            любым удобным для вас способом
          </p>
          <p>После оплаты, ваш тарифный план обновится в течение 10-30 минут</p>
        </div>
      </div>
    </div>
    <div
      tabindex="0"
      class="collapse collapse-arrow bg-[#eff0ff] dark:bg-primary dark:bg-opacity-10 rounded-box z-0 flex-none"
      @click="closeOtherInputs('second')"
    >
      <input tabindex="0" type="checkbox" v-model="inputs.second" />
      <div class="collapse-title relative text-xl font-medium">
        <div class="flex gap-4 text-xl font-semibold">Как пополнить баланс</div>
      </div>
      <div class="collapse-content">
        <div class="flex flex-col gap-4">
          <p>
            Чтобы пополнить баланс для совершения покупок товаров на
            маркетплейсе, выполните простые рекомендации:
          </p>
          <ol class="list-decimal pl-5">
            <li>Нажмите на «+»</li>
            <li>Введите желаемую сумму пополнения</li>
            <li>Нажмите кнопку Пополнить</li>
            <li>Заполните необходимые поля с данными</li>
            <li>Выберите приемлемый для вас способ оплаты</li>
            <li>Переведите по указанным реквизитам</li>
          </ol>
          <p>Ожидайте пополнения от 10 минут до 72 часов</p>
          <p>
            Пополнение происходит как только финансы поступают на наши расчетный
            счет
          </p>
        </div>
      </div>
    </div>
    <div
      tabindex="0"
      class="collapse collapse-arrow bg-[#eff0ff] dark:bg-primary dark:bg-opacity-10 rounded-box z-0 flex-none"
      @click="closeOtherInputs('third')"
    >
      <input tabindex="0" type="checkbox" v-model="inputs.third" />
      <div class="collapse-title relative text-xl font-medium">
        <div class="flex gap-4 text-xl font-semibold">Как создать самовыкуп</div>
      </div>
      <div class="collapse-content">
        <div class="flex flex-col gap-4">
          <p>
            Чтобы осуществить покупку товара на маркетплейсе,
            выполните простые рекомендации:
          </p>
          <ol class="list-decimal pl-5">
            <li>Перейдите в меню Выкупы</li>
            <li>Выберите маркетплейс</li>
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
              width="300"
              :src="`https://ozonmpportal.hb.vkcs.cloud/faqImages/wildberries/4.png`"
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
              Покупка товара осуществляются только по СПП, но расчет БЕЗ СПП в
              связи с волантильностью цен
            </li>
          </ol>

          <p class="font-bold">Статусы по Выкупам:</p>
          <p>
            <strong>Активен</strong> - покупка товара находится в поиске
            свободного слота/окна для перехода к действиям
          </p>
          <p>В работе - покупка товара перешла в стадию осуществления заказа</p>
          <p>
            <strong>Завершен</strong> - покупка товара была осуществлена с
            дальнейшим переходом в меню Доставка (доставка на ПВЗ) и Финансы
            (точная дата и время покупки, а так же финансовые операции)
          </p>
          <p>
            <strong>В архиве</strong> - покупка товара не может осуществиться по
            ошибке. Проверьте причину нажав на 3 точки - О выкупе
          </p>
          <p>
            <strong>На паузе</strong> - покупка товара не может осуществиться по
            причине недостатка на балансе финансовых средств
          </p>
          <div class="h-1" />
        </div>
      </div>
    </div>

    <div
      class="collapse collapse-arrow bg-[#eff0ff] dark:bg-primary dark:bg-opacity-10 rounded-box z-0 flex-none"
      @click="closeOtherInputs('fourth')"
    >
      <input type="checkbox" v-model="inputs.fourth" />
      <div class="collapse-title relative text-xl font-medium">
        <div class="flex gap-4 text-xl font-semibold">Как забрать товар с ПВЗ</div>
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
          <p><strong>В пути</strong> - товар находится в пути на ПВЗ</p>
          <p>
            <strong>Готов к выдаче / получению</strong> - товар находится на ПВЗ
            и готов к получению
          </p>
          <p>
            <strong>Отменен</strong> - покупка была отменена на ПВЗ или
            магазином или маркетплейсом с возвратом на склад
          </p>
          <p>
            <strong>Получено</strong> - товар был получен на ПВЗ и передан
            курьеру / ответственному лицу
          </p>

          <div class="h-1" />
        </div>
      </div>
    </div>

    <div
      tabindex="0"
      class="collapse collapse-arrow bg-[#eff0ff] dark:bg-primary dark:bg-opacity-10 rounded-box z-0 flex-none"
      @click="closeOtherInputs('fifth')"
    >
      <input type="checkbox" v-model="inputs.fifth" />
      <div class="collapse-title relative text-xl font-medium">
        <div class="flex gap-4 text-xl font-semibold">Как опубликовать отзыв</div>
      </div>
      <div class="collapse-content">
        <div class="flex flex-col gap-4">
          <p>
            Для публикации отзывов на полученные товары, используйте меню Отзывы
          </p>
          <p>
            В данном меню вы можете запланировать публикацию отзывов на недели и
            месяцы вперед для поддержания рейтинга и перекрытия негативных
            отзывов
          </p>
          <nuxt-img
            class="py-1 rounded-lg flex justify-center mx-auto"
            width="800"
            :src="`https://ozonmpportal.hb.vkcs.cloud/faqImages/wildberries/6.png`"
          />
          <p>Чтобы опубликовать отзыв, выполните простые рекомендации:</p>
          <ol class="list-decimal pl-5">
            <li>Перейдите в меню Отзывы</li>
            <li>Выберите желаемый Артикул</li>
            <li>Выберите нужную Доставку</li>
            <li>Заполните поля с данными</li>
            <li>Запланируйте дату и время публикации</li>
            <li>Выберите приемлемый для вас способ оплаты</li>
            <li>Нажмите кнопку Отправить / Опубликовать</li>
          </ol>
          <nuxt-img
            class="py-1 rounded-lg flex justify-center mx-auto"
            width="500"
            :src="`https://ozonmpportal.hb.vkcs.cloud/faqImages/wildberries/7.png`"
          />

          <p class="font-bold">Статусы по Отзывам:</p>
          <p>
            <strong>Опубликован</strong> - прошел модерацию маркетплейса и
            опубликован в списке Отзывов. Списание за оказанную услугу найдете в
            меню Финансы
          </p>
          <p>
            <strong>Отменен</strong> - не прошел модерацию маркетплейса и убран
            из списка в Ожидании. Услуга не оплачиваемая
          </p>
          <p>
            <strong>В работе</strong> - проходит модерацию маркетплейса и
            ожидает решения по публикации
          </p>
          <p>
            <strong>Активен</strong> - взят в работу и ищет свое окно для
            прохождения процедуры публикации отзыва
          </p>

          <div class="h-1" />
        </div>
      </div>
    </div>

    <div
      tabindex="0"
      class="collapse collapse-arrow bg-[#eff0ff] dark:bg-primary dark:bg-opacity-10 rounded-box z-0 flex-none"
      @click="closeOtherInputs('sixth')"
    >
      <input type="checkbox" v-model="inputs.sixth" />
      <div class="collapse-title relative text-xl font-medium">
        <div class="flex gap-4 text-xl font-semibold">Как опубликовать лайки</div>
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
      @click="closeOtherInputs('seventh')"
    >
    <input type="checkbox" v-model="inputs.seventh" />
      <div class="collapse-title relative text-xl font-medium">
        <div class="flex gap-4 text-xl font-semibold">Как опубликовать вопрос</div>
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
      @click="closeOtherInputs('eighth')"
    >
      <input type="checkbox" v-model="inputs.eighth" />
      <div class="collapse-title relative text-xl font-medium">
        <div class="flex gap-4 text-xl font-semibold">Как добавить товар в Корзину</div>
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
