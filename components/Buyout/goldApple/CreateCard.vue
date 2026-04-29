<script setup lang="ts">
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
});
const emit = defineEmits(["callback", "pointModalOpen", "ruleModalOpen"]);
const { notify } = useNotification();
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

const store = useGoldAppleBuyoutStore();
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

function setDeliveryDate(date: string, time: string) {
  store.createProducts[props.index].deliveryPeriodDate = date;
  store.createProducts[props.index].deliveryPeriodTime = time;
}

const { user }: any = useUserSession();
const categoryDropdown = ref<any>(null);

const selectCategory = (categories: any, index: number) => {
  store.createProducts[index].category = categories;
  categoryDropdown.value.click();
};

function onParameterChange(event: Event) {
  const index = store.createProducts[props.index].parameters.indexOf(
    (event.target as HTMLInputElement).value
  );
  store.createProducts[props.index].price =
    store.createProducts[props.index].prices[index];
  store.createProducts[props.index].priceText =
    store.createProducts[props.index].prices[index] + " ₽";
}

const infoModal = ref<any>(null);
const infoType = ref("");
function openInfoModal(type: string) {
  infoType.value = type;
  infoModal.value?.show();
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
              <Icon name="material-symbols:content-copy-outline-rounded" size="20" />Дублировать
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
                :href="product.url"
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
            @click="openInfoModal('sex')"
          >Пол</span>
          <select
            class="select select-sm border-none bg-[#F3E9DD] rounded-xl w-20 appearance-none"
            @change="onSexChange"
            v-model="product.sex"
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
          <div class="text-sm">
            {{ product.rules.length ? product.rules.map((rule: any) => rule.id).join(", ") : "" }}
          </div>
          <button class="border-base-100" @click="$emit('ruleModalOpen', index)">
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
            class="btn btn-sm normal-case rounded-full p-1 bg-[#f0f5ff] dark:bg-primary dark:bg-opacity-10 w-fit mx-auto"
            @click="$emit('pointModalOpen', index)"
          >
            <span v-show="loading" class="loading loading-spinner" />
            <Icon v-if="!loading" name="fluent:add-24-filled" size="20" />
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-1 mt-3">
        <span class="text-sm text-gray-500">Тип доставки</span>
        <select
          v-model="store.createProducts[props.index].deliveryType"
          class="select select-sm w-full bg-[#F3E9DD] max-w-sm appearance-none"
        >
          <option value="self" class="text-center">Самовывоз 0₽</option>
          <option value="market" class="text-center">Магазин 0₽</option>
          <option value="5Post" class="text-center">Постамат 5POST 100+₽</option>
          <option value="Яндекс Доставка" class="text-center">Яндекс доставка 100+₽</option>
        </select>
      </div>

      <div class="flex flex-col gap-1 mt-3">
        <span class="text-sm text-gray-500">Параметры</span>
        <select
          v-model="store.createProducts[props.index].selectedParameter"
          class="select select-sm w-full bg-[#F3E9DD] max-w-sm appearance-none"
          @change="onParameterChange($event)"
        >
          <option
            v-for="parameter in product.parameters"
            :key="parameter"
            :value="parameter"
          >
            {{ parameter }}
          </option>
        </select>
      </div>

      <div class="flex flex-col gap-1 mt-3">
        <span
          class="text-sm text-gray-500 underline decoration-dotted cursor-pointer hover:text-primary transition-colors w-fit"
          @click="openInfoModal('search')"
        >Поисковые запросы</span>
        <div class="w-full flex flex-col gap-2">
          <BuyoutGoldAppleCreateSearchQueries
            :product-index="props.index"
            :article="product.article"
            :queries="product.searchQuery"
            @update="productSearchQueryUpdate"
            @add="addSearchQuery"
            @remove="removeSearchQuery"
          />
        </div>
      </div>

      <div class="w-[60%] flex flex-col gap-2 mt-3">
        <BuyoutAvitoCreateSearchQueriesRegion
          :product-index="props.index"
          :article="product.article"
          :regions="product.searchQueryRegion"
          @update="productSearchQueryUpdate"
          @add="addSearchQuery"
          @remove="removeSearchQuery"
        />
      </div>
    </div>
  </div>

  <BuyoutHelpModal ref="infoModal" :info-type="infoType" />
</template>

<style scoped></style>
