<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
  show: { type: Boolean, required: true },
})

const emit = defineEmits(['close'])

function closeModal() {
  emit('close')
  modalType.value = 'choice'
  selectedWalletType.value = null
  walletError.value.value = false
  ipForm.value.forEach((item: any) => {
    item.value = ''
    item.error = false
  })
  oooForm.value.forEach((item: any) => {
    item.value = ''
    item.error = false
  })
  selfForm.value.forEach((item: any) => {
    item.value = ''
    item.error = false
  })
  selectedOption.value = null
}

const modalType = ref('choice')
const form = ref(['ИП', 'ООО', 'Самозанятость'])
const selectedOption = ref<string | null>(null)
function changeForm() {
  if (selectedOption.value == 'ИП') {
    modalType.value = 'ip'
  } else if (selectedOption.value == 'ООО') {
    modalType.value = 'ooo'
  } else if (selectedOption.value == 'Самозанятость') {
    modalType.value = 'self'
  }
}

const walletType = ref([
  {
    label: 'wallet',
    title: 'Кошелек',
    checked: false,
  },
  {
    label: 'partner',
    title: 'Партнерка',
    checked: false,
  },
])
const walletError = ref({ title: 'Выберите счет списания', value: false })
const selectedWalletType = ref<string | null>(null)

const ipForm = ref([
  {
    label: 'summ',
    title: 'Сумма вывода',
    placeholder: 'Введите сумму вывода',
    inputType: 'number',
    value: '',
    error: false,
    errorText: 'Введите сумму вывода',
  },
  {
    label: 'inn',
    title: 'ИНН',
    placeholder: 'Введите ИНН',
    inputType: 'number',
    value: '',
    error: false,
    errorText: 'Введите ИНН',
  },
  {
    label: 'naimenovanie',
    title: 'Наименование ИП',
    placeholder: 'Введите Наименование ИП',
    inputType: 'text',
    value: '',
    error: false,
    errorText: 'Введите Наименование ИП',
  },
  {
    label: 'check',
    title: 'Рассчетный счет',
    placeholder: 'Введите рассчетный счет',
    inputType: 'number',
    value: '',
    error: false,
    errorText: 'Введите рассчетный счет',
  },
  {
    label: 'bik',
    title: 'БИК',
    placeholder: '22552245',
    inputType: 'number',
    value: '',
    error: false,
    errorText: 'Введите БИК',
  },
])

const oooForm = ref([
  {
    label: 'summ',
    title: 'Сумма вывода',
    placeholder: 'Введите сумму вывода',
    inputType: 'number',
    value: '',
    error: false,
    errorText: 'Введите сумму вывода',
  },
  {
    label: 'inn',
    title: 'ИНН',
    placeholder: 'Введите ИНН',
    inputType: 'number',
    value: '',
    error: false,
    errorText: 'Введите ИНН',
  },
  {
    label: 'naimenovanie',
    title: 'Наименование ООО',
    placeholder: 'Введите Наименование ООО',
    inputType: 'text',
    value: '',
    error: false,
    errorText: 'Введите Наименование ИП',
  },
  {
    label: 'check',
    title: 'Рассчетный счет',
    placeholder: 'Введите рассчетный счет',
    inputType: 'number',
    value: '',
    error: false,
    errorText: 'Введите рассчетный счет',
  },
  {
    label: 'bik',
    title: 'БИК',
    placeholder: '22552245',
    inputType: 'number',
    value: '',
    error: false,
    errorText: 'Введите БИК',
  },
])

const selfForm = ref([
  {
    label: 'summ',
    title: 'Сумма вывода',
    placeholder: 'Введите сумму вывода',
    inputType: 'number',
    value: '',
    error: false,
    errorText: 'Введите сумму вывода',
  },
  {
    label: 'card',
    title: 'Номер карты',
    placeholder: '2255224569852355',
    inputType: 'number',
    value: '',
    error: false,
    errorText: 'Введите номер карты',
  },
])

function withdraw(type: any) {
  if (!selectedWalletType.value) {
    walletError.value.value = true
  } else {
    walletError.value.value = false
  }

  let withdrawForm = [] as any
  if (type === 'ip') {
    withdrawForm = ipForm.value
  } else if (type === 'ooo') {
    withdrawForm = oooForm.value
  }

  withdrawForm.forEach((item: any) => {
    if (!item.value) {
      item.error = true
    } else {
      item.error = false
    }
  })

  const isError = withdrawForm.some((item: any) => item.error)
  if (isError || walletError.value.value) {
    return
  }

  modalType.value = 'finalForm'
}
</script>

