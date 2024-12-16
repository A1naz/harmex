<script setup lang="ts">
import type { Rule } from "@/data/buyout/rules";
import { useOzonBuyoutStore } from "../../../stores/ozonBuyout";

const props = defineProps({
  product: {
    type: Object as any,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  openDiscount: {
    type: Function,
    required: true,
  },
  openPromo: {
    type: Function,
    required: true,
  },
  loading: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits([
  "callback",
  "pointModalOpen",
  "ruleModalOpen",
  "removeDiscount",
  "removePromo",
]);

const { notify } = useNotification();

const startDate = ref(new Date(Date.now() + 1000 * 60 * 5));

const store = useOzonBuyoutStore();

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
    <td class="border-r border-base">
      <div class="w-48 truncate flex flex-col justify-center">
        <div class="text-sm font-normal truncate text-center">
          {{ product.name }}
        </div>
        <div class="text-center">
          <a
            :href="`https://www.ozon.ru/product/${product.article}`"
            target="_blank"
            class="text-sm text-primary truncate link link-hover text-center"
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
          class="select select-sm w-full bg-base-300 bg-opacity-40 max-w-[sm] appearance-none"
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
          class="border-base-100 text-base-300"
          @click="$emit('ruleModalOpen', index)"
        >
          <Icon name="mdi:settings" size="20" />
        </button>
      </div>
    </td>

    <td class="border-r border-base w-xs max-w-[100px] px-0.5">
      <div class="flex items-center mt-2 w-xs">
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
    <td class="break-all border-r border-base">
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
            class="break-all whitespace-normal cursor-pointer text-primary"
            @click="$emit('pointModalOpen', index)"
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
          class="btn btn-sm normal-case rounded-full p-1 bg-[#f0f5ff] dark:bg-primary dark:bg-opacity-10"
          @click="$emit('pointModalOpen', index)"
        >
          <span v-show="loading" class="loading loading-spinner" />
          <Icon v-if="!loading" name="fluent:add-24-filled" size="20" />
        </button>
      </div>
    </td>

    <td class="border-r border-base">
      <div class="w-full flex flex-col gap-2">
        <BuyoutOzonCreateSearchQueries
          :product-index="props.index"
          :article="product.article"
          :queries="product.searchQuery"
          @update="productSearchQueryUpdate"
          @add="addSearchQuery"
          @remove="removeSearchQuery"
        />
      </div>
    </td>
    <td class="w-[80px] border-r border-base">
      <div class="flex justify-between">
        <button
          :disabled="
            product.promoCode && product.promoCode !== '' ? true : false
          "
          class="w-full text-center btn btn-ghost dark:border-[#51535a] border-base-300 px-1.5 btn-sm btn-square text-base-content font-normal hover:text-primary whitespace-nowrap"
          @click="props.openDiscount(index, product.price)"
        >
          {{
            product.discountPrice && product.discountPrice !== product.price
              ? `${product.discountPrice} ₽`
              : "Указать скидку"
          }}
        </button>
        <button
          v-if="
            product.discountPrice && product.discountPrice !== product.price
          "
          class="w-fit btn btn-ghost btn-sm border-base-300 px-1 btn-square text-base-content font-normal hover:text-primary whitespace-nowrap -ml-6"
          @click="$emit('removeDiscount', index)"
        >
          <Icon name="ep:close-bold" size="12" />
        </button>
      </div>
      <div class="flex justify-between mt-1">
        <button
          :disabled="
            product.discountPrice && product.discountPrice !== product.price
          "
          class="w-full text-center btn btn-ghost dark:border-[#51535a] border-base-300 btn-sm btn-square text-base-content font-normal hover:text-primary whitespace-nowrap"
          @click="props.openPromo(index, product.price)"
        >
          {{ product.promoCode ? `${product.promoCode}` : "Указать промокод" }}
        </button>
        <button
          v-if="product.promoCode"
          class="w-fit btn btn-ghost btn-sm border-base-300 px-1 -ml-6 btn-square text-base-content font-normal hover:text-primary whitespace-nowrap"
          @click="$emit('removePromo', index)"
        >
          <Icon name="ep:close-bold" size="12" />
        </button>
      </div>
    </td>
    <td class="w-[20px] border-r border-base">
      <div class="flex justify-center">
        <input
          type="checkbox"
          :checked="product.FBS"
          @click="product.FBS ? (product.FBS = false) : (product.FBS = true)"
          class="checkbox checkbox-primary"
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
