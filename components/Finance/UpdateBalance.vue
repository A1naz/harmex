<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
  show: { type: Boolean, required: true },
})

const emit = defineEmits(['close'])

function closeModal() {
  summ.value = 0
  form.value = 'addBalance'
  emit('close')
}

const summ = ref(0)
const summArr = [1000, 5000, 25000, 50000, 100000]
const form = ref('addBalance')
function balanceUpdate() {
  form.value = 'result'
}
</script>

<template>
  <input type="checkbox" id="selectUser" :checked="show" class="modal-toggle" />
  <div class="modal cursor-pointer z-[9999]" @click="closeModal">
    <div
      class="modal-box rounded-[8px] w-full sm:w-9/12 sm:max-w-2xl cursor-auto border py-[36px] px-[10px] sm:px-[40px] border-[#dee2e6]"
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
      <div v-if="form == 'addBalance'" class="flex flex-col w-full gap-[72]">
        <div
          class="flex flex-col w-full justify-center items-center gap-[15px] mb-[47px]"
        >
          <h1 class="text-xl font-bold">Пополнение счета</h1>
          <div class="flex flex-col gap-[4px] justify-start w-full">
            <span>{{ 'Сумма пополнения' }}</span>
            <input
              type="number"
              class="w-full input input-bordered rounded-lg p-2 mt-[4px]"
              placeholder="Введите сумму пополнения"
              v-model="summ"
            />
          </div>
          <div class="flex gap-[17px] justify-start w-full">
            <button
              @click="summ = item"
              v-for="item in summArr"
              class="px-[10px] border hover:bg-transparent hover:border-[#595959] hover:text-[#595959] rounded-[10px] py-1.5 bg-[#302e37] text-white"
            >
              {{ item }} ₽
            </button>
          </div>
        </div>
        <div class="flex gap-[16px] self-end">
          <button
            :disabled="!summ"
            @click="balanceUpdate"
            class="py-2 px-9 disabled:hover:text-white border rounded-lg disabled:bg-[#595959] disabled:border-[#595959] text-white bg-[#1b38ca] border-[#1b38ca] hover:bg-transparent hover:text-[#1b38ca] hover:border-[#1b38ca]"
          >
            Далеее
          </button>
        </div>
      </div>
      <div v-else class="flex flex-col w-full gap-[72]">
        <div
          class="flex flex-col w-full justify-center items-center gap-[20px]"
        >
          <h1 class="text-xl font-bold">Пополнение счета</h1>
          <div class="flex gap-[20px] justify-start w-full">
            <span class="text-lg font-semibold">{{
              'Оплата заказа №21239964 (4715)'
            }}</span>
            <div
              class="px-[5px] rounded-[5px] text-white bg-[#1b38ca] text-[0.95rem] flex items-center"
            >
              {{ summ }} ₽
            </div>
          </div>
          <div class="flex flex-col gap-[10px] w-full justify-start">
            <div
              class="flex flex-col rounded-[10px] leading-4 px-[13px] py-[7px] bg-[#f6f6f6]"
            >
              <span class="text-sm">Получатель платежа:</span>
              <span class="font-semibold">ИП Иванов Иван</span>
            </div>
            <div
              class="flex flex-col rounded-[10px] leading-4 px-[13px] py-[7px] bg-[#f6f6f6]"
            >
              <span class="text-sm">Метод оплаты:</span>
              <span class="font-semibold">Перевод на расчетный счет</span>
            </div>
          </div>
          <div class="flex flex-col gap-[10px] w-full justify-start">
            <span class="font-semibold">Быстрая оплата счета по QR-коду:</span>
            <div class="flex justify-around gap-4">
              <ol class="list-decimal pl-6 font-medium text-sm">
                <li>Откройте приложение банка на моб. телефоне.</li>
                <li>Выберите оплату по QR-коду.</li>
                <li>Наведите камеру телефона на QR-код счета.</li>
                <li>Произведите оплату.</li>
                <li>
                  Оплата будет зачислена автоматически в течении 3х часов.
                </li>
                <li>
                  Если у Вас возникли проблемы с платежом, напишите в
                  техническую поддержку портала.
                </li>
              </ol>
              <div
                class="flex flex-col w-full max-w-[200px] gap-[20px] items-end"
              >
                <NuxtImg
                  src="/icons/figma/finance/qrBalance.svg"
                  class="w-[197px] h-[187px]"
                />
                <span class="text-[#cc5f5f] leading-4 text-xs"
                  >Не изменяйте данные, иначе платеж не будет зачислен</span
                >
              </div>
            </div>
          </div>
          <div>
            <span class="text-[0.825rem]"
              >Ваши личные данные будут использоваться для обработки ваших
              заказов и других целей, описанных в нашей
              <a class="text-[#1b38ca] link no-underline hover:underline">политике конфидециальности</a>, продолжая вы соглашаетесь
              с условиями<a class="text-[#1b38ca] link no-underline hover:underline"> оферты</a>.</span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
