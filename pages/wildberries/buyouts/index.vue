<script setup lang="ts">
const { notify } = useNotification();

definePageMeta({
  layout: "app",
  title: "Выкупы",
  middleware: "auth",
});
const route = useRoute();
const buyouts = ref([]) as any;
const modal = ref(false);
const logModal = ref(false);
const removeModal = ref(false);
const selectedBuyout = ref<any>({});
const selectedIndex = ref(-1);
const storeMain = useMainStore();
const selectedPlace = ref(-1);
const status = computed(() => route.query?.status || "all");
const loading = ref(false);
const mpStore = useMPStore();

const dateFilter = ref("all");
const autoTarget = ref(true);
const search = reactive({
  text: "",
  loading: false,
  error: false,
  type: "article",
});
function openModal(index: number) {
  selectedIndex.value = index;
  selectedPlace.value = buyouts.value.length - index;
  selectedBuyout.value = buyouts.value[index];
  modal.value = true;
}
function openRemoveModal(index: number) {
  selectedIndex.value = index;
  selectedPlace.value = buyouts.value.length - index;
  selectedBuyout.value = buyouts.value[index];
  removeModal.value = true;
}
function openLogModal(index: number) {
  selectedIndex.value = index;
  selectedPlace.value = buyouts.value.length - index;
  selectedBuyout.value = buyouts.value[index];
  logModal.value = true;
}
const target = ref(null);
const targetIsVisible = ref(false);

const { stop } = useIntersectionObserver(target, ([{ isIntersecting }]) => {
  targetIsVisible.value = isIntersecting;
});

const skip = ref(50);
const end = ref(false);
async function getBuyouts() {
  loading.value = true;
  const { data } = await useFetch(() => "/api/wildberries/buyout/get", {
    method: "GET",
    query: {
      status: status.value ?? "all",
      dateFilter: dateFilter.value,
      limit: 50,
    },
    watch: false,
  });
  buyouts.value = data.value;
  loading.value = false;
}

// await getBuyouts()

async function removeBuyout() {
  const { error }: any = await useFetch("/api/wildberries/buyout/delete", {
    method: "DELETE",
    body: {
      uuid: selectedBuyout.value.uuid,
    },
    headers: useRequestHeaders(["cookie"]) as HeadersInit,
  });
  if (error.value) {
    notify({
      title: "Что-то пошло не так",
      text: error.value?.data?.message,
      group: "error",
      duration: 3000,
    });
  } else {
    removeModal.value = false;
    notify({
      title: "Успешно",
      text: "Выкуп успешно удален",
      group: "success",
      duration: 3000,
    });
    buyouts.value = buyouts.value.filter(
      (buyout: any) => buyout.uuid !== selectedBuyout.value.uuid
    );
  }
}
function archiveBuyout(uuid: string) {
  buyouts.value = buyouts.value.map((buyout: any) => {
    if (buyout.uuid === uuid) buyout.status = "archived";

    return buyout;
  });
  if (
    route.query.status &&
    route.query?.status !== "archived" &&
    route.query?.status !== "all"
  ) {
    buyouts.value = buyouts.value.filter((buyout: any) => buyout.uuid !== uuid);
  }
}

function unarchiveBuyout(uuid: string) {
  buyouts.value = buyouts.value.map((buyout: any) => {
    if (buyout.uuid === uuid) buyout.status = "active";

    return buyout;
  });
  if (
    route.query.status &&
    route.query?.status !== "active" &&
    route.query?.status !== "all"
  ) {
    buyouts.value = buyouts.value.filter((buyout: any) => buyout.uuid !== uuid);
  }
}
function unpauseBuyout(uuid: string) {
  buyouts.value = buyouts.value.map((buyout: any) => {
    if (buyout.uuid === uuid) buyout.status = "active";

    return buyout;
  });
  if (
    route.query.status &&
    route.query?.status !== "active" &&
    route.query?.status !== "all"
  ) {
    buyouts.value = buyouts.value.filter((buyout: any) => buyout.uuid !== uuid);
  }
}

async function selectFilterDate(e: any) {
  const target = e;
  dateFilter.value = target.value;
  skip.value = 50;
  end.value = false;
  const { data } = await useFetch("/api/wildberries/buyout/get", {
    method: "GET",
    query: {
      status: status.value || "all",
      dateFilter: dateFilter.value,
      limit: 50,
    },
    watch: false,
  });
  buyouts.value = data.value;
}
async function findBuyouts(value: string, type: string) {
  if (!value) {
    autoTarget.value = true;
    search.loading = false;
    getBuyouts();
    return;
  }
  const { data } = await useFetch("/api/wildberries/buyout/search", {
    query: {
      string: value,
      type,
    },
    watch: false,
  });
  if (data.value) buyouts.value = data.value;

  search.loading = false;
}

const findBuyoutsDebounced = useDebounceFn(findBuyouts, 1000);

async function onSearchInput() {
  autoTarget.value = false;
  search.loading = true;
  findBuyoutsDebounced(search.text, search.type);
}

const activeBuyouts = computedEager(() => {
  if (!buyouts.value.length) return [];
  const result = buyouts.value.filter(
    (buyout: any) => buyout.status === "active"
  );
  return result;
});
const availableBuyouts = computedEager(() => {
  if (!activeBuyouts.value.length) return null;
  let balance = storeMain.client.balance;
  let result = 0;
  activeBuyouts.value.forEach((buyout: any) => {
    balance -= buyout.product.price * buyout.quantity;
    if (balance >= 0) result++;
  });
  return result;
});
const neededDeposit = computedEager(() => {
  let result = 0;
  let sum = 0;
  activeBuyouts.value.forEach((buyout: any) => {
    sum += buyout.product.price * buyout.quantity;
  });
  if (sum > storeMain.client.balance) result = sum - storeMain.client.balance;

  return result;
});
const formatAvailable = computedEager(() => {
  if (!availableBuyouts.value) return "";
  const str = availableBuyouts.value.toString();
  const lastNumber = Number(str[str.length - 1]);
  if (Number(str) > 10 && Number(str) < 20) return "выкупов";
  if (lastNumber === 1) return "выкуп";
  if (lastNumber > 1 && lastNumber < 5) return "выкупа";
  else return "выкупов";
});

const filters = [
  {
    title: "Все выкупы",
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
    title: "В архиве",
    optionValue: "archived",
    params: "?status=archived",
    queryStatus: "archived",
  },
  {
    title: "На паузе",
    optionValue: "paused",
    params: "?status=paused",
    queryStatus: "paused",
  },
  {
    title: "Завершенные",
    optionValue: "completed",
    params: "?status=completed",
    queryStatus: "completed",
  },
  // ,
  // {
  //   title: 'Выкуп с рекламы',
  //   optionValue: 'completedByAds',
  //   params: '?status=completedByAds',
  //   queryStatus: 'completedByAds',
  // },
  // {
  //   title: 'Ожидает скидку',
  //   optionValue: 'discountAwaiting',
  //   params: '?status=discountAwaiting',
  //   queryStatus: 'discountAwaiting',
  // },
  // {
  //   title: 'Выкуп по скидке',
  //   optionValue: 'completedByDiscount',
  //   params: '?status=completedByDiscount',
  //   queryStatus: 'completedByDiscount',
  // },
  // {
  //   title: 'Недостаточно средств',
  //   optionValue: 'nofunds',
  //   params: '?status=nofunds',
  //   queryStatus: 'nofunds',
  // },
];

