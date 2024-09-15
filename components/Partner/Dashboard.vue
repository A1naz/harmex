<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'

const props = defineProps({
  balance: { type: Number, required: true },
  refCount: { type: Number, required: true },
  secondLevelReferrals: { type: Number, required: true },
  firstLevelReferrals: { type: Number, required: true },
  secondLevelPercent: { type: Number, required: true },
  refUrl: { type: String, required: true },
  rewardPercent: { type: Number, required: true },
  refLink: { type: Number, required: true },
})

const { width } = useWindowSize()

const currency = useCurrency()
const withdrawModal = ref(false)
const paymentHistoryModal = ref(false)
const qrModal = ref(false)
const qrCode = ref('null')
const qrLoading = ref(false)

const secondLevelComission = ref(0)
const firstLevelComission = ref(0)
const totalComission = ref(0)
const firstPaymentCounts = ref(0)
const totalDeals = ref(0)
const totalRepeatPayments = ref(0)
const totalDealsCount = ref(0)
const sharedReferralsCount = ref(0)
async function getComissions() {
  const { data } = await useFetch<{
    status: string
    secondLevelComissions: number
    firstLevelComissions: number
    totalCommissions: number
    firstPaymentCounts: number
    firstLevelDealsCount: number
    totalRepeatPayments: number
    totalDealsCount: number
    sharedReferralsCount: number
  }>('/api/partner/comissions', { method: 'GET' })
  if (data.value && data.value.status === 'ok') {
    secondLevelComission.value = data.value.secondLevelComissions
    firstLevelComission.value = data.value.firstLevelComissions
    totalComission.value = data.value.totalCommissions
    firstPaymentCounts.value = data.value.firstPaymentCounts
    totalDeals.value = data.value.firstLevelDealsCount
    totalRepeatPayments.value = data.value.totalRepeatPayments
    totalDealsCount.value = data.value.totalDealsCount
    sharedReferralsCount.value = data.value.sharedReferralsCount
  }
}
await getComissions()

const stats = [
  {
    title: 'Рефералов в 1 уровне',
    value: props.firstLevelReferrals,
  },
  {
    title: 'Рефералов в 2-м уровне',
    value: props.secondLevelReferrals,
  },
  {
    title: 'Комиссионные с 1-го уровня',
    value: currency.format(firstLevelComission.value) || 0,
  },
  {
    title: 'Комиссионные со 2-го уровня',
    value: currency.format(secondLevelComission.value) || 0,
  },
  {
    title: 'Средний доход с клиента',
    value:
      props.firstLevelReferrals === 0 || props.balance === 0
        ? '0 ₽'
        : currency.format(props.balance / props.firstLevelReferrals),
  },
  {
    title: 'Общая сумма комиссионных',
    value: currency.format(totalComission.value) || 0,
  },
]
const filler = [
  {
    title: 'Переходов на сайт',
    value: props.refLink,
  },
  {
    title: 'Регистраций',
    value: props.firstLevelReferrals,
  },
  {
    title: 'Конверсия в регистрацию',
    value: `${
      isFinite(Math.round((props.firstLevelReferrals / props.refLink) * 100))
        ? `${Math.round((props.firstLevelReferrals / props.refLink) * 100)}%`
        : '0%'
    }`,
  },
  {
    title: 'Первых пополнений',
    value: firstPaymentCounts.value,
  },
  {
    title: 'Конверсия в пополнение',
    value: `${
      isFinite(
        Math.round((firstPaymentCounts.value / props.firstLevelReferrals) * 100)
      )
        ? `${Math.round(
            (firstPaymentCounts.value / props.firstLevelReferrals) * 100
          )}%`
        : '0%'
    }`,
  },
  {
    title: 'Заказано услуг',
    value: totalDeals.value,
  },
  {
    title: 'Конверсия в оплату',
    value: `${
      isFinite(Math.round((props.firstLevelReferrals / totalDeals.value) * 100))
        ? `${Math.round((props.firstLevelReferrals / totalDeals.value) * 100)}%`
        : '0%'
    }`,
  },
  {
    title: 'Повторных пополнений',
    value: totalRepeatPayments.value,
  },
  {
    title: 'Повторные заказы',
    value: totalDealsCount.value,
  },
  {
    title: 'Конверсия в повторную оплату',
    value: `${
      isFinite(
        Math.round((totalRepeatPayments.value / totalDealsCount.value) * 100)
      )
        ? `${Math.round(
            (totalRepeatPayments.value / totalDealsCount.value) * 100
          )}%`
        : '0%'
    }`,
  },
  {
    title: 'Поделилось реф. ссылкой',
    value: sharedReferralsCount.value,
  },
]

