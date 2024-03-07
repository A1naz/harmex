<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'

const props = defineProps({
    balance: { type: Number, required: true},
    refCount: { type: Number, required: true},
    secondLevelReferrals: { type: Number, required: true},
    refUrl: { type: String, required: true},
    rewardPercent: { type: Number, required: true}
})


const filler = [
{
    title: 'Переходов на сайт',
    value: 250,
},
{
    title: 'Переходов на сайт',
    value: 250,
},
{
    title: 'Переходов на сайт',
    value: 250,
},
{
    title: 'Переходов на сайт',
    value: 250,
},
{
    title: 'Переходов на сайт',
    value: 250,
},
{
    title: 'Переходов на сайт',
    value: 0,
},
{
    title: 'Переходов на сайт',
    value: 250,
},
{
    title: 'Переходов на сайт',
    value: 250,
},
{
    title: 'Переходов на сайт',
    value: 250,
},
{
    title: 'Переходов на сайт',
    value: 250,
},
{
    title: 'Переходов на сайт',
    value: 250,
},
];
async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text)
  notify({
    title: 'Ссылка скопирована в буфер обмена',
  })
}
const currency = useCurrency()
const withdrawModal = ref(false)
const paymentHistoryModal = ref(false)

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

        <div class="w-full max-w-md bg-base-100 rounded-lg drop-shadow-sm ">
            <div class="flex justify-between p-3.5">
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
            <div>
                <svg viewBox="0 0 418 145" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g opacity="0.9">
                    <path opacity="0.1" d="M33.7456 10.7612C27.4309 14.9677 5.92245 29 0 29V145H418V58C411.894 58 389.734 35.7242 384.351 30.219C383.59 29.4407 382.551 29 381.463 29H349.78C348.845 29 347.94 28.6724 347.221 28.0741L316.305 2.33496C314.716 1.01221 312.381 1.11812 310.918 2.57927L279.422 34.0455C278.927 34.5398 278.311 34.8958 277.636 35.0778L245.612 43.7097C244.531 44.0009 243.378 43.8263 242.433 43.2282L211.163 23.4512C209.844 22.6173 208.161 22.626 206.852 23.4735L174.733 44.257C173.989 44.7387 173.105 44.9594 172.222 44.8845L140.183 42.1695C139.517 42.1129 138.874 41.89 138.316 41.521L106.913 20.7706C106.158 20.2717 105.256 20.0435 104.355 20.1235L70.6158 23.1158C69.9918 23.1712 69.3635 23.0792 68.7815 22.8472L37.4742 10.3701C36.2398 9.87816 34.8515 10.0245 33.7456 10.7612Z" fill="url(#paint0_linear_62_315419)"/>
                    <path d="M0 29C5.91199 29 27.355 14.7172 33.712 10.3927C34.8346 9.62899 36.2585 9.47823 37.5145 9.99409L68.7716 22.8324C69.3598 23.074 69.9972 23.1719 70.6308 23.1179L105.822 20.1211C106.741 20.0428 107.659 20.2847 108.421 20.8059L138.46 41.369C139.032 41.7607 139.697 41.9969 140.388 42.0545L172.778 44.751C173.677 44.8259 174.576 44.5944 175.327 44.094L206.783 23.1435C208.126 22.249 209.874 22.249 211.217 23.1435L242.289 43.8378C243.268 44.4903 244.486 44.6782 245.616 44.3514L277.678 35.0857C278.327 34.8983 278.917 34.5498 279.395 34.0727L310.918 2.57927C312.381 1.11813 314.716 1.01221 316.305 2.33496L347.221 28.0741C347.94 28.6724 348.845 29 349.78 29H381.463C382.551 29 383.59 29.4407 384.351 30.219C389.734 35.7242 411.894 58 418 58" stroke="#6788F3" stroke-width="2" stroke-linejoin="round"/>
                    </g>
                    <defs>
                    <linearGradient id="paint0_linear_62_315419" x1="209" y1="0" x2="209" y2="145" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#004DE5"/>
                    <stop offset="1" stop-color="#004DE5" stop-opacity="0"/>
                    </linearGradient>
                    </defs>
                </svg>

            </div>

        </div>
        <div class="flex flex-col gap-5 w-full">
            <div class="w-full flex justify-between gap-1">
                <button 
                    class="btn btn-sm normal-case font-normal px-10 border-none bg-primary bg-opacity-10 hover:bg-primary hover:bg-opacity-100 hover:text-base-100"
                    @click="withdrawModal = true"
                >
                   Вывод с баланса
                </button>
                <button 
                    class="btn btn-sm normal-case font-normal px-10 border-none bg-primary bg-opacity-10 hover:bg-primary hover:bg-opacity-100 hover:text-base-100"
                    @click="paymentHistoryModal = true"
                >
                    История баланса
                </button>
                <NuxtLink
                    :to="'/partner?tab=referals'"
                    :external="false"
                    class="btn btn-sm normal-case font-normal px-10 border-none bg-primary bg-opacity-10 hover:bg-primary hover:bg-opacity-100 hover:text-base-100"
                >
                    <span>
                    {{ 'Моя генеалогия' }}
                    </span>
            </NuxtLink>
            </div>
            
            <div class="bg-base-100 rounded-lg drop-shadow-sm w-full p-3.5 flex flex-col gap-5" >
                <h2 class="text-md">Приглашайте друзей и получайте бонусы</h2>
                <div class="flex gap-1 justify-between">
                    <div class="border-2 border-base-200 rounded-lg gap-3 p-3.5">
                        <h3 class="mb-3">Реферальная ссылка</h3>
                        <div class="join bg-base-100 rounded-lg border border-none md:flex justify-between gap-2 items-center" >
                            <div class="join-item  bg-base-200 rounded-lg p-3 flex gap-1" > 
                                <span class="link lg:link-hover truncate max-w-xs" @click="copyToClipboard(refUrl)">{{ refUrl }} </span>
                                <button @click="copyToClipboard(refUrl)" class="justify-end text-primary text-opacity-50 hover:text-opacity-100">
                                    <IconCSS name="material-symbols:content-copy-outline-rounded" size="30" />
                                </button>
                                
                            </div>
                        </div>
                    </div>
                    <div class="border-2 border-base-200 rounded-lg gap-3 p-3.5 w-full max-w-sm">
                        <div class="flex justify-between mb-3 gap-2">
                            <h3 class="">Персональный промокод:</h3>
                            <span class="text-xs text-primary my-auto">Сгенерировать</span>
                        </div>
                        <div class="join bg-base-100 rounded-lg border border-none md:flex justify-between gap-2 items-center" >
                            <div class="join-item  bg-base-200 rounded-lg w-full flex gap-1" > 
                                <input type="text" class="input join-item w-full border-none bg-base-200" />
                                
                                <button @click="copyToClipboard(refUrl)" class="justify-end  text-opacity-50 hover:text-opacity-100 m-3">
                                    <IconCSS name="fluent:checkmark-square-24-regular" size="30" />
                                </button>
                                
                            </div>
                        </div>
                    </div>
                    <div class="border-2 border-base-200 rounded-lg gap-3 p-3.5">
                        <h3 class="text-sm">Реферальная ссылка</h3>
                    </div>
                </div>
            </div>
        </div>
        </div>
        <div class="flex gap-10 w-full p-3.5 bg-base-100">
            <div class="w-full max-w-[70%]">
                <span>Воронка по партнерке</span>
                <div v-for="(item, index) in filler" class="grid grid-cols-5 border drop-shadow-sm border-base-200 rounded-lg mb-2 gap-2">
                    <div class="text-center">{{item.value}}</div>
                    <div class="flex justify-center align-center col-span-2">
                        <div v-if="index !== filler.length - 1" class="trapezoid" :style="{ 
                            width: 'calc(100% - ' + (index * 9) + '%)',
                            borderTopColor: interpolateColor(index),
                        }">{{ }}</div>
                        <div v-else class="triangle" :style="{ 
                            width: 'calc(7%)',
                            borderTopColor: interpolateColor(index),
                        }" >{{ }}</div>
                    </div>
                    <div class="col-span-2">{{ item.title }}</div>
                </div>

            </div>
            <div class="ml-auto">
                <div class="flex flex-col gap-2">
                    <div class="flex gap-2">
                        <div class="bg-primary bg-opacity-20 rounded-lg p-3.5">
                            Рефералов во 1-м уровне
                        </div>
                        <div class="bg-primary bg-opacity-20 rounded-lg p-3.5">
                            Рефералов во 2-м уровне
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <div class="bg-primary bg-opacity-20 rounded-lg p-3.5">
                            Рефералов во 1-м уровне
                        </div>
                        <div class="bg-primary bg-opacity-20 rounded-lg p-3.5">
                            Рефералов во 2-м уровне
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <div class="bg-primary bg-opacity-20 rounded-lg p-3.5">
                            Рефералов во 1-м уровне
                        </div>
                        <div class="bg-primary bg-opacity-20 rounded-lg p-3.5">
                            Рефералов во 2-м уровне
                        </div>
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
    border-left: 15px solid transparent; /* левая сторона трапеции */
    border-right: 15px solid transparent; /* правая сторона трапеции */
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


</style>
