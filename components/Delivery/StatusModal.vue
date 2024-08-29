<script setup lang="ts">
interface status {
  status: string
  date: string
}
interface Props {
  statusdelivery: status[]
  state: Boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['close'])
const currency = useCurrency()
const store = useMainStore()

onKeyStroke('Escape', (e) => {
  e.preventDefault()
  emit('close')
})
</script>

<template>
  <div
    id="buyoutLogModal" :class="{
      'modal-open': state,
    }" class="modal cursor-pointer"
    @click="$emit('close')"
  >
    <div v-if="state" class="modal-box max-w-2xl cursor-auto" @click.stop>
      <div class="">
        <a class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" @click="$emit('close')">✕</a>

        <div v-if="statusdelivery.length">
          <ul class="steps steps-vertical">
            <li v-for="(status, index) of statusdelivery" :key="index" class="step step-primary">
              <div class="flex gap-2 items-center justify-between">
                <div>
                  {{ status.status }}
                </div>
                <div class="text-sm">
                  {{ 
                    $dayjs(status.date).locale('ru').format(
                      'D MMMM YYYY HH:mm'
                    ) 
                  }}
                </div>
              </div>
            </li>
          </ul>
        </div>
        <Hero v-else />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
