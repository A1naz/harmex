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
  const { data } = await useFetch(() => "/api/avito/buyout/get", {
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
  const { error }: any = await useFetch("/api/avito/buyout/delete", {
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
  const { data } = await useFetch("/api/avito/buyout/get", {
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
  const { data } = await useFetch("/api/avito/buyout/search", {
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
  console.log("isVisible", isVisible);
  if (isVisible && autoTarget.value && buyouts.value.length >= 50) {
    if (end.value) return;
    const { data } = await useFetch("/api/avito/buyout/get", {
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
    const { data } = await useFetch("/api/avito/buyout/get", {
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
        const { data } = await useFetch("/api/avito/buyout/getOne", {
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
  slot: "/avito/buyouts",
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
  const platform = "avito";
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

  const platform = "avito";
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
          <NuxtLink to="/catalog/avito" class="cursor-pointer text-[#909090]">
            Avito
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
            @click="copyToClipboard(`${siteUrl}/avito/buyouts`)"
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
            to="/avito/buyouts/create"
            class="btn btn-primary dark:bg-primary border-none btn-sm gap-2 font-medium normal-case"
          >
            <Icon name="fluent:add-24-filled" size="25" />
          </NuxtLink>
        </div>
        <div class="w-full flex gap-1 lg:gap-2">
          <div class="flex gap-1 lg:gap-3 flex-nowrap whitespace-nowrap">
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
              <Icon name="ci:info" size="24" />
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
          <BuyoutAvitoCard
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
          <BuyoutAvitoCard
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
    <BuyoutAvitoLogModal
      v-if="logModal"
      :info="selectedBuyout"
      :index="selectedIndex"
      :state="logModal"
      @close="logModal = false"
    />
    <BuyoutAvitoInfoModal
      v-if="modal"
      :info="selectedBuyout"
      :state="modal"
      :index="selectedIndex"
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
       <h3 class="text-[17px] font-bold mb-2 flex items-center gap-1 pr-4">
        Как оставить отзыв за покупку на маркетплейсах — просто и без лишней
        возни:
      </h3>

      <ol class="ml-3 mb-4">
        <li class="mb-2">
          <strong> Шаг 1:</strong> Создайте заявку на покупку товара<br />
          Покупка происходит автоматически через нашу услугу Выкуп. <br />
          Вам нужно только создать заявку, остальное мы всё оформим сами.
        </li>
        <li class="mb-2">
          <strong> Шаг 2:</strong> Заберите товар в пункте выдачи (ПВЗ) <br />
          Зайдите в раздел Доставка <br />Нажмите кнопку EXL – Готовы к выдаче,
          чтобы скачать актуальные коды. <br />
          Эти коды покажите в ПВЗ, чтобы получить посылку. (Данные получателя —
          в том же разделе)
        </li>
        <li class="mb-2">
          <strong> Шаг 3:</strong> Как только вы заберёте товар, в личном
          кабинете появится заявка на отзыв (раздел Отзывы).
          <br />
          Просто перейдите туда и оставьте свой отзыв.
        </li>
      </ol>
      <h3 class="text-[17px] font-bold mb-2 flex items-center gap-1 pr-4 ml-1">
        Что нужно от вас?
      </h3>

      <ol class="list-decimal ml-6 mb-4">
        <li class="mb-2">Пополните баланс (на сумму товара + услуги).</li>
        <li class="mb-2">Создавать заявки и забирать товары.</li>
        <li class="mb-2">Всё остальное — мы сделаем за вас автоматически!</li>
      </ol>

      <p class="my-2">
        Если нужно больше деталей — внутри каждой услуги есть подробная
        инструкция шаг за шагом.
      </p>
      <p class="my-2">Подробные инструкции находятся внутри каждой услуги!</p>
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
      <p class="my-4 text-[16px] flex items-center gap-1 text-[#4b5563]">
        Чтобы оформить заказ, следуйте простым шагам:
      </p>
      <ol class="list-decimal ml-10 mb-4 text-[#4b5563]">
        <li>Нажмите на кнопку <strong>“+”</strong>.</li>

        <li>Введите <strong>артикул товара</strong></li>
        <p class="my-2">
          Артикул — это уникальный код, по которому идентифицируют товар на
          маркетплейсе или в магазине.
        </p>
        <p class="my-2">
          Артикул товара находиться в ссылке вашего объявления, пример:
          https://www.avito.ru/sankt-peterburgotele_17_m_1_krovat_4558969967…….
        </p>
        <nuxt-img
          alt=""
          class="flex mx-auto w-full px-20 mt-2"
          src="https://ozonmpportal.hb.vkcs.cloud/harmex/introduction/avito/1.png"
        />
        <nuxt-img
          alt=""
          class="flex mx-auto w-full px-20 mt-2"
          src="https://ozonmpportal.hb.vkcs.cloud/harmex/introduction/avito/2.png"
        />
        <li>Нажмите кнопку <strong>"Добавить"</strong></li>
        <li>
          Заполните данные по заявке:
          <ul class="list-disc ml-6 text-[#4b5563]">
            <li>Размер.</li>
            <li>Пол.</li>
            <li>Поведенческие факторы "Правила".</li>
            <li>Планируемое время заказа.</li>
            <li>Адрес пункта выдачи заказов (ПВЗ).</li>
            <li>Поисковый запрос.</li>
          </ul>
        </li>
        <li>Проверьте заполненные данные</li>
        <li>Нажмите кнопку Создать</li>
        <li>После проверки AI нажмите Создать</li>
        <li>Отслеживайте исполнение заказа в разрезе Статусов</li>
      </ol>
      <p>
        Этот процесс позволяет легко и быстро организовать выкуп товара в любых
        количествах, минимизируя ваше участие.
      </p>
      <nuxt-img
        alt=""
        class="flex mx-auto w-full px-4 mt-4"
        src="https://ozonmpportal.hb.vkcs.cloud/harmex/manualImages/wildberries/buyout2_1.png"
      />
      <nuxt-img
        alt=""
        class="flex mx-auto w-full px-4 mt-2"
        src="https://ozonmpportal.hb.vkcs.cloud/harmex/manualImages/wildberries/buyout2_2.png"
      />
      <p class="my-4">
        После того как заявка на выкуп товара получит статус
        <strong>"Завершен"</strong>, вам нужно будет забрать товар с пункта
        выдачи заказов (ПВЗ) используя меню
        <strong> Доставка.</strong>
      </p>
      <p>В меню Финансы, ознакомьтесь с фактическими операциями:</p>
      <ol class="list-item ml-4 mb-4 text-[#4b5563]">
        <li class="mt-2">- списание средств на покупку товара.</li>
        <li>- списание средств за услуги платформы.</li>
        <li>- дата и время фактического исполнения.</li>
        <li>- ID вашей заявки на услугу.</li>
      </ol>
      <p class="divider"></p>
      <p><strong>Примечания по созданию заказов</strong></p>
      <div class="ml-4 mt-4">
        <p><strong> 1. Количество заявок </strong></p>
        <ol class="list-disc ml-10 mb-4 text-[#4b5563]">
          <li>Создание заказов не ограничено по количеству.</li>
          <li>
            Одновременно можно создавать до <strong>10 заявок</strong>. Если
            нужно больше, просто продолжайте создавать новые партии по
            <strong>10 единиц</strong>.
          </li>
        </ol>
        <p><strong> 2. Проверка заявок </strong></p>
        <ol class="list-disc ml-10 mb-4 text-[#4b5563]">
          <li>
            Каждая заявка проверяется системой по более чем
            <strong>25 критериям</strong> для обеспечения безопасности.
          </li>
          <li>
            Если заявка не соответствует требованиям, она не пройдет проверку и
            не будет создана.
          </li>
        </ol>
        <p><strong> 3. Шаблоны заявок </strong></p>
        <ol class="list-disc ml-10 mb-4 text-[#4b5563]">
          <li>
            Для ускорения процесса создавайте <strong>шаблоны заявок</strong>.
            Это позволит быстро заполнять и отправлять заявки на исполнение.
          </li>
        </ol>
        <p><strong> 4. Планирование заявок </strong></p>
        <ol class="list-disc ml-10 mb-4 text-[#4b5563]">
          <li>
            Планируйте заявки на выкуп не на весь день (с 09:00 до 20:00), а в
            диапазоне

            <strong> 90–120 минут.</strong>.
          </li>
          <li>
            Это нужно для того, чтобы планировщик исполнял заявки в
            <strong> точное время</strong>, а не когда появится свободное окно.
          </li>
          <li>
            Пример планирования:
            <ol class="list-[square] mb-4 ml-6 text-[#4b5563]">
              <li>1-я заявка: с 09:00 до 10:00.</li>
              <li>2-я заявка: с 12:00 до 14:00.</li>
            </ol>
          </li>
        </ol>
        <p><strong> 5. Часовой пояс </strong></p>
        <ol class="list-disc ml-10 mb-4 text-[#4b5563]">
          <li>
            Время создания и исполнения заявки фиксируется по
            <strong>часовому поясу заказчика</strong>.
          </li>
        </ol>
        <p><strong> 6. Покупка товара </strong></p>
        <ol class="list-disc ml-10 mb-4 text-[#4b5563]">
          <li>
            Покупка товара осуществляется по

            <strong
              >указанной цене в объявлении на момент создания заявки.</strong
            >
          </li>
          <li>
            Если сумма будет не совпадать в процессе выкупа, он
            <strong> уйдет В Архив</strong> во избежание ошибки.
          </li>
        </ol>
      </div>

      <p class="divider"></p>
      <p><strong>Статусы выкупов</strong></p>
      <div class="ml-4 mt-4">
        <p><strong>1. Активен </strong></p>
        <ol class="list-disc ml-10 mb-4 text-[#4b5563]">
          <li>
            Покупка товара находится в поиске свободного слота/окна для перехода
            к действиям.
          </li>
          <li>Заявка ожидает своей очереди на исполнение.</li>
        </ol>
        <p><strong>2. В работе </strong></p>
        <ol class="list-disc ml-10 mb-4 text-[#4b5563]">
          <li>Покупка товара перешла в стадию осуществления заказа.</li>
          <li>Заявка активно обрабатывается системой.</li>
        </ol>

        <p><strong>3. Завершен </strong></p>
        <ol class="list-disc ml-10 mb-4 text-[#4b5563]">
          <li>Покупка товара успешно осуществлена..</li>
          <li>
            Заказ переходит в меню:

            <ol class="list-[square] mb-4 ml-6 text-[#4b5563]">
              <li><storng>Доставка</storng> (товар доставляется на ПВЗ).</li>
              <li>
                <storng>Финансы</storng> (отображается точная дата и время
                покупки, а также финансовые операции).
              </li>
            </ol>
          </li>
        </ol>
        <p><strong>4. В архиве </strong></p>
        <ol class="list-disc ml-10 mb-4 text-[#4b5563]">
          <li>Покупка товара не может быть осуществлена из-за ошибки.</li>
          <li>
            Чтобы узнать причину, нажмите на <strong>три точки</strong> рядом с
            заявкой и выберите пункт <strong>"О выкупе"</strong>.
          </li>
        </ol>
        <p><strong>5. На паузе </strong></p>
        <ol class="list-disc ml-10 mb-4 text-[#4b5563]">
          <li>
            Покупка товара приостановлена из-за
            <strong>недостатка средств на балансе</strong>.
          </li>
          <li>Пополните баланс, чтобы возобновить выполнение заявки.</li>
        </ol>
      </div>
      <p class="divider"></p>
      <p><strong>Рекомендации для эффективной работы</strong></p>
      <div class="ml-4 mt-4">
        <p><strong>1. Создание заявок </strong></p>
        <ol class="list-disc ml-10 mb-4 text-[#4b5563]">
          <li>Используйте шаблоны для быстрого заполнения данных.</li>
          <li>
            Убедитесь, что все поля заполнены корректно, чтобы избежать
            отклонения заявки.
          </li>
        </ol>
        <p><strong>2.Планирование </strong></p>
        <ol class="list-disc ml-10 mb-4 text-[#4b5563]">
          <li>
            Разбивайте заявки на временные интервалы (60–90 минут), чтобы
            избежать перегрузки системы.
          </li>
          <li>
            Пример:

            <ol class="list-[square] mb-4 ml-6 text-[#4b5563]">
              <li>Утренняя заявка: 09:00–10:00.</li>
              <li>Дневная заявка: 12:00–14:00.</li>
              <li>Вечерняя заявка: 16:00–17:30.</li>
            </ol>
          </li>
        </ol>

        <p><strong>3. Контроль статусов </strong></p>
        <ol class="list-disc ml-10 mb-4 text-[#4b5563]">
          <li>Регулярно проверяйте статусы заявок в личном кабинете.</li>
          <li>
            Если заявка перешла в статус "<strong>В архиве"</strong>, изучите
            причину и исправьте ошибку.
          </li>
          <li>
            Если заявка на <strong>"Паузе"</strong>, пополните баланс для
            продолжения работы.
          </li>
        </ol>
        <p><strong>4. Финансовый учет </strong></p>
        <ol class="list-disc ml-10 mb-4 text-[#4b5563]">
          <li>
            Учитывайте, что расчеты происходят с учётом стоимости товара в объявлении, поэтому следите за волатильностью цен и планируйте бюджет заранее.

          </li>
        </ol>
        <p><strong>5. Получение товара </strong></p>
        <ol class="list-disc ml-10 mb-4 text-[#4b5563]">
          <li>
            После завершения заявки заберите товар с ПВЗ, используя меню
            <strong> "Доставка".</strong>
          </li>
          <li>
            Проверьте товар на соответствие заказу и отсутствие повреждений.
          </li>
        </ol>
      </div>
      <p class="divider"></p>
      <p class="mb-4"><strong>Пример работы с заявками</strong></p>
      <ul class="list-decimal ml-10">
        <li>
          Вы создаете заявку на 10 единиц товара, заполняете все данные
          (артикул, размер, пол, поведенческие факторы и т.д.).
        </li>
        <li>
          Система проверяет заявку по 25+ критериям и подтверждает ее создание.
        </li>
        <li>Вы планируете заявку на временной интервал с 09:00 до 10:00.</li>
        <li>
          Заявка переходит в статус <strong>"Активен"</strong>, затем
          <strong>"В работе"</strong>, и, наконец, <strong>"Завершен"</strong>.
        </li>
        <li>После завершения вы забираете товар с ПВЗ и проверяете его.</li>
        <li>
          Если заявка отклонена, вы проверяете причину через меню
          <strong>"О выкупе"</strong> и исправляете ошибки.
        </li>
      </ul>
    </ManualModal>
  </div>
</template>

<style scoped></style>
