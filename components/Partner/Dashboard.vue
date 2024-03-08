<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'

const props = defineProps({
    balance: { type: Number, required: true},
    refCount: { type: Number, required: true},
    secondLevelReferrals: { type: Number, required: true},
    refUrl: { type: String, required: true},
    rewardPercent: { type: Number, required: true}
})

const currency = useCurrency()
const withdrawModal = ref(false)
const paymentHistoryModal = ref(false)

const stats = [
{
    title: 'Рефералов в 1 уровне',
    value: props.refCount-props.secondLevelReferrals,
},
{
    title: 'Рефералов в 2-м уровне',
    value: props.secondLevelReferrals,
},
{
    title: 'Комиссионные с 1-го уровня',
    value: 250,
},
{
    title: 'Комиссионные со 2-го уровня',
    value: 250,
},
{
    title: 'Средний доход с клиента',
    value: currency.format(props.balance/props.refCount),
},
{
    title: 'Общая сумма комиссионных',
    value: currency.format(props.balance),
},
]
const filler = [
{
    title: 'Переходов на сайт',
    value: 250,
},
{
    title: 'Регистраций',
    value: 250,
},
{
    title: 'Конверсия в регистрацию',
    value: 250,
},
{
    title: 'Первых пополнений',
    value: 250,
},
{
    title: 'Конверсия в пополнение',
    value: 250,
},
{
    title: 'Заказано услуг',
    value: 0,
},
{
    title: 'Конверсия в оплату',
    value: 250,
},
{
    title: 'Повторных пополнений',
    value: 250,
},
{
    title: 'Повторные заказы',
    value: 250,
},
{
    title: 'Конверсия в повторную оплату',
    value: 250,
},
{
    title: 'Поделилось реф. ссылкой',
    value: 250,
},
];
async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text)
  notify({
    title: 'Ссылка скопирована в буфер обмена',
  })
}


function interpolateColor(index: any) {
            const startColor = [75, 94, 113]; // RGB для #4B5E71
            const endColor = [150, 196, 234]; // RGB для #96C4EA

            const factor = index / (filler.length - 1);

            const interpolatedColor = startColor.map((start, i) => Math.round(start + factor * (endColor[i] - start)));
            
            return `rgb(${interpolatedColor.join(',')})`;
        }
</script>

