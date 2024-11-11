<!-- eslint-disable ts/no-use-before-define -->
<script setup lang="ts">
const props = defineProps({
  show: { type: Boolean, required: true },
})

const emit = defineEmits(['close'])
const currency = useCurrency()
function closeModal() {
  emit('close')
  modalType.value = 'choice'
  selectedWalletType.value = null
  walletError.value.value = false
  selectedOption.value = null
}

const modalType = ref('choice')
const form = ref(['Личный баланс', 'Партнерская программа'])
const selectedOption = ref<string | null>(null)

const walletError = ref({ title: 'Выберите счет списания', value: false })
const selectedWalletType = ref<string | null>('wallet')
const amountRaw = ref(0)
const partnerAgreement = ref(false)

async function getPartnerAgreement() {
  const { data }: any = await useFetch('/api/finance/partnerAgreement')
  partnerAgreement.value = data.value
}

await getPartnerAgreement()

const withdrawForm = ref({
  amount: currency.format(amountRaw.value),
  walletType: modalType.value,
})
const formattedAmount = ref(currency.format(amountRaw.value))
function formatCurrency(value: number) {
  return currency.format(value)
}
function updateAmount(event: Event) {
  const input = event.target as HTMLInputElement
  const value = input.value.replace(/[^\d.,]/g, '')

  // Convert value to a number and then back to string to remove extraneous characters
  if (value === '') {
    amountRaw.value = 0
    formattedAmount.value = ''
  }
  else {
    amountRaw.value = Number.parseFloat(value.replace(/,/g, ''))
    if (!Number.isNaN(amountRaw.value)) {
      formattedAmount.value = formatCurrency(amountRaw.value)
    }
  }

  withdrawForm.value.amount = formattedAmount.value
}
</script>

<template>
  <input id="selectUser" type="checkbox" :checked="show" class="modal-toggle">
  <div class="modal cursor-pointer z-[9999]" @click="closeModal">
    <div
      class="modal-box rounded-[8px] w-full sm:w-9/12 sm:max-w-2xl cursor-auto border py-[36px] px-[10px] sm:px-[58px] border-[#dee2e6]"
      @click.stop
    >
      <form method="dialog">
        <label class="btn btn-sm btn-circle btn-ghost bg-[#e5e5e5] absolute right-2 top-2" @click="closeModal">
          ✕
        </label>
      </form>

      <!-- ///choice form  -->
      <div v-if="modalType === 'choice'" class="flex flex-col w-full gap-[72]">
        <div class="flex flex-col w-full justify-center items-center gap-4">
          <h1 class="text-2xl font-bold">
            Вывод средств
          </h1>
          <div class="text-lg">
            Выберите откуда вывести средства
          </div>

          <div class="flex flex-col gap-4 w-full">
            <button class="btn btn-ghost bg-base-200 w-full hover:text-blue-500 hover:bg-blue-50 shadow-none drop-shadow-none" @click="modalType = 'baseBalance'">
              <span class="text-base-content">Личный баланс</span>
              <Icon class="ml-auto" name="tabler:arrow-right" size="24" />
            </button>
            <button class="btn btn-ghost bg-base-200 w-full hover:text-blue-500 hover:bg-blue-50" @click="modalType = 'partnerBalance'">
              <span class="text-base-content">Партнерская программа</span>
              <Icon class="ml-auto " name="tabler:arrow-right" size="24" />
            </button>
          </div>
        </div>
      </div>
      <!-- ///baseBalance form  -->
      <div v-if="modalType === 'baseBalance'">
        <div class="flex flex-col w-full justify-center gap-4">
          <h1 class="text-2xl font-bold">
            Вывод средств c личного кабинента
            <div class="text-sm text-[#e04141] font-normal">
              Вывод осуществляется в течение 14 дней с даты подачи заявки
            </div>
          </h1>
          
          <div>
            <div class="label">
              <span class="label-text text-primary">Сумма вывода</span>
            </div>
            <input
              v-model.lazy="formattedAmount"
              type="text"
              placeholder="Введите сумму вывода" class="input input-primary w-full" @input="updateAmount"
            >
          </div>

          <div class="agreement flex gap-2 items-center w-full">
            Пользовательское соглашение
            <NuxtLink to="/agreement.pdf" class="link link-primary">
              Скачать
            </NuxtLink>
          </div>
          <div class="w-full flex justify-end">
            <button class="btn btn-primary" @click="modalType = 'finalForm'">
              Вывести
            </button>
          </div>
        </div>
      </div>
      <!-- ///partnerBalance form  -->
      <div v-if="modalType === 'partnerBalance'">
        <div class="flex flex-col w-full justify-center gap-4">
          <h1 class="text-2xl font-bold">
            Вывод средств c партнерской программы
            <div class="text-sm text-[#e04141] font-normal">
              Вывод осуществляется в течение 14 дней с даты подачи заявки
            </div>
          </h1>
          <div>
            <div class="label">
              <span class="label-text text-primary">Сумма вывода</span>
            </div>
            <input
              v-model.lazy="formattedAmount"
              type="text"
              placeholder="Введите сумму вывода" class="input input-primary w-full" @input="updateAmount"
            >
          </div>
          <div v-if="partnerAgreement" class="agreement flex gap-2 items-center w-full">
            Партнёрское соглашение
            <NuxtLink to="/agreement.pdf" class="link link-primary">
              Скачать
            </NuxtLink>
          </div>
          <div v-else>
            Партнёрское соглашение не заключено
            <NuxtLinkLocale class="link link-primary" to="/profile?partnerDetailsModal=true">
              Перейти
            </NuxtLinkLocale>
          </div>
          <div class="w-full flex justify-end">
            <button :disabled="!partnerAgreement" class="btn btn-primary" @click="modalType = 'finalForm'">
              Вывести
            </button>
          </div>
        </div>
      </div>
      <div v-if="modalType === 'finalForm'" class="flex flex-col w-full gap-[72]">
        <div class="flex flex-col w-full justify-center items-center gap-[15px] mb-[47px]">
          <h1 class="text-xl font-bold">
            Запрос на вывод средств отправлен успешно!
          </h1>
          <span class="text-[0.925rem] leading-5 text-center">Наши специалисты обработают запрос в течении нескольких
            рабочих дней. Следите за статусом заявки в разделе "История выплат"</span>
        </div>

        <div class="flex gap-[16px] self-end">
          <button
            class="py-2 px-9 disabled:hover:text-white border rounded-lg disabled:bg-[#595959] disabled:border-[#595959] text-white bg-[#1b38ca] border-blue-800 hover:bg-transparent hover:text-[#1b38ca] hover:border-blue-800"
          >
            Посмотреть
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn-ghost{
  box-shadow: none;
}</style>
