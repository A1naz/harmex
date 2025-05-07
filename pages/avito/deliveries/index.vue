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
const codeInputMob = ref();
const loadingExport = ref(false);
const status = computed(() => route.query?.status || "all");
const loading = ref(false);
const dateRange = ref([]);
const startDate = ref(new Date(Date.now() + 1000 * 60 * 5));
const search = ref<any>({
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
const currentDelivery = ref<any>();
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
  const { data } = await useFetch("/api/avito/delivery/get", {
    method: "GET",
    query: {
      status: status.value ?? "all",
      limit: 50,
    },
  });
  deliveries.value = data.value;
  loading.value = false;
}
// getDeliveries();

async function exportReadyXLS() {
  loadingExport.value = true;
  const { data } = await useFetch("/api/avito/delivery/exportReady", {
    params: {
      dateRange: dateRange.value.length > 0 ? dateRange.value : null,
    },
    responseType: "blob",
  });
  const fileURL = window.URL.createObjectURL(new Blob([data.value as any]));
  const fileLink = document.createElement("a");
  fileLink.href = fileURL;
  fileLink.setAttribute("download", "Готовы к выдаче Avito.xlsx");
  document.body.appendChild(fileLink);
  fileLink.click();
  loadingExport.value = false;
}
async function exportXLS() {
  loadingExport.value = true;
  const { data, error } = await useFetch("/api/avito/delivery/export", {
    params: {
      dateRange: dateRange.value.length > 0 ? dateRange.value : null,
    },
    responseType: "blob",
  });
  if (error.value) {
    notify({
     group: "error",
      title: "Что-то пошло не так",
      text: "Не удалось экспортировать данные",
    });
    loadingExport.value = false;
    return;
  }
  const fileURL = window.URL.createObjectURL(new Blob([data.value as any]));
  const fileLink = document.createElement("a");
  fileLink.href = fileURL;
  fileLink.setAttribute("download", "Общая таблица Avito.xlsx");
  document.body.appendChild(fileLink);
  fileLink.click();
  loadingExport.value = false;
}
async function exportReadyUntilPenaltyXLS() {
  loadingExport.value = true;
  const { data, error } = await useFetch(
    "/api/avito/delivery/exportReadyUntilPenalty",
    {
      params: {
        dateRange: dateRange.value.length > 0 ? dateRange.value : null,
      },
      responseType: "blob",
    }
  );
  if (error.value) {
    notify({
     group: "error",
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
    "Готовы к выдаче Avito до штрафа.xlsx"
  );
  document.body.appendChild(fileLink);
  fileLink.click();
  loadingExport.value = false;
}

async function findDeliveries(value: string, type: string) {
  if (!value) {
    autoTarget.value = true;
    await getDeliveries();
    search.value.loading = false;
    return;
  }
  const { data } = await useFetch("/api/avito/delivery/search", {
    query: {
      string: value,
      type,
    },
  });
  if (data.value) deliveries.value = data.value;

  search.value.loading = false;
}

const findDeliveriesDebounced = useDebounceFn(findDeliveries, 1000);

async function onSearchInput() {
  autoTarget.value = false;
  search.value.loading = true;
  findDeliveriesDebounced(search.value.text, search.value.type);
}

// function openInfoModal() {
//   store.infoModal = true
// }

watch(targetIsVisible, async (isVisible) => {
  if (isVisible && autoTarget.value) {
    if (end.value) return;
    loading.value = true;
    const { data } = await useFetch("/api/avito/delivery/get", {
      method: "GET",
      query: {
        status: route.query?.status || "all",
        limit: 50,
        skip: skip.value,
      },
    });
    loading.value = false;
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
    const { data } = await useFetch("/api/avito/delivery/get", {
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

const customLinks = filters.map((filter) => ({
  title: filter.title,
  slot: "/avito/deliveries",
  query: filter.params,
}));

const statusText = computed(() => {
  return filters.find((el: any) => el.queryStatus === route.query.status)
    ?.title;
});

function updateSearchType(filter: any) {
  search.value.type = filter.value;
}

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
  const platform = "avito";
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

  const platform = "avito";
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

const exportReadyCount = ref(0);
async function getExportReadyCount() {
  const { data } = await useFetch(
    "/api/avito/delivery/getExportReadyCount"
  );
  exportReadyCount.value = data.value;
}
getExportReadyCount();
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
          <NuxtLink
            to="/catalog/avito"
            class="cursor-pointer text-[#909090]"
          >
          Avito
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
            @click="copyToClipboard(`${siteUrl}/avito/deliveries`)"
          >
            <Icon name="ph:share-fat-fill" size="20" />
          </button>
        </div>
      </div>
    </div>
    <!-- <div class="font-medium gap-1 mt-4">
      <span class="text-[#ff6666]"> 5 дней </span>
      на получение
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
                  placeholder="Id, артикул"
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
                class="div w-[48px] h-[32px] border-[1px] rounded-[6px] bg-[#fc7c5b]"
              >
                <Icon
                  name="solar:calendar-linear"
                  class="mt-1 text-white"
                  size="22px"
                />
              </button>
            </DateRangePicker>
            <div
              v-if="!loadingExport"
              class="dropdown lg:dropdown-end z-10 flex flex-nowrap items-center gap-2 lg:gap-3"
            >
              <label
                tabindex="0"
                class="btn btn-sm border-none btn-primary bg-[#fc7c5b] text-white"
                >XLS</label
              >

              <ul
                tabindex="0"
                class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 mt-40"
              >
              <li v-if="deliveries?.length && exportReadyCount <= 50">
                  <NuxtLink
                    :to="`/avito/deliveries/export${
                      dateRange.length
                        ? '?dateRange=' +
                          dateRange
                            .map((date) => new Date(date).toISOString())
                            .join(',')
                        : ''
                    }`"
                  >
                    Готовы к выдаче PDF
                  </NuxtLink>
                </li>
                <li><a @click="exportReadyXLS">Готовы к выдаче Excel</a></li>

                <li><a @click="exportXLS">Общая таблица Excel</a></li>
                <li><a @click="exportReadyUntilPenaltyXLS">До штрафа</a></li>
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
            <button
              @click="manualModal = true"
              class="btn btn-primary bg-base-200 text-base-content hover:text-white border-none btn-sm gap-2 font-medium normal-case"
            >
              <Icon name="ci:info" size="24" />
            </button>
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
          <DeliveryAvitoExpand
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
          <DeliveryAvitoExpand
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
    <DeliveryAvitoInfoModal
      v-if="modal"
      :info="selectedDelivery"
      :state="modal"
      :index="selectedIndex"
      @close="modal = false"
    />
    <ManualModal
      :show="manualModal"
      @close="manualModal = false"
      :is-checked="isChecked"
      @checkbox-toggle="toggleCheckbox"
    >
      <p class="mb-5 text-xl font-semibold">Как получить товар на ПВЗ</p>
      <p>
        Для получения товаров с пункта выдачи заказов (ПВЗ) на Avito используйте меню <strong>"Доставка"</strong>.
      </p>
      <p class="mt-4">
        Это меню позволяет отслеживать статусы всех доставок в режиме реального
        времени и получать товары, готовые к выдаче. Ниже приведена пошаговая
        инструкция с учетом всех нюансов.
      </p>
      <p class="divider"></p>
      <p>Отслеживание статусов <strong>доставок</strong></p>
      <ul class="list-disc ml-10">
        <li class="mt-1">
          Перейдите в меню <strong>"Доставка"</strong> в вашем личном кабинете
          Harmex.
        </li>
        <li class="mt-1">
          Здесь вы можете видеть актуальные статусы всех ваших заказов:
          <ul class="list-disc ml-6">
            <li class="mt-1">
              <strong>В пути</strong> — товар находится в пути на ПВЗ.
            </li>
            <li class="mt-1">
              <strong>Готов к выдаче / получению</strong> — товар прибыл на ПВЗ
              и готов к выдаче.
            </li>
            <li class="mt-1">
              <strong>Отменен </strong> — доставка отменена, товар возвращен на
              склад.
            </li>
            <li class="mt-1">
              <strong>Получено </strong> — товар был получен на ПВЗ и передан
              курьеру или ответственному лицу.
            </li>
          </ul>
        </li>
      </ul>
      <p class="divider"></p>
      <p>Получение товаров, <strong>готовых к выдаче</strong></p>
      <ul class="list-disc ml-10">
        <li class="mt-1">
          Для получения товаров, которые имеют статус
          <strong>"Готов к выдаче / получению"</strong>, используйте функционал
          выгрузки файлов с актуальными QR-кодами и данными.
        </li>
        <li class="mt-1">
          Доступно два варианта выгрузки:
          <ul class="list-decimal ml-6">
            <li class="mt-1">
              <strong>Готовы к выдаче в PDF</strong> — удобно для печати и
              использования на ПВЗ.
            </li>
            <li>
              <strong>Excel-файл</strong> — подходит для анализа и сверки
              данных.
            </li>
          </ul>
        </li>
        <li class="mt-1">
          Чтобы выгрузить файлы:
          <ul class="list-decimal ml-6">
            <li class="mt-1">
              В меню <strong>"Доставка"</strong> выберите заказы со статусом
              <strong>"Готов к выдаче / получению"</strong>.
            </li>
            <li>
              Нажмите на кнопку <strong>"Выгрузить"</strong> и выберите нужный
              формат (PDF или Excel).
            </li>
            <li>Сохраните файл на устройство.</li>
          </ul>
        </li>
      </ul>
      <nuxt-img
        alt=""
        class="flex mx-auto w-full px-4 mt-4"
        src="https://ozonmpportal.hb.vkcs.cloud//ozonmpportal/harmex/manualImages/wildberries/buyout2_3.png"
      />
      <p class="divider"></p>
      <p class="my-4"><strong>Сверка данных по доставкам:</strong></p>
      <ul class="list-disc ml-10">
        <li class="mt-1">
          Для анализа всех доставок в разрезе промежутка времени используйте
          Excel-файл под названием
          <strong>"Общая таблица Excel"</strong>.
        </li>

        <li class="mt-1">
          Этот файл содержит подробную информацию о каждом заказе:
          <ul class="list-[square] ml-6">
            <li class="mt-1">Номер заказа.</li>
            <li>Статус доставки.</li>
            <li>Дата и время прибытия на ПВЗ.</li>
            <li>Дата и время получения на ПВЗ.</li>
          </ul>
        </li>
      </ul>
      <p class="divider"></p>
      <p class="my-4"><strong>Важные примечания:</strong></p>
      <ul class="list-disc ml-10">
        <li class="mt-1">
          <strong>Сроки получения товара:</strong>
          <ul class="list-[square] ml-6">
            <li class="mt-1">
              Получайте товары со статусом
              <strong>"Готов к выдаче / получению"</strong> в течение
              <strong>5 дней</strong> с момента прибытия на ПВЗ.
            </li>
            <li>
              Это необходимо для соблюдения параметров поведенческой активности
              на маркетплейсе и поддержания минимум
              <strong>4 покупок в месяц</strong> одним аккаунтом.
            </li>
          </ul>
        </li>
        <li class="mt-1">
          <strong>Санкции за задержку:</strong>
          <ul class="list-[square] ml-6">
            <li>
              Если вы не получаете товары в течение 5 дней с момента прибытия на
              ПВЗ, вы можете получить санкцию.
            </li>
          </ul>
        </li>

        <li class="mt-1">
          <strong>Отмененные доставки:</strong>
          <ul class="list-[square] ml-6">
            <li class="mt-1">
              Если доставка отменена (статус <strong>"Отменен"</strong>),
              обратитесь в <strong>службу заботы</strong> для возврата
              финансовых средств.
            </li>
            <li>
              Возврат средств будет произведен на ваш <strong>Кошелек</strong> в
              меню <strong>"Финансы"</strong>.
            </li>
          </ul>
        </li>
      </ul>
      <p class="divider"></p>
      <p class="mb-2"><strong>Пример работы с меню "Доставка"</strong></p>
      <ul class="list-decimal ml-10">
        <li>
          Вы заходите в меню <strong>"Доставка"</strong> и видите, что несколько
          заказов имеют статус <strong>"Готов к выдаче / получению"</strong>.
        </li>
        <li>Выгружаете файл с QR-кодами в формате PDF.</li>
        <li>Сохраняете файл и отправляетесь в ПВЗ.</li>
        <li>
          На ПВЗ предъявляете QR-код или Код получения, Имя и Номер телефона.
        </li>
        <li>Получаете товар и проверяете его на соответствие заказу.</li>
        <li>
          Если один из заказов отменен, обращаетесь в службу заботы для возврата
          средств.
        </li>
      </ul>
      <p class="divider"></p>
      <p class="mb-2"><strong>Рекомендации</strong></p>
      <ul class="list-disc ml-10">
        <li>Регулярно проверяйте статусы доставок в меню "Доставка".</li>
        <li>Не затягивайте с получением товаров, чтобы избежать штрафов.</li>
        <li>
          Используйте Excel-файл "Общая таблица Excel" для анализа и
          планирования.
        </li>
        <li>В случае проблем с доставкой сразу обращайтесь в службу заботы.</li>
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
