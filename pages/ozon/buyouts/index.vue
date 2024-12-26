<script setup lang="ts">
import { Buyout } from "~/server/lib/models/ozon/Buyout";

const { notify } = useNotification();

definePageMeta({
  layout: "app",
  title: "Выкупы",
  middleware: "auth",
});
const removeModal = ref(false);
const route = useRoute();
const buyouts = ref([]) as any;
const modal = ref(false);
const logModal = ref(false);
const selectedBuyout = ref<any>({});
const selectedIndex = ref(-1);
const storeMain = useMainStore();
const selectedPlace = ref(-1);
const status = computed(() => route.query?.status || "all");
const loading = ref(false);
const manualModal = ref(false);
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
function openLogModal(index: number) {
  selectedIndex.value = index;
  selectedPlace.value = buyouts.value.length - index;
  selectedBuyout.value = buyouts.value[index];
  logModal.value = true;
}
const target = ref(null);
const targetIsVisible = ref(false);
const skip = ref(50);
const end = ref(false);
async function getBuyouts() {
  loading.value = true;
  const { data } = await useFetch(() => "/api/ozon/buyout/get", {
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
  const { data } = await useFetch("/api/ozon/buyout/get", {
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
  const { data } = await useFetch("/api/ozon/buyout/search", {
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
    title: "Пауза",
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
  {
    title: "Выкуплены по рекламе",
    optionValue: "completedByAds",
    params: "?status=completedByAds",
    queryStatus: "completedByAds",
  },
  {
    title: "Ожидает скидку",
    optionValue: "discountAwaiting",
    params: "?status=discountAwaiting",
    queryStatus: "discountAwaiting",
  },
  {
    title: "Скидка предоставлена",
    optionValue: "discountGiven",
    params: "?status=discountGiven",
    queryStatus: "discountGiven",
  },
  {
    title: "Выкуп по скидке",
    optionValue: "completedByDiscount",
    params: "?status=completedByDiscount",
    queryStatus: "completedByDiscount",
  },
  {
    title: "Недостаточно средств",
    optionValue: "nofunds",
    params: "?status=nofunds",
    queryStatus: "nofunds",
  },
];

watch(targetIsVisible, async (isVisible) => {
  if (isVisible && autoTarget.value && buyouts.value.length >= 50) {
    if (end.value) return;
    const { data } = await useFetch("/api/ozon/buyout/get", {
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
    const { data } = await useFetch("/api/ozon/buyout/get", {
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
        const { data } = await useFetch("/api/ozon/buyout/getOne", {
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

const customLinks = filters.map((filter) => ({
  title: filter.title,
  slot: "/ozon/buyouts",
  query: filter.params,
}));

function openRemoveModal(index: number) {
  selectedIndex.value = index;
  selectedPlace.value = buyouts.value.length - index;
  selectedBuyout.value = buyouts.value[index];
  removeModal.value = true;
}

async function removeBuyout() {
  const { error }: any = await useFetch("/api/ozon/buyout/delete", {
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
      type: "error",
      duration: 3000,
    });
  } else {
    removeModal.value = false;
    notify({
      title: "Успешно",
      text: "Выкуп успешно удален",
      type: "success",
      duration: 3000,
    });
    buyouts.value = buyouts.value.filter(
      (buyout: any) => buyout.uuid !== selectedBuyout.value.uuid
    );
  }
}

const orgInfo = ref({}) as any;
const isVisible = ref(false);
const { stop } = useIntersectionObserver(target, ([{ isIntersecting }]) => {
  targetIsVisible.value = isIntersecting;
});
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

function toggleCheckbox() {
  const platform = "ozon";
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

  const platform = "ozon";
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
          <NuxtLink to="/catalog/ozon" class="cursor-pointer text-[#909090]">
            Ozon
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
            @click="copyToClipboard(`${siteUrl}/ozon/buyouts`)"
          >
            <Icon name="ph:share-fat-fill" size="20" />
          </button>
        </div>
      </div>
    </div>
    <div />
    <div class="flex justify-start lg:justify-between mb-4 items-center mt-4">
      <div
        class="flex relative gap-2 lg:gap-3 flex-col lg:flex-row w-full lg:w-full"
      >
        <div class="flex gap-2">
          <NuxtLink
            to="/ozon/buyouts/create"
            class="btn btn-primary dark:bg-primary border-none btn-sm gap-2 font-medium normal-case"
          >
            <Icon name="fluent:add-24-filled" size="25" />
          </NuxtLink>
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
      <div>
        <div
          group
          class="cards grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-[repeat(auto-fit,minmax(300px,1fr))] h-full"
        >
          <BuyoutOzonCard
            v-for="(buyout, index) of buyouts"
            :key="buyout.uuid"
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
      <div ref="target" class="p-2 w-full col-span-1 h-40 md:h-10" />
    </div>

    <Hero v-else-if="!loading" />
    <div v-else class="w-full mt-5 flex justify-center items-center">
      <span class="loading loading-dots loading-lg text-primary" />
    </div>
    <BuyoutOzonLogModal
      v-if="logModal"
      :info="selectedBuyout"
      :index="selectedIndex"
      :state="logModal"
      @close="logModal = false"
    />
    <BuyoutOzonInfoModal
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
      <h3 class="text-xl font-bold mb-2 flex items-center gap-1 pr-4">
        Как создать заказ на выкуп товара?
      </h3>
      <p class="mb-2 text-[17px]">
        Выкуп товара на
        <span class="font-semibold">маркетплейсе OZON</span> происходит
        автоматически, без вашего прямого участия.
      </p>

      <p class="mt-1.5 text-[16px] flex items-center gap-1 text-[#4b5563]">
        Чтобы мы исполнили услугу, выполните простые рекомендации:
      </p>
      <ol class="list-decimal ml-6 mb-1 text-[#4b5563]">
        <li>Нажмите на кнопку “+”</li>
        <nuxt-img
          alt="image"
          class="flex mx-auto w-full px-4"
          src="https://ozonmpportal.hb.vkcs.cloud//ozonmpportal/harmex/manualImages/ozon/buyout1.png"
        />
        <li>Введите артикул</li>
        <li>Нажмите кнопку “Добавить”</li>
        <li>
          Заполните данные по заявке
          <ul class="list-disc ml-6 text-[#4b5563]">
            <li>Размер</li>
            <li>Пол</li>
            <li>Поведенческие факторы</li>
            <li>Планируемое время заказа</li>
            <li>Адрес ПВЗ</li>
            <li>Поисковый запрос</li>
          </ul>
        </li>
        <li>Проверьте заполненные данные</li>
        <li>Нажмите кнопку Создать</li>
        <li>После проверки AI нажмите Создать</li>
        <li>Отслеживайте исполнение заказа в разрезе Статусов</li>
      </ol>
      <p class="font-semibold mt-1">Обращаем внимание!</p>
      <p>
        Существует 4 инструмента для выкупа товара: покупка по полной цене, по
        скидке, по промокоду и RealFBS.
      </p>

      <ol class="list-decimal ml-6 text-[#4b5563]">
        <li>
          Выкуп по полной цене совершается без заполнения колонки Скидка и
          RealFBS.
        </li>
        <li>Комбинированный выкуп - выкуп FealFBS по скидке или промокоду.</li>
      </ol>
      <p class="my-1">
        В случае добавления дополнительного функционала - скидка, промокод или
        RealFBS заполните необходимые данные.
      </p>
      <nuxt-img
        alt="image"
        class="flex mx-auto w-full px-4"
        src="https://ozonmpportal.hb.vkcs.cloud//ozonmpportal/harmex/manualImages/ozon/buyout2.png"
      />

      <p
        class="mt-1.5 text-[16px] font-semibold flex items-center gap-1 text-[#4b5563]"
      >
        После Завершения заказа, заберите товар с ПВЗ используя меню Доставка!
      </p>
      <p
        class="mt-1.5 text-[16px] font-semibold flex items-center gap-1 text-[#4b5563]"
      >
        Примечания:
      </p>
      <ol class="list-decimal ml-6 mb-4 text-[#4b5563] flex flex-col gap-1">
        <li>
          Создание заказов неограниченно. При этом, в моменте создания,
          количество заявок на заказ ограничено 10 ед., через проверки на
          корректность введенных вами данных. Просто продолжайте создавать
          заявки по 10 ед.
        </li>
        <li>
          В целях безопасного совершения покупок, каждая заявка проверяется
          перед созданием по более 25 критериям. Некорректные заявки не пройдут
          центр безопасности.
        </li>
        <li>
          Создавайте шаблоны заявок для быстрого наполнения и отправки на
          исполнение.
        </li>
        <li>
          Планируйте заявки на выкуп не с 09.00 до 20.00, а в диапазоне 60-90
          минут, чтобы наш планировщик исполнял в точное время, а не когда есть
          свободное окно, т.к. могут пройти ваши заказы одновременно. Пример:
          1-я заявка с 09.00 до 10.00; 2-я заявка с 12.00 до 14.00.
        </li>
        <li>
          Время создания заявки и исполнения фиксируется по часовому поясу
          заказчика.
        </li>
        <li>Заявка без скидки и RealFBS пройдет по полной стоимости товара.</li>
        <li>
          Указывая скидку, мы запросим скидку у магазина, которую необходимо
          одобрить. ФИО и точная дата запроса указана в Созданной заявке.
        </li>
        <li>
          Указывая способ доставки RealFBS и скидку, мы запросим скидку, получим
          одобрение и выполним заказ по RealFBS.
        </li>
      </ol>
      <p class="text-[#4b5563] font-semibold">Статусы Выкупов:</p>
      <ul class="flex flex-col text-[#4b5563] gap-1">
        <li>
          <span class="font-semibold">Активен</span> - покупка товара находится
          в поиске свободного слота/окна для перехода к действиям
        </li>
        <li>
          <span class="font-semibold">В работе</span> - покупка товара перешла в
          стадию осуществления заказа
        </li>
        <li>
          <span class="font-semibold">Завершен</span> - покупка товара была
          осуществлена с дальнейшим переходом в меню Доставка (доставка на ПВЗ)
          и Финансы (точная дата и время покупки, а так же финансовые операции)
        </li>
        <li>
          <span class="font-semibold">В архиве</span> - покупка товара не может
          осуществиться по ошибке. Проверьте причину нажав на 3 точки - О выкупе
        </li>
        <li>
          <span class="font-semibold">На паузе</span> - покупка товара не может
          осуществиться по причине недостатка на балансе финансовых средств
        </li>
        <li>
          <span class="font-semibold">Скидка запрошена</span> - у магазина была
          запрошена скидка Покупателем в конкретное время, ожидающее одобрения
        </li>
      </ul>
    </ManualModal>
  </div>
</template>

<style scoped></style>