async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text)
  await useFetch('/api/partner/isShared', { method: 'GET' })
  notify({
    title: 'Ссылка скопирована в буфер обмена',
  })
}

function interpolateColor(index: any) {
  const startColor = [75, 94, 113] // RGB для #4B5E71
  const endColor = [150, 196, 234] // RGB для #96C4EA

  const factor = index / (filler.length - 1)

  const interpolatedColor = startColor.map((start, i) =>
    Math.round(start + factor * (endColor[i] - start))
  )

  return `rgb(${interpolatedColor.join(',')})`
}

async function getQr() {
  qrLoading.value = true
  qrModal.value = true
  const { data }: any = await useFetch('/api/partner/getCode', {
    method: 'GET',
    query: {
      refUrl: props.refUrl,
    },
  })
  qrCode.value = data.value.qrCode
  qrLoading.value = false
}
</script>

<template>
  <div class="w-full flex flex-col lg:flex-row gap-2.5 mb-4">
    <div class="w-full flex justify-between gap-1 lg:hidden">
      <button
        class="btn btn-sm lg:btn-md w-full max-w-[30%] normal-case font-normal border-none bg-[#eff0ff] dark:bg-primary dark:bg-opacity-10 hover:bg-primary hover:bg-opacity-100 hover:text-base-100"
        @click="withdrawModal = true"
      >
        Вывод с баланса
      </button>
      <button
        class="btn btn-sm lg:btn-md w-full max-w-[30%] normal-case font-normal border-none bg-primary bg-opacity-10 hover:bg-primary hover:bg-opacity-100 hover:text-base-100"
        @click="paymentHistoryModal = true"
      >
        История баланса
      </button>
      <NuxtLink
        :to="'/partner?tab=referals'"
        :external="false"
        class="btn btn-sm lg:btn-md w-full max-w-[30%] normal-case font-normal border-none bg-primary bg-opacity-10 hover:bg-primary hover:bg-opacity-100 hover:text-base-100"
      >
        <span>
          {{ 'Моя генеалогия' }}
        </span>
      </NuxtLink>
    </div>
    <div class="w-full lg:max-w-[35%] bg-base-100 rounded-lg drop-shadow-sm">
      <div class="flex justify-between p-3.5 flex-wrap">
        <div>
          <div class="flex gap-1">
            <nuxt-img
              class="w-6 h-6"
              src="/icons/figma/partner/moneyBag.svg"
              alt="graph"
            />
            <h2 class="text-lg">Партнерский счет</h2>
          </div>
          <span class="font-bold text-xl">
            {{ currency.format(props.balance) || 0 }}
          </span>
        </div>

        <div class="max-w-[200px]">
          <span class="text-xs text-base-300"
            >Доходность зависит от количества приглашенных пользователей</span
          >
        </div>
      </div>
      <div class="background-div flex">
        <div
          class="bg-base-100 self-end ml-5 mb-10 flex flex-col py-[0.2rem] px-[0.3rem] rounded-lg drop-shadow-sm"
        >
          <div class="text-gray-600 text-xs">1 уровень</div>
          <div class="font-bold text-sm">
            {{ props.firstLevelReferrals + ' человек' }}
          </div>
          <div class="text-primary text-xs">
            {{ props.rewardPercent + '% дохода' }}
          </div>
        </div>
        <IconCSS
          class="self-end mb-14 ml-3 text-primary"
          name="bi:arrow-right"
          size="35"
        />
        <div
          class="bg-base-100 self-end ml-3 mb-10 flex flex-col py-[0.2rem] px-[0.3rem] rounded-lg drop-shadow-sm"
        >
          <div class="text-gray-600 text-xs">2 уровень</div>
          <div class="font-bold text-sm">
            {{ props.secondLevelReferrals + ' человек' }}
          </div>
          <div class="text-primary text-xs">
            {{ props.secondLevelPercent + '% дохода' }}
          </div>
        </div>
      </div>
    </div>
    <div class="flex flex-col gap-5 w-full lg:max-w-[65%]">
      <div class="w-full justify-between gap-1 hidden lg:flex">
        <button
          class="btn btn-sm lg:btn-md w-full max-w-[30%] normal-case font-normal border-none bg-[#eff0ff] hover:bg-[#6788f3] dark:bg-primary dark:bg-opacity-10 dark:hover:bg-primary dark:hover:bg-opacity-100 hover:text-base-100 dark:hover:text-base-content"
          @click="withdrawModal = true"
        >
          Вывод с баланса
        </button>
        <button
          class="btn btn-sm lg:btn-md w-full max-w-[30%] normal-case font-normal border-none bg-[#eff0ff] hover:bg-[#6788f3] dark:bg-primary dark:bg-opacity-10 dark:hover:bg-primary dark:hover:bg-opacity-100 hover:text-base-100 dark:hover:text-base-content"
          @click="paymentHistoryModal = true"
        >
          История баланса
        </button>
        <NuxtLink
          :to="'/partner?tab=referals'"
          :external="false"
          class="btn btn-sm lg:btn-md w-full max-w-[30%] normal-case font-normal border-none bg-[#eff0ff] hover:bg-[#6788f3] dark:bg-primary dark:bg-opacity-10 dark:hover:bg-primary dark:hover:bg-opacity-100 hover:text-base-100 dark:hover:text-base-content"
        >
          <span>
            {{ 'Моя генеалогия' }}
          </span>
        </NuxtLink>
      </div>

      <div
        class="bg-base-100 rounded-lg drop-shadow-sm w-full p-3.5 flex flex-col gap-5 mt-auto"
      >
        <div class="flex gap-2">
          <nuxt-img
            class="w-6 h-6"
            src="/icons/figma/partner/human.svg"
            alt="human"
          />
          <h2 class="text-md">Приглашайте друзей и получайте бонусы</h2>
        </div>
        <div class="flex flex-col sm:flex-row gap-1">
          <div
            class="border-2 border-base-200 rounded-lg gap-1 sm:gap-3 p-3.5 w-full sm:max-w-[40%] flex flex-col justiyf-between"
          >
            <h3 class="mb-3">Реферальная ссылка</h3>

            <div
              class="bg-base-200 rounded-lg p-3 flex gap-1 w-full justify-between self-end mt-auto"
            >
              <span
                class="link lg:link-hover truncate"
                @click="copyToClipboard(refUrl)"
                >{{ refUrl }}
              </span>
              <button
                @click="copyToClipboard(refUrl)"
                class="text-primary text-opacity-50 hover:text-opacity-100"
              >
                <IconCSS
                  name="material-symbols:content-copy-outline-rounded"
                  size="30"
                />
              </button>
            </div>
          </div>
          <div
            class="border-2 border-base-200 rounded-lg gap-1 sm:gap-3 p-3.5 w-full sm:max-w-[40%] flex flex-col justify-between"
          >
            <div class="flex justify-between mb-3 gap-2 flex-wrap">
              <h3 class="">Персональный промокод:</h3>
              <button disabled class="text-xs text-primary my-auto">
                Сгенерировать
              </button>
            </div>
            <div
              class="join bg-base-100 rounded-lg border border-none md:flex justify-between gap-2 items-center"
            >
              <div class="join-item bg-base-200 rounded-lg w-full flex gap-1">
                <input
                  type="text"
                  placeholder="Введите промокод"
                  class="input join-item w-full border-none bg-base-200 placeholder:text-base-300"
                  disabled
                />

                <button
                  class="justify-end text-opacity-50 hover:text-opacity-100 m-3"
                  disabled
                >
                  <IconCSS
                    name="fluent:checkmark-square-24-regular"
                    size="30"
                  />
                </button>
              </div>
            </div>
          </div>
          <div
            class="border-2 border-base-200 rounded-lg gap-1 sm:gap-3 p-3.5 max-w-[50%] sm:w-full sm:max-w-[19%] justify-between flex flex-col"
          >
            <h3 class="mb-1 sm:mb-3">QR-код:</h3>
            <div
              class="join bg-base-100 rounded-lg border border-none flex justify-between gap-2 items-center justify-self-end"
            >
              <div class="join-item bg-base-200 rounded-lg w-full flex gap-1">
                <button
                  class="w-full text-primary hover:text-opacity-100 m-3 flex justify-center items-center gap-1.5"
                  @click="getQr()"
                >
                  <!-- <IconCSS name="ooui:qr-code" size="30" /> -->

                  <img class="w-8 h-8" src="/icons/figma/partner/qrIcon.svg" alt="qr" />
                  <span class="white-space-nowrap text-sm textr-[#718ff4]">QR-код</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div
    class="flex flex-col lg:flex-row gap-20 w-full py-5 px-2 sm:px-10 bg-base-100 rounded-lg drop-shadow-sm"
  >
    <div class="w-full lg:max-w-[60%]">
      <div class="flex gap-2">
        <nuxt-img
          class="w-6 h-6"
          src="/icons/figma/partner/graphCircle.svg"
          alt="graph"
        />
        <span class="text-lg">Воронка по партнерке</span>
      </div>
      <div class="grid grid-cols-6 mb-2 gap-2 mt-5">
        <div class="text-center text-xs">Значение</div>
        <div class="col-span-5 text-center"></div>
      </div>
      <div
        v-for="(item, index) in filler"
        class="grid grid-cols-6 border drop-shadow-sm border-base-200 rounded-lg sm:mb-1 gap-2"
      >
        <div class="text-center text-xs my-auto">{{ item.value || 0 }}</div>
        <div class="flex justify-center align-center col-span-2">
          <div
            v-if="index !== filler.length - 1"
            class="trapezoid relative"
            :style="{
              width: 'calc(100% - ' + index * (width < 640 ? 7 : 9) + '%)',
              borderTopColor: interpolateColor(index),
            }"
          >
            <div
              class="absolute -mt-8 text-base-100 inset-0 flex justify-center items-center text-xs"
            >
              {{ index + 1 }}
            </div>
          </div>
          <div
            v-else
            class="triangle relative"
            :style="{
              width: (width < 640 ? 25 : 8) + '%',
              borderTopColor: interpolateColor(index),
            }"
          >
            <div
              class="absolute -mt-10 text-base-100 inset-0 flex justify-center items-center text-xs"
            >
              {{ index + 1 }}
            </div>
          </div>
        </div>
        <div class="text-xs ml-2 my-auto col-span-3">{{ item.title }}</div>
      </div>
    </div>
    <div class="lg:w-[35%] flex justify-center align-center">
      <div class="grid grid-cols-2 gap-3 w-full">
        <div
          v-for="(item, index) in stats"
          class="flex flex-col bg-[#e5ebf2] dark:bg-primary dark:bg-opacity-5 rounded-lg p-5 navbar:p-2 gap-3"
        >
          <nuxt-img
            v-if="index < 2"
            class="w-8 h-8"
            src="/icons/figma/partner/stats1.svg"
            alt="stats1"
          />
          <nuxt-img
            v-if="index >= 2 && index !== stats.length - 1"
            class="w-8 h-8"
            src="/icons/figma/partner/stats2.svg"
            alt="stats2"
          />
          <nuxt-img
            v-if="index === stats.length - 1"
            class="w-8 h-8"
            src="/icons/figma/partner/stats3.svg"
            alt="stats3"
          />
          <span class="text-xs break-words">{{ item.title }}</span>
          <span
            class="count navbar:text-lg text-2xl text-base-content font-bold"
          >
            {{ item.value }}</span
          >
        </div>
      </div>
    </div>
  </div>

  <!-- <div class="flex flex-col gap-5 mt-96">
        <div class="flex flex-col gap-1">
            <div class="account flex p-2.5 bg-base-100 rounded-lg gap-2.5">
                <div>
                    Ваш партнерский счет:
                </div>
                <div class="balance text-xl text-primary font-bold">
                    {{ currency.format(props.balance) }}
                </div>
            </div>
            <div class="referrals flex flex-col gap-1">
                <div class="flex p-2.5 bg-base-100 rounded-lg gap-2.5">
                    <div>Приглашенных пользователей:</div>
                    <div class="count text-xl text-primary font-bold">
                        {{ refCount }} человек
                    </div>
                </div>
                
                <div class="flex p-2.5 bg-base-100 rounded-lg gap-2.5">
                    <div>Рефералов 2 уровня:</div>
                    <div class="count text-xl text-primary font-bold">
                        {{ secondLevelReferrals }} человек
                    </div>
                </div>
                
            </div>
        </div>
        <div class="buttons flex gap-1 sm:gap-4 ">
            <button class="btn btn-sm btn-primary bg-opacity-40 border-none  px-0 w-[50%]" @click="withdrawModal = true">
                Вывод средств
            </button>
            <button
                class="btn btn-sm btn-primary bg-opacity-40 border-none  px-0 w-[48%]"
                @click="paymentHistoryModal = true"
                >
                История баланса
            </button>
        </div>
    </div> -->

  <!-- <div class="divider m-0" /> -->

  <PartnerWithdrawModal
    v-if="withdrawModal"
    :state="withdrawModal"
    @close="withdrawModal = false"
  />

  <PartnerPaymentHistoryModal
    v-if="paymentHistoryModal"
    :state="paymentHistoryModal"
    @close="paymentHistoryModal = false"
  />
  <PartnerQrModal
    v-if="qrModal"
    :show="qrModal"
    :src="qrCode"
    :loading="qrLoading"
    @close-modal="qrModal = false"
  />
</template>

<style scoped>
.trapezoid {
  border-top: 30px solid #4b5e71;
  border-left: calc(0.7vw) solid transparent; /* Используем calc для комбинирования vw и px */
  border-right: calc(0.7vw) solid transparent;
  border-radius: 10px;
}
.triangle {
  width: 0;
  height: 0;
  border-left: 12px solid transparent;
  border-right: 12px solid transparent;
  border-top: 30px solid #96c4ea;
  border-radius: 5px;
}
.background-div {
  width: 100%;
  height: 200px;
  background-image: url('/icons/figma/partner/graph.svg');
  background-repeat: no-repeat;
  background-size: cover;
}
</style>