<template>
  <input type="checkbox" id="selectUser" :checked="show" class="modal-toggle" />
  <div class="modal cursor-pointer z-[9999]" @click="closeModal">
    <div
      class="modal-box rounded-[8px] w-full sm:w-9/12 sm:max-w-2xl cursor-auto border py-[36px] px-[10px] sm:px-[58px] border-[#dee2e6]"
      @click.stop
    >
      <form method="dialog">
        <label
          class="btn btn-sm btn-circle btn-ghost bg-[#e5e5e5] absolute right-2 top-2"
          @click="closeModal"
        >
          ✕
        </label>
      </form>

      <!-- ///choice form  -->
      <div v-if="modalType === 'choice'" class="flex flex-col w-full gap-[72]">
        <div
          class="flex flex-col w-full justify-center items-center gap-[15px] mb-[47px]"
        >
          <h1 class="text-2xl font-bold">Вывод средств</h1>
          <span class="text-lg">Выберите куда хотите вывести средства</span>

          <div class="flex gap-[31px]">
            <div
              v-for="(option, index) in form"
              :key="index"
              class="inline-flex items-center"
            >
              <label
                class="flex items-center cursor-pointer relative"
                :for="'check-' + index"
              >
                <input
                  type="radio"
                  :value="option"
                  v-model="selectedOption"
                  class="peer h-5 w-5 rounded-full cursor-pointer transition-all appearance-none shadow hover:shadow-md border border-slate-300 checked:bg-[#0624bd] checked:border-[#0624bd]"
                  :id="'check-' + index"
                />
                <span
                  class="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3.5 w-3.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    stroke="currentColor"
                    stroke-width="1"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </span>
                <span
                  class="absolute inset-0 rounded-full border border-transparent peer-checked:border-[#0624bd] peer-checked:scale-125 transition-all"
                ></span>
              </label>
              <label
                class="cursor-pointer ml-2 text-slate-600 text-sm"
                :for="'check-' + index"
              >
                {{ option }}
              </label>
            </div>
          </div>
        </div>

        <div class="flex gap-[16px] self-end">
          <button
            :disabled="!selectedOption"
            @click="closeModal"
            class="py-2 px-5 rounded-lg disabled:border-[#595959] disabled:text-[#595959] border disabled:hover:bg-transparent border-[#1b38ca] text-[#1b38ca] hover:bg-[#1b38ca] hover:text-white"
          >
            Отменить
          </button>
          <button
            :disabled="!selectedOption"
            @click="changeForm"
            class="py-2 px-9 disabled:hover:text-white border rounded-lg disabled:bg-[#595959] disabled:border-[#595959] text-white bg-[#1b38ca] border-[#1b38ca] hover:bg-transparent hover:text-[#1b38ca] hover:border-[#1b38ca]"
          >
            Далее
          </button>
        </div>
      </div>

      <div
        v-if="modalType === 'ip' || modalType === 'ooo' || modalType === 'self'"
        class="flex flex-col w-full gap-[72]"
      >
        <div
          class="flex flex-col w-full justify-center items-center gap-[15px] mb-[47px]"
        >
          <h1 class="text-2xl font-bold">
            Вывод средств на
            {{
              modalType == 'ip'
                ? 'ИП'
                : modalType == 'ooo'
                ? 'ООО'
                : 'Самозанятый'
            }}
          </h1>
          <span class="text-lg">Выберите откуда хотите вывести средства</span>

          <div class="flex gap-[31px] justify-start w-full">
            <div
              v-for="(option, index) in walletType"
              :key="index"
              class="inline-flex items-center"
            >
              <label
                class="flex items-center cursor-pointer relative"
                :for="'check-' + index"
              >
                <input
                  type="radio"
                  :value="option"
                  v-model="selectedWalletType"
                  class="peer h-5 w-5 rounded-full cursor-pointer transition-all appearance-none shadow hover:shadow-md border border-slate-300 checked:bg-[#0624bd] checked:border-[#0624bd]"
                  :id="'check-' + index"
                />
                <span
                  class="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3.5 w-3.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    stroke="currentColor"
                    stroke-width="1"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </span>
                <span
                  class="absolute inset-0 rounded-full border border-transparent peer-checked:border-[#0624bd] peer-checked:scale-125 transition-all"
                ></span>
              </label>
              <label
                class="cursor-pointer ml-2 text-slate-600"
                :for="'check-' + index"
              >
                {{ option.title }}
              </label>
            </div>
          </div>
          <span
            v-if="walletError.value"
            class="text-[#cc5f5f] flex justify-start w-full"
            >{{ walletError.title }}</span
          >

          <div
            v-for="option in modalType === 'ip'
              ? ipForm
              : modalType === 'ooo'
              ? oooForm
              : selfForm"
            class="flex flex-col gap-[4px] justify-start w-full"
          >
            <span>{{ option.title }}</span>
            <input
              :type="option.inputType"
              :class="option.error ? 'border-[#cc5f5f]' : ''"
              class="w-full input input-bordered rounded-lg p-2"
              :placeholder="option.placeholder"
              v-model="option.value"
            />
            <span v-if="option.error" class="text-[#cc5f5f]">{{
              option.errorText
            }}</span>
          </div>
        </div>

        <div class="flex gap-[16px] self-end">
          <button
            @click="modalType = 'choice'"
            class="py-2 px-5 rounded-lg disabled:border-[#595959] disabled:text-[#595959] border disabled:hover:bg-transparent border-[#1b38ca] text-[#1b38ca] hover:bg-[#1b38ca] hover:text-white"
          >
            Назад
          </button>
          <button
            @click="withdraw(modalType)"
            class="py-2 px-9 disabled:hover:text-white border rounded-lg disabled:bg-[#595959] disabled:border-[#595959] text-white bg-[#1b38ca] border-[#1b38ca] hover:bg-transparent hover:text-[#1b38ca] hover:border-[#1b38ca]"
          >
            Вывести
          </button>
        </div>
      </div>

      <div
        v-if="modalType === 'finalForm'"
        class="flex flex-col w-full gap-[72]"
      >
        <div
          class="flex flex-col w-full justify-center items-center gap-[15px] mb-[47px]"
        >
          <h1 class="text-xl font-bold">Запрос на вывод средств отправлен успешно!</h1>
          <span class="text-[0.925rem] leading-5	text-center ">Наши специалисты обработают запрос в течении нескольких рабочих дней. Следите за статусом заявки в разделе "История выплат"</span>

        </div>

        <div class="flex gap-[16px] self-end">
          <button
            class="py-2 px-9 disabled:hover:text-white border rounded-lg disabled:bg-[#595959] disabled:border-[#595959] text-white bg-[#1b38ca] border-[#1b38ca] hover:bg-transparent hover:text-[#1b38ca] hover:border-[#1b38ca]"
          >
            Посмотреть
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
