<script setup lang="ts">
import { buyoutInfoTexts } from '~/data/buyout/infoTexts'

const props = defineProps<{ infoType: string }>()

const dialog = ref<HTMLDialogElement>()

const info = computed(() => buyoutInfoTexts[props.infoType])
const title = computed(() => info.value?.title ?? 'Информация')

defineExpose({
  show: () => dialog.value?.showModal(),
  close: () => dialog.value?.close(),
})
</script>

<template>
  <dialog ref="dialog" class="modal">
    <form method="dialog" class="modal-box p-4 max-w-lg">
      <h3 class="font-bold text-lg pr-8">{{ title }}</h3>
      <div
        class="py-4 flex flex-col gap-2 text-sm leading-relaxed"
        v-html="info?.html ?? ''"
      />
      <div class="modal-action mt-0">
        <button class="btn btn-sm">Закрыть</button>
      </div>
    </form>
  </dialog>
</template>
