<script setup lang="ts">
import { useNotification } from '@kyvg/vue3-notification'
import { onMounted } from 'vue'

const url = ref('')
const paymentForm = reactive({
  paymentSum: 25000,
  paymentType: 'transfer' as 'transfer' | 'fast',
})
const closePaymentModal: any = ref(null) as Ref<HTMLLabelElement | null>
const { notify } = useNotification()
const details = ref(null) as any
const loading = ref(false)
const timer = ref(1200)
const orderModal = ref(false)
const qrCodeImg = ref('')
const orderUuid = ref('')
const paymentPurpose = ref('')
const selectedType = ref('balance')
const faceType = ref('yurFace')

function cancelPayment() {
  url.value = ''
  details.value = null
}

async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text)
}

function setSum(amount: number) {
  paymentForm.paymentSum = amount
}

onMounted(() => {
  timer.value = 900
})

async function createPayment() {
  loading.value = true

  //@ts-ignore
  const { data, error }: any = await useFetch('/api/payment/getQR', {
    method: 'GET',
    query: {
      summ: paymentForm.paymentSum,
      faceType: faceType.value,
    },
  })

  if (data.value) {
    qrCodeImg.value = data.value.qrCode
    orderUuid.value = data.value.uuid
    paymentPurpose.value = data.value.purpose
    loading.value = false
    closePaymentModal.value?.click()
    orderModal.value = true
  } else {
    notify({ text: 'Произошла ошибка', type: 'error' })
    loading.value = false
    return
  }
}
function setType(e: any) {
  selectedType.value = e.value
}
</script>

<template>
  <input id="payment-modal" type="checkbox" class="modal-toggle"/>
  <div class="modal cursor-pointer" @click="[cancelPayment(), closePaymentModal.click()]" >
    <label class="modal-box" @click.stop>
      <label
        ref="closePaymentModal"
        for="payment-modal"
        class="btn btn-sm btn-circle btn-ghost absolute right-1 top-1"
        @click="cancelPayment"
        >✕</label
      >

      <div>
        <div class="w-full flex flex-col gap-2 justify-center items-start">
          <div class="sum w-full">
            <h3 class="text-lg mb-2">Введите сумму пополнения</h3>
            <select
              class="select select-bordered mb-2 w-full text-[15px]"
              v-model="selectedType"
            >
              <option disabled>Тип пополнения</option>
              <option value="tariff" disabled>Тарифный баланс</option>
              <option selected value="balance">
                Баланс на покупку товаров
              </option>
            </select>
            <!-- <select
              class="select select-bordered mb-2 w-full text-[15px]"
              v-model="faceType"
            >
              <option disabled>Тип переводящего лица</option>
              <option value="fizFace" disabled>Физическое лицо</option>
              <option selected value="yurFace">Юридическое лицо</option>
            </select> -->
            <div class="my-0.5 mx-2 text-[12px]">
              P.S. Финансовые средства зачисляются на баланс от 3х минут до 72
              часов
            </div>
            <PaymentInput v-model="paymentForm.paymentSum" />
          </div>
          <div class="fastbuttons flex gap-0.5 w-full mt-2">
            <button class="btn btn-sm flex-1" @click="setSum(25000)">
              25 000 ₽
            </button>
            <button class="btn btn-sm flex-1" @click="setSum(50000)">
              50 000 ₽
            </button>
            <button class="btn btn-sm flex-1" @click="setSum(100000)">
              100 000 ₽
            </button>
            <button class="btn btn-sm flex-1" @click="setSum(250000)">
              250 000 ₽
            </button>
          </div>
        </div>
      </div>
      <div class="modal-action justify-between">
        <button
          class="btn btn-primary w-full text-[16px]"
          @click="createPayment"
        >
          Далее
        </button>
      </div>
    </label>
    <div
      v-if="loading"
      style="background-color: rgb(37, 37, 42); opacity: 80%"
      class="fixed z-[50] top-0 left-0 right-0 bottom-0 w-full h-screen overflow-hidden flex flex-col items-center justify-center"
    >
      <div class="ease-linear rounded-full mb-4">
        <Icon name="mdi:loading" class="h-20 w-20 animate-spin text-white" />
      </div>
      <h2 class="text-center opacity-100 text-white text-xl font-semibold">
        Загрузка...
      </h2>
      <p
        v-if="paymentForm.paymentType === 'fast'"
        class="w-1/3 opacity-100 text-white text-center"
      >
        Создается ссылка для оплаты, <br />
        пожалуйста не закрывайте эту страницу
      </p>
      <p v-else class="w-1/3 opacity-100 text-white text-center">
        Идет получение данных для перевода, <br />
        пожалуйста не закрывайте эту страницу
      </p>
    </div>
  </div>
  <TariffsOrderModal
    :state="orderModal"
    :tariffPrice="
      paymentForm.paymentSum ? paymentForm.paymentSum.toString() : '1'
    "
    :type="'account-pay'"
    :qr="qrCodeImg"
    :orderUuid="orderUuid"
    :paymentPurpose="paymentPurpose"
    @close="orderModal = false"
  />
</template>

<style scoped></style>
