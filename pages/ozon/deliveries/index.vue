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
function openModal(code: number, src: string) {
  modalInfo.src = src;
  modalInfo.code = code;
  modal.value = true;
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
  const { data } = await useFetch("/api/ozon/delivery/get", {
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
  const { data } = await useFetch("/api/ozon/delivery/exportReady", {
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

async function exportReadyUntilPenaltyXLS() {
  loadingExport.value = true;
  const { data, error } = await useFetch(
    "/api/ozon/delivery/exportReadyUntilPenalty",
    {
      params: {
        dateRange: dateRange.value.length > 0 ? dateRange.value : null,
      },
      responseType: "blob",
    }
  );
  if (error.value) {
    notify({
      type: "error",
      title: "Что-то пошло не так",
      text: "Не удалось экспортировать данные",
    });
    loadingExport.value = false;
    return;
  }
  const fileURL = window.URL.createObjectURL(new Blob([data.value as any]));
  const fileLink = document.createElement("a");
  fileLink.href = fileURL;
  fileLink.setAttribute(
    "download",
    "Готовы к выдаче Wildberries до штрафа.xlsx"
  );
  document.body.appendChild(fileLink);
  fileLink.click();
  loadingExport.value = false;
}

async function exportXLS() {
  loadingExport.value = true;
  const { data, error } = await useFetch("/api/ozon/delivery/export", {
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
  const { data } = await useFetch("/api/ozon/delivery/search", {
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
  if (isVisible && autoTarget.value && deliveries.value.length >= 50) {
    if (end.value) return;
    const { data } = await useFetch("/api/ozon/delivery/get", {
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
    const { data } = await useFetch("/api/ozon/delivery/get", {
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

  const platform = "ozon";
  const type = "deliveries";
  isChecked.value = modalState[platform]?.[type] || false;
  manualModal.value = !isChecked.value;
});

async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text);
  notify({
    title: "Успешно",
    text: "Скопировано в буфер обмена",
  });
}
</script>

<template>
  <div class="px-4 sm:px-16 pt-8">
    <div
      class="breadcrumbs text-sm flex-wrap-reverse flex w-full justify-between"
    >
      <ul class="font-medium text-[18px] text-[#909090]">
        <li class="cursor-pointer">
          <NuxtLink to="/catalog" class="cursor-pointer text-[#909090]">
            Маркетплейсы
          </NuxtLink>
        </li>
        <li class="cursor-pointer">
          <NuxtLink to="/catalog/ozon" class="cursor-pointer text-[#909090]">
            Ozon
          </NuxtLink>
        </li>
        <li class="cursor-pointer text-[#1e2734]">Доставки</li>
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
            @click="copyToClipboard(`https://app.harmex.ru/register?uuid`)"
          >
            <Icon name="ph:share-fat-fill" size="20" />
          </button>
        </div>
      </div>
    </div>
    <div class="font-medium gap-1 mt-4">
      Забирайте товары в течение
      <span class="text-[#ff6666]"> 5 дней </span>
      после прибытия на пвз!
    </div>
    <div class="flex justify-start lg:justify-between mb-4 items-center mt-4">
      <div
        class="flex relative gap-2 lg:gap-3 flex-col lg:flex-row w-full lg:w-full"
      >
        <div v-if="deliveries.length" class="export lg:absolute right-0 top-0">
          <div
            v-if="loadingExport"
            class="flex flex-nowrap items-center gap-2 lg:gap-3"
          >
            <DateRangePicker
              class="w-46"
              v-model="dateRange"
              :start-date="startDate"
              @reset="dateRange = []"
            >
              <button
                :disabled="loadingExport"
                class="btn btn-sm btn-primary bg-[#eff0ff] border-none dark:bg-primary dark:bg-opacity-20 text-base-content min-w-2xl"
              >
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
              disabled
              class="btn btn-sm btn-primary bg-opacity-20 border-none text-base-content mr-2"
            >
              <span class="loading loading-spinner loading-sm text-primary" />
            </button>
          </div>

          <div v-else class="flex flex-nowrap items-center gap-2 lg:gap-3">
            <DateRangePicker
              class="w-46"
              v-model="dateRange"
              :start-date="startDate"
              @reset="dateRange = []"
            >
              <button
                class="btn btn-sm btn-primary bg-[#eff0ff] border-none dark:bg-primary dark:bg-opacity-20 text-base-content min-w-2xl"
              >
                {{
                  dateRange.length > 1
                    ? `${$dayjs(dateRange[0]).format("DD.MM.YYYY")} - ${$dayjs(
                        dateRange[1]
                      ).format("DD.MM.YYYY")}`
                    : "Выбрать даты"
                }}
              </button>
            </DateRangePicker>
            <div
              class="dropdown lg:dropdown-end z-10 flex flex-nowrap items-center gap-2 lg:gap-3"
            >
              <label
                tabindex="0"
                class="btn btn-sm btn-primary bg-[#eff0ff] dark:bg-primary dark:bg-opacity-20 border-none text-base-content"
                >XLS</label
              >
              <ul
                tabindex="0"
                class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 mt-40"
              >
                <li>
                  <NuxtLink :to="`/ozon/deliveries/export${dateRange.length ? '?dateRange=' + dateRange.map(date => new Date(date).toISOString()).join(',') : ''}`">
                    Готовы к выдаче PDF
                  </NuxtLink>             
                </li>
                <li><a @click="exportReadyXLS">Готовы к выдаче Excel</a></li>

                <li><a @click="exportXLS">Общая таблица Excel</a></li>
                <li><a @click="exportReadyUntilPenaltyXLS">До штрафа</a></li>
              </ul>
            </div>
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
            <button
              @click="manualModal = true"
              class="btn btn-primary bg-base-200 text-base-content hover:text-white border-none btn-sm gap-2 font-medium normal-case"
            >
              <Icon name="line-md:question" size="15" />
            </button>
          </div>
          <div class="flex lg:ml-auto gap-0.5 lg:gap-3">
            <CustomSelect
              class="h-[2rem] bg-[#f4f4f4]"
              :tabs="[
                { title: 'Артикул', value: 'article' },
                { title: 'ID выкупа', value: 'uuid' },
              ]"
              @change-value="updateSearchType"
            />
          </div>
          <div
            class="absolute right-0 top-0 lg:w-fit lg:static"
            :class="
              dateRange.length > 0
                ? 'w-[calc(100%-240px)] lg:mr-[240px]'
                : 'w-[calc(100%-180px)] lg:mr-[190px]'
            "
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
        </div>
      </div>
    </div>

    <div v-if="deliveries?.length" class="grid grid-cols-1 gap-4 mt-4 w-full">
      <TransitionSlide
        group
        tag="ul"
        class="flex flex-col md:flex-row navbar:flex-col lg:flex-row gap-3"
      >
        <ul class="flex flex-col gap-3 lg:w-[49%] navbar:w-full">
          <li
            v-for="(delivery, index) of deliveries.slice(
              0,
              Math.ceil(deliveries.length / 2)
            )"
            :key="index"
            class="overflow-visible z-0"
          >
            <DeliveryOzonExpand
              :state="openAll"
              :info="delivery"
              @open-modal="openModal"
              @open-status-modal="openStatusModal"
              @open-penalty-modal="penaltyModal = true"
            />
          </li>
        </ul>
        <ul class="flex flex-col gap-3 lg:w-[49%] navbar:w-full">
          <li
            v-for="(delivery, index) of deliveries.slice(
              Math.ceil(deliveries.length / 2)
            )"
            :key="index"
            class="overflow-visible z-0"
          >
            <DeliveryOzonExpand
              :state="openAll"
              :info="delivery"
              @open-modal="openModal"
              @open-status-modal="openStatusModal"
              @open-penalty-modal="penaltyModal = true"
            />
          </li>
        </ul>
      </TransitionSlide>
      <DeliveryQrModal
        v-if="modal"
        :code="modalInfo.code"
        :src="modalInfo.src"
      />
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
    <ManualModal
      :show="manualModal"
      @close="manualModal = false"
      :is-checked="isChecked"
      @checkbox-toggle="toggleCheckbox"
    >
      <h3 class="text-xl font-bold mb-2 flex items-center gap-1">
        Как получить заказ на ПВЗ?
      </h3>
      <p class="mb-2 text-[17px]">
        Осуществление получения товаров на ПВЗ доступно с помощью меню
        <span class="font-bold">Доставки</span>
      </p>

      <p class="mb-2 text-[17px]">
        В данном меню вы в режиме реального времени, сможете отслеживать статусы
        по все доставкам
      </p>

      <p class="mb-2 text-[17px]">
        Чтобы получить Готовые к выдаче товары на ПВЗ, используйте функционал
        выгрузки файлов с Актуальными Qr-кодами и данными.
      </p>

      <p class="mb-2 text-[17px]">
        Доступно 2 варианта выгрузки:
        <span class="font-semibold">Готовы к выдаче в PDF и Excel-файле </span>
      </p>

      <p class="mb-2 text-[17px]">
        Для сверки данных всех доставок в разрезе промежутка времени,
        используйте Excel-файл под названием
        <span class="font-bold"> “Общая таблица Excel”</span>
      </p>

      <nuxt-img
        alt="image"
        class="flex mx-auto w-full px-4"
        src="https://ozonmpportal.hb.vkcs.cloud//ozonmpportal/harmex/manualImages/wildberries/deliveries1.png"
      />
      <p
        class="mt-1.5 text-[16px] font-semibold flex items-center gap-1 text-[#4b5563]"
      >
        Примечания:
      </p>
      <ol class="list-decimal ml-6 mb-4 text-[#4b5563] flex flex-col gap-1">
        <li>
          Получайте товары “Готовы к выдаче” в течение 5 дней с дня прибытия на
          ПВЗ. Необходимо для соблюдения всех параметров поведенческой
          активности на маркетплейсах и не менее 4х покупок месяц одним нашим
          аккаунтом.
        </li>
        <li>
          В случаях задержки товаров в получении на ПВЗ более 5-ти дней, мы
          вынуждены накладывать санкции в размере 25 р./ед.
        </li>
        <li>
          При Отмененных доставках обратитесь в службу заботы для возврата
          финансовых средств на ваш Кошелек в меню Финансы.
        </li>
      </ol>
      <p class="text-[#4b5563] font-semibold">Статусы Доставок:</p>
      <ul class="flex flex-col text-[#4b5563] gap-1">
        <li>
          <span class="font-semibold">В пути</span> - товар находится в пути на
          ПВЗ
        </li>
        <li>
          <span class="font-semibold">Готов к выдаче / получению </span> - товар
          находится на ПВЗ и готов к получению
        </li>
        <li>
          <span class="font-semibold">Отменен</span> - покупка была отменена на
          ПВЗ или магазином или маркетплейсом с возвратом на склад
        </li>
        <li>
          <span class="font-semibold">Получено</span> - товар был получен на ПВЗ
          и передан курьеру / ответственному лицу
        </li>
      </ul>
    </ManualModal>
    <div
      ref="target"
      class="flex justify-center items-center"
      style="height: 60px"
    />
  </div>
</template>

<style scoped></style>
