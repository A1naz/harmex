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
                <div class="dropdown">
                    <div
                        tabindex="0"
                        role="button"
                        class=" font-normal normal-case btn-primary bg-opacity-20 border-none text-base-content btn btn-sm w-[94px] px-0 lg:w-[120px] "
                    >
                        <span>Главная </span>
                    </div>
                    <ul
                        tabindex="0"
                        class="shadow dropdown-content z-[1] bg-base-100 p-1 rounded-lg mt-1 max-w-[200px]"
                    >
                        <li>
                        <NuxtLink
                            v-for="filter in tabs"
                            :to="'/partner' + filter.query"
                            :external="false"
                            :class="{
                            'btn-active': route.query.status === filter.query,
                            }"
                            class="btn btn-ghost btn-xs normal-case font-medium w-full"
                        >
                            <span>
                            {{ filter.title }}
                            </span>
                        </NuxtLink>
                        </li>
                    </ul>
                </div>
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
                    <div class="dropdown">
                    <div
                        tabindex="0"
                        role="button"
                        class=" font-normal normal-case btn-primary bg-opacity-20 border-none text-base-content btn btn-sm px-0 w-[120px] "
                    >
                        <span>Приглашенные клиенты</span>
                    </div>
                    <ul
                        tabindex="0"
                        class="shadow dropdown-content z-[1] bg-base-100 p-1 rounded-lg mt-1 max-w-[200px]"
                    >
                        <li>
                        <NuxtLink
                            v-for="filter in tabs"
                            :to="'/partner' + filter.query"
                            :external="false"
                            :class="{
                            'btn-active': route.query.status === filter.query,
                            }"
                            class="btn btn-ghost btn-xs normal-case font-medium w-full"
                        >
                            <span>
                            {{ filter.title }}
                            </span>
                        </NuxtLink>
                        </li>
                    </ul>
                    </div>
                    <ExportXls 
                        api="/api/partner/referals-export"
                        fileName="TOPVTOP - Статистика партнеров"
                        :config-columns="listConfigPartners"
                        :isVisible="true"
                        />
                </div>
                <Table 
                    endpoint="/partner/referals"
                    :config="listConfigPartners"
                    :useDefaultDateFilter="true"
                    />

            </template>
            <template v-slot:orders>
                <div class="flex justify-between gap-2 content-center bg-base-200 rounded-xl" >
                    <div class="dropdown">
                    <div
                        tabindex="0"
                        role="button"
                        class="font-normal normal-case btn-primary bg-opacity-20 border-none text-base-content btn btn-sm px-0 w-[120px] "
                    >
                        <span>Заказы клиентов</span>
                    </div>
                    <ul
                        tabindex="0"
                        class="shadow dropdown-content z-[1] bg-base-100 p-1 rounded-lg mt-1 max-w-[200px]"
                    >
                        <li>
                        <NuxtLink
                            v-for="filter in tabs"
                            :to="'/partner' + filter.query"
                            :external="false"
                            :class="{
                            'btn-active': route.query.status === filter.query,
                            }"
                            class="btn btn-ghost btn-xs normal-case font-medium w-full"
                        >
                            <span>
                            {{ filter.title }}
                            </span>
                        </NuxtLink>
                        </li>
                    </ul>
                    </div>
                    <ExportXls 
                        api="/api/partner/orders-export"
                        fileName="TOPVTOP - Заказы партнеров"
                        :config-columns="listConfigOrders"
                        :isVisible="true"
                        />
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

