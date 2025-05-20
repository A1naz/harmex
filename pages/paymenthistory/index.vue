<!-- eslint-disable ts/ban-ts-comment -->
<script lang="ts" setup>
import { isNumber } from "util";

definePageMeta({
  layout: "app",
  middleware: "auth",
});

const params = useRoute().query;
const { user }: any = useUserSession();
const dateRange = ref([]);
const searchInput = ref("");
const startDate = ref(new Date(Date.now() + 1000 * 60 * 5));
const buttonsLine: Array<{ label: string; value: string }> = [
  { label: "Общее", value: "general" },
  { label: "Пополнение", value: "replenishment" },
  { label: "Расходы", value: "expenses" },
  { label: "Партнерка", value: "partner" },
  { label: "Генеалогия", value: "genealogy" },
];

const tableTypes: Array<{ title: string; value: string; images: string }> = [
  { title: "Общее", value: "general", images: "null" },
  { title: "Пополнение", value: "replenishment", images: "null" },
  { title: "Расходы", value: "expenses", images: "null" },
  { title: "Партнерка", value: "partner", images: "null" },
  { title: "Генеалогия", value: "genealogy", images: "null" },
];

const tableData = ref<any>([]);
const fetchedData = ref<any>([]);
const tableType = ref("general");
const currentPage = ref(1);
const loadingExport = ref(false);
const config = useRuntimeConfig();
const refUrl = computed(() =>
  user.value.username === "dmagrunin" || user.value.username === "test"
    ? `https://harmex.ru/samovykupy-tovarov-na-avito?ref=${user.value.uuid}`
    : `https://harmex.ru/?ref=${user.value.uuid || "partner"}`
);

const headersForTable = ref<any>([]);
const loading = ref(false);
const limit = ref(15);
const skip = ref(0);

async function getData() {
  fetchedData.value = [];
  loading.value = true;
  skip.value = (currentPage.value - 1) * limit.value;
  const { data } = await useFetch(
    "/api/finance/finance-data",
    /* @ts-ignore */
    {
      method: "GET",
      query: {
        tableType: tableType.value,
        page: currentPage.value,
        itemsPerPage: limit.value,
        skip: skip.value,
        searchInput: searchInput.value,
        dateRange: dateRange.value,
      },
      watch: false,
    }
  );
  fetchedData.value = data.value;
  loading.value = false;
}
getData();

// watch(
//   () => fetchedData.value,
//   (newData) => {
//     if (newData) {
//       data.value = newData
//       updateTableData()
//     }
//   },
//   { immediate: true },
// )

async function updateTableData() {
  tableData.value = [];
  loading.value = true;
  await getData();

  switch (tableType.value) {
    case "general":
      headersForTable.value = [
        { value: "summ", label: "Сумма" },
        { value: "date", label: "Дата" },
        { value: "source", label: "Источник" },
        { value: "service", label: "Услуга" },
        { value: "article", label: "Артикул" },
        { value: "orderId", label: "ID заказа" },
        { value: "comment", label: "Комментарий" },
      ];
      tableData.value = fetchedData.value.map((item: any) => ({
        summ: item.summ,
        date: item.date,
        source: item.source,
        service: item.service,
        article: item.article,
        orderId: item.orderId,
        comment: item.comment,
      }));
      loading.value = false;
      break;

    case "replenishment":
      headersForTable.value = [
        { value: "summ", label: "Сумма" },
        { value: "date", label: "Дата" },
        { value: "source", label: "Источник" },
        { value: "service", label: "Услуга" },
        { value: "orderId", label: "ID заказа" },
        { value: "comment", label: "Комментарий" },
      ];
      tableData.value = fetchedData.value.map((item: any) => ({
        summ: item.summ,
        date: item.date,
        source: item.source,
        orderId: item.orderId,
        comment: item.comment,
        service: item.service,
      }));
      loading.value = false;
      break;

    case "expenses":
      headersForTable.value = [
        { value: "summ", label: "Сумма" },
        { value: "date", label: "Дата" },
        { value: "source", label: "Источник" },
        { value: "service", label: "Услуга" },
        { value: "article", label: "Артикул" },
        { value: "orderId", label: "ID заказа" },
      ];
      tableData.value = fetchedData.value.map((item: any) => ({
        summ: item.summ,
        date: item.date,
        source: item.source,
        service: item.service,
        orderId: item.orderId,
        article: item.article,
      }));
      loading.value = false;
      break;

    case "partner":
      headersForTable.value = [
        { value: "summ", label: "Сумма" },
        { value: "date", label: "Дата" },
        { value: "source", label: "Источник" },
        { value: "service", label: "Услуга" },
      ];
      console.log(fetchedData);
      tableData.value = fetchedData.value.map((item: any) => ({
        summ: item.summ,
        date: item.date,
        source: item.source,
        service: item.service,
      }));
      loading.value = false;
      break;

    case "genealogy":
      headersForTable.value = [
        { value: "commission", label: "Комиссионнные" },
        { value: "username", label: "Логин реферала" },
        { value: "date", label: "Дата добавления в рефералы" },
      ];
      tableData.value = fetchedData.value.map((item: any) => ({
        commission: item.commission,
        username: item.username,
        date: item.date,
      }));
      loading.value = false;
      break;
  }
}