watch(targetIsVisible, async (isVisible) => {

  if (isVisible && autoTarget.value && buyouts.value.length >= 50) {
    if (end.value) return;
    const { data } = await useFetch("/api/wildberries/buyout/get", {
      method: "GET",
      query: {
        status: route.query?.status || "all",
        limit: 50,
        dateFilter: dateFilter.value,
        skip: skip.value,
      },
      watch: false,
    });
    if ((data.value as any).length === 0) {
      end.value = true;
      return;
    }
    buyouts.value = [...buyouts.value, ...(data.value as any)];
    skip.value += 50;
  }
});
watch(
  () => status.value,
  async () => {
    skip.value = 50;
    end.value = false;
    const { data } = await useFetch("/api/wildberries/buyout/get", {
      method: "GET",
      query: {
        status: status.value || "all",
        dateFilter: dateFilter.value,
        limit: 50,
      },
      watch: false,
    });
    buyouts.value = data.value;
  },
  { deep: true, immediate: true }
);

onMounted(async () => {
  if (route.query?.uuid) {
    const uuid = route.query?.uuid;
    if (buyouts.value) {
      const index = buyouts.value!.findIndex(
        (buyout: any) => buyout.uuid === uuid
      );
      if (index !== -1) {
        openModal(index);
      } else {
        const { data } = await useFetch("/api/wildberries/buyout/getOne", {
          method: "GET",
          query: { uuid },
          watch: false,
        });
        if (data.value) {
          buyouts.value = [data.value, ...buyouts.value];
          openModal(0);
        }
      }
    }
  }
});

getBuyouts();

const statusText = computed(() => {
  return filters.find((el: any) => el.queryStatus === route.query.status)
    ?.title;
});

const dropdownOpened = ref<boolean>(false);

function handleBodyClick(event: MouseEvent) {
  const dropdown = document.querySelector(".dropdown");
  if (dropdown && !dropdown.contains(event.target as Node)) {
    dropdownOpened.value = false;
  }
}

onMounted(() => {
  document.body.addEventListener("click", handleBodyClick);
});

onUnmounted(() => {
  document.body.removeEventListener("click", handleBodyClick);
});

const codeInput = ref();

