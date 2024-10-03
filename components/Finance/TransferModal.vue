<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
  show: { type: Boolean, required: true },
})

const emit = defineEmits(['close'])

function closeModal() {
  form.value = ''
  summ.value = 0
  emit('close')
}

const summ = ref(0)
const summArr = [1000, 5000, 25000, 50000, 100000]
const user = ref({ username: '', email: '' }) as any
const wallet = ref({ title: '', value: '' })
const form = ref('')
function balanceUpdate() {
  form.value = 'result'
}

function setUserData(fieldData: any) {
  user.value = { username: fieldData.username, uuid: fieldData.uuid }
}
function searchUser(searchQuery: string) {
  user.value = searchQuery
}

function setWalletData(fieldData: any) {
  wallet.value = { title: fieldData.title, value: fieldData.value }
}

const btnDisabled = computed(() => {
  return (
    summ.value !== 0 && user.value.username !== '' && wallet.value.title !== ''
  )
})
</script>

<template>
  <input type="checkbox" id="selectUser" :checked="show" class="modal-toggle" />
  <div class="modal cursor-pointer z-[9999]">
    <div
      class="modal-box rounded-[8px] w-full z-[10000] sm:w-9/12 sm:max-w-2xl cursor-auto border py-[36px] px-[10px] sm:px-[40px] border-[#dee2e6]"
    >
      <form method="dialog">
        <label
          class="btn btn-sm btn-circle btn-ghost bg-[#e5e5e5] absolute right-2 top-2"
          @click="closeModal"
        >
          ✕
        </label>
      </form>
      <div v-if="form == 'result'" class="flex flex-col w-full gap-[72]">
        <div
          class="flex flex-col w-full justify-center items-center gap-[15px] mb-[47px]"
        >
          <h1 class="text-xl font-bold">
            Запрос на вывод средств отправлен успешно!
          </h1>
          <p class=" text-center"> 
            Наши специалисты обработают запрос в течении нескольких рабочих
            дней. Следите за статусом заявки в разделе "История выплат"
          </p>
        </div>
        <div class="flex gap-[16px] self-end">
          <button
            @click="balanceUpdate"
            class="py-2 px-9 disabled:hover:text-white border rounded-lg disabled:bg-[#595959] disabled:border-[#595959] text-white bg-[#1b38ca] border-[#1b38ca] hover:bg-transparent hover:text-[#1b38ca] hover:border-[#1b38ca]"
          >
            Посмотреть
          </button>
        </div>
      </div>
      <div v-else class="flex flex-col w-full gap-[72]">
        <div
          class="flex flex-col w-full justify-center items-center gap-[15px] mb-[47px]"
        >
          <h1 class="text-xl font-bold">Перевод средств</h1>
          <div class="flex flex-col gap-[4px] justify-start w-full">
            <span>{{ 'Сумма вывода' }}</span>
            <input
              type="number"
              class="w-full input input-bordered rounded-lg p-2 mt-[4px]"
              placeholder="Введите сумму перевода"
              v-model="summ"
            />
          </div>
          <div class="flex flex-col gap-[4px] justify-start w-full">
            <span>Пользователь</span>
            <MultiSelect
              :placeholder="'Выберите пользователя'"
              :currentData="[user]"
              :listData="[
                { username: '12312', uuid: '12312313' },
                { username: '123121', uuid: '112312313' },
              ]"
              :fieldToDisplay="'username'"
              :fieldToCheck="'uuid'"
              :listDataLoading="false"
              :currentDataLoading="false"
              @set-form-data="(fieldData: any) => setUserData(fieldData)"
              @search="(searchQuery: string) => searchUser(searchQuery)"
            />
          </div>
          <div class="flex flex-col gap-[4px] justify-start w-full">
            <span>Откуда</span>
            <MultiSelect
              :placeholder="'Введите откуда перевести средства'"
              :currentData="[wallet]"
              :listData="[
                { title: 'Кошелек', value: 'wallet' },
                { title: 'Партнерка', value: 'partner' },
              ]"
              :fieldToDisplay="'title'"
              :fieldToCheck="'value'"
              :listDataLoading="false"
              :currentDataLoading="false"
              @set-form-data="(fieldData: any) => setWalletData(fieldData)"
              :search="false"
            />
          </div>
          <div class="flex flex-col gap-[4px] justify-start w-full">
            <span>{{ 'Комментарий' }}</span>
            <input
              type="text"
              class="w-full input input-bordered rounded-lg p-2 mt-[4px]"
              placeholder="Введите комментарий"
            />
          </div>
        </div>
        <div class="flex gap-[16px] self-end">
          <button
            @click="closeModal"
            class="py-2 px-5 rounded-lg disabled:border-[#595959] disabled:text-[#595959] border disabled:hover:bg-transparent border-[#1b38ca] text-[#1b38ca] hover:bg-[#1b38ca] hover:text-white"
          >
            Отмена
          </button>
          <button
            :disabled="!btnDisabled"
            @click="balanceUpdate"
            class="py-2 px-9 disabled:hover:text-white border rounded-lg disabled:bg-[#595959] disabled:border-[#595959] text-white bg-[#1b38ca] border-[#1b38ca] hover:bg-transparent hover:text-[#1b38ca] hover:border-[#1b38ca]"
          >
            Вывести
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
