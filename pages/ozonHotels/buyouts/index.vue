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
  const { data } = await useFetch(() => "/api/ozonHotels/buyout/get", {
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
  const { error }: any = await useFetch("/api/ozonHotels/buyout/delete", {
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
  const { data } = await useFetch("/api/ozonHotels/buyout/get", {
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
  const { data } = await useFetch("/api/ozonHotels/buyout/search", {
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
    title: "Все брони",
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
    const { data } = await useFetch("/api/ozonHotels/buyout/get", {
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
    const { data } = await useFetch("/api/ozonHotels/buyout/get", {
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
        const { data } = await useFetch("/api/ozonHotels/buyout/getOne", {
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
  slot: "/ozonHotels/buyouts",
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
  const platform = "ozonHotels";
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

  const platform = "ozonHotels";
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
            Отели
          </NuxtLink>
        </li>
        <li class="cursor-pointer">
          <NuxtLink
            to="/catalog/ozonHotels"
            class="cursor-pointer text-[#909090]"
          >
            Ozon отели
          </NuxtLink>
        </li>
        <li class="cursor-pointer text-[#1e2734]">Брони</li>
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
            @click="copyToClipboard(`${siteUrl}/ozonHotels/buyouts`)"
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
            to="/ozonHotels/buyouts/create"
            class="btn btn-primary dark:bg-primary border-none btn-sm gap-2 font-medium normal-case"
          >
            <Icon name="fluent:add-24-filled" size="25" />
          </NuxtLink>
        </div>
        <div class="w-full flex gap-1 lg:gap-2">
          <div class="flex gap-1 lg:gap-3 flex-nowrap whitespace-nowrap">
            <!-- <span><CustomSelect
              class="h-[2rem]  lg:min-w-[120px]"
              status-text="ozonHotels"
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

            <!-- <CustomSelect
              class="h-[2rem] bg-[#f4f4f4] min-w-[100px]"
              :tabs="[
                { title: 'Артикул', value: 'article' },
                { title: 'ID выкупа', value: 'uuid' },
                { title: 'Имя', value: 'name' },
              ]"
              @change-value="updateSearchType"
            /> -->
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
          <BuyoutOzonHotelsCard
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
          <BuyoutOzonHotelsCard
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
    <BuyoutOzonHotelsLogModal
      v-if="logModal"
      :info="selectedBuyout"
      :index="selectedIndex"
      :state="logModal"
      @close="logModal = false"
    />
    <BuyoutOzonHotelsInfoModal
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
      <h3 class="text-[19px] font-bold mb-2 flex items-center gap-1 pr-4">
        Как оставить отзыв на Ozon отели в 3 шага?
      </h3>
      <h3 class="text-[17px] font-bold mb-2 flex items-center gap-1 pr-4">
        Чтобы оставить отзыв, нужно сделать три простых действия:
      </h3>

      <ol class="list-decimal ml-6 mb-4">
        <li>
          Создать бронь – это происходит автоматически через услугу
          <strong></strong>Брони". Вам не нужно ничего делать вручную.
        </li>

        <li>
          Одобрить бронь – зайдите в меню Проживания, используйте данные о
          покупателе, чтобы подтвердить посещение апартаментов.
        </li>
        <li>
          Оставить отзыв – после подтверждения брони в личном кабинете продавца,
          появится заявка на публикацию отзыва в разделе
          <strong>Отзывы</strong>.
        </li>
      </ol>
      <h3 class="text-[17px] font-bold mb-2 flex items-center gap-1 pr-4">
        Что нужно от вас?
      </h3>

      <p class="mt-2">
        Просто пополните баланс на покупку товара и оплату услуги, а затем
        создайте заявку с деталями. Всё остальное – автоматизировано.
      </p>

      <p class="my-2">Подробные инструкции находятся внутри каждой услуги!</p>
      <nuxt-img
        alt=""
        class="flex mx-auto w-full px-4 mt-2"
        src="https://ozonmpportal.hb.vkcs.cloud//ozonmpportal/harmex/introduction/ozonHotels1.png"
      />
      <p class="my-4 text-[16px] flex items-center gap-1 text-[#4b5563]">
        Чтобы оформить заказ, следуйте простым шагам:
      </p>
      <ol class="list-decimal ml-10 mb-4 text-[#4b5563]">
        <li>Нажмите на кнопку <strong>“+”</strong>.</li>
        <li>Вставьте ссылку на <strong>объявление</strong></li>
        <li>Выберите <strong>даты</strong> бронирования номера</li>
        <li>Нажмите кнопку <strong>"Добавить"</strong></li>
        <nuxt-img
          alt=""
          class="flex mx-auto w-full px-4 mt-2"
          src="https://ozonmpportal.hb.vkcs.cloud//ozonmpportal/harmex/introduction/sutochno2.png"
        />
        <li>
          Заполните данные по заявке:
          <ul class="list-disc ml-6 text-[#4b5563]">
            <li>Выберите формат номера.</li>
            <li>Выберите “Пол покупателя”.</li>
            <li>Поведенческие факторы “Правила”.</li>
            <li>Добавьте “Поисковый запрос”.</li>
            <li>Введите “Промокод” (по желанию).</li>
          </ul>
        </li>
        <li>Проверьте введенные данные</li>
        <li>Нажмите кнопку <strong>"Создать"</strong></li>
        <li>
          После проверки искусственным интеллектом (AI) подтвердите создание
          заказа, нажав <strong>"Создать"</strong> еще раз.
        </li>
        <li>
          Отслеживайте выполнение заказа через раздел <strong>"Брони".</strong>
        </li>
      </ol>
      <p>
        Этот процесс позволяет легко и быстро организовать выкуп брони в любых
        количествах, минимизируя ваше участие.
      </p>
      <nuxt-img
        alt=""
        class="flex mx-auto w-full px-4 mt-4"
        src="https://ozonmpportal.hb.vkcs.cloud//ozonmpportal/harmex/introduction/sutochno3.png"
      />
      <p class="my-4">
        Для выкупа товара на Суточно, доступны 2 основных инструмента. Каждый из
        них имеет свои особенности и применяется в зависимости от целей и
        стратегии продвижения. Ниже приведено подробное описание каждого
        инструмента, а также инструкции по их использованию.
      </p>
      <p class="divider"></p>
      <p class="mt-3 ml-8"><strong>1. Выкуп по полной цене</strong></p>
      <p>Описание</p>
      <ol class="list-disc ml-10 mb-4 text-[#4b5563]">
        <li>
          Это стандартный способ выкупа товара, при котором покупка
          осуществляется
          <strong>без скидок, промокодов или дополнительных условий </strong>.
        </li>
        <li>
          Подходит для ситуаций, когда нужно быстро увеличить продажи и улучшить
          позиции товара в рейтинге при минимальных вложениях в продвижение.
        </li>
      </ol>
      <p class="-mt-3">Как использовать</p>
      <ol class="list-disc ml-10 mb-4 text-[#4b5563]">
        <li>
          При создании заявки на выкуп
          <strong>не заполняйте колонку "Промокод" </strong>.
        </li>
        <li>
          Просто укажите артикул товара, количество и другие необходимые данные.
        </li>
      </ol>
      <p class="-mt-3">Пример</p>
      <ol class="list-disc ml-10 mb-4 text-[#4b5563]">
        <li>
          Вы хотите выкупить 10 единиц товара по полной цене. В заявке
          указываете только артикул и количество, оставляя поле "Скидка"
          пустыми.
        </li>
      </ol>
      <p class="mt-3 ml-8"><strong>2. Выкуп по промокоду</strong></p>
      <div class="ml-4 mt-1">
        <p>Описание</p>
        <ol class="list-disc ml-10 mb-4 text-[#4b5563]">
          <li>
            Этот способ позволяет выкупить товар с использованием
            <strong> промокода</strong>, что также снижает затраты.
          </li>
          <li>
            Промокоды могут быть предоставлены маркетплейсом или сгенерированы
            вами (если такая возможность доступна).
          </li>
        </ol>
        <p class="-mt-3">Как использовать</p>
        <ol class="list-disc ml-10 mb-4 text-[#4b5563]">
          <li>
            При создании заявки заполните колонку <strong>"Промокод"</strong>,
            указав действующий промокод.
          </li>
          <li>Убедитесь, что промокод активен и применим к вашему товару.</li>
        </ol>
        <p class="-mt-3">Пример</p>
        <ol class="list-disc ml-10 mb-4 text-[#4b5563]">
          <li>
            Вы хотите выкупить 10 единиц товара с промокодом "SUMMER20". В
            заявке указываете артикул, количество и промокод "SUMMER20".
          </li>
        </ol>
      </div>
      <nuxt-img
        alt=""
        class="flex mx-auto w-full px-4 mt-4"
        src="https://ozonmpportal.hb.vkcs.cloud//ozonmpportal/harmex/introduction/sutochno4.png"
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

        <p><strong> 3. Планирование заявок </strong></p>
        <ol class="list-disc ml-10 mb-4 text-[#4b5563]">
          <li>
            Планируйте заявки на выкуп не на весь день (с 09:00 до 20:00), а в
            <strong>диапазоне 60–90 минут</strong>.
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
          <li>Это предотвращает одновременное исполнение всех заказов.</li>
        </ol>
        <p><strong> 4. Часовой пояс </strong></p>
        <ol class="list-disc ml-10 mb-4 text-[#4b5563]">
          <li>
            Время создания и исполнения заявки фиксируется по
            <strong>часовому поясу заказчика</strong>.
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
            Учитывайте, что расчеты происходят <strong>без промокодов</strong>,
            поэтому следите за волатильностью цен и планируйте бюджет заранее.
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
