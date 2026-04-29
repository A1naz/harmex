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
  categories: {
    type: Array as any,
    required: false,
    default: [],
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
      group: "error",
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

const { user }: any = useUserSession();
const categoryDropdown = ref<any>(null);

const selectCategory = (categories: any, index: number) => {
  store.createProducts[index].category = categories;
  categoryDropdown.value.click();
};
function notifyDigitalProduct() {
  if (!props.product.digitalProduct) {

    props.product.adress = ""
    notify({
      title: "Цифровой товар не будет доставлен на пвз, будьте внимательны",
      text: "",
      group: "success",
      duration: 5000,
    });
  }
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
          <Icon size="16" name="ic:round-minus" />
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
          <Icon size="16" name="ic:round-plus" />
        </div>
      </div>
    </td> -->
    <td class="border-r border-base">
      <div class="w-20 2xl:w-full flex items-center">
        <select
          v-if="product.sizes.length"
          class="select select-sm w-full bg-[#F3E9DD]"
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
          class="select select-sm w-full bg-[#F3E9DD] max-w-[sm] appearance-none"
          @change="onSexChange"
          v-model="product.sex"
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
          class="btn btn-sm normal-case rounded-full p-1 bg-[#F3E9DD] dark:bg-primary dark:bg-opacity-10"
          @click="$emit('pointModalOpen', index)"
        >
          <span v-show="loading" class="loading loading-spinner" />
          <Icon v-if="!loading" name="fluent:add-24-filled" size="20" />
        </button>
      </div>
    </td>

    <td class="border-r border-base">
      <div class="w-full flex gap-2 justify-center">
        <details
          class="dropdown disabled"
          v-if="
            product.searchQuery.length <= 1 && !product.searchQuery[0].value
          "
        >
          <summary
            class="btn btn-sm normal-case text-sm font-normal m-1 z-1 text-nowrap"
            ref="categoryDropdown"
            style="z-index: 1 !important"
            :class="{
              'btn-circle': !store.createProducts[props.index].category,
            }"
          >
            {{
              store.createProducts[props.index].category &&
              store.createProducts[props.index].category.length
                ? store.createProducts[props.index].category.join(" > ")
                : ""
            }}
            <Icon
              v-if="!store.createProducts[props.index].category"
              name="fluent:add-24-filled"
              size="20"
            />
          </summary>
          <ul
            style="z-index: 9999 !important"
            tabindex="0"
            class="dropdown-content rounded-box z-1 w-52 p-2 shadow-sm"
          >
            <button
              class="btn btn-sm btn-square relative left-1 -top-1 z-50"
              @click="categoryDropdown.click()"
            >
              <Icon name="material-symbols:close-rounded" size="18" />
            </button>
            <div
              class="overflow-y-auto bg-base-100 rounded-md -mt-10 fixed drop-shadow-lg pl-1"
              style="max-height: 400px; width: 500px"
            >
              <BuyoutOzonCategoryTreeSelect
                :categories="categories"
                @select-category="selectCategory($event, index)"
              />
            </div>
          </ul>
        </details>
        <button
          v-else
          class="btn m-1 text-sm z-1 font-normal btn-sm normal-case btn-circle"
          disabled
          style="z-index: 1 !important"
        >
          <Icon name="fluent:add-24-filled" size="20" />
        </button>
        <button
          class="btn btn-sm btn-square mt-1 -ml-2.5"
          v-if="product.category"
          @click="product.category = null"
        >
          <Icon name="material-symbols:close-rounded" size="18" />
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
    <td class="w-[140px] border-r border-base">
      <div class="flex justify-center mt-1">
        <div class="flex gap-2">
            
            <input     
            @click="notifyDigitalProduct"
              v-model="product.digitalProduct"
              type="checkbox"
              class="checkbox checkbox-primary border-base-content"
            />
          
          </div>
      </div>
    </td>
    <td class="w-[90px] border-r border-base">
      <div class="flex justify-center">
        <button
          v-if="
            !product.discountPrice || product.discountPrice == product.price
          "
          :disabled="
            product.promoCode && product.promoCode !== '' ? true : false
          "
          class="btn btn-sm normal-case rounded-full p-1.5 bg-[#F3E9DD] dark:bg-primary dark:bg-opacity-10 border-none"
          @click="props.openDiscount(index, product.price)"
        >
          <Icon name="fluent:add-24-filled" size="20" />
        </button>
        <span
          @click="props.openDiscount(index, product.price)"
          v-if="
            product.discountPrice && product.discountPrice !== product.price
          "
          class="break-all whitespace-nowrap cursor-pointer text-primary mt-2 mr-1"
          >{{ product.discountPrice }} ₽</span
        >
        <button
          v-if="
            product.discountPrice && product.discountPrice !== product.price
          "
          class="btn btn-sm normal-case rounded-full p-1.5 bg-[#F3E9DD] dark:bg-primary dark:bg-opacity-10 border-none"
          @click="$emit('removeDiscount', index)"
        >
          <Icon name="ep:close-bold" size="12" />
        </button>
      </div>
    </td>
    <td class="w-[80px] border-r border-base">
      <div class="flex justify-center mt-1">
        <button
          v-if="!product.promoCode"
          :disabled="
            product.discountPrice && product.discountPrice !== product.price
          "
          class="btn btn-sm normal-case rounded-full p-1.5 bg-[#F3E9DD] dark:bg-primary dark:bg-opacity-10 border-none"
          @click="props.openPromo(index, product.price)"
        >
          <Icon
            v-if="!product.promoCode"
            name="fluent:add-24-filled"
            size="20"
          />
        </button>
        <span
          @click="props.openPromo(index, product.price)"
          class="break-all whitespace-nowrap cursor-pointer text-primary mt-2 mr-1"
          >{{ product.promoCode }}</span
        >
        <button
          v-if="product.promoCode"
          class="btn btn-sm normal-case rounded-full p-1.5 bg-[#F3E9DD] dark:bg-primary dark:bg-opacity-10 border-none w-fit h-fit"
          @click="$emit('removePromo', index)"
        >
          <Icon name="ep:close-bold" size="12" />
        </button>
      </div>
    </td>
    <!-- <td class="w-[20px] border-r border-base">
      <div class="flex justify-center">
        <input
          type="checkbox"
          :checked="product.FBS"
          @click="product.FBS ? (product.FBS = false) : (product.FBS = true)"
          class="checkbox checkbox-primary"
        />
      </div>
    </td> -->
    <td class="border-r border-base w-[90px]">
      <div class="flex justify-end">
        <div
          class="w-8 btn btn-ghost btn-sm btn-square text-[#8f8e93] dark:text-base-300 hover:text-primary"
          @click="deleteBuyOut"
        >
          <Icon name="material-symbols:close" size="20" />
        </div>
        <div
          class="w-8 btn btn-ghost btn-sm btn-square text-[#8f8e93] dark:text-base-300 hover:text-primary"
          @click="copyBuyout"
        >
          <Icon
            name="material-symbols:content-copy-outline-rounded"
            size="20"
          />
        </div>
      </div>
    </td>
  </tr>
</template>

<style scoped></style>
