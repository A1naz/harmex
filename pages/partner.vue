<script setup lang="ts">
import { IResTable, ITabs } from '~/data/types';
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

const closePartnerVideo = ref(null) as Ref<HTMLLabelElement | null>
const loadingList = ref(false)

const client = store.client
const partner = client.partner

function closePartnerVideofn() {
  closePartnerVideo.value?.click()
}
const secondLevelReferrals = ref(0)
async function getSecondartRefLevel(){
    const { data } = await useFetch<
        { status: string, secondLevelReferralsCount: number }
    >('/api/partner/getSecondLevelReferrals',{ method: 'GET' })
    if(data.value && data.value.status === 'ok') secondLevelReferrals.value = data.value.secondLevelReferralsCount
}
await getSecondartRefLevel()

interface ItemSearch {
    skip: number,
    limit: number,
    sort: any,
    filter: any
}
interface itemData {
    data: any [],
    count: number,
    search: ItemSearch
}
interface ListData {
    referals: itemData, 
    orders: itemData
}
const limitInit = 20
const itemInitData = {
    data: [],
    count: 0,
    search: {
        skip: 0,
        limit: limitInit,
        sort: {},
        filter: {}
    }
}
const listData = ref<ListData>({} as ListData)
function initListData(){
    listData.value = {
        referals: {    
            data: [],
            count: 0,
            search: {
                skip: 0,
                limit: limitInit,
                sort: { registrationDate: -1 },
                filter: {}
            }
        },
        orders: {    
            data: [],
            count: 0,
            search: {
                skip: 0,
                limit: limitInit,
                sort: { date: -1 },
                filter: {}
            }
        },
    }
}
initListData()

async function _fetchData() {
    if (tab.value) {
        listData.value[tab.value as keyof ListData].data = []
        const { search } = listData.value[tab.value as keyof ListData]
        const { data } = await useFetch<IResTable>(`/api/partner/${tab.value}`, { 
            query: { 
                skip: search.skip, 
                limit: search.limit,
                sort: JSON.stringify(search.sort),
                filter: JSON.stringify(search.filter)
            },
            method: 'GET' 
        })
        if(data.value && data.value.list.length > 0){
            listData.value[tab.value as keyof ListData].data = data.value.list
            listData.value[tab.value as keyof ListData].count = data.value.count
        } else {
            listData.value[tab.value as keyof ListData].count = 0
        }
    }
    loadingListDebounce() // to avoid double fetch after click on sort
}
const _getDataDebounced = useDebounceFn(()=> _fetchData() , 700)

function getData(){
    loadingList.value = true
    _getDataDebounced()
}

const loadingListDebounce = useDebounceFn(()=> loadingList.value = false , 500)  

function updateFilter<T extends keyof ItemSearch>(key: T, value: ItemSearch[T]) {
    if(key =='skip') {
        value = listData.value[tab.value as keyof ListData].search.limit * (value - 1)
    }
    if(key =='limit') {
        listData.value[tab.value as keyof ListData].search.skip = 0
    }
    if(key == 'sort') value = { [value.sortField]: value.sortOrder }

    if(key == 'filter') {
        listData.value[tab.value as keyof ListData].search.skip = 0
    }
    listData.value[tab.value as keyof ListData].search[key] = value
    listData.value[tab.value as keyof ListData].data = []
    getData()
}

const tabs: ITabs[] = [
    {title: 'Главная', slot: 'main', query: ''},
    {title: 'Приглашенные клиенты', slot: 'referals', query: '?tab=referals' },    
    {title: 'Заказы клиентов', slot: 'orders', query: '?tab=orders' },
]
function changeTab(newTab: string){
    if (newTab !== "main"){
        if (listData.value[newTab as keyof ListData].search.filter) {
            listData.value[newTab as keyof ListData].search.filter = {}
            getData()
        }
        if (listData.value[newTab as keyof ListData].data.length == 0) getData()
    }
}

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
    { field: 'refUsername', header: 'Ник', type: FieldsType.text },
    { field: 'refEmail', header: 'E-mail', type: FieldsType.text },
    { field: 'refLevel', header: 'Рекомендатель', type: FieldsType.text },
    { field: 'serviceType', header: 'Тип', type: FieldsType.text },
    { field: 'date', header: 'Дата операции', type: FieldsType.date },
    { field: 'serviceSum', header: 'Стоимость', type: FieldsType.price },
    { field: 'amount', header: 'Комиссионные', type: FieldsType.price },
    { field: 'refRewarded', header: 'Статус', type: FieldsType.boolean },
]

onMounted(()=> getData())

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
            @change-tab="changeTab"
            >
            <template v-slot:main>
                <div class="flex flex-col gap-4 w-full ">
                    <div class="bg-base-200 p-4 flex flex-col rounded-xl">
                        <PartnerDashboard 
                            :balance="store.client.partner.balance"
                            :ref-count="partner.refCount"
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
                <div class="flex justify-between bg-base-200 rounded-xl mb-2 p-2 gap-2" >
                    <TableDateDefaultFilter 
                        @range-upd="(r: number) => updateFilter('filter', r)"
                        />
                    <ExportXls 
                        api="/api/partner/referals-export"
                        fileName="TOPVTOP - Статистика партнеров"
                        :config-columns="listConfigPartners"
                        :isVisible="true"
                        />
                </div>
                <Table
                    :data="listData.referals.data"
                    :count="listData.referals.count"
                    :currentLimit="listData.referals.search.limit"
                    :currentSkip="listData.referals.search.skip"
                    :current-sort="listData.referals.search.sort"
                    :config="listConfigPartners"
                    :isLoading="loadingList"
                    @changePage="(p: number) => updateFilter('skip', p)"
                    @changeLimit="(l: number) => updateFilter('limit', l)"
                    />
            </template>
            <template v-slot:orders>
                <div class="flex justify-between gap-2 content-center bg-base-200 rounded-xl mb-2 p-2" >
                    <TableDateDefaultFilter 
                        @range-upd="(r: number) => updateFilter('filter', r)"
                        />
                    <ExportXls 
                        api="/api/partner/orders-export"
                        fileName="TOPVTOP - Заказы партнеров"
                        :config-columns="listConfigOrders"
                        :isVisible="true"
                        />
                </div>
                <Table 
                    :data="listData.orders.data"
                    :count="listData.orders.count"
                    :currentLimit="listData.orders.search.limit"
                    :currentSkip="listData.orders.search.skip"
                    :current-sort="listData.orders.search.sort"
                    :config="listConfigOrders"
                    :isLoading="loadingList"
                    @sort="(s: any) => updateFilter('sort', s)"
                    @changePage="(p: number) => updateFilter('skip', p)"
                    @changeLimit="(l: number) => updateFilter('limit', l)"
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
