<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'
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

const emit = defineEmits(['callback', 'pointModalOpen', 'ruleModalOpen'])
const store = useOzonBuyoutStore()
const startDate = ref(new Date(Date.now()))

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
    queryIndex: props.index,
    productIndex: index,
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
  <div class="buyout-card card bg-base-100 shadow-lg w-full">
    <div
      class="card-body flex-shrink-0 flex flex-col justify-start p-4 relative"
    >
      <!-- <div class="dropdown dropdown-end absolute right-2 top-2 z-10">
        <label tabindex="0" class="btn btn-sm btn-square btn-ghost">
          <Icon name="ph:dots-three-outline-vertical-fill" size="18" />
        </label>
        <ul
          tabindex="0"
          class="dropdown-content menu bg-base-200 p-2 shadow rounded-box w-52"
        >
          <li>
            <a @click="deleteBuyOut">
              <Icon name="material-symbols:delete-outline" />Удалить
            </a>
            <a  @click="copyBuyout">
              <IconCSS name="fluent:copy-20-filled" size="20" />Дублировать
            </a>
          </li>
        </ul>
      </div> -->

      <!-- <div>
        <h2 class="card-title">Выкуп №{{ index + 1 }}</h2>
      </div> -->
      <div class="flex gap-4 items-center">
        <div class="flex truncate gap-4">
          <div
            class="flex items-center flex-none flex-0 flex-shrink-0 h-full"
            style="max-width: 100px"
          >
            <nuxt-img
              style="object-fit: fill"
              class="rounded-xl"
              width="70"
              :src="product?.image || '/logo/logocolor.svg'"
              loading="lazy"
            />
          </div>
          <div class="flex flex-col truncate">
            <div class="mb-2 truncate">
              <p class="text-xs truncate">
                {{ product.name }}
              </p>
              <a
                :href="`https://www.ozon.ru/product/${product.article}`"
                target="_blank"
                class="text-xs text-primary link link-hover"
              >
                {{ product.article }}
              </a>
            </div>
          </div>
        </div>
        <div class="flex gap-2 self-start">
          <div
            class="w-8 btn btn-ghost btn-sm btn-square text-base-300"
            @click="copyBuyout"
          >
            <IconCSS name="fluent:copy-20-filled" size="20" />
          </div>
          <div
            class="w-8 btn btn-ghost btn-sm btn-square text-base-300"
            @click="deleteBuyOut"
          >
            <IconCSS name="material-symbols:close" size="20" />
          </div>
        </div>
      </div>
      <div class="flex justify-start gap-3 md:gap-2">
        <div class="flex flex-col">
          <span class="text-md text-gray-500 mb-2">Цена: </span>
          <span class="text-sm font-bold">{{ product.priceText }}</span>
        </div>
        <div class="flex flex-col">
          <span class="text-md text-gray-500 mb-1">Количество: </span>
          <span class="relative flex items-center flex-grow-0 w-20">
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
              class="input input-bordered input-sm w-full text-center"
            />
            <div
              class="absolute right-0 btn btn-ghost btn-sm btn-square"
              @click="productQuantityModel++"
            >
              <IconCSS size="16" name="ic:round-plus" />
            </div>
          </span>
        </div>
        <div class="flex flex-col">
          <span class="text-md text-gray-500">Размер: </span>
          <div class="flex items-center m-1">
            <select
              v-if="product.sizes.length"
              class="select select-sm select-bordered w-full"
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
        </div>
        <div class="flex flex-col">
          <span class="text-md text-gray-500 mb-1">Пол: </span>
          <select
            class="select select-sm select-bordered w-15 appearance-none"
            @change="onSexChange"
          >
            <option value="Нет">Нет</option>
            <option value="male">Муж</option>
            <option value="female">Жен</option>
          </select>
        </div>
      </div>
      <!-- <div class="flex justify-between items-center">
        <span>Пол:</span>
        <select
          class="select select-sm select-bordered w-32 appearance-none"
          @change="onSexChange"
        >
          <option value="Нет">Нет</option>
          <option value="male">Муж</option>
          <option value="female">Жен</option>
        </select>
      </div> -->
      <div class="flex justify-start gap-5">
        <div class="flex flex-col">
          <span class="text-md text-gray-500">Правила: </span>
          <div class="w-full flex items-center justify-center gap-2">
            <div class="mt-0.5">
              {{ product.rules.map((rule: any) => rule.id).join(', ') }}
            </div>
            <button
              class="border-base-100"
              @click="$emit('ruleModalOpen', index)"
            >
              <Icon name="mdi:settings" size="20" />
            </button>
          </div>
        </div>
        <div class="flex flex-col">
          <span class="text-md text-gray-500 mb-2">Дата выкупов: </span>
          <div>
            <div
              v-if="!product.purchaseSoon"
              v-show="product.dateRange[1] && product.dateRange[0]"
              class="text-sm flex flex-col justify-center items-start mb-2"
            >
              <div>
                {{
                  `${defaultDateShort(
                    product.dateRange[0]
                  )} - ${defaultDateShort(product.dateRange[1])}`
                }}
              </div>
            </div>

            <BuyoutDateRangePicker
              v-if="!product.purchaseSoon"
              v-model="productDateRangeModel"
              :start-date="startDate"
            />
            <!-- <button
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
              </button> -->
            <div v-else class="text-center">Выкуп в ближайшее время</div>
          </div>
        </div>
        <div class="flex flex-col">
          <span class="text-md text-gray-500 mb-2">Адрес: </span>
          <div v-if="product.adress" class="text-xs h-10 w-full break-all">
            <p
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
            class="btn btn-sm normal-case rounded-full p-1"
            @click="$emit('pointModalOpen', index)"
          >
            <span v-show="loading" class="loading loading-spinner" />
            <Icon v-if="!loading" name="fluent:add-24-filled" size="20" />
          </button>
        </div>
      </div>
      <div class="flex">
        <span class="text-md text-gray-500 mb-2 mr-3">Скидка: </span>
        <span class="text-md mb-2 font-bold">% </span>
      </div>
      <!-- <div class="flex justify-between items-center">
        <span>Даты выкупов: </span>
        <div class="flex flex-col items-end">
          <div>
            <span>
              {{ $dayjs(product.dateRange[0]).format('D MMMM HH:mm') }}</span
            >
            -
            <span>
              {{ $dayjs(product.dateRange[1]).format('D MMMM HH:mm') }}</span
            >
          </div>
        </div>
      </div>
      <BuyoutDateRangePicker
        v-model="productDateRangeModel"
        class="w-full"
        :start-date="startDate"
      />
      <div>
        <span>Правила:</span>
        {{
        product.rules.map((rule: any) => rule.id).join(', ')
        }}
      </div>
      <div class="flex justify-between items-center">
        <button
          :class="{
            'btn-outline': product.rules,
          }"
          class="btn btn-primary btn-sm normal-case w-full"
          @click="emit('ruleModalOpen', index)"
        >
          {{ 'Настроить' }}
        </button>
      </div>
      <div class="flex justify-between items-center mt-2">
        <div class="w-full flex flex-col items-start justify-center gap-1">
          <div class="flex justify-between gap-2 items-center w-full truncate">
            <span>Адрес:</span>
            <div v-if="product.adress" class="text-xs truncate">
              {{ product.adress }}
            </div>
          </div>

          <button
            :disabled="loading"
            :class="{
              'btn-outline': product.adress,
            }"
            class="btn btn-primary btn-sm normal-case w-full"
            @click="$emit('pointModalOpen', index)"
          >
            {{
              !loading
                ? product.adress
                  ? 'Изменить'
                  : 'Добавить'
                : 'Загрузка...'
            }}
          </button>
        </div>
      </div> -->
      <!-- <div>
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
      </div> -->
      <!-- 
      <div class="divider" /> -->

      <!-- <div class="flex gap-4 items-center">
        <div
          class="flex items-center flex-none flex-0 flex-shrink-0 h-full"
          style="max-width: 100px;"
        >
          <nuxt-img
            style="object-fit: fill"
            class="rounded-xl"
            width="70"
            :src="product?.image || '/logo/logocolor.svg'"
            loading="lazy"
          />
        </div>
        <div class="flex flex-col truncate">
          <div class="mb-2 truncate">
            <p class="text-sm truncate">
              {{ product.name }}
            </p>
            <a
              :href="`https://www.ozon.ru/product/${product.article}`"
              target="_blank"
              class="text-sm text-secondary link link-hover"
            >
              {{ product.article }}
            </a>
          </div>
          <div>
            <span class="text-sm text-gray-500">Цена: </span>
            <span class="">{{ product.priceText }}</span>
          </div>
          <div>
            <span class="text-sm text-gray-500">Количество: </span>
            <span class="relative flex items-center flex-grow-0 w-20 m-1">
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
                class="input input-bordered input-sm w-full text-center"
              />
              <div
                class="absolute right-0 btn btn-ghost btn-sm btn-square"
                @click="productQuantityModel++"
              >
                <IconCSS size="16" name="ic:round-plus" />
              </div>
            </span>
          </div>
          <div>
            <span class="text-sm text-gray-500">Размер: </span>
            <div class="flex items-center m-1">
              <select
                v-if="product.sizes.length"
                class="select select-sm select-bordered w-full"
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
          </div>
        </div>
      </div> -->
    </div>
  </div>
</template>

<style scoped></style>
