<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'
import { useWildberriesBuyoutStore } from '../../../stores/wildberriesBuyout'
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

const store = useWildberriesBuyoutStore()

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
  <tr class="bg-base-100">
    <!-- <td class="hidden 3xl:block text-center mt-9">
      {{ index + 1 }}
    </td> -->
    <td class="border-r border-base">
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
    <td class="border-r border-base text-center">
      <div class="w-48 truncate text-center flex flex-col justify-center">
        <div class="text-sm font-normal truncate text-center">
          {{ product.name }}
        </div>
        <div class="text-center">
          <a
            :href="`https://www.wildberries.ru/catalog/${product.article}/detail.aspx`"
            target="_blank"
            class="text-sm text-primary link link-hover text-center"
          >
            {{ product.article }}
          </a>
        </div>
      </div>
    </td>
    <td class="border-r border-base text-center">
      <div class="text-sm text-center w-full">
        {{ product.priceText }}
      </div>
    </td>
    <!-- <td class="border-r border-base">
      <div class="relative flex items-center flex-grow-0 w-full">
        <div
          class="absolute left-0 btn btn-ghost btn-sm btn-square"
          @click="productQuantityModel--"
        >
          <IconCSS size="16" name="ic:round-minus" />
        </div>
        <input
          v-model="productQuantityModel"
          type="number"
          min="1"
          max="1000"
          class="input input-sm w-full text-center bg-base-300 bg-opacity-40"
        />
        <div
          class="absolute right-0 btn btn-ghost btn-sm btn-square"
          @click="productQuantityModel++"
        >
          <IconCSS size="16" name="ic:round-plus" />
        </div>
      </div>
    </td> -->
    <td class="border-r border-base">
      <div class="w-20 2xl:w-full flex items-center">
        <select
          v-if="product.sizes.length"
          class="select select-sm w-full bg-base-300 bg-opacity-40"
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
    <td class="border-r border-base">
      <div class="w-20 2xl:w-full">
        <select
          class="select select-sm w-full bg-base-300 bg-opacity-40 max-w-sm appearance-none"
          @change="onSexChange"
        >
          <option value="Нет">Нет</option>
          <option value="male">Муж</option>
          <option value="female">Жен</option>
        </select>
      </div>
    </td>
    <td class="border-r border-base">
      <div class="w-full flex items-center justify-center gap-2">
        <div class="my-auto">
          {{
            product.rules.length
              ? product.rules.map((rule: Rule) => rule.id).join(', ')
              : ''
          }}
        </div>
        <button
          class="border-base-100 text-[#96959a] dark:text-base-content dark:text-opacity-40"
          @click="$emit('ruleModalOpen', index)"
        >
          <Icon name="mdi:settings" size="20" />
        </button>
      </div>
    </td>
    <td class="border-r border-base">
      <div class="flex items-center mt-2">
        <div class="w-full">
          

          <BuyoutDateRangePicker
            v-if="!product.purchaseSoon"
            v-model="productDateRangeModel"
            :start-date="startDate"
          />
          <div v-else class="text-center">Выкуп в ближайшее время</div>
        </div>
      </div>
    </td>
    <td class="break-all max-w-[300px] border-r border-base">
      <div
        class="w-full flex flex-col items-center gap-1 flex-wrap overflow-hidden justify-center"
      >
        <div
          v-if="product.adress"
          class="text-xs max-h-18 w-full break-all text-center"
        >
          <span v-show="loading" class="loading loading-spinner" />
          <p
            v-if="!loading"
            @click="$emit('pointModalOpen', index)"
            class="break-all whitespace-normal cursor-pointer text-primary"
          >
            {{ product.adress }}
          </p>
        </div>
        <button
          v-if="!product.adress"
          :disabled="loading"
          :class="{
            'btn-outline': product.adress,
          }"
          class="btn btn-sm normal-case rounded-full p-1.5 bg-[#f0f5ff] dark:bg-primary dark:bg-opacity-10 border-none w-fit"
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

    <td class="border-r border-base">
      <div class="w-full flex flex-col gap-2">
        <BuyoutWildberriesCreateSearchQueries
          :product-index="props.index"
          :article="product.article"
          :queries="product.searchQuery"
          @update="productSearchQueryUpdate"
          @add="addSearchQuery"
          @remove="removeSearchQuery"
        />
      </div>
    </td>
    <td class="border-r border-base w-[90px]">
      <div class="flex justify-end">
        <div
          class="w-8 btn btn-ghost btn-sm btn-square text-[#8f8e93] dark:text-base-300 hover:text-primary"
          @click="deleteBuyOut"
        >
          <IconCSS name="material-symbols:close" size="20" />
        </div>
        <div
          class="w-8 btn btn-ghost btn-sm btn-square text-[#8f8e93] dark:text-base-300 hover:text-primary"
          @click="copyBuyout"
        >
          <IconCSS name="fluent:copy-20-filled" size="20" />
        </div>
      </div>
    </td>
  </tr>
</template>

<style scoped></style>