function changeTableType(type: string) {
  tableType.value = type;
}

async function exportReadyXLS() {
  loadingExport.value = true;
  const { data } = await useFetch("/api/finance/export", {
    responseType: "blob",
    query: { tableType: tableType.value, page: 1, dateRange: dateRange.value },
  });
  const fileURL = window.URL.createObjectURL(new Blob([data.value as any]));
  const fileLink = document.createElement("a");
  fileLink.href = fileURL;
  fileLink.setAttribute(
    "download",
    (buttonsLine.find((item: any) => item.value === tableType.value)?.label || "export") +
      ".xlsx"
  );
  document.body.appendChild(fileLink);
  fileLink.click();
  loadingExport.value = false;
}

const balanceForm = reactive({
  userBalance: 0,
  partnerBalance: 0,
  refCount: 0,
  rewardSumm: "500 ₽",
});

async function getBalance() {
  const { data }: any = await useFetch("/api/finance/getUserBalance", {
    method: "get",
    watch: false,
  });
  if (data.value) {
    balanceForm.userBalance = data.value.balance;
    balanceForm.partnerBalance = data.value.commissions;
    balanceForm.refCount = data.value.firstLevelReferralsCount;
    balanceForm.rewardSumm = data.value.rewardSumm;
  }
}

getBalance();

watch(() => tableType.value, updateTableData, { immediate: true });
watch(() => currentPage.value, updateTableData);
watch(
  () => limit.value,
  (newLimit: number) => {
    if (Number.isFinite(newLimit)) {
      skip.value = 0;
      updateTableData();
    }
  }
);
const totalPages = 100;

function swapPage(swapTo: number) {
  currentPage.value += swapTo;
}

