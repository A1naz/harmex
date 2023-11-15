<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'

const props = defineProps({
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


<div class="linkcard card bg-base-200 p-4 mt-2 flex flex-col gap-2">
        <div>
        <div class="mb-1">Ваша ссылка для приглашения:</div>
            <div class="bg-base-100 rounded-lg p-2 border border-primary md:flex justify-between gap-2 items-center" >
                <span class="link lg:link-hover" @click="copyToClipboard(refUrl)"> {{ refUrl }} </span>
                <button
                    class="btn btn-sm btn-primary hidden lg:block"
                    @click="copyToClipboard(refUrl)"
                    >
                    Скопировать
                </button>
            </div>
            <button
                class="btn btn-sm btn-primary block mt-2 lg:hidden"
                @click="copyToClipboard(refUrl)"
                >
                Скопировать
            </button>
        </div>

        <div>
            <div class="md:flex">
            <div class="mt-0.5">Вознаграждение партнера:</div>
            <div class="text-lg text-primary font-bold md:ml-2">
                {{ rewardPercent }}%
            </div>
            </div>
        <div class="md:flex">
            <div class="mt-0.5">Вознаграждение партнера 2 уровня:</div>
            <div class="text-lg text-primary font-bold md:ml-2">5 %</div>
        </div>
      </div>
    </div>
</template>

<style scoped></style>
