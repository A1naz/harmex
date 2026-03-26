<script setup lang="ts">
const { notify } = useNotification();
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
  categories: {
    type: Array as any,
    required: false,
    default: [],
  },
  openPromo: {
    type: Function as any,
    required: false,
    default: () => {},
  },
});

const emit = defineEmits(["callback", "pointModalOpen", "ruleModalOpen", "removePromo"]);

const infoModal = ref<any>(null);
const infoType = ref("");

function openInfoModal(type: string) {
  infoType.value = type;
  infoModal.value?.show();
}

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

const store = useWildberriesBuyoutStore();
const startDate = ref(new Date(Date.now()));

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
    queryIndex: props.index,
    productIndex: index,
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

const rulesText = computed(() => {
  const parts = [];
  if (props.product.rules && props.product.rules.length > 0) {
    parts.push(props.product.rules.map((rule: Rule) => rule.id).join(", "));
  }
  if (props.product.shelves) {
    parts.push("Выкуп с полок");
  }
  return parts.join(", ");
});
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
              <Iconme="material-symbols:content-copy-outline-rounded" size="20" />Дублировать
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
                :href="`https://www.wildberries.ru/catalog/${product.article}/detail.aspx`"
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
            <Icon name="material-symbols-light:content-copy" size="18" />
          </div>
          <div
            class="w-8 btn btn-ghost btn-sm btn-square text-base-content text-opacity-50"
            @click="deleteBuyOut"
          >
            <Icon name="material-symbols:close" size="18" />
          </div>
        </div>
      </div>
      <div class="flex justify-start gap-8 mt-1">
        <div class="flex flex-col gap-1">
          <span
            class="text-sm text-gray-500 underline decoration-dotted cursor-pointer hover:text-primary transition-colors"
            @click="openInfoModal('price')"
          >Цена</span>
          <span class="text-sm font-bold">{{ product.priceText }}</span>
        </div>
        <div class="flex flex-col gap-1">
          <span
            class="text-sm text-gray-500 underline decoration-dotted cursor-pointer hover:text-primary transition-colors"
            @click="openInfoModal('size')"
          >Размер</span>
          <div class="flex items-center">
            <select
              v-if="product.sizes.length"
              class="select select-sm border-none bg-[#F3E9DD] w-full rounded-xl"
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
            <div v-else class="text-sm">Нет</div>
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <span
            class="text-sm text-gray-500 underline decoration-dotted cursor-pointer hover:text-primary transition-colors"
            @click="openInfoModal('sex')"
          >Пол</span>
          <select
            class="select select-sm border-none bg-[#F3E9DD] rounded-xl w-20 appearance-none"
            @change="onSexChange"
          >
            <option value="Нет">Нет</option>
            <option value="male">Муж</option>
            <option value="female">Жен</option>
          </select>
        </div>
      </div>

      <div class="flex flex-col gap-1 mt-3">
        <span
          class="text-sm text-gray-500 underline decoration-dotted cursor-pointer hover:text-primary transition-colors w-fit"
          @click="openInfoModal('rules')"
        >Правила</span>
        <div class="flex items-center gap-2">
          <div class="text-sm">{{ rulesText }}</div>
          <button
            class="border-base-100"
            @click="$emit('ruleModalOpen', index)"
          >
            <Icon class="w-5 h-5" name="solar:settings-outline" alt="settings" />
          </button>
        </div>
      </div>

      <div class="flex justify-start gap-6 mt-3">
        <div class="flex flex-col gap-1">
          <span
            class="text-sm text-gray-500 underline decoration-dotted cursor-pointer hover:text-primary transition-colors w-fit"
            @click="openInfoModal('dates')"
          >Дата выкупов</span>
          <div>
            <BuyoutDateRangePicker
              v-if="!product.purchaseSoon"
              v-model="productDateRangeModel"
              :start-date="startDate"
            />
            <div v-else class="text-center text-xs">Ближайшее время</div>
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <span
            class="text-sm text-gray-500 underline decoration-dotted cursor-pointer hover:text-primary transition-colors w-fit"
            @click="openInfoModal('adress')"
          >Адрес</span>
          <div
            v-if="product.adress"
            class="text-xs h-10 w-full truncate max-w-[150px]"
          >
            <span v-show="loading" class="loading loading-spinner" />
            <p
              v-if="!loading"
              class="truncate cursor-pointer text-primary"
              @click="$emit('pointModalOpen', index)"
            >
              {{ product.adress }}
            </p>
          </div>
          <button
            v-if="!product.adress"
            :disabled="loading"
            :class="{ 'btn-outline': product.adress }"
            class="btn btn-sm normal-case rounded-full p-1 bg-[#F3E9DD] dark:bg-primary dark:bg-opacity-10 w-fit mx-auto"
            @click="$emit('pointModalOpen', index)"
          >
            <span v-show="loading" class="loading loading-spinner" />
            <Icon v-if="!loading" name="fluent:add-24-filled" size="20" />
          </button>
        </div>
      </div>

      <div class="flex items-center gap-3 mt-3">
        <span
          class="text-sm text-gray-500 underline decoration-dotted cursor-pointer hover:text-primary transition-colors"
          @click="openInfoModal('digitalProduct')"
        >Цифровой товар</span>
        <input
          v-model="product.digitalProduct"
          type="checkbox"
          class="checkbox checkbox-primary border-base-content"
          @click="notifyDigitalProduct"
        />
      </div>

      <div class="flex flex-col gap-1 mt-3">
        <span
          class="text-sm text-gray-500 underline decoration-dotted cursor-pointer hover:text-primary transition-colors w-fit"
          @click="openInfoModal('search')"
        >Поисковые запросы</span>
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
      </div>

      <div class="flex flex-col gap-1 mt-3">
        <span
          class="text-sm text-gray-500 underline decoration-dotted cursor-pointer hover:text-primary transition-colors w-fit"
          @click="openInfoModal('shelves')"
        >SKU конкурента</span>
        <input
          v-model="product.competitorArticle"
          type="text"
          class="input bg-base-200 input-sm w-full rounded-xl"
          :disabled="!product.shelves"
          placeholder="Артикул конкурента"
        />
      </div>

      <div class="flex items-center gap-3 mt-3">
        <span
          class="text-sm text-gray-500 underline decoration-dotted cursor-pointer hover:text-primary transition-colors"
          @click="openInfoModal('promoCode')"
        >Промокод</span>
        
        <div class="flex items-center gap-1">
          <button
            v-if="!product.promoCode"
            class="btn btn-sm normal-case rounded-full p-1.5 bg-[#F3E9DD] dark:bg-primary dark:bg-opacity-10 border-none"
            @click="props.openPromo(index, product.price)"
          >
            <Icon name="fluent:add-24-filled" size="20" />
          </button>
          <span
            v-if="product.promoCode"
            class="break-all whitespace-nowrap cursor-pointer text-primary mr-1"
            @click="props.openPromo(index, product.price)"
          >{{ product.promoCode }}</span>
          <button
            v-if="product.promoCode"
            class="btn btn-sm normal-case rounded-full p-1.5 bg-[#F3E9DD] dark:bg-primary dark:bg-opacity-10 border-none w-fit h-fit"
            @click="emit('removePromo', index)"
          >
            <Icon name="ep:close-bold" size="12" />
          </button>
        </div>
      </div>

        <div class="flex items-center gap-3 mt-3">
        <span
          class="text-sm text-gray-500 underline decoration-dotted cursor-pointer hover:text-primary transition-colors"
          @click="openInfoModal('digitalProduct')"
        >Цифровой товар</span>
        <input
          v-model="product.digitalProduct"
          type="checkbox"
          class="checkbox checkbox-primary border-base-content"
          @click="notifyDigitalProduct"
        />
      </div>
      <div class="flex flex-col gap-1 mt-3">
        <span
          class="text-sm text-gray-500 underline decoration-dotted cursor-pointer hover:text-primary transition-colors w-fit"
          @click="openInfoModal('category')"
        >Категория</span>
        <div class="w-full flex gap-2">
          <details
            v-if="product.searchQuery.length <= 1 && !product.searchQuery[0].value"
            class="dropdown disabled"
          >
            <summary
              ref="categoryDropdown"
              class="btn btn-sm normal-case text-sm font-normal m-1 z-1"
              style="z-index: 1 !important"
            >
              {{
                store.createProducts[props.index].category &&
                store.createProducts[props.index].category.length
                  ? store.createProducts[props.index].category.join(" > ")
                  : "Выбрать категорию"
              }}
            </summary>
            <ul
              tabindex="0"
              class="dropdown-content rounded-box z-1 w-52 p-2 shadow-sm"
              style="z-index: 9999 !important"
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
                <BuyoutWildberriesCategoryTreeSelect
                  :categories="categories"
                  @select-category="selectCategory($event, index)"
                />
              </div>
            </ul>
          </details>
          <button
            v-else
            class="btn m-1 text-sm z-1 font-normal btn-sm normal-case"
            disabled
            style="z-index: 1 !important"
          >
            Выбрать категорию
          </button>
          <button
            v-if="product.category"
            class="btn btn-sm btn-square mt-1 -ml-2.5"
            @click="product.category = null"
          >
            <Icon name="material-symbols:close-rounded" size="18" />
          </button>
        </div>
      </div>
    </div>
  </div>

  <BuyoutHelpModal ref="infoModal" :info-type="infoType" />
</template>

<style scoped></style>
