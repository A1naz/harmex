<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'

defineProps({
    refUrl: { type: String, required: true},
    rewardPercent: { type: Number, required: true},
})

async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text)
  notify({
    title: 'Ссылка скопирована в буфер обмена',
  })
}

</script>

<template>
    <div class="flex flex-col gap-3 w-full">
        <div class="flex flex-col gap-3.5">
            <div class="mb-1 text-lg">Ваша ссылка для приглашения:</div>
            <div class="bg-base-100 rounded-lg p-2 border border-none md:flex justify-between gap-2 items-center" >
                <span class="link lg:link-hover  text-gray-500" @click="copyToClipboard(refUrl)"> {{ refUrl }} </span>
                <button
                    class="btn btn-sm btn-primary bg-opacity-40 border-none hidden lg:block"
                    @click="copyToClipboard(refUrl)"
                    >
                    Скопировать
                </button>
            </div>
            <button
                class="btn btn-sm btn-primary bg-opacity-40 border-none  block mt-2 lg:hidden"
                @click="copyToClipboard(refUrl)"
                >
                Скопировать
            </button>
        </div>
        <div class="flex flex-col gap-5">
            <div class="flex justify-between ">
                <div class="mt-0.5">Вознаграждение партнера:</div>
                <div class="text-lg text-primary bg-warning p-1 rounded-lg font-bold md:ml-2  ">
                    {{ rewardPercent }} %
                </div>
            </div>
            <div class="flex justify-between ">
                <div class="mt-0.5">Вознаграждение партнера 2 уровня:</div>
                <div class="text-lg text-primary bg-error bg-opacity-80 p-1 rounded-lg font-bold md:ml-2 ">5 %</div>
            </div>
        </div>
    </div>
    

</template>

<style scoped></style>
