<script setup lang="ts">
const liArchiveQuestData = [
  'Перейдите в меню Выкупы;',
  'Найдите ваш выкуп используя Поиск;',
  'Найдите нужный вам выкуп;',
  'Нажмите 3 точки (правый верхний угол окна);',
  'Выберите раздел Инфо о выкупе;',
  'Изучите детали Архива вашего выкупа.',
]
const liArchiveReasonsData = [
  'Поисковый ключ находится после 50-й страницы в поиске;',
  'Платная доставка на ПВЗ в размере 200 руб/ед;',
  'Закрытый ПВЗ;',
  'Выкуп на Постамат;',
  'Карточка не найдена в рекламе / сортировке;',
  'Неверно введен поисковый запрос.',
]

const liDeliveryPickupData = [
  'Перейдите в меню Доставка;',
  'Нажмите кнопку Экспорт;',
  'Выберите удобный для вас формат выгрузки данных;',
  'Скачайте файл;',
  ' Откройте файл;',
  'Забирайте товары с ПВЗ.',
]

const liDeliveryPuckupError = [
  'Сбой при считывании Qr-кода;',
  'Плохое качество картинки и скана Qr-кода;',
  'Смена адреса ПВЗ маркетплейсом;',
  'Отмена магазином выкупа товара;',
  'Не оплачен товар;',
  'Забор совершается по данным с кабинета, а не выгрузки;',
  'Просто человеческий фактор.',
]
const liBuyoutRulesData = [
  'Определите поисковые ключи  для запуск рекламы и выкупа',
  'Определите временной интервал запуска рекламы и выкупов',
  'Подготовьте материалы и проверьте позиции поисковых запросов (ключевиков)',
  'Запустите рекламную кампанию ',
  'Выкупите ваши товары с указанием правила 1 (Выкупить в ближайшее время) и правило 8 или 9 (выкупы с рекламы в режиме реального времени)',
  'Отслеживайте процесс выкупов',
]

const liReviewData = [
  'Подготовьте материалы и поисковые ключи для создания текстов',
  'Создайте текст с учетом человеческого фактора: ошибки, формулировки, манера общения, терминалогия, смыслы, эмодзи и прочее',
  'Запланируйте публикацию отзывов в нужный для вас промежуток времени дня',
  'Проверяйте тексты перед отправкой (не допускайте дубликатов текста)',
  'Отслеживайте процесс публикации отзывов',
]

const liDdsData = [
  'Перейдите в меню Финансы',
  'Выберите нужную Сортировку',
  'Нажмите кнопку',
  'Выберите диапазон дат',
  'Скачайте Excel-таблицу',
  'Изучите данные внутри Excel-таблицы',
]

