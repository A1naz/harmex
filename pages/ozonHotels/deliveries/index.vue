<script setup lang="ts">
const { notify } = useNotification();

definePageMeta({
  layout: "app",
  middleware: "auth",
  title: "Доставки",
});
const openAll = ref(false);
const route = useRoute();
const deliveries = ref([]) as any;
const autoTarget = ref(true);
const loading = ref(true);
const codeInputMob = ref();
const loadingExport = ref(false);
const dateRange = ref([]);
const startDate = ref(new Date(Date.now() + 1000 * 60 * 5));
const status = computed(() => route.query?.status || "all");
const search = reactive({
  text: "",
  loading: false,
  error: false,
  type: "article",
});

// function selectStatus(e: Event) {
//   const target = e.target as HTMLSelectElement
//   router.push({
//     path: '/delivery',
//     query: {
//       status: target.value,
//     },
//   })
// }
const modalInfo = reactive({
  src: "",
  code: 0,
});
const modal = ref(false);
const statusModal = ref(false);
const penaltyModal = ref(false);
const currentStatusdDelivery = ref<any[]>([]);
const selectedDelivery = ref<any>();
const selectedIndex = ref(-1);
function openModal(index: number) {
  selectedIndex.value = index;
  selectedDelivery.value = deliveries.value[index];
  modal.value = true;
  // logModal.value = true;
}
function openStatusModal(statusdelivery: any[]) {
  currentStatusdDelivery.value = statusdelivery;
  statusModal.value = true;
}
const target = ref(null);
const targetIsVisible = ref(false);
// eslint-disable-next-line unused-imports/no-unused-vars
const { stop } = useIntersectionObserver(target, ([{ isIntersecting }]) => {
  targetIsVisible.value = isIntersecting;
});
const skip = ref(50);
const end = ref(false);
async function getDeliveries() {
  loading.value = true;
  const { data } = await useFetch("/api/ozonHotels/delivery/get", {
    method: "GET",
    query: {
      status: status.value ?? "all",
      limit: 50,
    },
  });
  deliveries.value = data.value;
  loading.value = false;
}
getDeliveries();

async function exportReadyXLS() {
  loadingExport.value = true;
  const { data } = await useFetch("/api/ozonHotels/delivery/exportReady", {
    params: {
      dateRange: dateRange.value.length > 0 ? dateRange.value : null,
    },
    responseType: "blob",
  });
  const fileURL = window.URL.createObjectURL(new Blob([data.value as any]));
  const fileLink = document.createElement("a");
  fileLink.href = fileURL;
  fileLink.setAttribute("download", "Готовы к выдаче Ozon.xlsx");
  document.body.appendChild(fileLink);
  fileLink.click();
  loadingExport.value = false;
}


async function exportXLS() {
  loadingExport.value = true;
  const { data, error } = await useFetch("/api/ozonHotels/delivery/export", {
    params: {
      dateRange: dateRange.value.length > 0 ? dateRange.value : null,
    },
    responseType: "blob",
  });
  if (error.value) {
    console.log(error.value);
    notify({
      type: "error",
      title: "Что-то пошло не так",
      text: "Не удалось экспортировать данные" + error.value,
    });
    loadingExport.value = false;
    return;
  }
  const fileURL = window.URL.createObjectURL(new Blob([data.value as any]));
  const fileLink = document.createElement("a");
  fileLink.href = fileURL;
  fileLink.setAttribute("download", "Общая таблица Ozon.xlsx");
  document.body.appendChild(fileLink);
  fileLink.click();
  loadingExport.value = false;
}

async function findDeliveries(value: string, type: string) {
  if (!value) {
    autoTarget.value = true;
    await getDeliveries();
    search.loading = false;
    return;
  }
  const { data } = await useFetch("/api/ozonHotels/delivery/search", {
    query: {
      string: value,
      type,
    },
  });
  if (data.value) deliveries.value = data.value;

  search.loading = false;
}

const findDeliveriesDebounced = useDebounceFn(findDeliveries, 1000);

async function onSearchInput() {
  autoTarget.value = false;
  search.loading = true;
  findDeliveriesDebounced(search.text, search.type);
}

// const isInfoModal = ref<boolean>(false)
// function toggleInfoModal() {
//   isInfoModal.value = !isInfoModal.value
// }

