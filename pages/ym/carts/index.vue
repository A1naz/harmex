<!-- eslint-disable unused-imports/no-unused-vars -->
<script setup lang="ts">
const { notify } = useNotification();

definePageMeta({
  layout: "app",
  middleware: "auth",
  title: "Корзина",
});
const mpStore = useMPStore();
const route = useRoute();
const router = useRouter();
const sortPage = ref("all");
const sortPageDate = ref("");

const search = reactive({
  text: "",
  loading: false,
  error: false,
  type: "article",
});
const codeInput = ref();
const carts = ref([]) as any;
const amount = ref(0);
const loadingUrl = ref(false);
const period = ref("3h");
const query = ref("");
const article = ref("");
const size = ref("none");
const productData = ref<any>(null);
const urlError = ref(false);
const modalShow = ref<boolean>(false);
const logModal = ref(false);
const selectedCart = ref({
  uuid: "",
});

const loading = ref(false);
const limit = ref(50);
const skip = ref(0);
const end = ref(false);
const target = ref(null);
const targetIsVisible = ref(false);
const { stop } = useIntersectionObserver(target, ([{ isIntersecting }]) => {
  targetIsVisible.value = isIntersecting;
});
watch(targetIsVisible, async (isVisible) => {
  if (!end.value && isVisible && carts.value.length >= limit.value) {
    await getCarts();
  }
});
async function getCarts() {
  modalShow.value = false;
  const { data, error } = await useFetch("/api/yandexMarket/cart/get", {
    method: "GET",
    query: {
      statusQuery: sortPage.value,
      dateFilter: sortPageDate.value,
      string: search.text,
      type: search.type,
      limit: limit.value,
      skip: skip.value,
    },
    watch: false,
  });
  if ((data.value as any)?.length === 0) {
    loading.value = false;
    end.value = true;
    return;
  }
  if (data.value) {
    carts.value = [...carts.value, ...(data.value! as any)];
    loading.value = false;
  }

  if (error.value) {
    notify({
      type: "error",
      title: "Не удалось получить корзины",
      text: error.value.message,
    });
  }
  skip.value += limit.value;
  loading.value = false;
}
await getCarts();
async function getProductInfo() {
  if (!article.value) return;

  const { data, error } = await useFetch(
    `/api/yandexMarket/product/${article.value}`,
    {
      method: "GET",
    }
  );
  if ((data.value as any)?.product) {
    productData.value = (data.value as any).product;
    if (productData.value?.sizes && productData.value.sizes.length > 0) {
      size.value = productData.value.sizes[0];
    }
    urlError.value = false;
  }
  if (error.value) urlError.value = true;

  loadingUrl.value = false;
}
let timeout = null as NodeJS.Timer | null;
async function changeUrl() {
  if (article.value === "") return;
  loadingUrl.value = true;
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(getProductInfo, 2000);
}
function selectPeriod(event: any) {
  period.value = event.target.value;
}
function selectSize(event: any) {
  size.value = event.target.value;
}
function getStatus(status: string) {
  if (status === "created") return "Создан";
  else if (status === "work") return "В работе";
  else if (status === "busy") return "В работе";
  else if (status === "completed") return "Завершен";
  else if (status === "archived") return "В архиве";
  else if (status === "nofunds") return "Недостаточно средств";
  else return status;
}

async function resumeStatus(item: any) {
  const { data, error } = await useFetch("/api/yandexMarket/cart/resume", {
    method: "POST",
    body: {
      item,
    },
    watch: false,
  });
  if (error.value) {
    notify({
      title: "Что-то пошло не так",
      text: error.value?.data?.message,
      type: "error",
      duration: 3000,
    });
    return;
  }
  if (data.value) {
    notify({
      type: "success",
      title: "Успешно",
      text: "Корзина успешно возвращена в работу",
      duration: 3000,
    });
    selectFilterDate({ value: sortPage.value });
  }
}

function removeProduct() {
  productData.value = null;
  article.value = "";
  amount.value = 0;
}

async function selectFilterDate(e: any, date?: boolean) {
  if (date) {
    sortPageDate.value = e.value;
  } else {
    sortPage.value = e.value;
  }
  loading.value = true;
  carts.value = [];
  skip.value = 0;
  end.value = false;
  await getCarts();
}

async function findBuyouts(value: string, type: string) {
  carts.value = [];
  skip.value = 0;
  end.value = false;
  if (!value) {
    search.loading = false;
    await getCarts();
    return;
  }
  loading.value = true;
  await getCarts();

  search.loading = false;
}

const findBuyoutsDebounced = useDebounceFn(findBuyouts, 1000);

async function onSearchInput(event: Event) {
  const newValue = (event.target as HTMLInputElement).value;
  search.loading = true;
  findBuyoutsDebounced(search.text, search.type);
}

function updateSearchType(filter: any) {
  search.type = filter.value;
}

function changeFilter(e: any) {
  mpStore.changeMp(e.value, "cart");
}

onMounted(() => {
  if (route.query.modalShow) {
    modalShow.value = route.query.modalShow === "true";
    const query = { ...route.query };
    delete query.modalShow;
    router.push({ query });
  }
});

const orgInfo = ref({}) as any;
const isVisible = ref(false);

async function getOrgInfo() {
  const currentPath = router.currentRoute.value.path;

  const pathSegments = currentPath.split("/").filter(Boolean);

  const mp = pathSegments[0];
  const serviceType = `/${pathSegments[1]}`;

  const { data }: any = await useFetch("/api/catalog/getOrgInfo", {
    method: "GET",
    query: {
      serviceType,
      mp,
    },
  });

  if (!data.value) return;
  orgInfo.value = data.value.orgInfo;
}
getOrgInfo();

