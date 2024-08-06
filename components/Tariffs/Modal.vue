<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'
import { email } from '@vuelidate/validators';
const props = defineProps({
  tariff: {
    type: Object as any,
    required: true,
  },
  tariffName: {
    type: String,
    required: true,
  },
  tariffPrice: {
    type: String,
    required: true,
  },
  form: {
    type: Object as any,
    required: true,
  },
  currentType: {
    type: String,
    required: true,
  },
  state: {
    type: Boolean,
    required: true,
  },
})
const emit = defineEmits(['close', 'continue'])
const orderType = ref('')
const form = reactive({
  email: '',
  name: '',
  phoneNumber: '',
})

const extractValues = (items: any) => {
  return items.map((item: any) => {
    return {
      value: item[props.form.dateRange.replace('months', '')],
      title: item.title,
    }
  })
}

const factorsValues = computed(() => {
  return extractValues(props.tariff.factors)
})
const ratingIncreaseValues = computed(() => {
  return extractValues(props.tariff.ratingIncrease)
})

function nextModal(type: string) {
  if(type === '') {
    notify({
      title: 'Ошибка',
      text: 'Выберите способ оплаты',
      type: 'error',
      duration: 2000,
    })
    return
  }
  if(form.phoneNumber.replace(/[\(\)\-\s]/g, '').length < 12 || form.name === '' || form.email === '')
  {
    notify({
      title: 'Ошибка',
      text: 'Введите корректные данные',
      type: 'error',
      duration: 2000,
    })
    return
  }

  emit('continue', type)
}

function clearData(){
  form.email = ''
  form.name = ''
  form.phoneNumber = ''
}