watch(targetIsVisible, async (isVisible) => {
  if (isVisible && autoTarget.value) {
    if (end.value) return;
    const { data } = await useFetch("/api/ozonHotels/delivery/get", {
      method: "GET",
      query: {
        status: route.query?.status || "all",
        limit: 50,
        skip: skip.value ? skip.value : 0,
      },
    });
    if ((data.value as any)?.length === 0) {
      end.value = true;
      return;
    }
    deliveries.value = [...deliveries.value, ...(data.value! as any)];
    skip.value += 50;
  }
});

watch(
  () => status.value,
  async () => {
    skip.value = 50;
    end.value = false;
    const { data } = await useFetch("/api/ozonHotels/delivery/get", {
      method: "GET",
      query: {
        status: status.value ?? "all",
        limit: 50,
      },
    });
    deliveries.value = data.value;
  },
  { deep: true, immediate: true }
);

const filters = [
  {
    title: "Все доставки",
    optionValue: "all",
    params: "",
    queryStatus: undefined,
  },
  {
    title: "Активные",
    optionValue: "active",
    params: "?status=active",
    queryStatus: "active",
  },
  {
    title: "Завершенные",
    optionValue: "completed",
    params: "?status=completed",
    queryStatus: "completed",
  },
  {
    title: "В пути",
    optionValue: "onTheWay",
    params: "?status=onTheWay",
    queryStatus: "onTheWay",
  },
  {
    title: "Готовы к выдаче",
    optionValue: "pickupReady",
    params: "?status=pickupReady",
    queryStatus: "pickupReady",
  },
  {
    title: "Отмененные",
    optionValue: "canceled",
    params: "?status=canceled",
    queryStatus: "canceled",
  },
  // {
  //   title: 'В архиве',
  //   optionValue: 'archived',
  //   params: '?status=archived',
  //   queryStatus: 'archived',
  // },
];
const statusText = computed(() => {
  return filters.find((el: any) => el.queryStatus === route.query.status)
    ?.title;
});

function updateSearchType(filter: any) {
  search.type = filter.value;
}

// function changeFilter(e: any) {
//   mpStore.changeMp(
//     e.value,
//     'deliveries',
//     route.query?.status ? `?status=${route.query.status}` : '',
//   )
// }

const customLinks = filters.map((filter) => ({
  title: filter.title,
  slot: "/ozon/deliveries",
  query: filter.params,
}));

const orgInfo = ref({}) as any;
const isVisible = ref(false);
const router = useRouter();

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

const isChecked = ref(false);
const manualModal = ref(false);

function toggleCheckbox() {
  const platform = "ozon";
  const type = "deliveries";
  const storedValue = localStorage.getItem("modalState");
  const modalState = storedValue ? JSON.parse(storedValue) : {};

  if (!modalState[platform]) {
    modalState[platform] = {};
  }
  modalState[platform][type] = !modalState[platform][type];

  localStorage.setItem("modalState", JSON.stringify(modalState));

  isChecked.value = modalState[platform][type];
}

