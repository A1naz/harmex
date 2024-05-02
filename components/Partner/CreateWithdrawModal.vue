<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'

const props = defineProps({
  state: {
    type: Boolean,
    required: true,
  },
})
const emit = defineEmits(['close', 'create'])

const currency = useCurrency()

const closeButton = ref<HTMLElement>()
const { $dayjs } = useNuxtApp()
const errorAmount = ref('')
const errorOrgName = ref('')
const errorInn = ref('')
const errorCard = ref('')
const errorFio= ref('')

const form = reactive({
  amount: 0,
  card: '',
  fio: '',
  orgName: '',
  inn: '',
  withdrawType: 'account',
})
async function createWithdraw() {
  if(!form.amount || form.amount <= 0) {
    errorAmount.value = 'Сумма не введена или меньше нуля'
  } else errorAmount.value = ''
  if(!form.orgName) {
    errorOrgName.value = 'Наименование ИП/ООО не введен'
  } else errorOrgName.value = ''
  if(!form.card) {
    errorCard.value = 'Номер карты / расчетный счет не введен'
  } else errorCard.value = ''
  if(!form.fio) {
    errorFio.value = 'ФИО не введено '
  } else errorFio.value = ''
  if(!form.inn) {
    errorInn.value = 'ИНН не введен'
  } else errorInn.value = ''
  if (form.withdrawType === 'card') {
    if (!form.amount || !form.card || !form.fio) return
  }

  const { data, error } = await useFetch('/api/partner/createWithdraw', {
    method: 'POST',
    body: form,
  })

  if (error.value)
    notify({
      type: 'error',
      title: 'Что-то пошло не так',
      text: error.value?.message,
    })

  if (data.value) {
    if (data.value.status === 'ok') {
      notify({ type: 'success', title: 'Вывод успешно создан' })     
      emit('create')
      form.amount = 0;
      form.card = '';
      form.fio = '';
      form.orgName = '';
      form.inn = '';
      form.withdrawType = 'account';
    } else {
      notify({
        type: 'error',
        title: 'Что-то пошло не так',
        text: data.value.message,
      })
    }
  }
}
const now = useNow()
onKeyStroke('Escape', (e) => {
  e.preventDefault()
  closeButton.value?.click()
  emit('close')
})

const isCardFormDisabled = computed(() => {
  return form.withdrawType !== 'account'
})
</script>

<template>
  <input id="review-modal" type="checkbox" class="modal-toggle" />
  <div
    ref="closeButton"
    :class="{
      'modal-open': state,
    }"
    class="modal backdrop-filter backdrop-blur-sm"
  >
    <div class="modal-box w-10/12 max-w-lg py-3 px-5">
      <label
        for="review-modal"
        class="btn btn-sm btn-circle absolute right-2 top-2 btn-ghost"
        @click="$emit('close')"
        >✕</label
      >
      <div class="mb-2">
        <h3 class="text-lg font-bold">Создание вывода</h3>
        <p>
          <span class="font-bold">Внимание!</span> Вывод возможен только на
          карту <span class="font-bold text-green-500">Сбербанка</span> или на
          баланс платфрмы
        </p>
        <p class="ml-1 mt-3">
          Вывести на:
        </p>
        <div class="flex flex-col mt-1">
          
          <div class="form-control">
            <label class="label justify-start cursor-pointer">
              <input
              type="radio"
              name="radio-10"
              class="radio radio-base-content"
              @change="form.withdrawType = 'account'"
              checked
              />
              <span class="label-text ml-2">Баланс платформы</span>
            </label>
          </div>
          <div class="form-control">
            <label class="label justify-start cursor-pointer">
              <input
              type="radio"
              name="radio-10"
              class="radio radio-base-content"
              @change="form.withdrawType = 'organization'"
              
              />
              <span class="label-text ml-2">Счет организации</span>
            </label>
          </div>
          <div class="form-control">
            <label class="label justify-start cursor-pointer">
              <input
              type="radio"
              name="radio-10"
              class="radio radio-base-content"
              @change="form.withdrawType = 'card'"
              />
              <span class="label-text ml-2">Счет самозанятых</span>
            </label>
          </div>
        </div>
        <form class="my-2 flex flex-col gap-2" @submit.prevent="createWithdraw">
          <div class="flex flex-col">
            <label class="label p-1">
              <span class="label-text text-gray-500 font-semibold">Сумма вывода</span>
            </label>
            <input
              v-model="form.amount"
              type="number"
              placeholder="Сумма"
              class="input bg-base-200 placeholder-gray-500 text-base-content w-full"
              :class="{ 'input-error': errorAmount }"
            />
            <span class="text-red-500 self-start">{{ errorAmount }}</span>
          </div>
          <div v-if="form.withdrawType !== 'account' && form.withdrawType !== 'card' ">
            <label class="label p-1">
              <span class="label-text text-gray-500 font-semibold">Наименование ИП/ООО</span>
            </label>
            <input
              :disabled="!isCardFormDisabled"
              v-model="form.orgName"
              type="text"
              placeholder="Иванов Иван Иванович "
              class="input bg-base-200 placeholder-gray-500 text-base-content  w-full"
              :class="{ 'input-error': errorOrgName }"
            />
            <span class="text-red-500 self-start">{{ errorOrgName  }}</span>
          </div>
          <div v-if="form.withdrawType !== 'account' && form.withdrawType !== 'organization' ">
            <label class="label p-1">
              <span class="label-text text-gray-500 font-semibold">ИНН</span>
            </label>
            <input
              :disabled="!isCardFormDisabled"
              v-model="form.inn"
              type="text"
              placeholder="2562542562542562 "
              class="input bg-base-200 placeholder-gray-500 text-base-content  w-full"
              :class="{ 'input-error': errorInn }"
            />
            <span class="text-red-500 self-start">{{ errorInn  }}</span>
          </div>
          <div v-if="form.withdrawType !== 'account'">
            <label class="label p-1">
              <span class="label-text text-gray-500 font-semibold">Номер карты / расчетный счет</span>
            </label>
            <input
              :disabled="!isCardFormDisabled"
              v-model="form.card"
              type="text"
              placeholder="220077777777777"
              class="input bg-base-200 placeholder-gray-500 text-base-content  w-full"
              :class="{ 'input-error': errorCard }"
            />
            <span class="text-red-500 self-start">{{ errorCard  }}</span>
          </div>
          <div v-if="form.withdrawType !== 'account'">
            <label class="label p-1">
              <span class="label-text text-gray-500 font-semibold">ФИО получателя</span>
            </label>
            <input
              :disabled="!isCardFormDisabled"
              v-model="form.fio"
              type="text"
              placeholder="Иванов Иван Иванович "
              class="input bg-base-200 placeholder-gray-500 text-base-content  w-full"
              :class="{ 'input-error': errorFio }"
            />
            <span class="text-red-500 self-start">{{ errorFio  }}</span>
          </div>
          <button class="btn btn-primary bg-opacity-20 border-none text-base-content btn-block mt-2">Вывести</button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
