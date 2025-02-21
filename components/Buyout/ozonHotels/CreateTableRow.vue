<script setup lang="ts">
const { notify } = useNotification();
import type { Rule } from "@/data/buyout/rules";

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
  openPromo: {
    type: Function,
    required: true,
  },
});

const emit = defineEmits(["callback", "pointModalOpen", "ruleModalOpen"]);

const startDate = ref(new Date(Date.now() + 1000 * 60 * 5));

const store = useOzonHotelsBuyoutStore();
function copyBuyout() {
  if (store.createProducts.length >= 10) {
    notify({
      title: "За раз можно создать максимум 10 выкупов",
      type: "error",
    });
    return;
  }

  const item = JSON.stringify(store.createProducts[props.index]);
  store.createProducts.push(JSON.parse(item));
}
async function deleteBuyOut() {
  store.removeProduct(props.index);
}
function onSizeChange(event: Event) {
  const target = event.target as HTMLInputElement;
  store.changeSize(target.value, props.index);
}
function onSexChange(event: Event) {
  const target = event.target as HTMLInputElement;
  store.changeSex(target.value, props.index);
}

function removeSearchQuery(index: number) {
  store.removeSearchQuery(props.index, index);
}
function addSearchQuery() {
  store.addSearchQuery(props.index);
}
function productSearchQueryUpdate(event: Event, index: number) {
  const newValue = (event.target as HTMLInputElement).value;
  store.changeSearchQuery({
    value: newValue,
    queryIndex: index,
    productIndex: props.index,
  });
}
const productDateRangeModel = computed({
  get() {
    return props.product.dateRange;
  },
  set(newValue: unknown[]) {
    store.changeDateRange(newValue, props.index);
  },
});

const productQuantityModel = computed({
  get() {
    return props.product.quantity;
  },
  set(newValue: number) {
    store.changeQuantity(newValue, props.index);
  },
});

const { $dayjs } = useNuxtApp();

function getFirstDate(dates: [Date | null, Date | null] | []) {
  if (dates && dates[0]) return `${$dayjs(dates[0]).format("DD.MM")}`;

  return "";
}
function getSecondDate(dates: [Date | null, Date | null] | []) {
  if (dates && dates[1]) return `${$dayjs(dates[1]).format("DD.MM")}`;

  return "";
}
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
        <div class="dropdown dropdown-hover dropdown-right">
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
            :href="`https://www.ozon.ru/travel/hotels/product/${product.article}`"
            target="_blank"
            class="text-sm text-primary link link-hover text-center"
          >
            {{ product.article }}
          </a>
        </div>
      </div>
    </td>
    <td class="border-r border-base">
      <select
        v-if="product.roomsData.length"
        class="select select-sm w-full bg-[#f3e9dd]"
        @change="onSizeChange"
      >
        <option
          v-for="size in product.roomsData"
          :key="size.name"
          :selected="product.selectedSize === size.price + '|' + size.name"
          :value="size.price + '|' + size.name"
        >
          {{ size.price }} {{ size.name }}
        </option>
      </select>
      <div v-else class="text-sm text-center ml-2">Нет</div>
    </td>
    <td class="border-r border-base text-center">
      <div class="text-sm text-center w-full text-nowrap">
        {{ product.priceText }}
      </div>
    </td>

    <td class="border-r border-base w-20">
      <div class="w-20">
        <select
          class="select select-sm w-full bg-[#f3e9dd] max-w-sm appearance-none"
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
              ? product.rules.map((rule: Rule) => rule.id).join(", ")
              : ""
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
    <td class="border-r border-base w-10">
      <div class="text-center text-sm mt-2">
        <div>
          {{ getFirstDate(productDateRangeModel) }} -
          {{ getSecondDate(productDateRangeModel) }}
        </div>
      </div>
    </td>

    <td class="border-r border-base">
      <div class="w-full flex flex-col gap-2">
        <BuyoutOzonHotelsCreateSearchQueries
          :product-index="props.index"
          :article="product.article"
          :queries="product.searchQuery"
          @update="productSearchQueryUpdate"
          @add="addSearchQuery"
          @remove="removeSearchQuery"
        />
      </div>
    </td>
    <td class="w-[140px] border-r border-base">
      <div class="flex justify-between mt-1 mx-5">
        <button
          class="w-full text-center btn btn-ghost dark:border-[#51535a] border-base-300 btn-sm btn-square text-base-content font-normal hover:text-primary whitespace-nowrap px-1"
          @click="props.openPromo(index, product.price)"
        >
          {{ product.promoCode ? `${product.promoCode}` : "Указать промокод" }}
        </button>
        <button
          v-if="product.promoCode"
          class="w-fit btn btn-ghost btn-sm border-base-300 px-1 ml-[1px] btn-square text-base-content font-normal hover:text-primary whitespace-nowrap"
          @click="$emit('removePromo', index)"
        >
          <Icon name="ep:close-bold" size="12" />
        </button>
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