onMounted(() => {
  const storedValue = localStorage.getItem("modalState");
  const modalState = storedValue ? JSON.parse(storedValue) : {};

  const platform = "ozonHotels";
  const type = "deliveries";
  isChecked.value = modalState[platform]?.[type] || false;
  manualModal.value = !isChecked.value;
});

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
      class="breadcrumbs text-sm flex-wrap-reverse flex w-full justify-between"
    >
      <ul class="text-sm sm:text-base font-medium text-[18px] text-[#909090]">
        <li class="cursor-pointer">
          <NuxtLink to="/catalog" class="cursor-pointer text-[#909090]">
            Маркетплейсы
          </NuxtLink>
        </li>
        <li class="cursor-pointer">
          <NuxtLink to="/catalog/ozonHotels" class="cursor-pointer text-[#909090]">
            Ozon отели
          </NuxtLink>
        </li>
        <li class="cursor-pointer text-[#1e2734]">Проживания</li>
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
            @click="copyToClipboard(`${siteUrl}/ozonHotels/deliveries`)"
          >
            <Icon name="ph:share-fat-fill" size="20" />
          </button>
        </div>
      </div>
    </div>
    <!-- <div class="font-medium gap-1 mt-4">
      Забирайте товары в течение
      <span class="text-[#ff6666]"> 5 дней! </span>
    </div> -->
    <div class="flex justify-start lg:justify-between mb-4 items-center mt-4">
      <div
        class="flex relative gap-2 lg:gap-3 flex-col lg:flex-row w-full lg:w-full"
      >
        <div class="export lg:absolute right-0 top-0">
          <div class="flex flex-nowrap items-center gap-1 lg:gap-3">
            <div
              class="absolute right-0 top-0 lg:w-fit lg:static w-[calc(100%-110px)]"
            >
              <label class="w-full flex bg-[#ececed] rounded-lg items-center">
                <input
                  ref="codeInputMob"
                  v-model="search.text"
                  type="text"
                  class="input input-sm bg-transparent rounded-r-none w-full"
                  placeholder="Поиск"
                  @input="onSearchInput()"
                />
                <span
                  v-if="search.loading"
                  class="loading loading-spinner loading-xs flex justify-end p-2"
                />
                <Icon
                  v-else
                  class="text-[#8f8e93] flex justify-end pr-2"
                  name="tabler:search"
                  size="30"
                  @click="codeInputMob.focus()"
                />
              </label>
            </div>
            <DateRangePicker
              class="w-46"
              v-model="dateRange"
              :start-date="startDate"
              @reset="dateRange = []"
            >
              <button
                class="div w-[48px] h-[32px] bg-[#fc7c5b] text-white border-[1px] rounded-[6px]"
              >
                <Icon name="solar:calendar-linear" class="-mt-1" size="22px" />
              </button>
            </DateRangePicker>
            <div
              v-if="!loadingExport"
              class="dropdown lg:dropdown-end z-10 flex flex-nowrap items-center gap-2 lg:gap-3"
            >
              <label
                tabindex="0"
                class="btn btn-sm btn-primary bg-[#fc7c5b] text-white border-none"
                >XLS</label
              >
              <ul
                tabindex="0"
                class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 mt-40"
              >
                <li><a @click="exportXLS">Общая таблица Excel</a></li>
              </ul>
            </div>
            <button
              v-else-if="loadingExport"
              disabled
              class="btn btn-sm btn-primary bg-opacity-20 border-none text-base-content mr-2"
            >
              <span class="loading loading-spinner loading-sm text-primary" />
            </button>
          </div>
        </div>
        <div class="w-full flex gap-1 lg:gap-2">
          <div class="flex gap-1 lg:gap-3 flex-nowrap whitespace-nowrap">
            <span
              ><CustomSelect
                class="h-[2rem] min-w-[95px]"
                :status-text="statusText"
                :links="customLinks"
              />
          </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="deliveries?.length" class="grid grid-cols-1 gap-4 mt-4 w-full">
      <div
        v-if="deliveries.length > 3"
        group
        class="cards grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-[repeat(auto-fit,minmax(300px,1fr))] h-full"
      >
        <div
          v-for="(delivery, index) of deliveries"
          :key="delivery.uuid"
          class="max-w-[400px]"
        >
          <DeliveryOzonHotelsExpand
            :state="openAll"
            :info="delivery"
            @open-modal="openModal"
            :index="index"
            @open-status-modal="openStatusModal"
            @open-penalty-modal="penaltyModal = true"
          />
        </div>
      </div>
      <div v-else group class="flex flex-wrap gap-x-4 gap-y-3">
        <div
          v-for="(delivery, index) of deliveries"
          :key="delivery.uuid"
          class="max-w-full sm:max-w-[320px]"
        >
          <DeliveryOzonHotelsExpand
            :state="openAll"
            :info="delivery"
            :index="index"
            @open-modal="openModal"
            @open-status-modal="openStatusModal"
            @open-penalty-modal="penaltyModal = true"
          />
        </div>
      </div>

      <!-- <DeliveryWildberriesQrModal
        v-if="modal"
        :code="modalInfo.code"
        :src="modalInfo.src"
        :info="currentDelivery"
      /> -->
    </div>
    <Hero v-else-if="!loading" />
    <div v-else class="w-full mt-5 flex justify-center items-center">
      <span class="loading loading-dots loading-lg text-primary" />
    </div>
    <DeliveryPenaltyModal :state="penaltyModal" @close="penaltyModal = false" />
    <DeliveryStatusModal
      v-if="deliveries?.length"
      :statusdelivery="currentStatusdDelivery"
      :state="statusModal"
      @close="statusModal = false"
    />
    <DeliveryOzonHotelsInfoModal
      v-if="modal"
      :info="selectedDelivery"
      :state="modal"
      :index="selectedIndex"
      @close="modal = false"
    />
    <div
      ref="target"
      class="flex justify-center items-center"
      style="height: 60px"
    />
  </div>
  
</template>

<style scoped></style>
