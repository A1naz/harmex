<script setup lang="ts">

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
const { notify } = useNotification()

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
const qrCode = ref('')
const qrLoading = ref(false)

async function getQr() {
  qrLoading.value = true
  const { data }: any = await useFetch('/api/finance/getCode', {
    method: 'GET',
    query: {
      refUrl: props.refUrl,
    },
  })
  qrCode.value = data.value.qrCode
  qrLoading.value = false
}
getQr()

async function copyImageToClipboard(base64Image: any) {
  try {
    const binaryData = atob(base64Image.split(',')[1])
    const arrayBuffer = new ArrayBuffer(binaryData.length)
    const uint8Array = new Uint8Array(arrayBuffer)
    for (let i = 0; i < binaryData.length; i++) {
      uint8Array[i] = binaryData.charCodeAt(i)
    }

    const blob = new Blob([uint8Array], { type: 'image/png' })

    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ])
    useFetch('/api/partner/isShared', { method: 'GET' })
    notify({
      title: 'Изображение скопировано в буфер обмена',
    })
  } catch (error) {
    // console.error('Ошибка при копировании изображения в буфер обмена:', error);
    notify({
      title: 'Ошибка при копировании изображения',
    })
  }
}
</script>

<template>
  <div class="w-full flex flex-col gap-[25px] max-w-[400px] mb-4">
    <div
      class="flex w-full bg-[#f5f7ff] rounded-lg drop-shadow-sm overflow-hidden"
    >
      <div class="flex flex-col w-full">
        <div class="flex justify-between px-[20px] py-[15px] mb-20">
          <div class="flex flex-col gap-[6px]">
            <span class="text-lg font-semibold">Общий баланс</span>
            <span class="font-bold text-xl">
              {{ currency.format(props.balance) || 0 }}
            </span>
          </div>

          <div class="flex gap-2 items-start p-1">
            <nuxt-img width="40" src="/icons/figma/finance/mc.svg" />
            <nuxt-img width="40" src="/icons/figma/finance/visa.svg" />
          </div>
        </div>
        <div class="flex justify-between p-[14px]">
          <div
            class="bg-transparent self-end flex flex-col py-[0.2rem] px-[0.3rem] rounded-lg drop-shadow-sm"
          >
            <span class=" font-normal">Партнерка</span>
            <span class="text-lg font-semibold">{{ currency.format(props.refBalance) || 0 }}</span>

          </div>
          <div
            class="bg-transparent self-end flex flex-col py-[0.2rem] px-[0.3rem] rounded-lg drop-shadow-sm"
          >
            <span class=" font-normal white">Кошелек</span>
            <span class="text-lg font-semibold white">{{ currency.format(props.balance) || 0 }}</span>

          </div>


        </div>
      </div>
    </div>

    <div class="flex gap-[5px] justify-center">
      <button
        class="btn btn-outline border-[#e46e46] bg-white hover:bg-white hover:text-black hover:border-[#e46e46] hover:shadow-xl active:bg-[#e46e46] active:text-white text-[14px] font-medium px-[50px] rounded-xl relative group"
        @click="modalShow = true"
      >
        <div class="flex items-center justify-center">
          <Icon
            name="solar:hand-money-linear"
            class="text-[#e46e46] group-active:text-white"
            size="22px"
          />
          <span class="ml-3 text-[#e46e46] group-active:text-white">Вывод</span>
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
        class="btn btn-outline border-[#e46e46] bg-white hover:bg-white hover:text-black hover:border-[#e46e46] hover:shadow-xl active:bg-[#e46e46] active:text-white text-[14px] font-medium px-[40px] rounded-xl relative group"
        @click="balanceModalShow = true"
      >
        <div class="flex items-center justify-center">
          <Icon
            name="solar:hand-money-linear"
            class="text-[#e46e46] group-active:text-white"
            size="22px"
          />
          <span class="ml-3  text-[#e46e46] group-active:text-white">Пополнение</span>
        </div>
      </button>
    </div>

    <div class="flex flex-col w-full  rounded-lg drop-shadow-sm bg-gradient-to-t border border-[#f0f0f0] from-[#f2f4fe] from-[5%] to-[#fefefe] min-h-[260px]">
      <div class="flex justify-between p-[14px]">
        <div class="flex flex-col gap-[10px]">
          <span class="text-lg font-normal">Партнерский счет</span>
          <span class="font-bold text-xl">
            {{ currency.format(props.refBalance) || 0 }}
          </span>
        </div>
        
      </div>
      <div class="flex p-[14px]">
          <span
            class="text-xs text-[0.8rem] text-center text-[#909090] flex-wrap whitespace-pre-wrap"
          >Доходность зависит от количества приглашенных пользователей</span>
        </div>
      <div class="flex justify-start mt-auto w-full">
        <div
          class="bg-base-100 self-start m-3 mt-0 gap-3 flex flex-col py-[0.4rem] px-[0.5rem] rounded-lg drop-shadow-sm w-full border border-[#f0f0f0]"
        >
          <div class="font-bold text-[0.9rem] whitespace-nowrap text-[#9e9e9e]">
            {{ `${firstLevelReferrals} человек` }}
          </div>
          <div class="text-primary text-[1rem] text-start text-[#71a7e5] font-bold">
            {{ `${firstLevelReferrals * 750} ₽` }}
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-5 w-full">
      <div class="bg-[#f2f3f5] rounded-lg px-5 flex flex-col gap-[18px] py-3">
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
              class="bg-[#f2f3f5] rounded-lg p-3 flex gap-1 w-full justify-between self-end mt-auto"
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
              <div class="join-item bg-transparent rounded-lg w-full flex gap-1 ">
                <button
                  @click="copyImageToClipboard(qrCode)"
                  class="w-full text-[#1B38CA] hover:text-opacity-100 flex items-center gap-3"
                >
                <NuxtImg
                  v-if="!qrLoading"
                  class="rounded-lg"
                  height="200"
                  width="200"
                  :src="qrCode"
                />
                <div v-else class="w-full flex justify-center items-center">
                  <span class="loading loading-dots loading-lg text-primary"></span>
                </div>
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
