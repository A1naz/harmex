<script setup lang="ts">
import { IResTable, ITabs, ItemData, ItemSearch } from '~/data/types';
import { FieldsType } from '~/data/enums'

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Партнерская программа',
})

const { width } = useWindowSize()
const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const store = useMainStore()
const refUrl = computed(() => `${runtimeConfig.public.siteUrl}/register?ref=${client.uuid}`)

const client = store.client
const partner = client.partner

const secondLevelReferrals = ref(0)
async function getSecondartRefLevel(){
    const { data } = await useFetch<
        { status: string, secondLevelReferralsCount: number }
    >('/api/partner/getSecondLevelReferrals',{ method: 'GET' })
    if(data.value && data.value.status === 'ok') secondLevelReferrals.value = data.value.secondLevelReferralsCount
}
await getSecondartRefLevel()

const tabs: ITabs[] = [
    {title: 'Главная', slot: 'main', query: ''},
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
    { field: 'refUsername', header: 'Ник', type: FieldsType.text },
    { field: 'refEmail', header: 'E-mail', type: FieldsType.text },
    { field: 'refLevel', header: 'Рекомендатель', type: FieldsType.text },
    { field: 'serviceType', header: 'Тип', type: FieldsType.text },
    { field: 'date', header: 'Дата операции', type: FieldsType.date },
    { field: 'serviceSum', header: 'Стоимость', type: FieldsType.price },
    { field: 'amount', header: 'Комиссионные', type: FieldsType.price },
    { field: 'refRewarded', header: 'Статус', type: FieldsType.boolean },
]

function datePrepare(daysAgo: number) {
    if(daysAgo == -1) return {}

    const to = new Date()
    to.setUTCHours(23,59,59,999)

    const from = new Date()
    from.setUTCHours(0,0,0,0);

    if (daysAgo > 1) {
        if(daysAgo == 30) {
            from.setDate(1)
        } else {
            from.setDate(from.getDate() - daysAgo)
        }
    }
    const dateRange = {
        dateRange: { 
            from: from.toISOString(), 
            to: to.toISOString()
    }}
    return dateRange
}

const dateRange = ref(datePrepare(-1))
function changeRange(filter: DateFilterRanges){
    dateRange.value = datePrepare(filter.value)
}
</script>

<template>
    <div>
        <!-- <div class="mb-4">
            <div class="flex">
                <h1 class="text-2xl font-bold mt-4">Партнерская программа</h1>
            </div>
            <p class="text-xs font-light mt-4 lg:text-sm">
                Приглашайте друзей и получайте бонусы
            </p>
            <p class="text-xs mt-1 lg:text-sm font-bold">
                Вывод реферальных средств доступен и осуществляется в течение 24-72 часов.
                Создайте заявку для получения поступлений и напишите в Службу заботы.
            </p>
        </div> -->
        <div class="mt-4"></div>
        <Tabs class="opacity-0"
            :tabs="tabs"
            >
            
            <template v-slot:main>
                <CustomDrop
                    :statusText="'Главная'"
                    :tabs="tabs"
                />
                <div class="flex gap-4 w-full flex-col md:flex-row bg-primary bg-opacity-10 rounded-xl mt-4">
                    <div class="px-2 py-7 md:p-5 flex flex-col md:w-[50%] w-full">
                        <PartnerDashboard 
                            :balance="store.client.partner.balance"
                            :ref-count="partner.refCount"
                            :second-level-referrals="secondLevelReferrals"
                            :ref-url="refUrl"
                            :reward-percent="partner.rewardPercent"
                            />
                    </div>
                    <div v-if=" width > 768" class="divider divider-horizontal m-0" />
                    <div v-else class="divider m-0" />
                    <div class="px-2 py-7 md:p-5 flex flex-col md:w-[50%] w-full">
                        <PartnerRefUrl 
                            :ref-url="refUrl"
                            :reward-percent="partner.rewardPercent"
                            />
                    </div>
                    
                </div>
            </template>
            <template v-slot:referals>
                
                <div class="flex justify-between bg-base-200 rounded-xl gap-2" >
                    <CustomDrop
                    :statusText="'Приглашенные клиенты'"
                    :tabs="tabs"
                    @change-value = "changeRange"
                    />
                
                    
                    <div class="flex gap-2">
                    <CustomSelect :tabs="[{ title: 'Все время', value: -1 },
                    { title: 'Сегодня', value: 1 },
                    { title: '3 дня', value: 3 },
                    { title: '7 дней', value: 7 },
                    { title: 'Месяц', value: 30 },]" 
                    @change-value = "changeRange"
                    />
                
                    <ExportXls 
                        api="/api/partner/referals-export"
                        fileName="TOPVTOP - Статистика партнеров"
                        :config-columns="listConfigPartners"
                        :isVisible="true"
                        />
                    </div>
                </div>
                <Table 
                    endpoint="/partner/referals"
                    :config="listConfigPartners"
                    :useDefaultDateFilter="true"
                    />

            </template>
            <template v-slot:orders>
                <div class="flex justify-between gap-2 content-center bg-base-200 rounded-xl" >
                    <CustomDrop
                    :statusText="'Заказы клиентов'"
                    :tabs="tabs"
                />
                
                    <ExportXls 
                        api="/api/partner/orders-export"
                        fileName="TOPVTOP - Заказы партнеров"
                        :config-columns="listConfigOrders"
                        :isVisible="true"
                        />
                </div>
                <div class="overflow-x-auto">
                
                </div>
                <Table
                    endpoint="/partner/orders"
                    :config="listConfigOrders"
                    :useDefaultDateFilter="true"
                    />
            </template>
        </Tabs>
    </div>

</template>
<style>
thead tr:first-child {
    border-top-left-radius: 10px; /* Скругление верхнего левого угла */
    border-top-right-radius: 10px; /* Скругление верхнего правого угла */
}
</style>
