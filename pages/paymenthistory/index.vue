<!-- eslint-disable ts/ban-ts-comment -->
<script lang="ts" setup>
import { isNumber } from "util";

definePageMeta({
  layout: "app",
  middleware: "auth",
});

const { user } = useUserSession();
const dateRange = ref([]);
const startDate = ref(new Date(Date.now() + 1000 * 60 * 5));
const buttonsLine: Array<{ label: string; value: string }> = [
  { label: "Общее", value: "general" },
  { label: "Пополнение", value: "replenishment" },
  { label: "Расходы", value: "expenses" },
  { label: "Партнерка", value: "partner" },
  { label: "Генеалогия", value: "genealogy" },
];

const tableData = ref<any>([]);
const fetchedData = ref<any>([]);
const tableType = ref("general");
const currentPage = ref(1);
const loadingExport = ref(false);
const config = useRuntimeConfig();
const refUrl = computed(
  () => `https://harmex.ru/?ref=${user.value.uuid || "partner"}`
);

const headersForTable = ref<any>([]);
const loading = ref(false);
const limit = ref(15);
const skip = ref(0);

async function getData() {
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
    buttonsLine.find((item: any) => item.value === tableType.value).label +
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
      :ref-url="refUrl"
      :reward-percent="5"
      :ref-link="5"
    />
    <div class="flex flex-col gap-4 w-full flex-1 m-4 bg-white rounded-lg">
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
          <DateRangePicker
            class="w-46 -mt-1"
            v-model="dateRange"
            :start-date="startDate"
            @reset="dateRange = []"
          >
            <button class="btn btn-sm mt-1 btn-primary border-none min-w-2xl">
              {{
                dateRange.length > 1
                  ? `${$dayjs(dateRange[0]).format("DD.MM.YYYY")} - ${$dayjs(
                      dateRange[1]
                    ).format("DD.MM.YYYY")}`
                  : "Выбрать даты"
              }}
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
  </div>
</template>
