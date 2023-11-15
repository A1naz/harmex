<script setup lang="ts">

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Партнерская программа',
})

const secondLevelReferrals = ref(0)
const closePartnerVideo = ref(null) as Ref<HTMLLabelElement | null>
const runtimeConfig = useRuntimeConfig()
const store = useMainStore()
const client = store.client
const partner = client.partner
const url = runtimeConfig.public.siteUrl
const refUrl = computed(() => `${url}/register?ref=${client.uuid}`)
const partners = ref([])

async function getPartners() {
    if(client.partner.refCount == 0){
        partners.value = []
    } else {
        const { data }: any = await useFetch('/api/partner/referals', { method: 'GET' })
        if(data) partners.value = data.value.refInfo
    }
}

function closePartnerVideofn() {
  closePartnerVideo.value?.click()
}

await getPartners()


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

        <div class="card bg-base-200 p-4 mt-6 mb-2 flex flex-col gap-2">
            <PartnerDashboard 
                :balance="store.client.partner.balance"
                :ref-count="store.client.partner.refCount"
                :second-level-referrals="secondLevelReferrals"
                :ref-url="refUrl"
                :reward-percent="partner.rewardPercent"
                />
        </div>

        <div class="linkcard card bg-base-200 p-4 mb-2 flex flex-col gap-2">
            <PartnerRefUrl 
                :ref-url="refUrl"
                :reward-percent="partner.rewardPercent"
                />
        </div>

        <div class="linkcard card bg-base-200 p-4 mb-2 flex flex-col gap-2">
            <PartnerList 
                :data="partners"
                />
        </div>

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