function closeModal(){
  clearData()
  emit('close')
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
    @click.self="closeModal"
  >
    <div v-if="state" class="modal-box rounded-none max-w-fit">
      <div class="">
        <a
          style="padding: 5px"
          class="btn btn-sm p-1 btn-circle btn-ghost absolute right-2 top-2 w-fit"
          @click="closeModal"
          >✕</a
        >
        <div>
          <section>
            <div class="container">
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
                      <input
                        v-model="form.email"
                        type="text"
                        name="email"
                        placeholder="Выберите ваш еmail"
                      />
                    </div>
                    <div class="formgroup">
                      <div class="label">Имя</div>
                      <input
                        v-model="form.name"
                        type="text"
                        name="name"
                        placeholder="Выберите ваше имя"
                      />
                    </div>
                    <div class="formgroup">
                      <div class="label">Номер телефона</div>
                      <input
                      v-model="form.phoneNumber"
                        type="tel"
                        name="tel"
                        placeholder="Выберите ваш номер телефона"
                        v-maska
                        data-maska="+7 (###) ###-##-##"
                        required="true"
                      />
                    </div>
                  </div>

                  <div class="h2 mb-10">Оплата</div>
                  <div class="subtitle">
                    Все операции защищены и зашифрованы.
                  </div>

                  <div class="bank-list">
                    <label class="type-payment" @click="orderType = 'bank-pay1'">
                      <input
                        :checked="orderType === 'bank-pay1'"
                        type="radio"
                        name="type-payment"
                        value="bank-pay"
                      />
                      <span class="type-payment__inner" >
                        <span class="type-payment__img">
                          <nuxt-img :src="`/icons/tarrifsImages/bank1.png`" />
                        </span>
                        <div class="type-payment__discr" >
                          <div class="type-payment__name">СБП</div>
                          <div class="type-payment__text">
                            Быстрый платеж через мобильное приложение.
                          </div>
                        </div>
                      </span>
                    </label>
                    <label class="type-payment" @click="orderType = 'bank-pay2'">
                      <input
                        :checked="orderType === 'bank-pay2'"
                        type="radio"
                        name="type-payment"
                        value="bank-pay"
                      />
                      <span class="type-payment__inner" >
                        <span class="type-payment__img">
                          <nuxt-img :src="`/icons/tarrifsImages/bank2.png`" />
                        </span>
                        <div class="type-payment__discr">
                          <div class="type-payment__name">
                            Viza/MasterCard/Мир/SberPay
                          </div>
                          <div class="type-payment__text">
                            Оплата счета в рублях, дебетовые и кредитные карты .
                          </div>
                        </div>
                      </span>
                    </label>
                    <label class="type-payment" @click="orderType = 'account-pay'" >
                      <input
                        :checked="orderType === 'account-pay'"
                        type="radio"
                        name="type-payment"
                        value="account-pay"
                      />
                      <span class="type-payment__inner" >
                        <span class="type-payment__img">
                          <nuxt-img :src="`/icons/tarrifsImages/bank3.png`" />
                        </span>
                        <div class="type-payment__discr">
                          <div class="type-payment__name">
                            Перевод на расчетный счет
                          </div>
                          <div class="type-payment__text">
                            Оплата банковским переводом
                          </div>
                        </div>
                      </span>
                    </label>
                    <label class="type-payment" @click="orderType = 'credit-pay'">
                      <input
                      :checked="orderType === 'credit-pay'"
                        type="radio"
                        name="type-payment"
                        value="credit-pay"
                      />
                      <span class="type-payment__inner">
                        <span class="type-payment__img">
                          <nuxt-img :src="`/icons/tarrifsImages/bank4.png`" />
                        </span>
                        <div class="type-payment__discr">
                          <div class="type-payment__name">Рассрочка</div>
                          <div class="type-payment__text">
                            Заполните онлайн-заявку и получите одобрение за 60
                            секунд.
                          </div>
                        </div>
                      </span>
                    </label>
                  </div>
                </div>
                <div class="payment__r">
                  <div class="payment-info">
                    <div class="payment-info__head">
                      <div class="h2">Название услуги:</div>
                      <div class="h2">Сумма:</div>
                    </div>
                    <div class="payment-info__body">
                      <div class="payment-info__text">
                        {{ tariffName }}
                      </div>
                      <div class="payment-info__summ">
                        {{
                          tariffPrice
                        }}
                        ₽
                      </div>
                    </div>
                  </div>

                  <div class="table-services">
                    <div
                      class="collapse collapse-arrow bg-base-100 rounded-box z-0"
                    >
                      <input checked type="checkbox" />
                      <div
                        class="collapse-title relative text-xl font-medium flex items-center"
                      >
                        <div class="table-services__head">Таблица услуги</div>
                      </div>
                      <div class="collapse-content pb-0">
                        <div class="overflow-x-auto hidden md:flex">
                          <table
                            class="table table-zebra border-b border-[#e5e7e8] dark:border-[#1a1817]"
                          >
                            <tbody class="table-services__body">
                              <tr
                                v-for="(value, index) in ratingIncreaseValues"
                                :key="index"
                                class="table-services__row"
                              >
                                <th
                                  class="w-1/5 border-r border-[#e5e7e8] dark:border-[#1a1817] table-services__col whitespace-nowrap"
                                >
                                  <span>{{ value.title }}</span>
                                </th>
                                <td
                                  class="w-1/5 text-center border-r border-[#e5e7e8] dark:border-[#1a1817] table-services__col"
                                >
                                  <Icon
                                    v-if="value.value === 0"
                                    name="mingcute:close-line"
                                    size="25"
                                    class="w-10 text-[#f9654b]"
                                  />
                                  <span>{{ value.value }}</span>
                                </td>
                              </tr>
                              <tr
                                v-for="(value, index) in factorsValues"
                                :key="index"
                                class="table-services__row"
                              >
                                <th
                                  class="w-1/5 border-r border-[#e5e7e8] dark:border-[#1a1817] table-services__col whitespace-nowrap"
                                >
                                  <span>{{ value.title }}</span>
                                </th>
                                <td
                                  class="w-1/5 text-center border-r border-[#e5e7e8] dark:border-[#1a1817] table-services__col"
                                >
                                  <Icon
                                    v-if="value.value === 0"
                                    name="mingcute:close-line"
                                    size="25"
                                    class="w-10 text-[#f9654b]"
                                  />
                                  <span>{{ value.value }}</span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="payment-policy">
                    Ваши личные данные будут использоваться для обработки ваших
                    заказов и других целей, описанных в нашей
                    <a href="#">политике конфидециальности</a>, продолжая вы
                    соглашаетесь с условиями <a href="#">оферты</a>.
                  </div>

                  <div class="payment-total">
                    <div class="payment-total__price">
                      <span class="payment-total__text">Итог:</span>
                      <span class="payment-total__summ">{{ tariffPrice }} ₽</span>
                    </div>

                    <button class="btn btn--black" @click.prevent @click="nextModal(orderType)">Продолжить</button>
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
