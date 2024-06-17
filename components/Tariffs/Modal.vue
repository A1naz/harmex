<script setup lang="ts">
const props = defineProps({
  state: {
    type: Boolean,
    required: true,
  },
})
const emit = defineEmits(['close'])

onKeyStroke('Escape', (e) => {
  e.preventDefault()
  emit('close')
})
</script>

<template>
  <div
    id="buyoutLogModal" :class="{
      'modal-open': state,
    }" class="modal"
    @click.self="$emit('close')"
  >
    <div v-if="state" class="modal-box max-w-fit">
      <div class="">
        <a class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 w-fit" @click="$emit('close')">✕</a>
        <div class="text-xl font-bold flex items-center gap-2 opacity-0">
          <IconCSS name="fluent:send-logging-24-filled" />
        </div>
        <div >
         <section>
            <div class='container'>
               <!-- <div class="page-btn">
                  <a href="#" class="btn-back">
  
                     <img src="assets/img/back.svg" alt="back">
                  </a>
               </div> -->
            
               <form class="payment validate">
                  <div class="payment__l">
                     <div class="h1 payment__title">Оформление заказа</div>
                     <div class="h2 mb-10">Платежный адрес</div>
                     <div class="payment-form">
                        <div class="formgroup">
                           <div class="label">Email</div>
                           <input type="text" name="email" placeholder="Выберите ваш еmail">
                        </div>
                        <div class="formgroup">
                           <div class="label">Имя</div>
                           <input type="text" name="name" placeholder="Выберите ваше имя">
                        </div>
                        <div class="formgroup">
                           <div class="label">Номер телефона</div>
                           <input type="tel" name="tel" placeholder="Выберите ваш номер телефона">
                        </div>
                     </div>

                     <div class="h2 mb-10">Оплата</div>
                     <div class="subtitle">Все операции защищены и зашифрованы.</div>

                     <div class="bank-list">
                        <label class="type-payment">
                           <input type="radio" name="type-payment" value="bank-pay">
                           <span class="type-payment__inner">
                              <span class="type-payment__img">
                                 <nuxt-img
                                    :src="`/icons/tarrifsImages/bank1.png`"
                                 />
                              </span>
                              <div class="type-payment__discr">
                                 <div class="type-payment__name">СБП</div>
                                 <div class="type-payment__text">Быстрый платеж через мобильное приложение.</div>
                              </div>
                           </span>
                        </label>
                        <label class="type-payment">
                           <input type="radio" name="type-payment" value="bank-pay">
                           <span class="type-payment__inner">
                              <span class="type-payment__img">
                                 <nuxt-img
                                    :src="`/icons/tarrifsImages/bank2.png`"
                                 />
                              </span>
                              <div class="type-payment__discr">
                                 <div class="type-payment__name">Viza/MasterCard/Мир/SberPay</div>
                                 <div class="type-payment__text">Оплата счета в рублях, дебетовые и кредитные карты .</div>
                              </div>
                           </span>
                        </label>
                        <label class="type-payment">
                           <input type="radio" name="type-payment" value="account-pay">
                           <span class="type-payment__inner">
                              <span class="type-payment__img">
                                 <nuxt-img
                                    :src="`/icons/tarrifsImages/bank3.png`"
                                 />
                              </span>
                              <div class="type-payment__discr">
                                 <div class="type-payment__name">Перевод на расчетный счет</div>
                                 <div class="type-payment__text">Оплата банковским переводом</div>
                              </div>
                           </span>
                        </label>
                        <label class="type-payment">
                           <input type="radio" name="type-payment" value="credit-pay">
                           <span class="type-payment__inner">
                              <span class="type-payment__img">
                                 <nuxt-img
                                    :src="`/icons/tarrifsImages/bank4.png`"
                                 />
                              </span>
                              <div class="type-payment__discr">
                                 <div class="type-payment__name">Рассрочка</div>
                                 <div class="type-payment__text">Заполните онлайн-заявку и получите одобрение за 60 секунд.</div>
                              </div>
                           </span>
                        </label>
                     </div>
                  </div>
                  <div class="payment__r">
                     <div class="payment-info">
                        <div class="payment-info__head">
                           <div class="h2">Название услуги: </div>
                           <div class="h2">Сумма:</div>
                        </div>
                        <div class="payment-info__body">
                           <div class="payment-info__text">Запуск под ключ, 12 месяцев, Тарифный план “Продвинутый” </div>
                           <div class="payment-info__summ">138 200 ₽</div>
                        </div>
                     </div>

                     <div class="table-services">
                        <div class="table-services__head">Таблица услуги</div>
                        <div class="table-services__body">
                           <div class="table-services__row">
                              <div class="table-services__col">Покупка товаров, шт.</div>
                              <div class="table-services__col">300</div>
                           </div>
                           <div class="table-services__row">
                              <div class="table-services__col">Публикация отзывов, шт.</div>
                              <div class="table-services__col">60</div>
                           </div>
                           <div class="table-services__row">
                              <div class="table-services__col">Лайки на бренд, шт.</div>
                              <div class="table-services__col">300</div>
                           </div>
                           <div class="table-services__row">
                              <div class="table-services__col">Вопросы бренду / товару, шт.</div>
                              <div class="table-services__col">60</div>
                           </div>
                           <div class="table-services__row">
                              <div class="table-services__col">Добавление в корзину, шт.</div>
                              <div class="table-services__col">300</div>
                           </div>
                           <div class="table-services__row">
                              <div class="table-services__col">Автоответы на отзывы, SKU</div>
                              <div class="table-services__col">7</div>
                           </div>
                           <div class="table-services__row">
                              <div class="table-services__col">Клики по карточке, шт.</div>
                              <div class="table-services__col">600</div>
                           </div>
                           <div class="table-services__row">
                              <div class="table-services__col">Выкуп в ближайшее время, шт.</div>
                              <div class="table-services__col">60</div>
                           </div>
                           <div class="table-services__row">
                              <div class="table-services__col">Добавление конкурентов в корзину, шт.</div>
                              <div class="table-services__col">125</div>
                           </div>
                           <div class="table-services__row">
                              <div class="table-services__col">Изучение карточки 60 секунд, шт.</div>
                              <div class="table-services__col">60</div>
                           </div>
                           <div class="table-services__row">
                              <div class="table-services__col">Выкупить с рекламы, шт.</div>
                              <div class="table-services__col">150</div>
                           </div>
                           <div class="table-services__row">
                              <div class="table-services__col">Выкупить с сортировки, шт.</div>
                              <div class="table-services__col">60</div>
                           </div>
                           <div class="table-services__row">
                              <div class="table-services__col">Технический менеджер</div>
                              <div class="table-services__col flex justify-center"
                              >
                                 <nuxt-img
                                    class="w-4 h-4"
                                    :src="`/icons/tarrifsImages/table-check.svg`"
                                 />
                              </div>
                           </div>
                           <div class="table-services__row">
                              <div class="table-services__col">Личный аккаунт менеджер</div>
                              <div class="table-services__col flex justify-center"
                              >
                                 <nuxt-img
                                    class="w-4 h-4"
                                    :src="`/icons/tarrifsImages/table-check.svg`"
                                 />
                              </div>
                           </div>
                        </div>
                     </div>

                     <div class="payment-policy">
                        Ваши личные данные будут использоваться для обработки ваших заказов и других целей, описанных в нашей <a href="#">политике конфидециальности</a>, продолжая вы соглашаетесь с условиями <a href="#">оферты</a>.
                     </div>

                     <div class="payment-total">
                        <div class="payment-total__price">
                           <span class="payment-total__text">Итог:</span>
                           <span class="payment-total__summ">138 200 ₽</span>
                        </div>

                        <button class="btn btn--black">Продолжить</button>
                     </div>
                  </div>
               </form>
            </div>
         </section>
        </div>
      </div>
    </div>
   
  </div>
</template>

<style scoped>
@import url('~/assets/style/css/styles.scss');
</style>
