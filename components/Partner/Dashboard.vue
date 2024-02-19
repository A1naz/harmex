<script setup lang="ts">

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

</script>

<template>
    <div class="flex flex-col gap-5">
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
    </div>
    

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

<style scoped></style>
