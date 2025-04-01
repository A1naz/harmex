<script setup lang="tsx">
import type { Rule } from "@/data/buyout/rules";
import { rules } from "@/data/buyout/rules";
import { useWindowSize } from "@vueuse/core";

const { notify } = useNotification();

const currency = useCurrency();
const isCreateButtonDisabled = ref(false);
const { width } = useWindowSize();

const timer = ref(40);
const timerRunning = ref(false);
const timerFinished = ref(false);
let interval: any;
const disabledCreateButton = ref(false);
const ruleModal = ref(false);
const selectedRuleProductIndex = ref(0);
const checksModal = ref(false);
const infoModal = ref<HTMLDialogElement>();
const store = useOzonHotelsBuyoutStore();
const infoType = ref("");
const defaultRules: Rule[] = rules;
const article = ref<string>();
const products = computed(() => store.createProducts);
const { user } = useUserSession();
// const modalShow = ref(false);
const codeInput = ref();
const refreshKey = ref(1);
const dateRange = ref([]);
const startDate = ref(new Date(Date.now() + 1000 * 60 * 5));

definePageMeta({
  layout: "app",
  middleware: "auth",
  title: "Бронировать отель озон",
});
const isUserWarned: any = ref(false);
onMounted(() => {});

const loading = ref(false);

function startTimer() {
  timer.value = 40;
  timerRunning.value = true;

  interval = setInterval(() => {
    if (timer.value > 0 && loading.value) {
      timer.value--;
    } else {
      clearInterval(interval);
      timerRunning.value = false;
      timerFinished.value = true;
    }
  }, 1000);
}

async function addProduct() {
  if (!dateRange.value || !dateRange.value.length) {
    notify({
     group: "error",
      title: "Ошибка",
      text: "Выберите даты",
    });
    return;
  }

  if (!article.value) return;
  startTimer();
  loading.value = true;
  const string = article.value.toString().trim();

  store.addProduct(article.value, dateRange.value).finally(() => {
    loading.value = false;
  });

  article.value = "";
}
async function ruleModalOpen(index: number) {
  ruleModal.value = true;
  selectedRuleProductIndex.value = index;
}

function onRuleChange(event: Event, index: number, rule: number) {
  const target = event.target as HTMLInputElement;
  store.changeRule(target.checked, index, rule);
}

// function removeProduct(index: number) {
//   store.removeProduct(index)
// }

function openInfoModal(type: string) {
  infoType.value = type;
  infoModal.value?.showModal();
}

const totalSum = computed(() => {
  return products.value.reduce((acc, item) => {
    return acc + item.price * item.quantity;
  }, 0);
});

const totalQuantity = computed(() => {
  return products.value.reduce((acc, item) => {
    return acc + item.quantity;
  }, 0);
});

const modalOpen = ref(false);
const modalOpenFF = ref(false);
function closeModal() {
  modalOpen.value = false;
  modalOpenFF.value = false;
}

async function openChecksModal() {
  let valid = true;
  let errorMsg = "";
  products.value.forEach((item: any) => {
    if (!item.dateRange[0] || !item.dateRange[1]) {
      valid = false;
      errorMsg = "Не у всех товаров указаны даты выкупов";
    }
    if (!item.searchQuery[0].value) {
      valid = false;
      errorMsg = "Не у всех товаров указан поисковый запрос";
    }
    if (!item.selectedSize) item.selectedSize = "none";

    const minDate = new Date(item.dateRange[0]);
    const maxDate = new Date(item.dateRange[1]);
    const minDay = minDate.getDate();
    const maxDay = maxDate.getDate();
  });

  if (!valid) {
    notify({
      title: "Что-то пошло не так",
      text: errorMsg,
     group: "error",
      duration: 3000,
    });
    return;
  }
  checksModal.value = true;
}

async function createBuyout() {
  isCreateButtonDisabled.value = true;
  const userOffsetMinutes = new Date().getTimezoneOffset();
  const userTimezoneOffsetHours = -userOffsetMinutes / 60;
  const userTimezoneOffsetMinutesRemainder = -userOffsetMinutes % 60;
  disabledCreateButton.value = true;
  const { data, error } = await useFetch("/api/ozonHotels/buyout/create", {
    method: "POST",
    watch: false,
    body: JSON.stringify(products.value),
    query: {
      userTimezoneOffsetHours,
      userOffsetMinutes: userTimezoneOffsetMinutesRemainder,
    },
  });
  disabledCreateButton.value = false;
  if (error.value) {
    notify({
      title: "Что-то пошло не так",
      text: error.value?.data.message,
     group: "error",
      duration: 3000,
    });
    isCreateButtonDisabled.value = false;
  } else if (data.value!.status === "ok") {
    notify({
      title: "Выкуп успешно создан",
     group: "success",
      duration: 3000,
    });

    store.createProducts = [];
    navigateTo({ path: "/ozonHotels/buyouts" });
  }
}