function updateSearchType(filter: any) {
  search.type = filter.value;
}
async function changeMP(e: any) {
  mpStore.changeMp(
    e.value,
    "buyouts",
    route.query?.status ? `?status=${route.query.status}` : ""
  );
}
const customLinks = filters.map((filter) => ({
  title: filter.title,
  slot: "/wildberries/buyouts",
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
const manualModalPVZ = ref(false)

function toggleCheckbox() {
  const platform = "wildberries";
  const type = "buyout";
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

  const platform = "wildberries";
  const type = "buyout";
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
            to="/catalog/wildberries"
            class="cursor-pointer text-[#909090]"
          >
            Wildberries
          </NuxtLink>
        </li>
        <li class="cursor-pointer text-[#1e2734]">Выкупы</li>
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
            @click="copyToClipboard(`${siteUrl}/wildberries/buyouts`)"
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
        <div class="flex gap-2">
          <NuxtLink
            to="/wildberries/buyouts/create"
            class="btn btn-primary dark:bg-primary border-none btn-sm gap-2 font-medium normal-case"
          >
            <Icon name="fluent:add-24-filled" size="25" />
          </NuxtLink>
        </div>
        <div class="w-full flex gap-1 lg:gap-2">
          <div class="flex gap-1 lg:gap-3 flex-wrap whitespace-nowrap">
            <!-- <span><CustomSelect
              class="h-[2rem]  lg:min-w-[120px]"
              status-text="Wildberries"
              :tabs="storeMain.client.username === 'test' ? mpStore.sortMp('buyouts') : mpStore.sortMp('buyouts', true)"
              @change-value="changeMP"
            /></span> -->
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
              SKU
            </button>
            <button
              @click="manualModalPVZ = true"
              class="btn btn-primary bg-base-200 text-base-content hover:text-white border-none btn-sm gap-2 font-medium normal-case"
            >
              ПВЗ
            </button>
          </div>
          <div class="flex lg:ml-auto gap-0.5 lg:gap-3">
            <CustomSelect
              class="bg-[#f4f4f4] h-[2rem]"
              :tabs="[
                { title: 'Все время', value: 'all' },
                { title: 'Сегодня', value: 'today' },
                { title: 'Вчера', value: '2days' },
                { title: '3 дня', value: '3days' },
                { title: 'Неделя', value: '7days' },
              ]"
              @change-value="selectFilterDate"
            />
          </div>
          <div
            class="absolute right-0 top-0 w-[calc(100%-55px)] lg:w-fit lg:static"
          >
            <label class="w-full flex bg-[#ececed] rounded-lg items-center">
              <input
                ref="codeInput"
                v-model="search.text"
                type="text"
                class="input input-sm border-none bg-transparent dark:bg-base-300 dark:bg-opacity-40 w-full lg:w-11/12"
                placeholder="артикул, id, наименование товара"
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
                @click="codeInput.focus()"
              />
            </label>
          </div>
        </div>
      </div>
    </div>

    <div v-if="buyouts.length > 0">
      <!-- <div
        v-if="
          (route.query.status === 'active' || !route.query.status)
            && activeBuyouts.length > 0
        "
        class="flex justify-center py-2 rounded-lg px-2 mb-2 bg-base-100 border border-base-300"
      >
        <p
          v-if="availableBuyouts"
          :class="{
            'text-green-500': availableBuyouts === activeBuyouts.length,
          }"
          class="text-sm"
        >
          {{
            availableBuyouts === activeBuyouts.length
              ? 'Баланса хватит на все выкупы'
              : `Баланса хватит на ${availableBuyouts} ${formatAvailable} из ${activeBuyouts.length}.`
          }}
          <span v-if="neededDeposit > 0">{{
            `Пополните баланс на ${Math.round(
              neededDeposit,
            )} для выполнения всех выкупов.`
          }}</span>
        </p>
        <p
          v-if="availableBuyouts === 0 && activeBuyouts.length > 0"
          class="text-center text-orange-400 text-sm"
        >
          Недостаточно средств для совершения выкупа, пополните баланс.
        </p>
      </div>
      <div v-else class="px-2 py-4 mb-2" /> -->
      <div
        v-if="buyouts.length > 3"
        group
        class="cards grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-[repeat(auto-fit,minmax(300px,1fr))] h-full"
      >
        <div
          v-for="(buyout, index) of buyouts"
          :key="buyout.uuid"
          class="max-w-[400px]"
        >
          <BuyoutWildberriesCard
            :key="Date.now() + index"
            :index="index"
            :info="buyout"
            @unarchive="unarchiveBuyout"
            @archive="archiveBuyout"
            @open-modal="openModal"
            @remove-buyout="openRemoveModal"
            @unpause="unpauseBuyout"
            @open-log-modal="openLogModal"
          />
        </div>
      </div>
      <div v-else group class="flex flex-wrap gap-x-4 gap-y-3">
        <div
          v-for="(buyout, index) of buyouts"
          :key="buyout.uuid"
          class="max-w-full sm:max-w-[320px]"
        >
          <BuyoutWildberriesCard
            :key="Date.now() + index"
            :index="index"
            :info="buyout"
            @unarchive="unarchiveBuyout"
            @archive="archiveBuyout"
            @open-modal="openModal"
            @remove-buyout="openRemoveModal"
            @unpause="unpauseBuyout"
            @open-log-modal="openLogModal"
          />
        </div>
      </div>
      <div ref="target" class="p-2 w-full col-span-1 h-40" />
    </div>

    <Hero v-else-if="!loading" />
    <div v-else class="w-full mt-5 flex justify-center items-center">
      <span class="loading loading-dots loading-lg text-primary" />
    </div>
    <BuyoutWildberriesLogModal
      v-if="logModal"
      :info="selectedBuyout"
      :index="selectedIndex"
      :state="logModal"
      @close="logModal = false"
    />
    <BuyoutWildberriesInfoModal
      v-if="modal"
      :info="selectedBuyout"
      :state="modal"
      :index="selectedIndex"
      :from-review-page="!!route.query.fromReview"
      :review-uuid="route.query.reviewUuid"
      @close="modal = false"
    />
    <BuyoutRemoveModal
      v-if="removeModal"
      :info="selectedBuyout"
      :state="removeModal"
      :index="selectedIndex"
      @remove="removeBuyout"
      @close="removeModal = false"
    />
    <ManualModal
      :show="manualModal"
      @close="manualModal = false"
      :is-checked="isChecked"
      @checkbox-toggle="toggleCheckbox"
    >
      <h2 class="text-2xl font-bold mb-4">
        Как создать заявку на выкуп товара на платформе Harmex
      </h2>

      <h3 class="text-lg font-bold mb-2">Что важно знать перед началом?</h3>

      <p class="mb-2">
        На <strong>Wildberries</strong> выкуп товара происходит <strong>автоматически</strong> — без вашего участия.
      </p>

      <p class="mb-2">
        Вам <strong>не нужно</strong> ничего покупать вручную, использовать личные карты, прокси или аккаунты.
      </p>

      <p class="mb-4">
        Все операции выполняет платформа <strong>Harmex</strong>, строго в рамках законодательства РФ.
      </p>

      <p class="font-bold mb-1">Чек-лист быстрого изучения</p>
      <p class="text-sm mb-1">00:00 - 04:00. Пополнение баланса</p>
      <p class="text-sm mb-1">04:01 - 10:00. Создание заявки на выкуп</p>
      <p class="text-sm mb-1">10:01 - 14:00. Получение товара на ПВЗ</p>
      <p class="text-sm mb-3">14:01 - 16:29. Публикация отзывов</p>

      <video
        controls
        poster="https://ozonmpportal.hb.vkcs.cloud/harmex/introduction/buyoutsVideoTitle.png"
        class="my-6 w-full"
      >
        <source
          src="https://ozonmpportal.hb.vkcs.cloud/harmex/introduction/buyoutsVideo.mp4"
          type="video/mp4"
        />
        Ваш браузер не поддерживает видео.
      </video>

      <hr class="my-4 border-gray-300" />

      <p class="mb-3">
        Ознакомьтесь с разделом <strong>FAQ</strong>, где собраны ответы на популярные вопросы:
      </p>

      <ul class="list-disc ml-6 mb-4 text-sm space-y-1">
        <li>№1-2. Что нужно подготовить для создания заявки на выкуп / отзыв?</li>
        <li>№3. Как создать заявку на выкуп товара?</li>
        <li>№4. Что означают статусы исполнения заявки?</li>
        <li>№5. Как происходит процесс исполнения заявки?</li>
        <li>№6. По какой цене покупаем товар?</li>
        <li>№6.1. Как списываются финансы с баланса (аванс или пост-факт)?</li>
        <li>№6.2. Где получить финансовый отчет по каждой услуге?</li>
        <li>№7. В каком проценте по какой цене был куплен товар?</li>
        <li>№8. Какие закрывающие документы предоставляете?</li>
        <li>№9. Почему финансы не зачисляются в выходные?</li>
        <li>№10. Как выкупать новые карточки на маркетплейсе?</li>
        <li>№11. Какие способы выкупа товара для выдачи в поиске?</li>
        <li>№12. Как действовать, если заявка ушла в архив</li>
        <li>№13. Если Wildberries лишил СПП (скидки поставщика)</li>
      </ul>

      <hr class="my-4 border-gray-300" />

      <p class="font-bold mb-3">№1. Что вам нужно сделать?</p>

      <ol class="list-decimal ml-6 mb-4 space-y-1">
        <li>Создать заявку на выкуп (Выкупы).</li>
        <li>Отслеживать статус исполнения.</li>
        <li>Получить товар на ПВЗ (Доставки).</li>
        <li>Создать заявку на публикацию отзыва (Отзывы).</li>
        <li>Всё остальное — мы делаем за вас!</li>
      </ol>
      <NuxtImg
          src="https://ozonmpportal.hb.vkcs.cloud/harmex/introduction/wildberries/1.png"
          class="mx-1 my-2"
        />

      <hr class="my-4 border-gray-300" />

      <p class="font-bold mb-3">№2. Подготовьте данные для заявки</p>

      <p class="mb-3">Перед созданием заявки соберите простые исходные данные:</p>

      <ol class="list-decimal ml-6 mb-3 space-y-1">
        <li>Артикул товара (123456789)</li>
        <li>Пол аккаунтов (Женский / Мужской / Случайный)</li>
        <li>Дата и время выкупа (12 ноября, 15:00–19:00)</li>
        <li>Стратегия выкупа (Поиск / Реклама / Полки)</li>
        <li>Поисковые запросы ("женские сапоги", "зимние ботинки")</li>
        <li>Адреса ПВЗ (Казань, ул. Пушкина 23к1)</li>
      </ol>

      <p class="mb-4">
        <strong>Рекомендация:</strong> Если не уверены, какую стратегию выбрать — начните с "реклама+поиск", это универсальный вариант для старта.
      </p>

      <p class="mb-2"><strong>Лайфхак для быстрой настройки</strong></p>
      <p class="mb-2">Чтобы ваша заявка прошла модерацию с первого раза, мы добавили интерактивные подсказки прямо в интерфейс:</p>
      <ul class="list-disc pl-5 mb-2 flex flex-col gap-1">
        <li><strong>Где искать:</strong> нажмите на название любой колонки в таблице заказа.</li>
        <li><strong>Что внутри:</strong> пошаговая инструкция — как правильно активировать конкретное правило, выбрать ПВЗ или настроить выкуп с полок.</li>
        <li><strong>Зачем это нужно:</strong> там собраны все актуальные лимиты и секреты безопасности, которые обновляются под алгоритмы 2026 года.</li>
      </ul>
      <p class="mb-4">Не пренебрегайте инструкциями — это ваша страховка от ошибок и гарантия высокого рейтинга!</p>

      <NuxtImg
        src="https://ozonmpportal.hb.vkcs.cloud/harmex/introduction/wildberries/2.png"
        class="mx-1 my-2"
      />

      <hr class="my-4 border-gray-300" />

      <p class="font-bold mb-3">№3. Создайте заявку на выкуп</p>

      <ol class="list-decimal ml-6 mb-4 space-y-1">
        <li>Перейдите в раздел <strong>Каталог услуг</strong>.</li>
        <li>Выберите <strong>Wildberries — Выкупы</strong>.</li>
        <li>Нажмите <strong>Создать заявку</strong>.</li>
        <li>Заполните все поля: артикул, дата, количество, правила, адрес ПВЗ и т.д.</li>
        <li>Нажмите <strong>Создать</strong>.</li>
      </ol>

      <p class="mb-4">
        После создания вы увидите заявку в статусе <strong>"Активен"</strong>.
      </p>

      <NuxtImg
        src="https://ozonmpportal.hb.vkcs.cloud/harmex/introduction/wildberries/3.png"
        class="mx-1 my-2"
      />

      <hr class="my-4 border-gray-300" />

      <p class="font-bold mb-3">Использование персонального идентификатора (ID):</p>

      <p class="mb-4">
        Каждая услуга, которую вы заказываете, получает уникальный идентификатор (ID). Это позволяет службе поддержки быстро находить ваш заказ и оперативно решать возникающие вопросы.
      </p>

      <NuxtImg
        src="https://ozonmpportal.hb.vkcs.cloud/harmex/introduction/wildberries/4.png"
        class="mx-1 my-2"
      />

      <hr class="my-4 border-gray-300" />

      <p class="font-bold mb-3">№4. Отслеживайте процесс исполнения</p>

      <p class="mb-3">У каждой заявки есть <strong>4 статуса</strong>:</p>

      <ol class="list-decimal ml-6 mb-4 space-y-2">
        <li>🟡 <strong>Активный</strong> - заявка создана и готовится к исполнению</li>
        <li>🟢 <strong>В работе</strong> - подключен аккаунт, карта, устройство, геолокация, нагул</li>
        <li>🔴 <strong>Завершено</strong> - заказ выполнен, скриншоты добавлены, фин.отчет внесен</li>
        <li>🟠 <strong>В архиве</strong> - заявка архивирована по причине указанной <strong>3 точки - О выкупе</strong></li>
      </ol>

      <p class="mb-4">
        Когда заявка переходит в статус <strong>"В работе"</strong>, она уже выполняется через наш автоматизированный модуль.
      </p>

      <NuxtImg
        src="https://ozonmpportal.hb.vkcs.cloud/harmex/introduction/wildberries/5.png"
        class="mx-1 my-2"
      />

      <hr class="my-4 border-gray-300" />

      <p class="font-bold mb-3">№5. Как работает процесс "Самовыкупа" (внутри)</p>

      <p class="mb-3">
        Чтобы имитация выглядела максимально естественно, мы выполняем следующие действия от имени реальных пользователей:
      </p>

      <ol class="list-decimal ml-6 mb-4 space-y-1">
        <li>Входим в приложение Wildberries с мобильного устройства.</li>
        <li>"Гуляем" по каталогу 5–7 минут.</li>
        <li>Вводим поисковый запрос.</li>
        <li>Просматриваем 3–5 карточек конкурентов.</li>
        <li>Добавляем в корзину 1–3 карточки конкурентов.</li>
        <li>Ищем вашу карточку (до 40-й страницы).</li>
        <li>Переходим в неё, изучаем изображения и инфографику.</li>
        <li>Добавляем в корзину ваш товар.</li>
        <li>Оформляем заказ и оплачиваем.</li>
        <li>Прикладываем скриншоты для прозрачности.</li>
      </ol>

      <p class="mb-4">
        <strong>
        Все действия фиксируются в отчете, чтобы вы могли убедиться, что всё выполнено корректно.
        </strong>
      </p>

      <hr class="my-4 border-gray-300" />

      <p class="font-bold mb-3">№6. Оплатите услуги</p>

      <p class="mb-3">Для оплаты за товар и услуги:</p>

      <ol class="list-decimal ml-6 mb-3 space-y-1">
        <li><strong>Пополните баланс</strong> на сумму, достаточную для дневного бюджета (стоимость товара по СПП + услуга = Аванс).</li>
        <li>После исполнения услуги сумма автоматически спишется с баланса.</li>
        <li>В разделе <strong>Финансы</strong> отображаются:
          <ul class="list-[circle] ml-6 mt-1 space-y-1">
            <li>дата и время исполнения;</li>
            <li>сумма списания;</li>
            <li>идентификатор заказа (ID заказа)</li>
            <li>маркетплейс оказания услуги</li>
            <li>категория услуги</li>
          </ul>
        </li>
      </ol>

      <p class="mb-4">
        Harmex списывает средства <strong>только за фактически оказанные услуги</strong>. Отчет формируется <strong>по вашему местному времени</strong>, а не по МСК.
      </p>

      <NuxtImg
        src="https://ozonmpportal.hb.vkcs.cloud/harmex/introduction/wildberries/6.png"
        class="mx-1 my-2"
      />

      <hr class="my-4 border-gray-300" />

      <p class="font-bold mb-3">№7. Как проверить цену выкупа</p>

      <p class="mb-3">2 простых способа:</p>

      <ol class="list-decimal ml-6 mb-3 space-y-2">
        <li><strong>При создании заявки</strong> — система подтягивает актуальную цену автоматически с карточки товара.</li>
        <li><strong>После исполнения</strong> — откройте раздел <strong>Отчетность</strong>, введите <strong>ID заявки</strong> и посмотрите скриншот, где указана фактическая цена товара при выкупе</li>
        <li>Или Откройте заявку <strong>"Детали" - Выполнено</strong> и кликните по дате исполнения. Вы увидите фактическую цену списания</li>
      </ol>

      <p class="mb-4">
        Полная прозрачность для долгосрочного сотрудничества - залог нашего бизнеса.
      </p>

      <NuxtImg
        src="https://ozonmpportal.hb.vkcs.cloud/harmex/introduction/wildberries/7.png"
        class="mx-1 my-2"
      />

      <NuxtImg
        src="https://ozonmpportal.hb.vkcs.cloud/harmex/introduction/wildberries/8.png"
        class="mx-1 my-2"
      />

      <hr class="my-4 border-gray-300" />

      <p class="font-bold mb-3">№8. Отчетность и закрывающие документы</p>

      <ul class="list-disc ml-6 mb-4 space-y-1">
        <li>Финансовая отчетность — в меню <strong>Финансы - Excel</strong>.</li>
        <li>Чеки пост оплаты по QR-коду уходят на ваш email</li>
        <li>Закрывающие документы (по ЭДО) — формируются <strong>до 15 числа следующего месяца</strong>.</li>
      </ul>

      <p class="mb-2"><strong>Пример:</strong></p>
      <p class="ml-4">за сентябрь — до 15 октября,</p>
      <p class="ml-4 mb-4">за октябрь — до 15 ноября, и т.д.</p>

      <p class="mb-4">
        В документах отражаются <strong>фактические расходы по балансу</strong>, а не выставленные счета.
      </p>

      <NuxtImg
        src="https://ozonmpportal.hb.vkcs.cloud/harmex/introduction/wildberries/9.png"
        class="mx-1 my-2"
      />

      <hr class="my-4 border-gray-300" />

      <p class="font-bold mb-3">№9. Рекомендации для старта</p>

      <ul class="list-disc ml-6 mb-4 space-y-2">
        <li>Пополняйте баланс <strong>заранее</strong>, особенно перед выходными (банки не зачисляют переводы в сб и вс).</li>
        <li>Все операции по выкупам выполняются <strong>24/7</strong>, но зачисления — только <strong>в рабочие дни банков</strong>.</li>
        <li>Перед созданием заявки — <strong>проверьте сумму на балансе</strong>.</li>
      </ul>

      <hr class="my-4 border-gray-300" />

      <p class="font-bold mb-3">№10. Как выкупать новые карточки на маркетплейсе?</p>

      <p class="mb-3">
        Чтобы <strong>новая карточка товара появилась в поиске и начала подниматься в топ</strong>, нужно пройти <strong>два этапа</strong>:
      </p>

      <ol class="list-decimal ml-6 mb-3 space-y-2">
        <li><strong>Создать оборотку</strong> — первые 2–3 выкупа по артикулу, чтобы товар появился в поисковой выдаче.</li>
        <li><strong>Подключить рекламу</strong> и выполнять выкупы <strong>по поисковому запросу</strong> (до 40-й страницы).</li>
      </ol>

      <p class="mb-3">
        Это базовый алгоритм, без которого продвижение карточки невозможно.
      </p>

      <p class="mb-4">
        Если вы сразу создаёте выкупы по поисковому запросу, но карточка ещё не появилась в поиске — заявка уйдёт в архив с причиной <strong>"Не находит в поиске"</strong>.
      </p>

      <hr class="my-4 border-gray-300" />

      <p class="font-bold mb-3">№11. Какие способы выкупа товара для выдачи в поиске?</p>

      <p class="mb-3">
        Перед созданием заявки определите, <strong>по какой стратегии</strong> вы будете работать:
      </p>

      <ul class="list-disc ml-6 mb-4 space-y-2">
        <li>Выкупы по артикулу
          <ul class="list-[circle] ml-6 mt-1 space-y-1">
            <li>Новая карточка, без продаж</li>
            <li>Цель - создать оборотку, попасть в поиск</li>
          </ul>
        </li>
        <li>Выкупы с рекламой
          <ul class="list-[circle] ml-6 mt-1 space-y-1">
            <li>После появления карточки в поиске</li>
            <li>Цель - укрепить позиции и ускорить рост</li>
          </ul>
        </li>
        <li>Выкупы по поисковому запросу
          <ul class="list-[circle] ml-6 mt-1 space-y-1">
            <li>Когда карточка уже видна в поиске</li>
            <li>Цель - закрепиться в выдаче</li>
          </ul>
        </li>
        <li>Выкупы по сортировке
          <ul class="list-[circle] ml-6 mt-1 space-y-1">
            <li>Если карточка далеко (30–40 стр.)</li>
            <li>Цель - помочь алгоритму "подхватить" карточку</li>
          </ul>
        </li>
      </ul>

      <p class="font-bold mb-2">Оптимальный порядок:</p>
      <p class="mb-4 ml-4">
        1️⃣ Выкупы по артикулу → 2️⃣ Реклама → 3️⃣ Поиск → 4️⃣ Сортировка
      </p>

      <p class="font-bold mb-2">Пример:</p>
      <p class="ml-4">2–3 выкупа по артикулу → Подключение рекламы.</p>
      <p class="ml-4">3–5 выкупов по поисковому запросу → Если не проходят, то</p>
      <p class="ml-4 mb-4">1–2 выкупа по сортировке (при необходимости) → Повторение</p>

      <hr class="my-4 border-gray-300" />

      <p class="font-bold mb-3">№12. Как действовать, если заявка ушла в архив</p>

      <p class="font-bold mb-2">Причина: "Не находит в поиске"</p>
      <p class="mb-3">
        Значит, ваша карточка ещё не появилась в выдаче или находится дальше 40-й страницы.
      </p>

      <p class="mb-2"><strong>Решение:</strong></p>
      <ol class="list-decimal ml-6 mb-4 space-y-1">
        <li>Перезапустите заявку "3 точки - Убрать с Архива"</li>
        <li>Пересоздайте заявку <strong>по артикулу</strong>, чтобы создать оборотку.</li>
        <li>После 2–3 успешных выкупов создайте заявку <strong>по поисковому запросу</strong>.</li>
        <li>Если карточка всё ещё не находится — добавьте стратегию <strong>"по сортировке"</strong>.</li>
      </ol>

      <p class="mb-4">
        Сначала попасть в поиск → потом продвигаться в поиске.
      </p>

      <hr class="my-4 border-gray-300" />

      <p class="font-bold mb-2">Причина: "Техническая ошибка"</p>

      <p class="mb-3">
        Это временные сбои со стороны маркетплейса или сети (свет, интернет, API).
      </p>

      <ul class="list-disc ml-6 mb-4 space-y-1">
        <li>Перезапустите заявку ("Снять с архива").</li>
        <li>Если после 2–3 попыток ошибка повторяется — напишите в <strong>Службу заботы Harmex</strong>.</li>
      </ul>

      <hr class="my-4 border-gray-300" />

      <p class="font-bold mb-2">Причина: "Недостаточно средств"</p>

      <ul class="list-disc ml-6 mb-4 space-y-1">
        <li>Пополните баланс (QR / счёт от организации).</li>
        <li>После зачисления средств система автоматически возобновит исполнение.</li>
      </ul>

      <hr class="my-4 border-gray-300" />

      <p class="font-bold mb-2">Причина: "ПВЗ не найден на карте"</p>

      <ul class="list-disc ml-6 mb-4 space-y-1">
        <li>Попробуйте изменить формат названия (например, "ул. Ленина, 10" → "Ленина 10").</li>
        <li>Если не помогает — обратитесь в поддержку, и мы добавим адрес вручную.</li>
      </ul>

      <hr class="my-4 border-gray-300" />

      <p class="font-bold mb-3">№13. Если Wildberries лишил СПП (скидки поставщика)</p>

      <ol class="list-decimal ml-6 mb-4 space-y-2">
        <li>Подключите тариф <strong>1%</strong> для пробных закупок собственных товаров.</li>
        <li>Подключите модуль <strong>"Джем"</strong> — он позволяет восстановить СПП <strong>через 24 часа</strong>.</li>
        <li>После восстановления СПП вы сможете продолжить выкупы без потери маржи.</li>
      </ol>

    </ManualModal>
    <ManualModal
      :show="manualModalPVZ"
      @close="manualModalPVZ = false"
      :is-checked="isChecked"
      @checkbox-toggle="toggleCheckbox"
    >
      <h2 class="text-2xl font-bold mb-4">
        Как опубликовать отзыв на ПВЗ используя Harmex
      </h2>

      <h3 class="text-lg font-bold mb-2">Что важно знать перед началом?</h3>

      <p class="mb-2">
        На <strong>Wildberries</strong> и других маркетплейсах выкуп товара происходит <strong>автоматически</strong> — без вашего участия.
      </p>

      <p class="mb-2">
        Вам <strong>не нужно</strong> ничего покупать вручную, использовать личные карты, прокси или аккаунты.
      </p>

      <p class="mb-4">
        Все операции выполняет платформа <strong>Harmex</strong>, строго в рамках законодательства РФ.
      </p>

      <h3 class="text-lg font-bold mb-2">Что вам нужно сделать?</h3>

      <ol class="list-decimal ml-6 mb-4 space-y-1">
        <li>Выбрать самый дешевый товар на маркетплейсе</li>
        <li>Пополнить баланс на товар по СПП + услуги наши + комиссия</li>
        <li>Создать заявку на выкуп (Выкупы):
          <ul class="list-[circle] ml-6 mt-1 space-y-1">
            <li>с выкупом по артикулу</li>
            <li>в ближайшее время</li>
            <li>по правилу 9</li>
            <li>и низкочастотным запросом</li>
          </ul>
        </li>
        <li>Отслеживать статус исполнения.</li>
        <li>Получить товар на ПВЗ (Доставки).</li>
        <li>Создать заявку на публикацию отзыва (Отзывы).
          <ul class="list-[circle] ml-6 mt-1 space-y-1">
            <li>публикация отзыва доступна в течение 24-48 часов с момента "Получения товара на ПВЗ"</li>
          </ul>
        </li>
        <li>Всё остальное — мы делаем за вас!</li>
      </ol>

      <NuxtImg
        src="https://ozonmpportal.hb.vkcs.cloud/harmex/introduction/pvz1.png"
        class="mx-1 my-2"
      />

      <p class="font-bold mb-1">Чек-лист быстрого изучения</p>
      <p class="text-sm mb-1">00:00 - 04:00. Пополнение баланса</p>
      <p class="text-sm mb-1">04:01 - 10:00. Создание заявки на выкуп</p>
      <p class="text-sm mb-1">10:01 - 14:00. Получение товара на ПВЗ</p>
      <p class="text-sm mb-3">14:01 - 16:29. Публикация отзывов</p>

      <video
        controls
        poster="https://ozonmpportal.hb.vkcs.cloud/harmex/introduction/buyoutsVideoTitle.png"
        class="my-6 w-full"
      >
        <source
          src="https://ozonmpportal.hb.vkcs.cloud/harmex/introduction/buyoutsVideo.mp4"
          type="video/mp4"
        />
        Ваш браузер не поддерживает видео.
      </video>

      <hr class="my-4 border-gray-300" />

      <p class="mb-3">
        Ознакомьтесь с разделом <strong>FAQ</strong>, где собраны ответы на популярные вопросы:
      </p>

      <ul class="list-disc ml-6 mb-4 text-sm space-y-1">
        <li>№1. Что нужно подготовить для создания заявки на выкуп / отзыв?</li>
        <li>№2. Как создать заявку на выкуп товара?</li>
        <li>№3. Что означают статусы исполнения заявки?</li>
        <li>№4. Как происходит процесс исполнения заявки?</li>
        <li>№5. По какой цене покупаем товар?</li>
        <li>№6. Как списываются финансы с баланса (аванс или пост-факт)?</li>
        <li>№7. Где получить финансовый отчет по каждой услуге?</li>
        <li>№8. В каком проценте по какой цене был куплен товар?</li>
        <li>№9. Какие закрывающие документы предоставляете?</li>
        <li>№10. Почему финансы не зачисляются в выходные?</li>
        <li>№11. Как выкупать новые карточки на маркетплейсе?</li>
        <li>№12. Какие способы выкупа товара для выдачи в поиске?</li>
        <li>№13. Как действовать, если заявка ушла в архив</li>
      </ul>

      <hr class="my-4 border-gray-300" />

      <p class="font-bold mb-3">№1. Подготовьте данные для заявки</p>

      <p class="mb-3">Перед созданием заявки соберите простые исходные данные:</p>

      <ol class="list-decimal ml-6 mb-3 space-y-1">
        <li>Артикул товара (123456789)</li>
        <li>Пол аккаунтов (Женский / Мужской / Случайный)</li>
        <li>Дата и время выкупа (12 ноября, 15:00–19:00)</li>
        <li>Стратегия выкупа (Поиск / Реклама / Полки)</li>
        <li>Поисковые запросы ("женские сапоги", "зимние ботинки")</li>
        <li>Адреса ПВЗ (Казань, ул. Пушкина 23к1)</li>
      </ol>

      <p class="mb-4">
        <strong>Рекомендация:</strong> Если не уверены, какую стратегию выбрать — начните с "реклама+поиск", это универсальный вариант для старта.
      </p>

      <p class="mb-2"><strong>Лайфхак для быстрой настройки</strong></p>
      <p class="mb-2">Чтобы ваша заявка прошла модерацию с первого раза, мы добавили интерактивные подсказки прямо в интерфейс:</p>
      <ul class="list-disc pl-5 mb-2 flex flex-col gap-1">
        <li><strong>Где искать:</strong> нажмите на название любой колонки в таблице заказа.</li>
        <li><strong>Что внутри:</strong> пошаговая инструкция — как правильно активировать конкретное правило, выбрать ПВЗ или настроить выкуп с полок.</li>
        <li><strong>Зачем это нужно:</strong> там собраны все актуальные лимиты и секреты безопасности, которые обновляются под алгоритмы 2026 года.</li>
      </ul>
      <p class="mb-4">Не пренебрегайте инструкциями — это ваша страховка от ошибок и гарантия высокого рейтинга!</p>

      <NuxtImg
        src="https://ozonmpportal.hb.vkcs.cloud/harmex/introduction/wildberries/2.png"
        class="mx-1 my-2"
      />

      <hr class="my-4 border-gray-300" />

      <p class="font-bold mb-3">№2. Создайте заявку на выкуп</p>

      <ol class="list-decimal ml-6 mb-4 space-y-1">
        <li>Перейдите в раздел <strong>Каталог услуг</strong>.</li>
        <li>Выберите <strong>Wildberries — Выкупы</strong>.</li>
        <li>Нажмите <strong>Создать заявку</strong>.</li>
        <li>Заполните все поля: артикул, дата, количество, правила, адрес ПВЗ и т.д.</li>
        <li>Нажмите <strong>Создать</strong>.</li>
      </ol>

      <p class="mb-4">
        После создания вы увидите заявку в статусе <strong>"Активен"</strong>.
      </p>

      <NuxtImg
        src="https://ozonmpportal.hb.vkcs.cloud/harmex/introduction/wildberries/3.png"
        class="mx-1 my-2"
      />

      <hr class="my-4 border-gray-300" />

      <p class="font-bold mb-3">Использование персонального идентификатора (ID):</p>

      <p class="mb-4">
        Каждая услуга, которую вы заказываете, получает уникальный идентификатор (ID). Это позволяет службе поддержки быстро находить ваш заказ и оперативно решать возникающие вопросы.
      </p>

      <NuxtImg
        src="https://ozonmpportal.hb.vkcs.cloud/harmex/introduction/wildberries/4.png"
        class="mx-1 my-2"
      />

      <hr class="my-4 border-gray-300" />

      <p class="font-bold mb-3">№3. Отслеживайте процесс исполнения</p>

      <p class="mb-3">У каждой заявки есть <strong>4 статуса</strong>:</p>

      <ol class="list-decimal ml-6 mb-4 space-y-2">
        <li>🟡 <strong>Активный</strong> - заявка создана и готовится к исполнению</li>
        <li>🟢 <strong>В работе</strong> - подключен аккаунт, карта, устройство, геолокация, нагул</li>
        <li>🔴 <strong>Завершено</strong> - заказ выполнен, скриншоты добавлены, фин.отчет внесен</li>
        <li>🟠 <strong>В архиве</strong> - заявка архивирована по причине указанной <strong>3 точки - О выкупе</strong></li>
      </ol>

      <p class="mb-4">
        Когда заявка переходит в статус <strong>"В работе"</strong>, она уже выполняется через наш автоматизированный модуль.
      </p>

      <NuxtImg
        src="https://ozonmpportal.hb.vkcs.cloud/harmex/introduction/wildberries/5.png"
        class="mx-1 my-2"
      />

      <hr class="my-4 border-gray-300" />

      <p class="font-bold mb-3">№4. Как работает процесс "Самовыкупа" (внутри)</p>

      <p class="mb-3">
        Чтобы имитация выглядела максимально естественно, мы выполняем следующие действия от имени реальных пользователей:
      </p>

      <ol class="list-decimal ml-6 mb-4 space-y-1">
        <li>Входим в приложение Wildberries с мобильного устройства.</li>
        <li>"Гуляем" по каталогу 5–7 минут.</li>
        <li>Вводим поисковый запрос.</li>
        <li>Просматриваем 3–5 карточек конкурентов.</li>
        <li>Добавляем в корзину 1–3 карточки конкурентов.</li>
        <li>Ищем вашу карточку (до 40-й страницы).</li>
        <li>Переходим в неё, изучаем изображения и инфографику.</li>
        <li>Добавляем в корзину ваш товар.</li>
        <li>Оформляем заказ и оплачиваем.</li>
        <li>Прикладываем скриншоты для прозрачности.</li>
      </ol>

      <p class="mb-4">
        <strong>
        Все действия фиксируются в отчете, чтобы вы могли убедиться, что всё выполнено корректно.
        </strong>
      </p>

      <hr class="my-4 border-gray-300" />

      <p class="font-bold mb-3">№5. Оплатите услуги</p>

      <p class="mb-3">Для оплаты за товар и услуги:</p>

      <ol class="list-decimal ml-6 mb-3 space-y-1">
        <li><strong>Пополните баланс</strong> на сумму, достаточную для дневного бюджета (стоимость товара по СПП + услуга = Аванс).</li>
        <li>После исполнения услуги сумма автоматически спишется с баланса.</li>
        <li>В разделе <strong>Финансы</strong> отображаются:
          <ul class="list-[circle] ml-6 mt-1 space-y-1">
            <li>дата и время исполнения;</li>
            <li>сумма списания;</li>
            <li>идентификатор заказа (ID заказа)</li>
            <li>маркетплейс оказания услуги</li>
            <li>категория услуги</li>
          </ul>
        </li>
      </ol>

      <p class="mb-4">
        Harmex списывает средства <strong>только за фактически оказанные услуги</strong>. Отчет формируется <strong>по вашему местному времени</strong>, а не по МСК.
      </p>

      <NuxtImg
        src="https://ozonmpportal.hb.vkcs.cloud/harmex/introduction/wildberries/6.png"
        class="mx-1 my-2"
      />

      <hr class="my-4 border-gray-300" />

      <p class="font-bold mb-3">№8. Как проверить цену выкупа</p>

      <p class="mb-3">2 простых способа:</p>

      <ol class="list-decimal ml-6 mb-3 space-y-2">
        <li><strong>При создании заявки</strong> — система подтягивает актуальную цену автоматически с карточки товара.</li>
        <li><strong>После исполнения</strong> — откройте раздел <strong>Отчетность</strong>, введите <strong>ID заявки</strong> и посмотрите скриншот, где указана фактическая цена товара при выкупе</li>
        <li>Или Откройте заявку <strong>"Детали" - Выполнено</strong> и кликните по дате исполнения. Вы увидите фактическую цену списания</li>
      </ol>

      <p class="mb-4">
        Полная прозрачность для долгосрочного сотрудничества - залог нашего бизнеса.
      </p>

      <NuxtImg
        src="https://ozonmpportal.hb.vkcs.cloud/harmex/introduction/wildberries/7.png"
        class="mx-1 my-2"
      />

      <NuxtImg
        src="https://ozonmpportal.hb.vkcs.cloud/harmex/introduction/wildberries/8.png"
        class="mx-1 my-2"
      />

      <hr class="my-4 border-gray-300" />

      <p class="font-bold mb-3">№9. Отчетность и закрывающие документы</p>

      <ul class="list-disc ml-6 mb-4 space-y-1">
        <li>Финансовая отчетность — в меню <strong>Финансы - Excel</strong>.</li>
        <li>Чеки пост оплаты по QR-коду уходят на ваш email</li>
        <li>Закрывающие документы (по ЭДО) — формируются <strong>до 15 числа следующего месяца</strong>.</li>
      </ul>

      <p class="mb-2"><strong>Пример:</strong></p>
      <p class="ml-4">за сентябрь — до 15 октября,</p>
      <p class="ml-4 mb-4">за октябрь — до 15 ноября, и т.д.</p>

      <p class="mb-4">
        В документах отражаются <strong>фактические расходы по балансу</strong>, а не выставленные счета.
      </p>

      <NuxtImg
        src="https://ozonmpportal.hb.vkcs.cloud/harmex/introduction/wildberries/9.png"
        class="mx-1 my-2"
      />

      <hr class="my-4 border-gray-300" />

      <p class="font-bold mb-3">№10. Рекомендации для старта</p>

      <ul class="list-disc ml-6 mb-4 space-y-2">
        <li>Пополняйте баланс <strong>заранее</strong>, особенно перед выходными (банки не зачисляют переводы в сб и вс).</li>
        <li>Все операции по выкупам выполняются <strong>24/7</strong>, но зачисления — только <strong>в рабочие дни банков</strong>.</li>
        <li>Перед созданием заявки — <strong>проверьте сумму на балансе</strong>.</li>
      </ul>

      <hr class="my-4 border-gray-300" />

      <p class="font-bold mb-3">№11. Как выкупать новые карточки на маркетплейсе?</p>

      <p class="mb-3">
        Чтобы <strong>новая карточка товара появилась в поиске и начала подниматься в топ</strong>, нужно пройти <strong>два этапа</strong>:
      </p>

      <ol class="list-decimal ml-6 mb-3 space-y-2">
        <li><strong>Создать оборотку</strong> — первые 2–3 выкупа по артикулу, чтобы товар появился в поисковой выдаче.</li>
        <li><strong>Подключить рекламу</strong> и выполнять выкупы <strong>по поисковому запросу</strong> (до 40-й страницы).</li>
      </ol>

      <p class="mb-3">
        Это базовый алгоритм, без которого продвижение карточки невозможно.
      </p>

      <p class="mb-4">
        Если вы сразу создаёте выкупы по поисковому запросу, но карточка ещё не появилась в поиске — заявка уйдёт в архив с причиной <strong>"Не находит в поиске"</strong>.
      </p>

      <hr class="my-4 border-gray-300" />

      <p class="font-bold mb-3">№12. Какие способы выкупа товара для выдачи в поиске?</p>

      <p class="mb-3">
        Перед созданием заявки определите, <strong>по какой стратегии</strong> вы будете работать:
      </p>

      <ul class="list-disc ml-6 mb-4 space-y-2">
        <li>Выкупы по артикулу
          <ul class="list-[circle] ml-6 mt-1 space-y-1">
            <li>Новая карточка, без продаж</li>
            <li>Цель - создать оборотку, попасть в поиск</li>
          </ul>
        </li>
        <li>Выкупы с рекламой
          <ul class="list-[circle] ml-6 mt-1 space-y-1">
            <li>После появления карточки в поиске</li>
            <li>Цель - укрепить позиции и ускорить рост</li>
          </ul>
        </li>
        <li>Выкупы по поисковому запросу
          <ul class="list-[circle] ml-6 mt-1 space-y-1">
            <li>Когда карточка уже видна в поиске</li>
            <li>Цель - закрепиться в выдаче</li>
          </ul>
        </li>
        <li>Выкупы по сортировке
          <ul class="list-[circle] ml-6 mt-1 space-y-1">
            <li>Если карточка далеко (30–40 стр.)</li>
            <li>Цель - помочь алгоритму "подхватить" карточку</li>
          </ul>
        </li>
      </ul>

      <p class="font-bold mb-2">Оптимальный порядок:</p>
      <p class="mb-4 ml-4">
        1️⃣ Выкупы по артикулу → 2️⃣ Реклама → 3️⃣ Поиск → 4️⃣ Сортировка
      </p>

      <p class="font-bold mb-2">Пример:</p>
      <p class="ml-4">2–3 выкупа по артикулу → Подключение рекламы.</p>
      <p class="ml-4">3–5 выкупов по поисковому запросу → Если не проходят, то</p>
      <p class="ml-4 mb-4">1–2 выкупа по сортировке (при необходимости) → Повторение</p>

      <hr class="my-4 border-gray-300" />

      <p class="font-bold mb-3">№12. Как действовать, если заявка ушла в архив</p>

      <p class="font-bold mb-2">Причина: "Не находит в поиске"</p>
      <p class="mb-3">
        Значит, ваша карточка ещё не появилась в выдаче или находится дальше 40-й страницы.
      </p>

      <p class="mb-2"><strong>Решение:</strong></p>
      <ol class="list-decimal ml-6 mb-4 space-y-1">
        <li>Перезапустите заявку "3 точки - Убрать с Архива"</li>
        <li>Пересоздайте заявку <strong>по артикулу</strong>, чтобы создать оборотку.</li>
        <li>После 2–3 успешных выкупов создайте заявку <strong>по поисковому запросу</strong>.</li>
        <li>Если карточка всё ещё не находится — добавьте стратегию <strong>"по сортировке"</strong>.</li>
      </ol>

      <p class="mb-4">
        Сначала попасть в поиск → потом продвигаться в поиске.
      </p>

      <hr class="my-4 border-gray-300" />

      <p class="font-bold mb-2">Причина: "Техническая ошибка"</p>

      <p class="mb-3">
        Это временные сбои со стороны маркетплейса или сети (свет, интернет, API).
      </p>

      <ul class="list-disc ml-6 mb-4 space-y-1">
        <li>Перезапустите заявку ("Снять с архива").</li>
        <li>Если после 2–3 попыток ошибка повторяется — напишите в <strong>Службу заботы Harmex</strong>.</li>
      </ul>

      <hr class="my-4 border-gray-300" />

      <p class="font-bold mb-2">Причина: "Недостаточно средств"</p>

      <ul class="list-disc ml-6 mb-4 space-y-1">
        <li>Пополните баланс (QR / счёт от организации).</li>
        <li>После зачисления средств система автоматически возобновит исполнение.</li>
      </ul>

      <hr class="my-4 border-gray-300" />

      <p class="font-bold mb-2">Причина: "ПВЗ не найден на карте"</p>

      <ul class="list-disc ml-6 mb-4 space-y-1">
        <li>Попробуйте изменить формат названия (например, "ул. Ленина, 10" → "Ленина 10").</li>
        <li>Если не помогает — обратитесь в поддержку, и мы добавим адрес вручную.</li>
      </ul>

    </ManualModal>
  </div>
</template>

<style scoped></style>
