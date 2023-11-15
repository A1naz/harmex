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

<div class="card bg-base-200 p-4 mt-6 flex flex-col gap-2">
    <div class="account">
        <div>
            Ваш партнерский счет:
        </div>
        <div class="balance text-xl text-primary font-bold">
            {{ currency.format(props.balance) }}
        </div>
    </div>
    <div class="referrals">
        <div>Приглашенных пользователей:</div>
        <div class="count text-xl text-primary font-bold">
            {{ refCount }} человек
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
    </div>


</template>

<style scoped></style>
