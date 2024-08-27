<script setup lang="ts">
const props = defineProps({
  // tariff: {
  //   type: Object as any,
  //   required: true,
  state: {
    type: Boolean,
    required: true,
  },
  tariffName: {
    type: String,
    required: false,
    default: '',
  },
  tariffPrice: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  qr: {
    type: String,
    default: '/icons/tarrifsImages/qr.png',
  },
  orderUuid: {
    type: String,
    default: '',
  },
  paymentPurpose: {
    type: String,
    default: '',
  },
})
const emit = defineEmits(['close', 'changeType'])
const store = useMainStore()
import { notify } from '@kyvg/vue3-notification'

// const extractValues = (items: any) => {
//   return items.map((item: any) => {
//     return {
//       value: item[props.form.dateRange.replace('months', '')],
//       title: item.title,
//     }
//   })
// }

// const factorsValues = computed(() => {
//   return extractValues(props.tariff.factors)
// })
// const ratingIncreaseValues = computed(() => {
//   return extractValues(props.tariff.ratingIncrease)
// })

async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text)
  notify({ text: 'Скопировано в буфер обмена', type: 'success' })
}

onKeyStroke('Escape', (e) => {
  e.preventDefault()
  emit('close')
})
</script>

<template>
  <div
    id="buyoutLogModal"
    :class="{
      'modal-open': state,
    }"
    class="modal"
    @click.self="$emit('close')"
  >
    <div v-if="state" class="modal-box rounded-none max-w-fit">
      <div class="">
        <a
          style="padding: 5px"
          class="btn btn-sm p-1 btn-circle btn-ghost absolute right-2 top-2 w-fit"
          @click="$emit('close')"
          >✕</a
        >
        <div>
          <div
            v-if="type === 'success'"
            class="pay-popup success-popup zoom-anim-dialog mfp-hide"
            id="success-popup"
          >
            <div class="success-popup__icon flex justify-center">
              <nuxt-img :src="`/icons/tarrifsImages/success.svg`" />
            </div>
            <div class="success-popup__title">Платеж успешно обработан</div>
            <div class="success-popup__text">
              Поздравляем, вы оплатили <b>«{{ tariffName }}».</b> <br />Наш
              менеджер свяжется с вами в ближайшее время.
            </div>

            <div class="success-popup__btns">
              <a href="#">Яндекс почта</a>
              <a href="#">Gmail почта</a>
              <a href="#">Mail почта</a>
              <a href="#">Яндекс поиск</a>
            </div>
          </div>

          <div
            v-if="type === 'error'"
            class="pay-popup error-popup zoom-anim-dialog mfp-hide"
            id="error-popup"
          >
            <div class="error-popup__icon flex justify-center">
              <nuxt-img :src="`/icons/tarrifsImages/error.svg`" :alt="'icon'" />
            </div>
            <div class="error-popup__title">Ошибка оплаты</div>
            <div class="error-popup__text">
              При выполнении платежа произошла ошибка. <br />Пожалуйста,
              повторите попытку или измените вид платежа.
            </div>
            <div class="error-popup__text">
              В случае ошибки, обратитесь в нашу
              <a href="#">службу поддержки.</a>
            </div>
          </div>

          <div
            v-if="type === 'bank-pay1' || type === 'bank-pay2'"
            class="pay-popup payment-popup zoom-anim-dialog mfp-hide"
            id="bank-pay"
          >
            <div class="payment-popup__title">Оформление заказа</div>
            <div class="payment-popup__order">
              Оплата заказа {{ orderUuid }}
              <span class="payment-popup__sum">{{ tariffPrice }} ₽</span>
            </div>

            <div class="requisites">
              <div class="requisites__item">
                <div class="requisites__name">Получатель платежа:</div>
                <div class="requisites__text">ИП Новиков Андрей Валерьевич</div>
              </div>
              <div class="requisites__item" v-if="tariffName">
                <div class="requisites__name">Наименование товара/услуги:</div>
                <div class="requisites__text">
                  {{ tariffName }}
                </div>
              </div>
              <div class="requisites__item">
                <div class="requisites__name">Получатель чека:</div>
                <div class="requisites__text">
                  {{ store.client.phoneNumber }}
                </div>
              </div>
              <div class="requisites__item">
                <div class="requisites__name">Метод оплаты:</div>
                <div class="requisites__text">Перевод на расчётный счет</div>
              </div>
            </div>

            <a href="#" class="btn btn--blue w-100 pay-popup__pay">Оплатить</a>

            <div class="pay-popup__policy">
              Ваши личные данные будут использоваться для обработки ваших
              заказов и других целей, описанных в нашей
              <a href="/conf_policy.pdf" target="_blank"
                >политике конфидециальности</a
              >, продолжая вы соглашаетесь с условиями
              <a href="/oferta.pdf" target="_blank">оферты</a>.
            </div>
          </div>

          <div
            v-if="type === 'account-pay'"
            class="pay-popup payment-popup zoom-anim-dialog mfp-hide"
            id="account-pay"
          >
            <div class="payment-popup__title">Оформление заказа</div>
            <div class="payment-popup__order">
              Оплата заказа {{ orderUuid }}
              <span class="payment-popup__sum">{{ tariffPrice }} ₽</span>
            </div>

            <div class="requisites">
              <div class="requisites__item">
                <div class="requisites__name">Получатель платежа:</div>
                <div class="requisites__text">ИП Новиков Андрей Валерьевич</div>
              </div>
              <div class="requisites__item" v-if="tariffName">
                <div class="requisites__name">Наименование товара/услуги:</div>
                <div class="requisites__text">
                  {{ tariffName }}
                </div>
              </div>
              <!-- <div class="requisites__item">
                <div class="requisites__name">Получатель чека:</div>
                <div class="requisites__text">
                  {{ store.client.phoneNumber }}
                </div>
              </div> -->
              <div class="requisites__item">
                <div class="requisites__name">Метод оплаты:</div>
                <div class="requisites__text">Перевод на расчётный счет</div>
              </div>
            </div>

            <div class="qr">
              <div class="pay-popup__subtitle">
                Быстрая оплата счета по QR-коду:
              </div>
              <div class="qr__inner">
                <ol class="qr__list">
                  <li>Открыть приложение банка на моб. телефоне.</li>
                  <li>Выбрать оплату по QR-коду.</li>
                  <li>Навести камеру телефона на QR-код счета.</li>
                  <li>Произвести оплату.</li>
                  <li>
                    Оплата будет зачислена автоматически в течение 3 часов.
                  </li>
                  <li>
                    Если у Вас возникли проблемы с платежом, напишите в
                    техническую поддержку портала.
                  </li>

                  <span  class="text-xs -mb-2"> &nbsp; </span>
                  <div
                    class="font-bold text-error"
                    v-if="!store.client.fizFace"
                  >
                    Перевод только с бизнес-карты организации! Не с карты
                    физического лица
                  </div>
                  <div v-else class="font-bold text-error">
                    Перевод осущесвляется с карты физического лица
                  </div>
                </ol>

                <div class="qr__img">
                  <nuxt-img :src="qr" />
                </div>
              </div>
            </div>

            <div class="requisites">
              <div class="pay-popup__subtitle">Реквизиты:</div>
              <div class="requisites__item">
                <div class="requisites__name">ИНН:</div>
                <div class="requisites__text">713602742755</div>

                <div
                  class="requisites__copy"
                  @click="copyToClipboard('713602742755')"
                >
                  <nuxt-img :src="`/icons/tarrifsImages/copy.svg`" />
                </div>
              </div>
              <!-- <div class="requisites__item">
                <div class="requisites__name">КПП</div>
                <div class="requisites__text">500701001</div>

                <div
                  class="requisites__copy"
                  @click="copyToClipboard('500701001')"
                >
                  <nuxt-img :src="`/icons/tarrifsImages/copy.svg`" />
                </div>
              </div> -->
              <div class="requisites__item">
                <div class="requisites__name">БИК</div>
                <div class="requisites__text">044525593</div>

                <div
                  class="requisites__copy"
                  @click="copyToClipboard('044525593')"
                >
                  <nuxt-img :src="`/icons/tarrifsImages/copy.svg`" />
                </div>
              </div>
              <div class="requisites__item">
                <div class="requisites__name">Р/С:</div>
                <div class="requisites__text">40802810401300014591</div>

                <div
                  class="requisites__copy"
                  @click="copyToClipboard('40802810401300014591')"
                >
                  <nuxt-img :src="`/icons/tarrifsImages/copy.svg`" />
                </div>
              </div>
              <div class="requisites__item">
                <div class="requisites__name">К/С:</div>
                <div class="requisites__text">30101810200000000593</div>

                <div
                  class="requisites__copy"
                  @click="copyToClipboard('30101810200000000593')"
                >
                  <nuxt-img :src="`/icons/tarrifsImages/copy.svg`" />
                </div>
              </div>
              <div class="requisites__item">
                <div class="requisites__name">Банк получателя:</div>
                <div class="requisites__text">АО "АЛЬФА-БАНК"</div>

                <div
                  class="requisites__copy"
                  @click="copyToClipboard('АО АЛЬФА-БАНК')"
                >
                  <nuxt-img :src="`/icons/tarrifsImages/copy.svg`" />
                </div>
              </div>
              <div class="requisites__item">
                <div class="requisites__name">Сумма:</div>
                <div class="requisites__text">{{ tariffPrice }} ₽</div>

                <div
                  class="requisites__copy"
                  @click="copyToClipboard(tariffPrice)"
                >
                  <nuxt-img :src="`/icons/tarrifsImages/copy.svg`" />
                </div>
              </div>
              <div class="requisites__item">
                <div class="requisites__name">Назначение платежа: </div>
                <div class="requisites__text">
                  {{ paymentPurpose }}
                </div>

                <div
                  class="requisites__copy"
                  @click="copyToClipboard(paymentPurpose)"
                >
                  <nuxt-img :src="`/icons/tarrifsImages/copy.svg`" />
                </div>
              </div>
            </div>

            <div class="pay-popup__policy">
              Ваши личные данные будут использоваться для обработки ваших
              заказов и других целей, описанных в нашей
              <a href="/conf_policy.pdf" target="_blank"
                >политике конфидециальности</a
              >, продолжая вы соглашаетесь с условиями
              <a href="/oferta.pdf" target="_blank">оферты</a>.
            </div>
          </div>

          <div
            v-if="type === 'credit-pay'"
            class="pay-popup payment-popup zoom-anim-dialog mfp-hide"
            id="credit-pay"
          >
            <div class="payment-popup__title">Оформление заказа</div>
            <div class="payment-popup__order">
              Оплата заказа {{ orderUuid }}
              <span class="payment-popup__sum">{{ tariffPrice }} ₽</span>
            </div>

            <div class="credit-list">
              <label
                @click="$emit('changeType', 'credit-sber')"
                class="credit-list__item btn-popup"
              >
                <div class="credit-list__img">
                  <nuxt-img :src="`/icons/tarrifsImages/bank4.svg`" />
                </div>
                <div class="credit-list__discr">
                  <div class="credit-list__name">В рассрочку от СберБанка</div>
                  <div class="credit-list__text">
                    Онлайн оформление за 5 минут, до 600 000 ₽ без переплаты
                  </div>
                </div>
              </label>
              <label
                @click="$emit('changeType', 'credit-tinkoff')"
                class="credit-list__item btn-popup"
              >
                <div class="credit-list__img">
                  <nuxt-img :src="`/icons/tarrifsImages/bank5.png`" />
                </div>
                <div class="credit-list__discr">
                  <div class="credit-list__name">
                    В рассрочку от Тинькофф Банка
                  </div>
                  <div class="credit-list__text">
                    Онлайн оформление за 5 минут, до 300 000 ₽ без переплаты
                  </div>
                </div>
              </label>
              <label
                @click="$emit('changeType', 'credit-home')"
                class="credit-list__item btn-popup"
              >
                <div class="credit-list__img">
                  <nuxt-img :src="`/icons/tarrifsImages/bank6.png`" />
                </div>
                <div class="credit-list__discr">
                  <div class="credit-list__name">
                    В рассрочку от «ХоумКредит»
                  </div>
                  <div class="credit-list__text">
                    Онлайн оформление за 5 минут, до 500 000 ₽ без переплаты
                  </div>
                </div>
              </label>
            </div>

            <div class="pay-popup__policy">
              Ваши личные данные будут использоваться для обработки ваших
              заказов и других целей, описанных в нашей
              <a href="/conf_policy.pdf" target="_blank"
                >политике конфидециальности</a
              >, продолжая вы соглашаетесь с условиями
              <a href="/oferta.pdf" target="_blank">оферты</a>.
            </div>
          </div>

          <div
            v-if="type === 'credit-sber'"
            class="pay-popup credit-popup zoom-anim-dialog mfp-hide"
            id="credit-bank1"
          >
            <div class="credit-popup__icon flex justify-center">
              <nuxt-img :src="`/icons/tarrifsImages/bank7.svg`" />
            </div>
            <div class="credit-popup__title">В рассрочку от СберБанка</div>
            <div class="credit-popup__subtitle">
              Онлайн оформление за 5 минут, до 600 000 ₽ без переплаты
            </div>

            <div class="credit-term">
              <div class="credit-term__term">Срок рассрочки:</div>
              <div class="credit-term__text">
                Выберите удобный срок оплаты рассрочки
              </div>

              <div class="credit-term__list">
                <label class="term-btn">
                  <input type="radio" name="term1" checked />
                  <span class="term-btn__inner">6 мес</span>
                </label>
                <label class="term-btn">
                  <input type="radio" name="term1" />
                  <span class="term-btn__inner">10 мес</span>
                </label>
                <label class="term-btn">
                  <input type="radio" name="term1" />
                  <span class="term-btn__inner">12 мес</span>
                </label>
              </div>
            </div>

            <div class="credit-info">
              <div class="credit-info__item">
                <div class="credit-info__text">
                  Оплата заказа {{ orderUuid }}
                </div>
                <div class="credit-info__sum">{{ tariffPrice }} ₽</div>
              </div>
              <div class="credit-info__item">
                <div class="credit-info__text">Прогноз выплат:</div>
                <div class="credit-info__sum">от 4 167 ₽ / мес</div>
              </div>
            </div>

            <a href="#" class="btn btn--blue w-100 pay-popup__btn">Выбрать</a>
          </div>

          <div
            v-if="type === 'credit-tinkoff'"
            class="pay-popup credit-popup zoom-anim-dialog mfp-hide"
            id="credit-bank2"
          >
            <div class="credit-popup__icon flex justify-center">
              <nuxt-img :src="`/icons/tarrifsImages/bank8.png`" />
            </div>
            <div class="credit-popup__title">В рассрочку от Тинькофф Банка</div>
            <div class="credit-popup__subtitle">
              Онлайн оформление за 5 минут, до 600 000 ₽ без переплаты
            </div>

            <div class="credit-term">
              <div class="credit-term__term">Срок рассрочки:</div>
              <div class="credit-term__text">
                Выберите удобный срок оплаты рассрочки
              </div>

              <div class="credit-term__list">
                <label class="term-btn">
                  <input type="radio" name="term2" checked />
                  <span class="term-btn__inner">6 мес</span>
                </label>
                <label class="term-btn">
                  <input type="radio" name="term2" />
                  <span class="term-btn__inner">10 мес</span>
                </label>
                <label class="term-btn">
                  <input type="radio" name="term2" />
                  <span class="term-btn__inner">12 мес</span>
                </label>
              </div>
            </div>

            <div class="credit-info">
              <div class="credit-info__item">
                <div class="credit-info__text">
                  Оплата заказа {{ orderUuid }}
                </div>
                <div class="credit-info__sum">{{ tariffPrice }} ₽</div>
              </div>
              <div class="credit-info__item">
                <div class="credit-info__text">Прогноз выплат:</div>
                <div class="credit-info__sum">от 4 167 ₽ / мес</div>
              </div>
            </div>

            <a href="#" class="btn btn--blue w-100 pay-popup__btn">Выбрать</a>
          </div>

          <div
            v-if="type === 'credit-home'"
            class="pay-popup credit-popup zoom-anim-dialog mfp-hide"
            id="credit-bank3"
          >
            <div class="credit-popup__icon flex justify-center">
              <nuxt-img :src="`/icons/tarrifsImages/bank9.png`" />
            </div>
            <div class="credit-popup__title">В рассрочку от ХоумКредит</div>
            <div class="credit-popup__subtitle">
              Онлайн оформление за 5 минут, до 600 000 ₽ без переплаты
            </div>

            <div class="credit-term">
              <div class="credit-term__term">Срок рассрочки:</div>
              <div class="credit-term__text">
                Выберите удобный срок оплаты рассрочки
              </div>

              <div class="credit-term__list">
                <label class="term-btn">
                  <input type="radio" name="term3" checked />
                  <span class="term-btn__inner">6 мес</span>
                </label>
                <label class="term-btn">
                  <input type="radio" name="term3" />
                  <span class="term-btn__inner">10 мес</span>
                </label>
                <label class="term-btn">
                  <input type="radio" name="term3" />
                  <span class="term-btn__inner">12 мес</span>
                </label>
              </div>
            </div>

            <div class="credit-info">
              <div class="credit-info__item">
                <div class="credit-info__text">
                  Оплата заказа {{ orderUuid }}
                </div>
                <div class="credit-info__sum">{{ tariffPrice }} ₽</div>
              </div>
              <div class="credit-info__item">
                <div class="credit-info__text">Прогноз выплат:</div>
                <div class="credit-info__sum">от 4 167 ₽ / мес</div>
              </div>
            </div>

            <a href="#" class="btn btn--blue w-100 pay-popup__btn">Выбрать</a>
          </div>

          <div
            v-if="type === 'balance'"
            class="balance-pay zoom-anim-dialog mfp-hide"
            id="balance-pay"
          >
            <div class="balance-pay__title">Введите сумму пополнения:</div>
            <!-- <select class="balance-pay__select">
              <option value="Wildberries">Wildberries</option>
              <option value="Ozon">Ozon</option>
              <option value="Яндекс Маркет">Яндекс Маркет</option>
              <option value="Сбермаркет">Сбермаркет</option>
              <option value="AliExpress">AliExpress</option>
              <option value="Lamoda">Lamoda</option>
              <option value="Avito">Avito</option>
              <option value="Магнит Маркет">Магнит Маркет</option>
            </select> -->

            <input
              type="text"
              class="balance-pay__input"
              value="25 000 ₽"
              placeholder="25 000 ₽"
            />

            <div class="balance-pay__list">
              <label class="balance-pay-btn">
                <input type="radio" name="balance-pay" checked />
                <span class="balance-pay-btn__inner">25 000 ₽</span>
              </label>
              <label class="balance-pay-btn">
                <input type="radio" name="balance-pay" />
                <span class="balance-pay-btn__inner">50 000 ₽</span>
              </label>
              <label class="balance-pay-btn">
                <input type="radio" name="balance-pay" />
                <span class="balance-pay-btn__inner">100 000 ₽</span>
              </label>
              <label class="balance-pay-btn">
                <input type="radio" name="balance-pay" />
                <span class="balance-pay-btn__inner">250 000 ₽</span>
              </label>
            </div>

            <div class="btn btn--blue w-100 balance-pay__btn">Далее</div>
          </div>

          <div class="error-list">
            <div class="error-list__item" id="form-error">
              Проверьте корректность заполнения полей
            </div>
            <div class="error-list__item" id="type-error">
              Выберите способ оплаты
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('~/assets/style/css/styles.scss');

::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #5a81fd;
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
