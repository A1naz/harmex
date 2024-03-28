<script setup lang="ts">
import { useNotification } from '@kyvg/vue3-notification'
import { notify } from '@kyvg/vue3-notification'

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
const products = computed(() => store.createProducts)
// const load = toRef(props, 'loading')
const emit = defineEmits(['closeModal'])

const productDiscountModel = computed({
  get() {
    return products.value.length ? products.value[props.index]?.discount : 0
  },
  set(newValue: number) {
    store.changeDiscount(newValue, props.index)
  },
})

const productDiscountRequestPriceModel = computed({
  get() {
    return products.value.length ? products.value[props.index]?.discount : 0
  },
  set(newValue: number) {
    store.changeDiscountRequestPrice(newValue, props.index)
  },
})

const productDiscountPriceModel = computed({
  get() {
    return products.value.length ? products.value[props.index]?.discount : 0
  },
  set(newValue: number) {
    store.changeDiscountPrice(newValue, props.index)
  },
})

const discount = computed(() =>
  products.value.length ? products.value[props.index]?.discount || 0 : 0
)

const discountValue = ref(discount.value)


const price = computed(() =>
  products.value.length ? products.value[props.index]?.price : 0
)

const discountRequestPrice = ref(price.value)
const discountPrice = ref(price.value)
const discountBoolean = ref(false)
console.log(discountRequestPrice.value, discountPrice.value)

function saveDiscountValue() {
  // if (
  //   discountValue.value < 0 ||
  //   discountValue.value >= 100 ||
  //   !discountValue.value
  // ) {
  //   notify({
  //     title: 'Скидка не должна быть отрицательной или больше 100',
  //   })
  //   return
  // }
  if(discountRequestPrice.value !== price.value || discountPrice.value !== price.value) {
    discountBoolean.value = true
  }
  productDiscountRequestPriceModel.value = discountRequestPrice.value
  productDiscountPriceModel.value = discountPrice.value
  productDiscountModel.value = discountBoolean.value
  emit('closeModal')
}

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
    class="modalCustom fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm"
  >
    <div
      class="flex flex-col bg-base-100 rounded-lg w-full max-w-[650px] lg:max-w-xs gap-1 p-4"
      @click.stop
    >
      <div class="flex justify-between">
        <div class="font-medium text-lg mb-2">Введите сумму скидки</div>
        <!-- <button
          class="text-gray-500 hover:text-gray-700 self-end mb-2"
          @click="$emit('closeModal')"
        >
          <Icon name="material-symbols:close-rounded" size="24" />
        </button> -->
      </div>
      <div class="bg-base-100 rounded-lg">
        <div class="w-full flex flex-col items-start">
          <span class="text-left">Цена по скидке:</span>
          {{ product.discountRequestPrice }}
          <input
            type="number"
            v-model="product.discountRequestPrice"
            class="input input-sm lg:input-md w-full bg-base-300 bg-opacity-30 placeholder:text-base-content placeholder:text-opacity-50 text-gray-600 mt-2"
            placeholder="Цена товара по запрошенной скидке"
          />
          <span>Выкупать при:</span>
          <input
            type="number"
            v-model="product.discountPrice"
            class="input input-sm lg:input-md w-full bg-base-300 bg-opacity-30 placeholder:text-base-content placeholder:text-opacity-50 text-gray-600 mt-2"
            placeholder="Цена за которую будет выкуплен товар"
          />
        </div>
        <div class="flex gap-2">
          <button
            id="btnid"
            class="btn btn-sm h-[2.5rem] btn-primary w-[49%] border-none bg-opacity-0 text-base-content mt-2"
            @click="$emit('closeModal')"
          >
            Отмена
          </button>
          <button
            id="btnid"
            class="btn btn-sm h-[2.5rem] btn-primary w-[49%] border-none bg-opacity-10 text-base-content mt-2"
            @click="saveDiscountValue"
          >
            Сохранить
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
