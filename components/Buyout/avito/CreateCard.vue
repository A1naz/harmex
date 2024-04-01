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
const store = useAvitoBuyoutStore()
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
  <div class="buyout-card card bg-base-100 shadow-lg w-full lg:max-w-[350px]">
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
            class="flex items-center flex-none flex-0 flex-shrink-0"
            style="max-width: 100px"
          >
            <nuxt-img
              class="w-8 rounded-md"
              loading="lazy"
              fit="fill"
              :src="product?.image || '/logo/logocolor.svg'"
            />
          </div>
          <div class="flex flex-col truncate">
            <div class="mb-2 truncate">
              <p class="text-sm truncate">
                {{ product.name }}
              </p>
              <a
                :href="`https://www.avito.ru/${product.article}`"
                target="_blank"
                class="text-sm text-primary link link-hover"
              >
                {{ product.article }}
              </a>
            </div>
          </div>
        </div>
        <div class="flex self-start -mt-2">
          <div
            class="w-8 btn btn-ghost btn-sm btn-square text-base-content text-opacity-50 -mr-2"
            @click="copyBuyout"
          >
            <IconCSS name="material-symbols-light:content-copy" size="18" />
          </div>
          <div
            class="w-8 btn btn-ghost btn-sm btn-square text-base-content text-opacity-50"
            @click="deleteBuyOut"
          >
            <IconCSS name="material-symbols:close" size="18" />
          </div>
        </div>
      </div>
      <div class="flex justify-start gap-3 md:gap-2">
        <div class="flex flex-col">
          <span class="text-md text-gray-500 mb-2">Цена: </span>
          <span class="text-sm font-bold">{{ product.priceText }}</span>
        </div>
        <div class="flex flex-col">
          <span class="text-md text-gray-500 mb-1">Кол-во: </span>
          <span class="relative flex items-center flex-grow-0 w-15">
            <div
              class="absolute left-0 btn btn-ghost btn-sm btn-square bg-base-200 border-none rounded-l-xl"
              @click="productQuantityModel--"
            >
              <IconCSS size="16" name="ic:round-minus" />
            </div>
            <input
              v-model="productQuantityModel"
              type="number"
              min="1"
              max="1000"
              class="input border-none input-sm w-full text-center bg-base-200 rounded-xl"
            />
            <div
              class="absolute right-0 btn btn-ghost btn-sm btn-square border-none bg-base-200 rounded-r-xl"
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
              class="select select-sm border-none bg-base-200 w-full rounded-xl"
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
            class="select select-sm border-none bg-base-200 rounded-xl w-15 appearance-none"
            @change="onSexChange"
          >
            <option value="none">Нет</option>
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
          <option value="none">Нет</option>
          <option value="male">Муж</option>
          <option value="female">Жен</option>
        </select>
      </div> -->
      <div class="flex justify-start gap-5">
        <div class="flex flex-col">
          <span class="text-md text-gray-500 mb-1">Правила: </span>
          <div class="w-full flex items-center justify-center gap-2">
            <div class="text-sm">
              {{
                (product.purchaseSoon ? '1, ' : '') +
                (product.rules && product.rules.length ? '' : '') +
                (product.rules
                  ? product.rules.map((rule: Rule) => rule.id + 1).join(', ')
                  : '')
              }}
            </div>
            <button
              class="border-base-100"
              @click="$emit('ruleModalOpen', index)"
            >
              <img
                class="w-5 h-5"
                src="/icons/figma/buyouts/settings.svg"
                alt="settings"
              />
            </button>
          </div>
        </div>
        <div class="flex flex-col">
          <span class="text-md text-gray-500 mb-2">Дата выкупов: </span>
          <div>
            <!-- <div
                v-if="!product.purchaseSoon"
                v-show="product.dateRange[1] && product.dateRange[0]"
                class="text-sm flex flex-col justify-center items-start mb-2"
              >
                <div>
                  {{
                    `${defaultDateShort(product.dateRange[0])} - ${defaultDateShort(
                      product.dateRange[1]
                    )}`
                  }}
                </div>
              </div> -->

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
            <div v-else class="text-center text-xs">
                Ближайшее время
              </div>
          </div>
        </div>
        <div class="flex flex-col">
          <span class="text-md text-gray-500 mb-2">Адрес: </span>
          <div
            v-if="product.adress"
            class="text-xs h-10 w-full truncate max-w-[80px]"
          >
            <span v-show="loading" class="loading loading-spinner" />
            <p
              v-if="!loading"
              @click="$emit('pointModalOpen', index)"
              class="truncate cursor-pointer text-primary"
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
      <div>
        <div class="text-md text-gray-500 mb-1">Поисковые запросы:</div>
        <div class="w-[60%] flex flex-col gap-2">
          <BuyoutAvitoCreateSearchQueries
            :product-index="props.index"
            :article="product.article"
            :queries="product.searchQuery"
            @update="productSearchQueryUpdate"
            @add="addSearchQuery"
            @remove="removeSearchQuery"
          />
        </div>
      </div>
      
    </div>
  </div>
</template>

<style scoped></style>
