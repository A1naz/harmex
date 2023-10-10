<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'
const secondLevelReferrals = ref(0)

const closePartnerVideo = ref(null) as Ref<HTMLLabelElement | null>

function closePartnerVideofn() {
  closePartnerVideo.value?.click()
}

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Партнерская программа',
})
const currency = useCurrency()

const runtimeConfig = useRuntimeConfig()
const withdrawModal = ref(false)
const paymentHistoryModal = ref(false)
const store = useMainStore()
const client = store.client
const partner = client.partner
async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text)
  notify({
    title: 'Ссылка скопирована в буфер обмена',
  })
}
const url = runtimeConfig.public.siteUrl

const refUrl = computed(() => `${url}/register?ref=${client.username}`)

async function getSecondLevelReferrals() {
  const { data }: any = await useFetch('/api/partner/getSecondLevelReferrals', {
    method: 'GET',
  })
  if (data.value && data.value.status === 'ok') {
    secondLevelReferrals.value = data.value.secondLevelReferralsCount
  }
}

await getSecondLevelReferrals()
</script>

<template>
  <div>
    <div class="flex">
      <h1 class="text-2xl font-bold mt-4">Партнерская программа</h1>
      <div class="flex md:flex-row items-center md:ml-1 mt-0 md:mt-6  mr-20 md:mr-0">
        <button class="btn btn-xs btn-primary" @click="closePartnerVideofn">
          <IconCSS size="18" class="h-8 w-8" name="uil:youtube" />
          Как работает партнерка?
        </button>
      </div>
    </div>
    <p class="text-xs font-light mt-1 lg:text-sm">
      Приглашайте друзей и получайте бонусы
    </p>
    <p class="text-xs mt-1 lg:text-sm font-bold">
      Вывод финансовых средств недоступен до 15.10.2023. Для перевода
      реферальных на основной баланс напишите в службу заботы.
    </p>
    <div class="card bg-base-200 p-4 mt-6 flex flex-col gap-2">
      <div class="account">
        <div>Ваш партнерский счет:</div>
        <div class="balance text-xl text-primary font-bold">
          {{ currency.format(store.client.partner.balance) }}
        </div>
      </div>
      <div class="referrals">
        <div>Приглашенных пользователей:</div>
        <div class="count text-xl text-primary font-bold">
          {{ store.client.partner.refCount }} человек
        </div>
        <div>Рефералов 2 уровня:</div>
        <div class="count text-xl text-primary font-bold">
          {{ secondLevelReferrals }} человек
        </div>
      </div>
      <div class="divider m-0" />
      <div class="buttons flex gap-2">
        <button class="btn btn-sm btn-primary" @click="withdrawModal = true">
          Вывод средств
        </button>
        <button
          class="btn btn-sm btn-primary"
          @click="paymentHistoryModal = true"
        >
          История баланса
        </button>
      </div>
    </div>
    <div class="linkcard card bg-base-200 p-4 mt-2 flex flex-col gap-2">
      <div>
        <div class="mb-1">Ваша ссылка для приглашения:</div>
        <div
          class="bg-base-100 rounded-lg p-2 border border-primary md:flex justify-between gap-2 items-center"
        >
          <span class="link lg:link-hover" @click="copyToClipboard(refUrl)">{{
            refUrl
          }}</span>
          <button
            class="btn btn-sm btn-primary hidden lg:block"
            @click="copyToClipboard(refUrl)"
          >
            Скопировать
          </button>
        </div>
        <button
          class="btn btn-sm btn-primary block mt-2 lg:hidden"
          @click="copyToClipboard(refUrl)"
        >
          Скопировать
        </button>
      </div>
      <div>
        <div class="md:flex">
          <div class="mt-0.5">Вознаграждение партнера:</div>
          <div class="text-lg text-primary font-bold md:ml-2">
            {{ partner.rewardPercent }}%
          </div>
        </div>
        <div class="md:flex">
          <div class="mt-0.5">Вознаграждение партнера 2 уровня:</div>
          <div class="text-lg text-primary font-bold md:ml-2">5 %</div>
        </div>
      </div>
    </div>
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
    <div class="my-48"></div>
  </div>

  <input type="checkbox" id="partnerVideo" class="modal-toggle" />
  <div class="modal">
    <div class="modal-box w-11/12 max-w-4xl">
      <button
        class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        @click="closePartnerVideofn"
      >
        ✕
      </button>
      <iframe
        class="w-full h-[30rem] rounded-lg my-4"
        src="https://www.youtube.com/embed/GwGXzd8PwGE?si=C3lM_nbhlvFQ0Hvv"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
      />
      <div class="modal-action flex justify-between">
        <label
          for="partnerVideo"
          ref="closePartnerVideo"
          class="btn btn-primary hidden"
          ></label
        >
      </div>
    </div>
  </div>
</template>

<style scoped></style>