async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text);
  notify({
    title: "Успешно",
    text: "Ссылка на услугу скопирована",
  });
}

const config = useRuntimeConfig();
const siteUrl = config.public.siteUrl;
</script>

<template>
  <div class="px-4 sm:px-16 pt-8">
    <div
      class="breadcrumbs text-sm flex w-full justify-between flex-wrap-reverse"
    >
      <ul class="text-sm sm:text-base font-medium text-[18px] text-[#909090]">
        <li class="cursor-pointer">
          <NuxtLink to="/catalog" class="cursor-pointer text-[#909090]">
            Маркетплейсы
          </NuxtLink>
        </li>
        <li class="cursor-pointer">
          <NuxtLink to="/catalog/ym" class="cursor-pointer text-[#909090]">
            Yandex Market
          </NuxtLink>
        </li>
        <li class="cursor-pointer text-[#1e2734]">Корзины</li>
      </ul>
      <div v-if="orgInfo && orgInfo.title" class="flex gap-3">
        <div
          class="bg-transparent rounded-lg shadow-xs flex gap-2 items-center text-center"
        >
          <div class="org-name font-semibold text-gray-800">
            {{ orgInfo.title.toUpperCase() }}
          </div>

          <CustomShopTooltip :visible="isVisible" :info="orgInfo" />
          <button
            class="p-1 flex flex-col justify-center items-center text-center bg-gray-10 hover:bg-gray-200 rounded-lg text-[#909090]"
            @click="copyToClipboard(`${siteUrl}/ym/carts`)"
          >
            <Icon name="ph:share-fat-fill" size="20" />
          </button>
        </div>
      </div>
    </div>
    <div class="flex justify-start lg:justify-between mb-4 items-center mt-4">
      <div
        class="flex relative gap-2 lg:gap-3 flex-col lg:flex-row w-full lg:w-full"
      >
        <div class="flex gap-2 ml-2">
          <button
            class="btn btn-primary dark:bg-primary border-none font-normal btn-sm"
            @click="modalShow = true"
          >
            <Icon name="fluent:add-24-filled" size="25" />
          </button>
        </div>
        <div class="w-full flex gap-2 lg:gap-2">
          <div class="flex gap-1 lg:gap-3 flex-nowrap whitespace-nowrap">
            <span>
              <CustomSelect
                class="h-[2rem] sm:min-w-[120px]"
                :tabs="[
                  { title: 'Все корзины', value: 'all' },
                  { title: 'Активные', value: 'work' },
                  { title: 'Завершенные', value: 'completed' },
                  { title: 'Недостаточно средств', value: 'nofunds' },
                  { title: 'В архиве', value: 'archived' },
                ]"
                @change-value="selectFilterDate"
              />
            </span>
          </div>
          <div class="flex lg:ml-auto gap-2 lg:gap-3">
            <CustomSelect
              class="h-[2rem] bg-[#f4f4f4] sm:min-w-[120px]"
              :tabs="[
                { title: 'За все время', value: 'all' },
                { title: 'Сегодня', value: 'today' },
                { title: '3 дня', value: '3days' },
                { title: 'Неделя', value: '7days' },
              ]"
              @change-value="selectFilterDate($event, true)"
            />
          </div>
          <div
            class="absolute right-0 top-0 w-[calc(100%-65px)] lg:w-fit lg:static"
          >
            <div class="relative justify-end flex-grow-0 w-full">
              <input
                ref="codeInput"
                v-model="search.text"
                type="text"
                class="input input-sm bg-base-200 text-gray-500 w-full"
                placeholder="Поиск по артикулу"
                @input="onSearchInput($event)"
              />
              <span
                v-if="search.loading"
                class="absolute right-2 loading loading-spinner loading-xs p-2 mt-2"
              />
              <Icon
                v-else
                class="absolute right-0.5 p-2 my-auto text-[#8f8e93]"
                name="tabler:search"
                size="35"
                @click="codeInput.focus()"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- <div class="collapse collapse-plus bg-base-100 rounded-box mb-4 mt-6">
      <input type="checkbox" />

      <div class="collapse-title text-xl font-medium">Добавить в корзину</div>
      <div class="collapse-content">
        <div class="bg-base-200 rounded-lg">

        </div>
      </div>
    </div> -->

    <!-- <div class="text-red-500 ml-1 mt-1" v-if="store.client.username !== 'test'">
      Функционал временно недоступен
    </div> -->

    <div v-if="carts.length && !loading" class="mt-4">
      <div>
        <CartYandexMarketTable
          :get-status="getStatus"
          :resume-status="resumeStatus"
          :carts="carts"
          @log-modal="(item:any) => [(selectedCart = item), (logModal = true)]"
        />
        <div ref="target" class="flex justify-center items-center h-4" />
      </div>
    </div>
    <div v-else-if="!loading">
      <Hero />
    </div>
    <div
      v-if="loading"
      class="w-full mt-5 flex justify-center items-center h-80"
    >
      <span class="loading loading-dots loading-lg text-primary" />
    </div>
    <CartYandexMarketCreateCart
      :show="modalShow"
      @close-modal="modalShow = false"
      @create="getCarts()"
    />
    <LogModal
      :info="selectedCart"
      :state="logModal"
      @close="logModal = false"
    />
  </div>
</template>

<style scoped></style>