watch(products.value, (old, value) => {
  value.forEach((item, index) => {
    if (item.quantity < 1) products.value[index].quantity = 1;

    if (item.quantity > 1000) products.value[index].quantity = 1000;
  });
});

onKeyStroke("Escape", (e) => {
  e.preventDefault();
  ruleModal.value = false;
  infoModal.value?.close();
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

const currentProductIndex = ref(0);
const currentProductPrice = ref(0);
const promoModal = ref(false);
function openPromo(productIndex: number, price: number) {
  currentProductIndex.value = productIndex;
  currentProductPrice.value = price;

  promoModal.value = true;
}

function removePromo(index: number) {
  console.log(index);
  store.createProducts[index].promoCode = "";
}
</script>

<template>
  <div class="px-4 sm:px-16 pt-8">
    <div
      class="breadcrumbs text-sm flex w-full justify-between flex-wrap-reverse"
    >
      <ul class="text-sm sm:text-base font-medium text-[18px] text-[#909090]">
        <li class="cursor-pointer">
          <NuxtLink to="/catalog" class="cursor-pointer text-[#909090]">
            Отели
          </NuxtLink>
        </li>
        <li class="cursor-pointer">
          <NuxtLink
            to="/catalog/ozonHotels"
            class="cursor-pointer text-[#909090]"
          >
            Отели Ozon
          </NuxtLink>
        </li>
        <li class="cursor-pointer">
          <NuxtLink
            to="/ozonHotels/buyouts"
            class="cursor-pointer text-[#909090]"
          >
            Брони
          </NuxtLink>
        </li>
        <li class="cursor-pointer text-[#1e2734]">Создать</li>
      </ul>
    </div>
    <div>
      <!-- <h1 class="text-2xl font-bold mt-4">Добавить выкупы</h1>
    <p class="text-xs text-gray-500 font-light mt-1 lg:text-sm">
      Создайте новые выкупы. Введите артикулы товаров и заполните необходимые
      данные.
    </p> -->
      <div
        v-if="loading"
        style="background-color: rgb(37, 37, 42); opacity: 80%; z-index: 9999"
        class="fixed z-[50] top-0 left-0 right-0 bottom-0 w-full h-screen overflow-hidden flex flex-col items-center justify-center"
      >
        <span class="text-white text-2xl text-center">
          До получения продукта осталось приблизительно {{ timer }} сек.
        </span>
        <div class="ease-linear rounded-full mb-4">
          <Icon name="mdi:loading" class="h-20 w-20 animate-spin text-white" />
        </div>
      </div>
      <div class="flex flex-col md:flex-row md:justify-between">
        <div class="mt-6 md:flex items-center gap-2.5 w-full">
          <div
            class="relative flex justify-end items-center flex-grow-0 md:w-80 gap-2.5 w-full"
          >
            <input
              ref="codeInput"
              v-model="article"
              placeholder="ссылка на отель или номер"
              class="input input-sm w-full mb-2 md:mb-0 bg-base-200 border-base-200"
              @keydown.enter="addProduct"
            />
            <Icon
              class="absolute right-2 mb-2 md:mb-0 p-2 text-base-content text-opacity-50"
              name="tabler:search"
             size="20"
              @click="codeInput.focus()"
            />
          </div>
          <div class="flex gap-2.5">
            <BuyoutOzonHotelsDateRangePicker
              class="-mt-1"
              v-model="dateRange"
              :start-date="startDate"
              @reset="dateRange = []"
            >
              <button
                v-if="!dateRange[0] && !dateRange[1]"
                class="h-[32px] w-12 border-primary mt-1 border-[1px] text-primary rounded-[6px]"
              >
                <Icon name="solar:calendar-linear" class="mt-1" size="22px" />
              </button>
              <button
                v-else
                class="h-[32px] px-2 border-primary mt-1 border-[1px] text-primary rounded-[6px]"
              >
                {{ getFirstDate(dateRange) }} -
                {{ getSecondDate(dateRange) }}
              </button>
            </BuyoutOzonHotelsDateRangePicker>
            <button
              class="btn btn-primary text-white hover:text-base-100 btn-sm normal-case border-none font-normal"
              :disabled="!article || article == ''"
              @click="addProduct"
            >
              Добавить
            </button>
            <!-- <label
              for="template-select-modal"
              class="btn btn-sm btn-primary normal-case border-none bg-base-200 text-base-content mr-0 md:mr-1 mb-2 md:mb-0 font-normal hover:bg-primary hover:text-base-100"
              @click="getTemplates"
              >Шаблоны</label
            > -->
          </div>
        </div>
      </div>
      <div class="flex gap-2 mt-4">
        <div class="text-sm">
          <span class="text-gray-500">Товаров: </span>
          <span>{{ totalQuantity }} шт.</span>
        </div>
        <div class="text-sm">
          <span class="text-gray-500">Сумма: </span>
          <span>{{ currency.format(totalSum) }}</span>
        </div>
      </div>

      <ClientOnly>
        <div
          v-if="width < 1600"
          class="products-card grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 mt-4"
        >
          <BuyoutOzonHotelsCreateCard
            v-for="(product, index) in products"
            :key="`${index}_${refreshKey}`"
            :loading="false"
            :product="product"
            :index="index"
            :open-promo="openPromo"
            @removePromo="removePromo"
            @point-modal-open="false"
            @rule-modal-open="ruleModalOpen"
          />
        </div>
        <div
          v-else
          class="products-table scrollbar-thumb-primary scrollbar-track-base-200 scrollbar-thin"
        >
          <table class="table table-xs w-full mt-4">
            <thead class="relative mb-2 text-sm text-base-content">
              <tr class="bg-[#f3e9dd]">
                <!-- <th class="hidden 3xl:block">№</th> -->
                <th
                  class="w-12 text-center p-2 font-normal"
                  @click="openInfoModal('picture')"
                >
                  <!-- <Icon name="material-symbols:image-outline" size="20" /> -->
                  Фото
                </th>
                <th class="w-36 3xl:w-48 text-center font-normal">Название</th>

                <th class="font-normal">
                  <!-- <div class="flex justify-between w-full gap-1 items-center"> -->
                  <div class="text-center">
                    <span> Номер </span>
                    <!-- <span class="rounded-lg bg-base-200 px-1 text-xs"> ? </span> -->
                  </div>
                </th>
                <th
                  class="text-center font-normal"
                  @click="openInfoModal('price')"
                >
                  <div class="flex w-full items-center justify-center">
                    <span> Цена </span>
                    <!-- <span class="rounded-lg bg-base-200 px-1 text-xs"> ? </span> -->
                  </div>
                </th>
                <th class="font-normal">
                  <!-- <div class="flex justify-between w-full gap-1 items-center"> -->
                  <div class="text-center">
                    <span> Пол </span>
                    <!-- <span class="rounded-lg bg-base-200 px-1 text-xs"> ? </span> -->
                  </div>
                </th>
                <!-- <th class="font-normal" @click="openInfoModal('rules')">
   
                  <div class="text-center">
                    <span> Правила </span>
   
                  </div>
                </th> -->
                <th class="font-normal" @click="openInfoModal('dates')">
                  <!-- <div class="flex justify-between w-full gap-1 items-center"> -->
                  <div class="text-center">
                    <span> Даты бронирования </span>
                    <!-- <span class="rounded-lg bg-base-200 px-1 text-xs"> ? </span> -->
                  </div>
                </th>

                <!-- <th
                  class="min-w-40 font-normal"
                  @click="openInfoModal('adress')"
                >
          
                  <div class="text-center">
                    <span> Адрес </span>
        
                  </div>
                </th> -->
                <th
                  class="font-normal text-base-content"
                  @click="openInfoModal('search')"
                >
                  <div class="flex justify-center items-center gap-1">
                    <span>Поисковые запросы</span>
                    <!-- <span class="rounded-lg bg-base-200 px-1 text-xs">?</span> -->
                  </div>
                </th>

                <th class="font-normal text-base-content">
                  <div class="flex justify-center items-center gap-1">
                    <span>Промокод</span>
                    <!-- <span class="rounded-lg bg-base-200 px-1 text-xs">?</span> -->
                  </div>
                </th>

                <th class="text-base-content" />
              </tr>
            </thead>

            <tbody>
              <BuyoutOzonHotelsCreateTableRow
                v-for="(product, index) in products"
                :key="`${index}_${refreshKey}`"
                :product="product"
                :index="index"
                :loading="false"
                :open-promo="openPromo"
                @removePromo="removePromo"
                @rule-modal-open="ruleModalOpen"
                @point-modal-open="false"
              />
            </tbody>
          </table>
        </div>
      </ClientOnly>
      <div
        v-show="products.length"
        class="mt-6 md:flex justify-start lg:justify-end"
      >
        <div class="m-5 mb-20">
          <!-- <label
          v-if="store.createProducts.length > 0"
          class="btn btn-sm btn-error bg-red-400 normal-case mt-1 ml-0 md:mt-0 md:ml-2 z-0"
          for="removeAllModelCreateProducts"
          >Удалить все</label
        > -->
          <!-- <label
            class="btn btn-sm btn-primary normal-case border-none bg-base-200 text-base-content mt-2 md:mt-0 ml-1 md:ml-2 px-6 font-normal"
            for="template-modal"
          >
            Шаблон
          </label> -->

          <button
            class="btn btn-sm btn-primary normal-case border-none text-white mt-1 ml-2 font-normal"
            :disabled="disabledCreateButton"
            @click="openChecksModal"
          >
            <!-- {{
            products.length > 1
              ? `Создать
          выкупы`
              : `Создать выкуп`
          }} -->
            Создать
          </button>
        </div>
      </div>

      <div v-if="ruleModal">
        <input id="ruleModal" type="checkbox" class="modal-toggle" />
        <label
          for="ruleModal"
          class="modal modal-open modal-bottom sm:modal-middle cursor-pointer"
          @click="ruleModal = false"
        >
          <label for="" class="modal-box relative" @click.stop>
            <label
              for="ruleModal"
              class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              @click="ruleModal = false"
              >✕</label
            >
            <h3 class="font-bold text-lg mb-2">
              Выберите нужные правила для этого выкупа
            </h3>
            <div v-for="rule of defaultRules" :key="rule.id" class="">
         
              <div
                class="label cursor-pointer gap-4 items-start justify-between hidden"
              >
                <span class="label-text"
                  >{{ rule.id }}. {{ rule.description }}</span
                >
                <input
                  :disabled="
                    !!store.createProducts[selectedRuleProductIndex].rules.find(
                      (item) =>
                        item.category === rule.category && item.id !== rule.id
                    ) ||
                    !!store.createProducts[selectedRuleProductIndex].rules.find(
                      (item) => item.id === rule?.relies
                    )
                  "
                  type="checkbox"
                  class="checkbox checkbox-primary border-base-content"
                  :checked="
                    !!store.createProducts[selectedRuleProductIndex].rules.find(
                      (item) => item.id === rule.id
                    )
                  "
                  @change="
                    onRuleChange($event, selectedRuleProductIndex, rule.id)
                  "
                />
              </div>
            </div>
          </label>
        </label>
      </div>
      <dialog id="infoModal" ref="infoModal" class="modal">
        <form method="dialog" class="modal-box p-4">
          <h3 class="font-bold text-lg">Информация</h3>
          <div class="py-4 flex flex-col gap-2">
            <p v-if="infoType === 'picture'">
              <span class="font-bold"> Изображение </span>
              - Увеличивайте изображение товара просто наводя на него курсором
            </p>
            <p v-if="infoType === 'price'">
              <span class="font-bold"> Цена </span>
              - Цена товара указана без СПП
            </p>

            <p v-if="infoType === 'size'">
              <span class="font-bold"> Размер </span>
              - Выберите желаемый размер товара
            </p>
            <p v-if="infoType === 'sex'">
              <span class="font-bold"> Пол </span>
              - Выберите желаемый Пол для выкупов
            </p>
            <div v-if="infoType === 'search'">
              <div>
                <span class="font-bold"> Поисковые запросы </span>
                - Введите поисковые запросы, чем больше, тем лучше нажимая на
                "+"
              </div>
              <div class="text-sm">
                Например, при указании 5 поисковых запросов - каждый будет
                выкупаться по своему запросу, если по данному запросу товар не
                найден, то запрос игнорируется.
              </div>
            </div>
            <p v-if="infoType === 'adress'">
              <span class="font-bold"> Адрес </span>
              - Добавьте Адрес желаемого ПВЗ от куда вы будете забирать товар
            </p>
            <p v-if="infoType === 'dates'">
              <span class="font-bold"> Даты выкупов </span>
              - Выберите желаемый диапазон дат и времени для выкупов
            </p>
            <p v-if="infoType === 'rules'">
              <span class="font-bold"> Правила </span>
              - Используйте Правила для создания дополнительной безопасности
              ваших выкупов
            </p>
          </div>
          <div class="modal-action mt-0">
            <button class="btn btn-sm">Закрыть</button>
          </div>
        </form>
      </dialog>
      <BuyoutOzonHotelsCreateChecksModal
        v-if="checksModal"
        :is-create-button-disabled="isCreateButtonDisabled"
        :state="checksModal"
        @create="createBuyout"
        @close="checksModal = false"
      />
    </div>
    <BuyoutOzonHotelsPromoModal
      :show="promoModal"
      :index="currentProductIndex"
      :price="currentProductPrice"
      @close-modal="promoModal = false"
    />
  </div>
</template>

<style scoped>
th {
  @apply normal-case hover:text-primary hover:cursor-pointer;
}

table td,
table td * {
  vertical-align: top;
}

.b24-widget-button-wrapper {
  position: hidden;
  z-index: 0;
}

.b24-widget-button-shadow {
  position: hidden;
  z-index: 0;
}
</style>
