<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'

const props = defineProps({
  balance: { type: Number, required: true },
  refBalance: { type: Number, required: true },
  refCount: { type: Number, required: true },
  secondLevelReferrals: { type: Number, required: true },
  firstLevelReferrals: { type: Number, required: true },
  secondLevelPercent: { type: Number, required: true },
  refUrl: { type: String, required: true },
  rewardPercent: { type: Number, required: true },
  refLink: { type: Number, required: true },
})

const currency = useCurrency()

async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text)
  notify({
    title: 'Успешно',
    text: 'Скопировано в буфер обмена',
  })
}

const cards = [
  {
    cardType: 'visa',
    cardNumber: '1234 5678 9012 3456',
    cardHolder: 'Иванов Иван',
  },
  {
    cardType: 'mc',
    cardNumber: '1234 5678 9012 3456',
    cardHolder: 'Иванов Иван',
  },
]

const modalShow = ref(false)
const balanceModalShow = ref(false)
const transferModalShow = ref(false)
</script>

<template>
  <div class="w-full flex flex-col gap-[25px] max-w-[500px] mb-4">
    <div
      class="flex w-full bg-[#f5f7ff] rounded-lg drop-shadow-sm overflow-hidden"
    >
      <div class="flex flex-col w-full">
        <div class="flex justify-between px-[20px] py-[15px] mb-10">
          <div class="flex flex-col gap-[10px]">
            <span class="text-lg font-semibold">Общий баланс</span>
            <span class="font-bold text-xl">
              {{ currency.format(props.balance) || 0 }}
            </span>
          </div>
        </div>
        <div class="backgroundMini-div flex justify-start p-[14px]">
          <div
            class="bg-transparent self-end mb-5 flex flex-col py-[0.2rem] px-[0.3rem] rounded-lg drop-shadow-sm"
          >
            <span class="text-lg font-semibold">Кошелек: {{ currency.format(props.balance) || 0 }}</span>
            <span class="text-lg font-semibold">Партнерка: {{ currency.format(props.refBalance) || 0 }}</span>
          </div>
        </div>
      </div>
      <div class="relative flex justify-center items-center">
        <div
          v-for="(card, index) in cards"
          :class="
            index !== 0
              ? 'from-[#c5c5c5] to-[#dcdcdc] transform -translate-x-[76px] translate-y-0 z-0'
              : 'from-[#dcdcdc] to-[#c5c5c5] z-10'
          "
          class="border-4 border-[#dcdcdc] absolute rounded-[4rem] w-[300px] h-[300px] bg-gradient-to-r shadow-lg flex flex-col justify-between items-start text-white px-[31px] pt-[33px] pb-[44px]"
        >
          <nuxt-img
            class="w-20 h-20"
            :src="`icons/figma/finance/${card.cardType}.svg`"
          />

          <div class="flex flex-col justify-start text-black">
            <span class="text-lg tracking-wider">
              {{ card.cardNumber }}
            </span>
            <span>{{ card.cardHolder }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="flex gap-[5px] justify-center">
      <button
        class="btn btn-outline border-[#1b38ca] bg-white hover:bg-white hover:text-black hover:border-[#1b38ca] hover:shadow-xl active:bg-[#1934bd] active:text-white text-[14px] font-medium px-[70px] rounded-xl relative group"
        @click="modalShow = true"
      >
        <div class="flex items-center justify-center">
          <Icon
            name="solar:hand-money-linear"
            class="text-[#1b38ca] group-active:text-white"
            size="22px"
          />
          <span class="ml-3">Вывод</span>
        </div>
      </button>

      <!-- <button
        @click="transferModalShow = true"
        class="btn btn-outline border-[#1b38ca] bg-white hover:bg-white hover:text-black hover:border-[#1b38ca] hover:shadow-xl active:bg-[#1934bd] active:text-white text-[14px] font-medium px-[25px] rounded-xl relative group"
      >
        <div class="flex items-center justify-center">
          <Icon
            name="solar:hand-money-linear"
            class="text-[#1b38ca] group-active:text-white"
            size="22px"
          />
          <span class="ml-3">Перевод</span>
        </div>
      </button> -->

      <button
        class="btn btn-outline border-[#1b38ca] bg-white hover:bg-white hover:text-black hover:border-[#1b38ca] hover:shadow-xl active:bg-[#1934bd] active:text-white text-[14px] font-medium px-[70px] rounded-xl relative group"
        @click="balanceModalShow = true"
      >
        <div class="flex items-center justify-center">
          <Icon
            name="solar:hand-money-linear"
            class="text-[#1b38ca] group-active:text-white"
            size="22px"
          />
          <span class="ml-3">Пополнение</span>
        </div>
      </button>
    </div>

    <div class="w-full bg-[#f5f7ff] rounded-lg drop-shadow-sm">
      <div class="flex justify-between p-[14px]">
        <div class="flex flex-col gap-[10px]">
          <span class="text-lg font-semibold">Партнерский счет</span>
          <span class="font-bold text-xl">
            {{ currency.format(props.refBalance) || 0 }}
          </span>
        </div>
        <div class="flex w-2/5">
          <span
            class="text-sm text-center text-[#909090] flex-wrap whitespace-pre-wrap"
          >Доходность зависит от количества приглашенных пользователей</span>
        </div>
      </div>
      <div class="background-div flex justify-start">
        <div
          class="bg-base-100 self-start ml-3 flex flex-col py-[0.4rem] px-[0.5rem] rounded-lg drop-shadow-sm"
        >
          <div class="font-bold text-[0.9rem] whitespace-nowrap">
            {{ `${firstLevelReferrals} человек` }}
          </div>
          <div class="text-primary text-sm text-center">
            {{ `${firstLevelReferrals * 750} ₽` }}
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-5 w-full">
      <div class="bg-[#f5f7ff] rounded-lg px-5 flex flex-col gap-[18px] py-3">
        <div class="flex gap-2">
          <h2 class="text-lg font-bold">
            Партнерка
          </h2>
        </div>
        <div class="flex flex-col gap-[15px]">
          <div
            class="bg-white rounded-lg px-[15px] py-2.5 border border-[#ededed]"
          >
            <h3 class="mb-3">
              Реферальная ссылка
            </h3>

            <div
              class="bg-[#F7F7F7] rounded-lg p-3 flex gap-1 w-full justify-between self-end mt-auto"
            >
              <span
                class="cursor-pointer hover:underline truncate"
                @click="copyToClipboard(refUrl)"
              >{{ refUrl }}
              </span>
              <button
                class="text-primary text-opacity-50 hover:text-opacity-100"
                @click="copyToClipboard(refUrl)"
              >
                <IconCSS
                  name="solar:copy-outline"
                  size="30"
                  class="text-[#909090]"
                />
              </button>
            </div>
          </div>

          <div
            class="bg-white rounded-lg px-[15px] py-2.5 border border-[#ededed]"
          >
            <h3 class="mb-1 sm:mb-3">
              QR-код:
            </h3>
            <div
              class="join bg-white rounded-lg border border-none flex justify-between gap-2 items-center justify-self-end w-full"
            >
              <div class="join-item bg-[#F7F7F7] rounded-lg w-full flex gap-1 ">
                <button
                  class="w-full text-[#1B38CA] hover:text-opacity-100 m-3 flex items-center gap-3"
                >
                  <img
                    class="w-6 h-6 rounded-none"
                    src="/icons/figma/finance/qrIcon.svg"
                    alt="qr"
                  >
                  <span class="white-space-nowrap text-sm text-[#1B38CA]">QR-код</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <FinanceWithdrawModal :show="modalShow" @close="modalShow = false" />
  <FinanceUpdateBalance
    :show="balanceModalShow"
    @close="balanceModalShow = false"
  />
  <FinanceTransferModal
    :show="transferModalShow"
    @close="transferModalShow = false"
  />
</template>

<style scoped>
.background-div {
  width: 100%;
  height: 160px;
  background-image: url('/icons/figma/finance/graph.svg');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: top;
}

.backgroundMini-div {
  width: 100%;
  height: 200px;
  background-image: url('/icons/figma/finance/miniGraph.svg');
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
}

</style>