const displayPages = computed(() => {
  const pages = [];
  const maxVisiblePages = 5;
  let start = Math.max(currentPage.value - 2, 1);
  let end = Math.min(start + maxVisiblePages - 1, totalPages);

  if (end - start + 1 < maxVisiblePages) {
    start = Math.max(end - maxVisiblePages + 1, 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

watchDebounced(
  () => searchInput.value,
  () => {
    currentPage.value = 1;
    updateTableData();
  },
  { debounce: 800 }
);

watchDebounced(
  () => dateRange.value,
  () => {
    currentPage.value = 1;
    updateTableData();
  },
  { debounce: 800 }
);

const searchPlaceHolder = computed(() => {
  if (tableType.value === "replenishment") {
    return "id, ИП";
  } else return "id, артикул";
});

onMounted(() => {
  if (params.uuid) {
    searchInput.value = params.uuid;
  }
});
</script>

<template>
  <div
    class="flex flex-col sm:flex-row sm:items-start items-center justify-center gap-2 overflow-x-hidden sm:overflow-x-auto overflow-y-clip w-full"
  >
    <FinanceDashboard
      :second-level-percent="10"
      :ref-balance="balanceForm.partnerBalance"
      :balance="balanceForm.userBalance"
      :ref-count="balanceForm.refCount"
      :second-level-referrals="0"
      :first-level-referrals="balanceForm.refCount"
      :rewardSumm="balanceForm.rewardSumm"
      :ref-url="refUrl"
      :reward-percent="5"
      :ref-link="5"
    />
    <div
      class="sm:flex flex-col gap-4 w-full flex-1 m-4 bg-white rounded-lg hidden"
    >
      <div class="flex gap-4 justify-between items-center flex-wrap p-6 pb-0">
        <div class="flex gap-4 items-center flex-wrap">
          <button
            v-for="(button, index) in buttonsLine"
            :key="index"
            class="btn btn-sm btn-outline btn-primary bg-white hover:bg-white hover:text-black active:text-white font-medium rounded-lg relative group"
            :class="{ 'btn-active': button.value === tableType }"
            @click="changeTableType(button.value)"
          >
            <div class="flex items-center justify-center">
              {{ button.label }}
            </div>
          </button>
        </div>
        <div class="flex gap-1">
          <label class="input input-sm input-bordered flex items-center gap-2">
            <input
              type="text"
              class="grow"
              :placeholder="searchPlaceHolder"
              v-model="searchInput"
            />
            <Icon name="mynaui:search" size="22px" />
          </label>
          <DateRangePicker
            class="w-46 -mt-1"
            v-model="dateRange"
            :start-date="startDate"
            @reset="dateRange = []"
          >
            <button
              class="div w-[48px] h-[32px] border-primary mt-1 border-[1px] text-primary rounded-[6px]"
            >
              <Icon name="solar:calendar-linear" class="mt-1" size="22px" />
            </button>
          </DateRangePicker>
          <button
            v-if="dateRange.length"
            @click="dateRange = []"
            class="btn btn-sm btn-outline btn-square flex flex-shrink btn-primary bg-white hover:bg-white hover:text-black active:text-white font-medium rounded-lg relative group"
          >
            <div class="flex items-center justify-center">
              <Icon name="material-symbols:close-rounded" size="22px" />
            </div>
          </button>
          <button
            :disabled="loadingExport"
            @click="exportReadyXLS"
            class="btn btn-sm btn-outline flex flex-shrink btn-primary bg-white hover:bg-white hover:text-black active:text-white font-medium rounded-lg relative group"
          >
            <div class="flex items-center justify-center">
              <Icon v-if="!loadingExport" name="lucide:download" size="22px" />
              <span v-else class="loading loading-spinner" />
            </div>
          </button>
        </div>
      </div>
      <FinanceTable
        :table-data="tableData"
        :loading="loading"
        :headers="headersForTable"
        @swap-page="(page: number) => { currentPage = page}"
        @change-pagination="(itemsPerPage: number) => { limit = itemsPerPage}"
      />
    </div>
    <div class="gap-4 w-full flex-1 m-4 bg-white rounded-lg md:hidden">
      <div class="flex flex-col w-full pr-8 ml-4">
        <div class="flex flex-row justify-between">
          <div class="flex flex-col w-full mr-1">
            <custom-select-with-class
              :tabs="tableTypes"
              @change-value="(e: any) => tableType = e.value"
              :class="'h-[2.5rem] w-full border-[#e86b35] bg-[#ffffff]'"
            />
          </div>
          <div class="flex gap-1 justify-end mt-2">
            <DateRangePicker
              class="w-46 -mt-1"
              v-model="dateRange"
              :start-date="startDate"
              @reset="dateRange = []"
            >
              <button
                class="div w-[48px] h-[40px] -mt-1 border-primary border-[1px] rounded-[6px]"
              >
                <Icon
                  name="solar:calendar-linear"
                  class="text-primary"
                  size="22px"
                />
              </button>
            </DateRangePicker>

            <button
              :disabled="loadingExport"
              @click="exportReadyXLS"
              class="div w-[48px] h-[40px] -mt-2 border-primary border-[1px] rounded-[6px]"
            >
              <div class="flex items-center justify-center">
                <Icon
                  v-if="!loadingExport"
                  class="text-primary"
                  name="ic:round-download"
                  size="22px"
                />
                <span v-else class="loading loading-spinner text-primary" />
              </div>
            </button>
          </div>
        </div>
        <div class="w-full">
          <div
            class="max-w-md mx-auto bg-gray-100 border border-gray-300 rounded-lg p-4 mt-2"
            v-for="(item, index) in tableData"
            v-if="tableData && tableData.length"
          >
            <div
              class="grid grid-cols-2 gap-y-2 my-2 border-b pb-2"
              v-for="header in headersForTable"
            >
              <div class="font-semibold text-gray-700">
                {{ header.label }}
              </div>
              <div class="font-semibold text-gray-700 truncate">
                <span v-if="header.value == 'date'">{{
                  $dayjs(item[header.value]).format("DD.MM.YYYY HH:mm") || "-"
                }}</span>
                <a
                  class="link text-primary"
                  v-else-if="
                    item[header.value] &&
                    item[header.value].includes('EXTERNALHREF||')
                  "
                  :href="item[header.value].split('||')[1]"
                  target="_blank"
                  >{{
                    item[header.value].split("||")[
                      item[header.value].split("||").length - 1
                    ] || "-"
                  }}</a
                >
                <NuxtLink
                  class="link text-primary"
                  v-else-if="
                    item[header.value] &&
                    item[header.value].includes('NUXTLINK||')
                  "
                  :to="item[header.value].split('||')[1]"
                >
                  {{
                    item[header.value].split("||")[
                      item[header.value].split("||").length - 1
                    ] || "-"
                  }}
                </NuxtLink>
                <span v-else>{{ item[header.value] || "-" }}</span>
              </div>
            </div>
          </div>
          <div v-else-if="!loading">
            <div class="hero">
              <div
                class="hero-content text-center flex justify-center items-center h-48"
              >
                <div class="max-w-md">
                  <h1 class="text-2xl font-bold">Здесь ничего нет</h1>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      class="pagination-controls flex justify-between mt-auto mb-10 border-t w-full py-2 px-4 scroll-hidden md:hidden"
    >
      <div class="flex justify-center w-full gap-1">
        <button
          class="btn btn-primary btn-xs font-normal px-0 flex items-center bg-transparent text-primary border-none hover:text-white shadow-none"
          :disabled="currentPage === 1"
          @click="swapPage(-1)"
        >
          <Icon name="solar:alt-arrow-left-linear" size="24" />
        </button>

        <button
          v-for="page in displayPages"
          :key="page"
          class="btn btn-primary btn-xs text-black shadow-none border-none flex items-center hover:text-white"
          :class="{
            'text-white': currentPage === page,
            'bg-transparent': currentPage !== page,
          }"
          @click="(currentPage = page), swapPage(0)"
        >
          {{ page }}
        </button>

        <button
          class="btn btn-primary btn-xs p-0 bg-transparent text-primary border-none flex items-center hover:text-white shadow-none"
          :disabled="currentPage === totalPages"
          @click="swapPage(1)"
        >
          <Icon name="solar:alt-arrow-right-linear" size="24" />
        </button>
      </div>
    </div>
  </div>
</template>
<style scoped></style>
