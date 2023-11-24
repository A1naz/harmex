<script setup lang="ts">
import { ITabs } from '~/data/types';
import { FieldsType } from '~/data/enums'

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Партнерская программа',
})

const runtimeConfig = useRuntimeConfig()
const store = useMainStore()
const route = useRoute()

const tab = computed (() => route.query.tab)
const refUrl = computed(() => `${runtimeConfig.public.siteUrl}/register?ref=${client.uuid}`)

const secondLevelReferrals = ref(0)
const closePartnerVideo = ref(null) as Ref<HTMLLabelElement | null>
const loadingList = ref(false)

const client = store.client
const partner = client.partner


interface itemData {
    data: any [],
    skip: number,
    limit: number,
    sort: any,
    stopFetch: boolean
}
interface ListData {
    referals: itemData, 
    orders: itemData
}
const limitInit = 20
const itemInitData = {
    data: [],
    skip: 0,
    limit: limitInit,
    sort: {},
    stopFetch: false
}
const listData = ref<ListData>({
    referals: {...itemInitData},
    orders: {...itemInitData},
})

async function getData() {
    if (tab.value 
        && !loadingList.value
        && !listData.value[tab.value as keyof ListData].stopFetch
        ) {
        loadingList.value = true
        const { skip, limit, sort } = listData.value[tab.value as keyof ListData]
        const { data }: any = await useFetch(`/api/partner/${tab.value}`, { 
            query: { 
                skip: skip, 
                limit: limit,
                sort: JSON.stringify(sort)
            },
            method: 'GET' 
        })
        if(data.value && data.value.length > 0){
            listData.value[tab.value as keyof ListData].data = [
                ...listData.value[tab.value as keyof ListData].data,
                ...data.value
            ]
            listData.value[tab.value as keyof ListData].skip += limitInit
            listData.value[tab.value as keyof ListData].limit += limitInit
        } else {
            listData.value[tab.value as keyof ListData].stopFetch = true
        }
    }
    loadingListDebounce() // to avoid double fetch after click on sort
}

const getDataDebounced = useDebounceFn(()=> getData() , 1000)
const loadingListDebounce = useDebounceFn(()=> loadingList.value = false , 500)  

async function refreshData() {
    if(tab.value ){
        listData.value[tab.value as keyof ListData] = {...itemInitData}
        await getData()
    }
}

function search(sort: any) {
    listData.value[tab.value as keyof ListData].sort = { 
        [sort.sortField]: sort.sortOrder 
    }
    listData.value[tab.value as keyof ListData].data = []
    listData.value[tab.value as keyof ListData].skip = 0
    listData.value[tab.value as keyof ListData].limit = limitInit
    listData.value[tab.value as keyof ListData].stopFetch = false
    getDataDebounced()
}

function closePartnerVideofn() {
  closePartnerVideo.value?.click()
}

const tabs: ITabs[] = [
    {title: 'Главное', slot: 'main', query: ''},
    {title: 'Приглашенные клиенты', slot: 'referals', query: '?tab=referals' },    
    {title: 'Заказы клиентов', slot: 'orders', query: '?tab=orders' },
]

const listConfigPartners: ConfigTable[] = [
    { field: 'username', header: 'Ник', type: FieldsType.text },
    { field: 'email', header: 'E-mail', type: FieldsType.text },
    { field: 'registrationDate', header: 'Дата регистрации', type: FieldsType.date },
    { field: 'refCount', header: 'Приглашенных', type: FieldsType.text },
    { field: 'deals', header: 'Выполнено услуг', type: FieldsType.text },
    { field: 'summ', header: 'Фин. оборот', type: FieldsType.price },
    { field: 'comission', header: 'Комиссионные', type: FieldsType.price },
]
const listConfigOrders: ConfigTable[] = [
    { field: 'username', header: 'Ник', type: FieldsType.text },
    { field: 'email', header: 'E-mail', type: FieldsType.text },
    { field: 'refCount', header: 'Приглашенных', type: FieldsType.text },
    { field: 'dataoperation', header: 'Дата операции', type: FieldsType.date },
    { field: 'summ', header: 'Стоимость', type: FieldsType.price },
    { field: 'type', header: 'Тип', type: FieldsType.text },
]
const isListEnd = ref(false)
watch( () => isListEnd.value, async (newValue, oldValue) => {
    if (newValue) await getData()
})

</script>

<template>
    <div>
        <div class="mb-4">
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
                Вывод реферальных средств доступен и осуществляется в течение 24-72 часов.
                Создайте заявку для получения поступлений и напишите в Службу заботы.
            </p>
        </div>

        <Tabs 
            :tabs="tabs"
            @changeTab="isListEnd = false"
            >
            <template v-slot:main>
                <div class="flex flex-col gap-4 w-full ">
                    <div class="bg-base-200 p-4 flex flex-col rounded-xl">
                        <PartnerDashboard 
                            :balance="store.client.partner.balance"
                            :ref-count="listData.referals.data.length"
                            :second-level-referrals="secondLevelReferrals"
                            :ref-url="refUrl"
                            :reward-percent="partner.rewardPercent"
                            />
                    </div>
                    <div class="bg-base-200 p-4 flex flex-col rounded-xl">
                        <PartnerRefUrl 
                            :ref-url="refUrl"
                            :reward-percent="partner.rewardPercent"
                            />
                    </div>
                </div>
            </template>
            <template v-slot:referals>
                <div class="flex justify-end bg-base-200 rounded-xl mb-2 p-2 gap-2" >
                    <Button 
                        class="btn btn-sm btn-primary rounded-xl"
                        @click="refreshData" 
                        >
                        <span class="pi pi-refresh"></span>
                    </Button>
                </div>
                <List 
                    :data="listData.referals.data"
                    :config="listConfigPartners"
                    :isLoading="loadingList"
                    v-model:endList="isListEnd"
                    :sortCurrent="listData.referals.sort"
                    @sort="(v: any) => search(v)"
                    />
            </template>
            <template v-slot:orders>
                <div class="flex justify-end bg-base-200 rounded-xl mb-2 p-2 gap-2" >
                    <Button 
                        class="btn btn-sm btn-primary rounded-xl"
                        @click="refreshData" 
                        >
                        <span class="pi pi-refresh"></span>
                    </Button>
                </div>
                <List 
                    :data="listData.orders.data"
                    :config="listConfigOrders"
                    :isLoading="loadingList"
                    v-model:endList="isListEnd"
                    :sortCurrent="listData.referals.sort"
                    @sort="(v: any) => search(v)"
                    />
            </template>
        </Tabs>
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
                    >
                </label>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