<template>
    <div class="w-full flex gap-2.5 mb-4">

        <div class="w-full max-w-[35%] bg-base-100 rounded-lg drop-shadow-sm ">
            <div class="flex justify-between p-3.5 flex-wrap">
                <div>
                    <h2 class="text-lg">Партнерский счет</h2>
                    <span class="font-bold text-xl">
                        {{ currency.format(props.balance) }}
                    </span>
                </div>

                <div class="max-w-[200px]">
                    <span class="text-xs text-base-300">Доходность зависит от количества приглашенных пользователей</span>
                </div>

            </div>
            <div class="background-div flex">
                <div class="bg-base-100 self-end ml-5 mb-10 flex flex-col py-[0.2rem] px-[0.3rem] rounded-lg drop-shadow-sm">
                    <div class="text-gray-600 text-xs">1 уровень</div>
                    <div class="font-bold text-sm">15 человек</div>
                    <div class="text-primary text-xs">{{ props.rewardPercent+'% дохода' }}</div>
                </div>
                <IconCSS class="self-end mb-14 ml-3 text-primary" name="bi:arrow-right" size="35" />
                <div class="bg-base-100 self-end ml-3 mb-10 flex flex-col py-[0.2rem] px-[0.3rem] rounded-lg drop-shadow-sm">
                    <div class="text-gray-600 text-xs">2 уровень</div>
                    <div class="font-bold text-sm">120 человек</div>
                    <div class="text-primary text-xs">{{ props.rewardPercent/2 +'% дохода' }}</div>
                </div>
            </div>

        </div>
        <div class="flex flex-col gap-5 w-full max-w-[65%]">
            <div class="w-full flex justify-between gap-1">
                <button 
                    class="btn btn-sm lg:btn-md  w-full max-w-[30%] normal-case font-normal  border-none bg-primary bg-opacity-10 hover:bg-primary hover:bg-opacity-100 hover:text-base-100"
                    @click="withdrawModal = true"
                >
                   Вывод с баланса
                </button>
                <button 
                    class="btn btn-sm lg:btn-md w-full max-w-[30%] normal-case font-normal  border-none bg-primary bg-opacity-10 hover:bg-primary hover:bg-opacity-100 hover:text-base-100"
                    @click="paymentHistoryModal = true"
                >
                    История баланса
                </button>
                <NuxtLink
                    :to="'/partner?tab=referals'"
                    :external="false"
                    class="btn btn-sm lg:btn-md w-full max-w-[30%] normal-case font-normal  border-none bg-primary bg-opacity-10 hover:bg-primary hover:bg-opacity-100 hover:text-base-100"
                >
                    <span>
                    {{ 'Моя генеалогия' }}
                    </span>
            </NuxtLink>
            </div>
            
            <div class="bg-base-100 rounded-lg drop-shadow-sm w-full p-3.5 flex flex-col gap-5 mt-auto" >
                <h2 class="text-md">Приглашайте друзей и получайте бонусы</h2>
                <div class="flex gap-1">
                    <div class="border-2 border-base-200 rounded-lg gap-3 p-3.5 w-full max-w-[40%] flex flex-col justiyf-between">
                    <h3 class="mb-3">Реферальная ссылка</h3>

                    <div class="bg-base-200 rounded-lg p-3 flex gap-1 w-full justify-between self-end mt-auto"> 
                        <span class="link lg:link-hover truncate" @click="copyToClipboard(refUrl)">{{ refUrl }} </span>
                        <button @click="copyToClipboard(refUrl)" class="text-primary text-opacity-50 hover:text-opacity-100">
                            <IconCSS name="material-symbols:content-copy-outline-rounded" size="30" />
                        </button>
                    </div>
                </div>
                    <div class="border-2 border-base-200 rounded-lg gap-3 p-3.5 w-full max-w-[40%] flex flex-col justify-between">
                        <div class="flex justify-between mb-3 gap-2 flex-wrap">
                            <h3 class="">Персональный промокод:</h3>
                            <span class="text-xs text-primary my-auto">Сгенерировать</span>
                        </div>
                        <div class="join bg-base-100 rounded-lg border border-none md:flex justify-between gap-2 items-center " >
                            <div class="join-item  bg-base-200 rounded-lg w-full flex gap-1" > 
                                <input type="text" placeholder="Введите промокод" class="input join-item w-full border-none bg-base-200 placeholder:text-base-300" />
                                
                                <button class="justify-end  text-opacity-50 hover:text-opacity-100 m-3">
                                    <IconCSS name="fluent:checkmark-square-24-regular" size="30" />
                                </button>
                                
                            </div>
                        </div>
                    </div>
                    <div class="border-2 border-base-200 rounded-lg gap-3 p-3.5 w-full max-w-[19%] justify-between flex flex-col">
                        <h3 class="mb-3">QR-код:</h3>
                        <div class="join bg-base-100 rounded-lg border border-none flex justify-between gap-2 items-center justify-self-end" >
                            <div class="join-item  bg-base-200 rounded-lg w-full flex gap-1" > 
                                <button class="w-full text-primary  text-opacity-50 hover:text-opacity-100 m-3">
                                    <IconCSS name="ooui:qr-code" size="30" />
                                    <!-- <img class="px-4 pt-4" :src="`/img/mp/avito.png`" alt="Shoes" /> -->
                                    <!-- <img class="w-8 h-8" src="/icons/figma/partner/qrIcon.svg" alt="qr" /> -->
                                    <span class="ml-3">QR-код</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>
        <div class="flex flex-col sm:flex-row gap-20 w-full py-5 px-2 sm:px-10 bg-base-100 rounded-lg drop-shadow-sm">
            <div class="w-full sm:max-w-[60%]">
                <span>Воронка по партнерке</span>
                <div class="grid grid-cols-6  mb-2 gap-2 mt-5">
                    <div class="text-center text-xs">Значение</div>
                    <div class="col-span-5 text-center"></div>
                </div>
                <div v-for="(item, index) in filler" class="grid grid-cols-6  border drop-shadow-sm border-base-200 rounded-lg mb-1 gap-2">
                <div class="text-center text-xs my-auto">{{ item.value }}</div>
                <div class="flex justify-center align-center col-span-2">
                    <div v-if="index !== filler.length - 1" class="trapezoid relative" :style="{ 
                        width: 'calc(100% - ' + (index * 9) + '%)',
                        borderTopColor: interpolateColor(index),
                    }">
                        <div class="absolute -mt-8 text-base-100 inset-0 flex justify-center items-center text-xs">{{ index+1 }}</div>
                    </div>
                    <div v-else class="triangle relative" :style="{ 
                        width: '8%',
                        borderTopColor: interpolateColor(index),
                    }">
                        <div class="absolute -mt-10 text-base-100 inset-0 flex justify-center items-center text-xs">{{ index+1 }}</div>
                    </div>
                </div>
                <div class="text-xs ml-2 my-auto col-span-3">{{ item.title }}</div>
            </div>
            
            </div>
            <div class="sm:w-[35%] flex justify-center align-center">
                <div class="grid grid-cols-2 gap-3 ">
                    <div v-for="item in stats" class="flex flex-col bg-primary bg-opacity-5 rounded-lg p-5 gap-3 ">
                        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clip-path="url(#clip0_273_369755)">
                            <path d="M16.5 0.5H4C3.20435 0.5 2.44129 0.81607 1.87868 1.37868C1.31607 1.94129 1 2.70435 1 3.5V20.5C1 20.6326 1.05268 20.7598 1.14645 20.8536C1.24021 20.9473 1.36739 21 1.5 21H13.5C13.6326 21 13.7598 20.9473 13.8536 20.8536C13.9473 20.7598 14 20.6326 14 20.5V3.5" fill="#DFF9FF"/>
                            <path d="M15.7 0.5H4C3.20435 0.5 2.44129 0.81607 1.87868 1.37868C1.31607 1.94129 1 2.70435 1 3.5V15.2L15.7 0.5Z" fill="white"/>
                            <path d="M16.5 0.5H4C3.20435 0.5 2.44129 0.81607 1.87868 1.37868C1.31607 1.94129 1 2.70435 1 3.5V20.5C1 20.6326 1.05268 20.7598 1.14645 20.8536C1.24021 20.9473 1.36739 21 1.5 21H13.5C13.6326 21 13.7598 20.9473 13.8536 20.8536C13.9473 20.7598 14 20.6326 14 20.5V3.5" stroke="#00303E" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M16.0569 21.438H16.0469" stroke="#00303E" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M20.2098 15.8881C20.0746 16.0635 20.0015 16.2787 20.0018 16.5001V20.6511L16.0618 21.4401L17.1818 20.5401C17.32 20.4267 17.408 20.2634 17.4267 20.0856C17.4454 19.9078 17.3933 19.7298 17.2818 19.5901L15.3618 17.4701L14.6518 17.7601C14.3789 17.8733 14.0738 17.8818 13.795 17.784C13.5162 17.6862 13.2833 17.489 13.1408 17.2301C12.9984 16.9712 12.9565 16.6689 13.0231 16.3811C13.0897 16.0932 13.2601 15.8401 13.5018 15.6701C13.5548 15.631 13.6118 15.5974 13.6718 15.5701L15.5218 14.6701C15.7238 14.5697 15.9443 14.5117 16.1695 14.4997C16.3948 14.4876 16.6202 14.5218 16.8318 14.6001L20.2098 15.8881Z" fill="#DFF9FF" stroke="#00303E" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M16.4994 16.998L15.3594 17.468" stroke="#00303E" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M17.178 20.538L16.058 21.438H16.048L13.678 23.349C13.5399 23.4607 13.3639 23.5147 13.1869 23.4998C13.0099 23.4849 12.8455 23.4022 12.728 23.269L10.4 21.5H9V16.5L11.85 15.291C12.0219 15.2232 12.2052 15.1893 12.39 15.191C12.7024 15.1905 13.0069 15.2889 13.26 15.472L13.5 15.672C13.2583 15.842 13.0879 16.0951 13.0213 16.383C12.9547 16.6708 12.9966 16.9731 13.1391 17.232C13.2815 17.4908 13.5144 17.688 13.7932 17.7858C14.072 17.8836 14.3771 17.8751 14.65 17.762L15.36 17.472L17.28 19.592C17.3901 19.7317 17.4411 19.9089 17.422 20.0858C17.4029 20.2626 17.3153 20.425 17.178 20.538Z" fill="#DFF9FF" stroke="#00303E" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M9 16.5V21.5C9 21.7652 8.89464 22.0196 8.70711 22.2071C8.51957 22.3946 8.26522 22.5 8 22.5H6V15.5H8C8.26522 15.5 8.51957 15.6054 8.70711 15.7929C8.89464 15.9804 9 16.2348 9 16.5Z" fill="#6788F3" stroke="#00303E" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M23 15.5V22.5H21C20.7348 22.5 20.4804 22.3947 20.2929 22.2071C20.1054 22.0196 20 21.7652 20 21.5V16.5C20.0009 16.2794 20.0747 16.0653 20.21 15.891C20.3023 15.769 20.4218 15.6702 20.5589 15.6023C20.696 15.5344 20.847 15.4994 21 15.5H23Z" fill="#6788F3" stroke="#00303E" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M4 5H11" stroke="#00303E" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M4 8H11" stroke="#00303E" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M4 11H7.5" stroke="#00303E" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M14 3.5V3C14 2.33696 14.2634 1.70107 14.7322 1.23223C15.2011 0.763392 15.837 0.5 16.5 0.5C17.88 0.5 19 1.619 19 3.5H14Z" fill="#DFF9FF" stroke="#00303E" stroke-linecap="round" stroke-linejoin="round"/>
                            </g>
                            <defs>
                            <clipPath id="clip0_273_369755">
                            <rect width="24" height="24" fill="white"/>
                            </clipPath>
                            </defs>
                        </svg>

                        <span class="text-xs">{{ item.title }}</span>
                        <span class="count text-2xl text-base-content font-bold"> {{ item.value }}</span>
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

</template>

<style scoped>
.trapezoid {
    border-top: 30px solid #4B5E71; /* высота трапеции */
    border-left: 10px solid transparent; /* левая сторона трапеции */
    border-right: 10px solid transparent; /* правая сторона трапеции */
    border-radius: 10px; /* скругление углов */
}
.triangle {
        width: 0; 
  height: 0; 
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 30px solid #96C4EA;
  border-radius: 5px;
}
.background-div {
  width: 100%; /* Укажите ширину и высоту вашего div */
  height: 200px;
  background-image: url('/icons/figma/partner/graph.svg');
  /* Дополнительные свойства для настройки фона, например, повторение */
  background-repeat: no-repeat;
  background-size: cover; /* или contain в зависимости от ваших предпочтений */
}

</style>
