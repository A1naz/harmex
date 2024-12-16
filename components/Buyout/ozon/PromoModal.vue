<script setup lang="ts">

const props = defineProps({
  show: { type: Boolean },
  price: { type: Number, required: true },
  index: {
    type: Number,
    required: true,
  },
})

// const loading = ref(false)

// const qrCode = toRef(props, 'src')
const store = useOzonBuyoutStore()



const closeButton = ref<HTMLElement>()
onKeyStroke('Escape', (e) => {
  e.preventDefault()
  closeButton.value?.click()
})
</script>

<template>
  <div
    v-if="props.show === true"
    @click="$emit('closeModal')"
    class="modalCustom cursor-pointer fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm"
  >
    <div
      class="flex flex-col cursor-auto bg-base-100 rounded-lg w-full max-w-[650px] lg:max-w-xs gap-1 p-4"
      @click.stop
    >
      <div class="flex justify-between">
        <div class="font-medium text-lg mb-2">Введите Промокод</div>
        <!-- <button
          class="text-gray-500 hover:text-gray-700 self-end mb-2"
          @click="$emit('closeModal')"
          >
          <Icon name="material-symbols:close-rounded" size="24" />
        </button> -->
      </div>
      <div class="bg-base-100 rounded-lg">
        <div class="w-full flex flex-col items-start">
          <input
            v-model="store.createProducts[index].promoCode"
            class="input input-sm lg:input-md w-full bg-base-300 bg-opacity-30 placeholder:text-base-content placeholder:text-opacity-50 text-gray-600 mt-2"
            placeholder="Промокод"
          />
          <!-- <span class="mt-2">Выкупать при:</span>
          <input
            @blur="checkZero"
            v-model="store.createProducts[index].discountRequestPrice"
            type="number"
            class="input input-sm lg:input-md w-full bg-base-300 bg-opacity-30 placeholder:text-base-content placeholder:text-opacity-50 text-gray-600 mt-2"
            placeholder="Цена за которую будет выкуплен товар"
          /> -->
        </div>
        <div class="flex justify-center mt-2">
          <button
            id="btnid"
            class="btn btn-sm h-[2.5rem] bg-[#e4ecfb] w-[70%] dark:bg-[#6366f1] border-none mt-2"
            @click="$emit('closeModal')"
          >
            Закрыть
          </button>
        </div>
        <!-- <div v-else class="w-full flex justify-center items-center">
          <span class="loading loading-dots loading-lg text-primary"></span>
        </div> -->
      </div>
    </div>
  </div>
</template>

<style scoped></style>
