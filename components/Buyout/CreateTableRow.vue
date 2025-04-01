<script setup lang="ts">
const { notify } = useNotification();
import { useOzonBuyoutStore } from '../../stores/ozonBuyout'
import type { Rule } from '@/data/buyout/rules'

const props = defineProps({
  product: {
    type: Object as any,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  loading: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['callback', 'pointModalOpen', 'ruleModalOpen'])

const startDate = ref(new Date(Date.now() + 1000 * 60 * 5))

const store = useOzonBuyoutStore()

function copyBuyout() {
  if (store.createProducts.length >= 10) {
    notify({
      title: 'За раз можно создать максимум 10 выкупов',
      type: 'error',
    })
    return
  }

  const item = JSON.stringify(store.createProducts[props.index])
  store.createProducts.push(JSON.parse(item))
}
async function deleteBuyOut() {
  store.removeProduct(props.index)
}
function onSizeChange(event: Event) {
  const target = event.target as HTMLInputElement
  store.changeSize(target.value, props.index)
}
function onSexChange(event: Event) {
  const target = event.target as HTMLInputElement
  store.changeSex(target.value, props.index)
}

function removeSearchQuery(index: number) {
  store.removeSearchQuery(props.index, index)
}
function addSearchQuery() {
  store.addSearchQuery(props.index)
}
function productSearchQueryUpdate(event: Event, index: number) {
  const newValue = (event.target as HTMLInputElement).value
  store.changeSearchQuery({
    value: newValue,
    queryIndex: index,
    productIndex: props.index,
  })
}
const productDateRangeModel = computed({
  get() {
    return props.product.dateRange
  },
  set(newValue: unknown[]) {
    store.changeDateRange(newValue, props.index)
  },
})

const productQuantityModel = computed({
  get() {
    return props.product.quantity
  },
  set(newValue: number) {
    store.changeQuantity(newValue, props.index)
  },
})
</script>

<template>
  <tr class="border-b-base-300 bg-base-100">
    <td class="hidden 3xl:block text-center mt-9">
      {{ index + 1 }}
    </td>
    <td>
      <div
        style="
          width: 28px;
          height: 36px;
          overflow: visible;
          position: relative;
          border-radius: 4px;
        "
      >
        <div class="dropdown dropdown-hover">
          <label tabindex="0">
            <nuxt-img
              class="rounded-lg"
              loading="lazy"
              fit="fill"
              :src="product.image"
            />
          </label>
          <ul
            tabindex="0"
            class="dropdown-content mt-4 p-2 shadow bg-base-100 rounded-box w-52 z-10"
          >
            <nuxt-img
              class="rounded-lg"
              loading="lazy"
              fit="fill"
              :src="product.image"
            />
          </ul>
        </div>
      </div>
    </td>
    <td class="">
      <div class="w-48 truncate">
        <div class="text-sm font-medium truncate">
          {{ product.name }}
        </div>
        <a
        :href="`https://www.ozon.ru/product/${product.article}`"
          target="_blank"
          class="text-sm text-primary link link-hover"
        >
          {{ product.article }}
        </a>
      </div>
    </td>
    <td>
      <div class="text-sm">
        {{ product.priceText }}
      </div>
    </td>
    <td>
      <div class="relative flex items-center flex-grow-0 w-full">
        <div
          class="absolute left-0 btn btn-ghost btn-sm btn-square"
          @click="productQuantityModel--"
        >
          <Iconze="16" name="ic:round-minus" />
        </div>
        <input
          v-model="productQuantityModel"
          type="number"
          min="1"
          max="1000"
          class="input input-bordered input-sm w-full text-center bg-base-200"
        />
        <div
          class="absolute right-0 btn btn-ghost btn-sm btn-square"
          @click="productQuantityModel++"
        >
          <Icon size="16" name="ic:round-plus" />
        </div>
      </div>
    </td>
    <td>
      <div class="w-20 2xl:w-full flex items-center">
        <select
          v-if="product.sizes.length"
          class="select select-sm select-bordered w-full bg-base-200"
          @change="onSizeChange"
        >
          <option
            v-for="size in product.sizes"
            :key="size"
            :selected="product.selectedSize === size"
            :value="size"
          >
            {{ size }}
          </option>
        </select>
        <div v-else class="text-sm text-center ml-2">Нет</div>
      </div>
    </td>
    <td>
      <div class="w-20 2xl:w-full">
        <select
          class="select select-sm select-bordered w-full bg-base-200 max-w-[100px] appearance-none"
          @change="onSexChange"
        >
          <option value="Нет">Нет</option>
          <option value="male">Муж</option>
          <option value="female">Жен</option>
        </select>
      </div>
    </td>
    <!-- <td>
      <div class="w-full flex flex-col gap-2">
        <BuyoutCreateSearchQueries
          :product-index="props.index"
          :article="product.article"
          :queries="product.searchQuery"
          @update="productSearchQueryUpdate"
          @add="addSearchQuery"
          @remove="removeSearchQuery"
        />
      </div>
    </td> -->
    <td class="break-all max-w-[300px]">
      <div
        class="w-full flex flex-col items-center gap-1 flex-wrap overflow-hidden  justify-center"
      >
        <div v-if="product.adress" class="text-xs h-10 w-full break-all">
          <p @click="$emit('pointModalOpen', index)" class="break-all whitespace-normal cursor-pointer text-primary">
            {{ product.adress }}
          </p>
        </div>
        <button
          v-if="!product.adress"
          :disabled="loading"
          :class="{
            'btn-outline': product.adress,
          }"
          class="btn btn-sm normal-case rounded-full p-1"
          @click="$emit('pointModalOpen', index)"
        >
          <span v-show="loading" class="loading loading-spinner" />
          <Icon v-if="!loading" name="fluent:add-24-filled" size="20" />
        </button>
        <!-- <button
          v-if="product.adress"
          :disabled="loading"
          :class="{
            'btn-outline': product.adress,
          }"
          class="btn btn-primary btn-sm normal-case w-full"
          @click="$emit('pointModalOpen', index)"
        >
          <span v-show="loading" class="loading loading-spinner" />
          <span v-if="!loading">Изменить </span>
          
        </button> -->
      </div>
    </td>
    <td>
      <label class="label cursor-pointer -ml-1 text-sm -mb-1">
        Выкупить в ближайшее время
        <input
          type="checkbox"
          v-model="product.purchaseSoon"
          class="checkbox checkbox-primary"
        />
      </label>
      <div class="flex items-center">
        <div class="w-full">
          <div
            v-if="!product.purchaseSoon"  
            v-show="product.dateRange[1] && product.dateRange[0]"
            class="mx-auto w-fit text-sm flex flex-col justify-center items-center bg-primary bg-opacity-10 rounded-md p-1 mb-2"
          >
            <div>
              {{
                `${defaultDateShort(product.dateRange[0])} - ${defaultDateShort(
                  product.dateRange[1]
                )}`
              }}
            </div>
          </div>
          <div>
            
          </div>
          <BuyoutDateRangePicker
            v-if="!product.purchaseSoon"
            v-model="productDateRangeModel"
            :start-date="startDate"
          />
          <button
            v-else
            disabled
            :class="{
              'btn-outline': product.dateRange[0] && product.dateRange[1],
            }"
            class="btn btn-primary btn-sm normal-case w-full"
          >
            {{
              product.dateRange[0] && product.dateRange[1]
                ? 'Изменить'
                : 'Выбрать'
            }}
          </button>
        </div>
      </div>
    </td>
    <td>
      <div class="w-full flex items-center justify-center gap-2">
        <div class="mb-1">
          {{ product.rules.map((rule: Rule) => rule.id).join(', ') }}
        </div>
        <button
          class="border-base-100 text-base-300"
          @click="$emit('ruleModalOpen', index)"
        >
          <Icon name="mdi:settings" size="20" />
        </button>
      </div>
    </td>
    <td>
      <div class="w-8 btn btn-ghost btn-sm btn-square text-base-300 hover:text-primary" @click="deleteBuyOut">
        <Icon name="material-symbols:close" size="20" />
      </div>
      <div class="w-8 btn btn-ghost btn-sm btn-square text-base-300 hover:text-primary" @click="copyBuyout">
        <Icon name="material-symbols:content-copy-outline-rounded" size="20" />
      </div>
    </td>
  </tr>
</template>

<style scoped></style>