const inputs = reactive<any>({
  first: false,
  second: false,
  third: false,
  fourth: false,
  fifth: false,
  sixth: false,
  seventh: false,
  eighth: false,
  ninth: false,
  tenth: false,
  eleventh: false,
  twelfth: false,
  thirteenth: false,
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
  <div class="flex flex-col gap-4 pb-20 w-full px-7">
    <div class="flex flex-col gap-3 text-xl font-bold">
      Партнерская программа
    </div>
    <div class="divider w-full my-0"></div>

    <div
      tabindex="0"
      class="collapse collapse-arrow bg-[#eff0ff] dark:bg-primary dark:bg-opacity-10 rounded-box z-0 flex-none"
      @click="closeOtherInputs('first')"
    >
      <input tabindex="0" type="checkbox" v-model="inputs.first" />
      <div class="collapse-title text-lg font-bold">
        Что такое партнерская программа?
      </div>
      <div class="collapse-content flex flex-col gap-3">
        <p class="-py-7">
          Партнерская программа (англ. Affiliate program) или Партнерка — форма
          делового сотрудничества между продавцом и партнёрами, где вы можете
          зарабатывать фиксированный % с продаж, просто рекомендуя их другим
          людям/партнерам с помощью специальной партнерской ссылки, которую вы
          получите после регистрации в партнерской программе
        </p>
        <p class="-py-7">
          В партнерской программе, каждый может делать то, что хочет и когда
          хочет
        </p>
        <p class="-py-7">
          Чтобы получить доступ к партнёрке нужно пройти регистрацию и всего 1
          раз приобрести доступ к подписке
        </p>
        <p class="-py-7">
          Оплатив любой пакет платформы Market Monstr стоимостью от 5 000 рублей
          доступ будет открыт
        </p>
      </div>
    </div>

    <div
      tabindex="0"
      class="collapse collapse-arrow bg-[#eff0ff] dark:bg-primary dark:bg-opacity-10 rounded-box z-0 flex-none"
      @click="closeOtherInputs('second')"
    >
      <input tabindex="0" type="checkbox" v-model="inputs.second" />
      <div class="collapse-title text-lg font-bold">
        Как работает партнерка?
      </div>
      <div class="collapse-content flex flex-col gap-3">
        <p class="-py-7">
          Получив доступ к партнерской программе у вас есть/будет личный кабинет
        </p>
        <p class="-py-7">
          Постоянная ссылка на вход
          <a
            class="link link-hover text-primary underline"
            href="https://app.marketmonstr.pro/auth"
            >https://app.marketmonstr.pro/auth
          </a>
        </p>
        <p class="-py-7">
          В меню Партнерская программа находится ваша индивидуальная ссылка для
          рекомендаций, там же вы найдете отчётность по всем вознаграждениям и
          выводам (бухгалтерия)
        </p>
        <nuxt-img
          class="p-5 rounded-lg flex justify-center mx-auto"
          width="800"
          :src="`https://ozonmpportal.hb.vkcs.cloud/faqImages/partner/1.png`"
        />
        <p class="-py-7">
          Используя индивидуальную ссылку для рекомендации платформы Market
          Monstr, любой человек который перейдёт по ней, за ним в любом браузере
          зафиксируются cookie (метка, что человек перешел именно от вас)
        </p>
        <p class="-py-7">
          Если данный посетитель сайта в течение 90 дней вернется на наш сайт
          или зарегистрируется/купит, то он(-а) автоматически после регистрации
          станут под вас
        </p>
        <p class="-py-7">
          Когда они будут в будущем оплачивать и/или также рекомендовать другим
          платформу, то все их новые оплаты/регистрации также будут
          автоматически зафиксированы под вами
        </p>
        <p class="-py-7">
          После каждой оплаты вы будете получать вознаграждение, исходя из того
          сколько уровней в партнерке у вас открыто. Уведомление об оплатах
          будет приходить в вашу электронную почту и/или Telegram-бот
        </p>
        <p class="-py-7">
          Всех своих партнеров вы сможете отслеживать в меню
          <span class="font-bold">Партнерская программа - Моя генеалогия</span>
        </p>
        <nuxt-img
          class="px-5 pt-5 rounded-lg flex justify-center mx-auto"
          width="800"
          :src="`https://ozonmpportal.hb.vkcs.cloud/faqImages/partner/2.png`"
        />
        <nuxt-img
          class="px-5 pb-5 rounded-lg flex justify-center mx-auto"
          width="800"
          :src="`https://ozonmpportal.hb.vkcs.cloud/faqImages/partner/3.png`"
        />
        <p class="-py-7">
          Используя свою партнерскую ссылку в личном кабинете вы можете
          рекомендовать платформу своим друзьям, знакомым, коллегам или
          партнерам
        </p>
        <p class="-py-7">
          Вам не нужно читать презентации, что-то кому-то доказывать или
          объяснять
        </p>
        <p class="-py-7">
          Человек делает оплату и получает именно то, что ему нужно
        </p>
      </div>
    </div>

    <div
      @click="closeOtherInputs('third')"
      tabindex="0"
      class="collapse collapse-arrow bg-[#eff0ff] dark:bg-primary dark:bg-opacity-10 rounded-box z-0 flex-none"
    >
      <input type="checkbox" v-model="inputs.third" />
      <div class="collapse-title text-lg font-bold">
        Где найти партнерскую ссылку?
      </div>
      <div class="collapse-content flex flex-col gap-3">
        <p class="-py-7">
          Чтобы найти ссылку для рекомендаций, вам необходимо:
        </p>
        <ol class="list-decimal pl-5 px-7">
          <li>Перейти в меню Партнерская программа</li>
          <li>Скопировать ссылку / Qr-код / Создать промокод</li>
          <li>
            Отправить ссылку по смс, в соц сети, e-mail или в удобном
            мессенджере
          </li>
          <li>Всю отчетность отслеживать в меню Партнерская программа</li>
        </ol>
        <nuxt-img
          class="p-5 rounded-lg flex justify-center mx-auto"
          width="800"
          :src="`https://ozonmpportal.hb.vkcs.cloud/faqImages/partner/1.png`"
        />
      </div>
    </div>

    <div
      tabindex="0"
      class="collapse collapse-arrow bg-[#eff0ff] dark:bg-primary dark:bg-opacity-10 rounded-box z-0 flex-none"
      @click="closeOtherInputs('fourth')"
    >
      <input type="checkbox" v-model="inputs.fourth" />
      <div class="collapse-title text-lg font-bold">
        Сколько уровней в партнерке и какие условия?
      </div>
      <div class="collapse-content flex flex-col gap-3">
        <p class="-py-7">
          В нашей партнерской программе есть 2 уровня вознаграждений:<br />
          1 уровень - 5%<br />
          2 уровень - 2%
        </p>
        <p class="-py-7">
          Доступ к партнерской программе вы получаете сразу после оплаты любого
          пакета от 5 000 рублей
        </p>
        <p class="-py-7">
          После оплаты, вы автоматически переходите в статус Партнер и вам
          открывается доступ к Партнерской программе и материалам для
          рекомендаций
        </p>
        <nuxt-img
          class="p-5 rounded-lg flex justify-center mx-auto"
          width="500"
          :src="`https://ozonmpportal.hb.vkcs.cloud/faqImages/partner/4.png`"
        />
      </div>
    </div>

    <div
      tabindex="0"
      class="collapse collapse-arrow bg-[#eff0ff] dark:bg-primary dark:bg-opacity-10 rounded-box z-0 flex-none"
      @click="closeOtherInputs('fifth')"
    >
      <input type="checkbox" v-model="inputs.fifth" />
      <div class="collapse-title text-lg font-bold">
        Как происходит оплата платформы?
      </div>
      <div class="collapse-content flex flex-col gap-3">
        <p class="-py-7">
          Оплата тарифного плана происходит единым платежом с банковской карты
          любой страны и любой валюты
        </p>
        <p class="-py-7">
          При оплате не из России автоматически происходит конвертация, т.е
          платежная система сама пересчитывает сколько надо оплатить в вашей
          валюте и выставляет вам счёт на нужную сумму
        </p>
      </div>
    </div>

    <div
      tabindex="0"
      class="collapse collapse-arrow bg-[#eff0ff] dark:bg-primary dark:bg-opacity-10 rounded-box z-0 flex-none"
      @click="closeOtherInputs('sixth')"
    >
      <input type="checkbox" v-model="inputs.sixth" />
      <div class="collapse-title text-lg font-bold">
        Как происходят выплаты вознаграждений?
      </div>
      <div class="collapse-content flex flex-col gap-3">
        <p class="-py-7">
          Выплаты за рекомендации вы получаете на внутренний баланс через 2
          недели после оплаты. То есть если кто-то оплатил платформу 1 января то
          получить за это деньги вы сможете после 14 января. Данный период
          необходим для учета был ли возврат или нет.
        </p>
        <p class="-py-7">Минимальная сумма для вывода 5 000 рублей</p>
        <p class="-py-7">
          Чтобы получать вознаграждения, вам необходимо перейти в меню
          Партнерская программа - Вывод с баланса (делать каждый раз при выводе)
        </p>

        <ol class="list-decimal pl-5 px-7">
          <li>Введите желаемую сумму для вывода</li>
          <li>Введите свои данные</li>
          <li>Подайте заявку на вывод</li>
          <li>
            После того как деньги будут вам отправлены вы получите уведомление в
            свою почту
          </li>
        </ol>
        <nuxt-img
          class="px-5 pt-5 rounded-lg flex justify-center mx-auto"
          width="800"
          :src="`https://ozonmpportal.hb.vkcs.cloud/faqImages/partner/2.png`"
        />
        <nuxt-img
          class="px-5 pb-5 rounded-lg flex justify-center mx-auto"
          width="600"
          :src="`https://ozonmpportal.hb.vkcs.cloud/faqImages/partner/6.png`"
        />
      </div>
    </div>

    <div
      tabindex="0"
      class="collapse collapse-arrow bg-[#eff0ff] dark:bg-primary dark:bg-opacity-10 rounded-box z-0 flex-none"
      @click="closeOtherInputs('seventh')"
    >
      <input type="checkbox" v-model="inputs.seventh" />
      <div class="collapse-title text-lg font-bold">Зачем мне партнерка?</div>
      <div class="collapse-content flex flex-col gap-3">
        <p class="-py-7">
          Регулярно рекомендуя нашу платформу друзьям, коллегам, подписчикам, вы
          сможете создать себе дополнительный пассивный источник дохода
        </p>
        <p class="-py-7">
          Мы только начинаем формировать рынок, выходить на другие страны
        </p>
        <p class="-py-7">
          Это позволит вам зарабатывать гораздо больше денег без встреч,
          консультаций, объяснений и обучений
        </p>
        <p class="-py-7">Мы всё уже сделали за вас и для вас</p>
        <p class="-py-7">
          Всё что осталось вам - это использовать/подредактировать наши
          рекламные материалы или создать свои
        </p>
      </div>
    </div>

    <div
      tabindex="0"
      class="collapse collapse-arrow bg-[#eff0ff] dark:bg-primary dark:bg-opacity-10 rounded-box z-0 flex-none"
      @click="closeOtherInputs('eighth')"
    >
      <input type="checkbox" v-model="inputs.eighth" />
      <div class="collapse-title text-lg font-bold">Преимущества партнерки</div>
      <div class="collapse-content flex flex-col gap-3">
        <p class="-py-7">Партнерская программа Market Monstr позволит вам:</p>
        <ul class="list-disc pl-5 mt-2">
          <li>Быть в 1% рынка и снять сливки</li>
          <li>Работать с понятной целевой аудиторией</li>
          <li>Поставить под себя десятки тысяч людей</li>
          <li>Рекомендовать востребованный продукт</li>
          <li>Получить доступ к широкому ассортименту</li>
          <li>Получать быстрые выплаты</li>
          <li>Использовать готовые материалы</li>
          <li>Рекомендовать, а дальше делегировать на команду Market Monstr</li>
          <li>Навсегда ставить под себя в сеть кандидат</li>
          <li>Получать доход с 2 линий</li>
        </ul>
      </div>
    </div>

    <div
      tabindex="0"
      class="collapse collapse-arrow bg-[#eff0ff] dark:bg-primary dark:bg-opacity-10 rounded-box z-0 flex-none"

      @click="closeOtherInputs('ninth')"
    >
      <input type="checkbox" v-model="inputs.ninth" />
      <div class="collapse-title text-lg font-bold">
        Отличия партнерки Market Monstr от других
      </div>
      <div class="collapse-content flex flex-col gap-3">
        <p class="-py-7">Партнерская программа Market Monstr позволит вам:</p>
        <ul class="list-disc pl-5 mt-2">
          <li>Быть в 1% рынка и снять сливки</li>
          <li>Работать с понятной целевой аудиторией</li>
          <li>Поставить под себя десятки тысяч людей</li>
          <li>Рекомендовать востребованный продукт</li>
          <li>Получить доступ к широкому ассортименту</li>
          <li>Получать быстрые выплаты</li>
          <li>Использовать готовые материалы</li>
          <li>Рекомендовать, а дальше делегировать на команду Market Monstr</li>
          <li>Навсегда ставить под себя в сеть кандидат</li>
          <li>Получать доход с 2 линий</li>
        </ul>
      </div>
    </div>

    <div
      tabindex="0"
      class="collapse collapse-arrow bg-[#eff0ff] dark:bg-primary dark:bg-opacity-10 rounded-box z-0 flex-none"

      @click="closeOtherInputs('tenth')"
    >
      <input type="checkbox" v-model="inputs.tenth" />
      <div class="collapse-title text-lg font-bold">
        Как рекомендовать продукт
      </div>
      <div class="collapse-content flex flex-col gap-3">
        <p class="-py-7">
          Чтобы порекомендовать продукт, выполните следующие рекомендации:
        </p>

        <ol class="list-decimal pl-5 px-7">
          <li>Перейдите в меню Партнерская программа</li>
          <li>
            Скопируйте вашу реферальную ссылку на продукт или на участие в
            партнерской программе
          </li>
          <li>
            Определите как вы порекомендуете (Поделитесь со знакомыми в
            мессенджере, Порекомендуете в соц. сетях, Запустите рекламу и т.д.)
          </li>
          <li>Используйте готовые материалы для рекомендаций</li>
        </ol>
        <nuxt-img
          class="p-5 rounded-lg flex justify-center mx-auto"
          width="800"
          :src="`https://ozonmpportal.hb.vkcs.cloud/faqImages/partner/1.png`"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
p,
ul,
li {
  font-size: 0.875rem;
  line-height: 1.25rem;
}
</style>
