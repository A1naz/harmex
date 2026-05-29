<script setup lang="tsx">
import type { Rule } from "@/data/buyout/rules";
import { rules } from "@/data/buyout/ZYRules";
import { useWindowSize } from "@vueuse/core";

const closeWarningModal = true;
const closeTemplateModal = ref(null) as Ref<HTMLLabelElement | null>;
const closeTemplateSelectModal = ref(null) as Ref<HTMLLabelElement | null>;
const currency = useCurrency();
const isCreateButtonDisabled = ref(false);
const { width } = useWindowSize();
const { notify } = useNotification();

const loadingTemplates = ref(false);
const openAll = ref(false);
const templateTitle = ref("");
const templates = ref<any>([]);
// const modalShow = ref(false)
const codeInput = ref();

definePageMeta({
  layout: "app",
  middleware: "auth",
  title: "Добавить выкупы Золотое яблоко",
});
const store = useGoldAppleBuyoutStore();
const route = useRoute();
const products = computed(() => store.createProducts);

onMounted(() => {
  showSuspendedModal.value = true;
  disabledCreateButton.value = true;
});

const isWarningChecked = ref(false);

const disabledCreateButton = ref(false);
const showSuspendedModal = ref(false);
const ruleModal = ref(false);
const selectedRuleProductIndex = ref(0);
const checksModal = ref(false);
const infoModal = ref<HTMLDialogElement>();
const infoType = ref("");
const defaultRules: Rule[] = rules;
const article = ref<string>();

const loading = ref(false);

async function addProduct() {
  if (!article.value) return;
  startTimer();
  loading.value = true;

  store.addProduct(article.value).finally(() => {
    loading.value = false;
  });

  article.value = "";
}

function ruleModalOpen(index: number) {
  ruleModal.value = true;
  selectedRuleProductIndex.value = index;
}

function onRuleChange(event: Event, index: number, rule: number) {
  const target = event.target as HTMLInputElement;
  store.changeRule(target.checked, index, rule);
}

function handleAddress(address: string, lt: number, lg: number, id: string, postcode: string) {
  modalOpen.value = false;
  store.handleAddress(address, lt, lg, id, postcode);
}
function openInfoModal(type: string) {
  infoType.value = type;
  infoModal.value?.show();
}

const totalSum = computed(() => {
  return products.value.reduce((acc: number, item: any) => {
    return acc + item.price * item.quantity;
  }, 0);
});

const totalQuantity = computed(() => {
  return products.value.reduce((acc: number, item: any) => {
    return acc + item.quantity;
  }, 0);
});

const pickpoints = shallowRef();
const pickpointsMarket = shallowRef();
const pickpoints5Post = shallowRef();
const pickpointsYandex = shallowRef();
const modalOpen = ref(false);
const modalOpenSelf = ref(false);
const modalOpenMarket = ref(false);
const modalOpen5Post = ref(false);
const modalOpenYandex = ref(false);
function closeModal() {
  modalOpen.value = false;
  modalOpenSelf.value = false;
  modalOpenMarket.value = false;
  modalOpen5Post.value = false;
  modalOpenYandex.value = false;
}

async function openChecksModal() {
  const productCountsByAddress: any = {};

  let valid = true;
  let errorMsg = "";
  products.value.forEach(
    (
      item: {
        deliveryPeriodDate: any;
        deliveryPeriodTime: any;
        dateRange: any[];
        searchQuery: { value: any }[];
        selectedSize: string;
      },
      _index: any
    ) => {
      //if (!item.deliveryPeriodDate || !item.deliveryPeriodTime) {
      //valid = false
      //errorMsg = 'Не у всех товаров указаны дата и время доставки'
      // return
      // }
      if (!item.dateRange[0] || !item.dateRange[1]) {
        valid = false;
        errorMsg = "Не у всех товаров указаны даты выкупов";
      }
      if (
        !item.searchQuery[0].value &&
        (!item.category || !item.category.length)
      ) {
        valid = false;
        errorMsg = "Не у всех товаров указан поисковый запрос";
      }
      if (!item.selectedSize) item.selectedSize = "none";
    }
  );
  if (!valid) {
    notify({
      title: "Что-то пошло не так",
      text: errorMsg,
      group: "error",
      duration: 3000,
    });
    return;
  }
  checksModal.value = true;
}

async function createBuyout() {
  isCreateButtonDisabled.value = true;
  const userOffsetMinutes = new Date().getTimezoneOffset();
  const userTimezoneOffsetHours = -userOffsetMinutes / 60;
  const userTimezoneOffsetMinutesRemainder = -userOffsetMinutes % 60;
  disabledCreateButton.value = true;
  const { data, error } = await useFetch("/api/goldApple/buyout/create", {
    method: "POST",
    watch: false,
    body: JSON.stringify(products.value),
    query: {
      userTimezoneOffsetHours,
      userOffsetMinutes: userTimezoneOffsetMinutesRemainder,
    },
  });
  disabledCreateButton.value = false;
  if (error.value) {
    notify({
      title: "Что-то пошло не так",
      text: error.value?.data.message,
      group: "error",
      duration: 3000,
    });
    isCreateButtonDisabled.value = false;
  } else if (data.value!.status === "ok") {
    notify({
      title: "Выкуп успешно создан",
      group: "success",
      duration: 3000,
    });

    store.createProducts = [];
    navigateTo({ path: "/goldApple/buyouts" });
  }
}

watch(products.value, (old, value) => {
  value.forEach((item: { quantity: number }, index: string | number) => {
    if (item.quantity < 1) products.value[index].quantity = 1;

    if (item.quantity > 1000) products.value[index].quantity = 1000;
  });
});

const loadingPickpoints = ref(false);
async function getPickpoints() {
  loadingPickpoints.value = true;
  try {
    const data = await $fetch("/api/goldApple/buyout/pickpoints", {
      method: "GET",
    });
    pickpoints.value = (data as any).points;
    pickpointsMarket.value = (data as any).pickpointsMarket;
    pickpoints5Post.value = (data as any).pickpoints5Post;
    pickpointsYandex.value = (data as any).pickpointsYandex;
  } catch (e: any) {
    notify({
      title: "Что-то пошло не так",
      text: e?.message,
      group: "error",
      duration: 3000,
    });
  }
  loadingPickpoints.value = false;
}

async function pointModalOpen(index: number) {
  if (!pickpoints.value) loading.value = true;

  store.selectedItem = index;
  if (products.value[index].deliveryType === "self") {
    modalOpenSelf.value = true;
  } else if (products.value[index].deliveryType === "courier") {
    modalOpen.value = true;
  } else if (products.value[index].deliveryType === "market") {
    modalOpenMarket.value = true;
  } else if (
    products.value[index].deliveryType === "5Post" 
  ) {
    modalOpen5Post.value = true;
  } else if (
    products.value[index].deliveryType === "Яндекс Доставка"
  ) {
    modalOpenYandex.value = true;
  }
}

onMounted(async () => {
  getPickpoints();
  if (route.query.uuid) {
    startTimer();
    loading.value = true;
    await store.cloneBuyout(route.query.uuid.toString());
    loading.value = false;
  }
});
onKeyStroke("Escape", (e) => {
  e.preventDefault();
  ruleModal.value = false;
  infoModal.value?.close();
});

const isCreatingTemplatesDisabled = ref(false);
async function createTemplate() {
  isCreatingTemplatesDisabled.value = true;

  const { data } = await useFetch(
    "/api/goldApple/buyout/createBuyoutTemplate",
    {
      method: "POST",
      query: {
        title: templateTitle,
      },
      body: products.value,
      watch: false,
    }
  );

  if (data.value) {
    store.createProducts = [];
    notify({
      title: "Шаблон выкупа создан",
      group: "success",
    });

    closeTemplateModal.value?.click();
    isCreatingTemplatesDisabled.value = false;
  }
}

async function getTemplates() {
  loadingTemplates.value = true;
  const { data }: any = await useFetch("/api/goldApple/buyout/templates");
  if (data.value) {
    templates.value = data.value.templates;
  }
  loadingTemplates.value = false;
}

function deleteTemplate(uuid: any) {
  templates.value = templates.value.filter((item: any) => {
    return item.uuid !== uuid;
  });
}

function closeTemplateModalFN() {
  closeTemplateSelectModal.value?.click();
}
function modalAddProduct(changedArticle: any) {
  article.value = changedArticle;
  addProduct();
}

const timer = ref(40);
const timerRunning = ref(false);
const timerFinished = ref(false);
let interval: any;

function startTimer() {
  timer.value = 40;
  timerRunning.value = true;

  interval = setInterval(() => {
    if (timer.value > 0 && loading.value) {
      timer.value--;
    } else {
      clearInterval(interval);
      timerRunning.value = false;
      timerFinished.value = true;
    }
  }, 1000);
}

const prices = ref({
  minPrice: 50,
  price: 10,
  type: "price",
});
const mainStore = useMainStore();
prices.value = await mainStore.getPrices("zy");

const summ = computed(() => {
  const summInfo = mainStore.getBuyoutsSumm(
    products.value.map((item) => Number(item.price)),
    prices.value
  );

  if (summInfo && summInfo.summ) {
    return summInfo;
  } else {
    return {
      summ: 0,
      serviceSumm: 0,
    };
  }
});

const categories = ref([
  {
    name: "Цветы",
    subcategories: [
      {
        name: "Монобукеты",
      },
      {
        name: "Авторские букеты",
      },
      {
        name: "Цветы в коробке",
      },
      {
        name: "Цветы в корзине",
      },
      {
        name: "Цветы поштучно",
      },
      {
        name: "Букеты из сухоцветов",
      },
      {
        name: "Цветы для интерьера",
      },
      {
        name: "Цветы в ящиках",
      },
      {
        name: "Подарочные наборы",
      },
      {
        name: "Букеты невесты",
      },
      {
        name: "Стабилизированные цветы",
      },
      {
        name: "Мягкие игрушки",
      },
      {
        name: "Композиции из цветов",
      },
      {
        name: "Букеты из мыла",
      },
      {
        name: "Мишки из роз",
      },
      {
        name: "Искусственные цветы",
      },
      {
        name: "Открытки",
      },
      {
        name: "Траурные цветы",
      },
      {
        name: "Другое",
      },
    ],
  },
  {
    name: "Съедобные букеты",
    subcategories: [
      {
        name: "Монобукеты",
      },
      {
        name: "Авторские букеты",
      },
      {
        name: "Цветы в коробке",
      },
      {
        name: "Цветы в корзине",
      },
      {
        name: "Цветы поштучно",
      },
      {
        name: "Букеты из сухоцветов",
      },
      {
        name: "Цветы для интерьера",
      },
      {
        name: "Цветы в ящиках",
      },
      {
        name: "Подарочные наборы",
      },
      {
        name: "Букеты невесты",
      },
      {
        name: "Стабилизированные цветы",
      },
      {
        name: "Мягкие игрушки",
      },
      {
        name: "Композиции из цветов",
      },
      {
        name: "Букеты из мыла",
      },
      {
        name: "Мишки из роз",
      },
      {
        name: "Искусственные цветы",
      },
      {
        name: "Открытки",
      },
      {
        name: "Траурные цветы",
      },
      {
        name: "Другое",
      },
    ],
  },
  {
    name: "Воздушные шары",
    subcategories: [
      {
        name: "Монобукеты",
      },
      {
        name: "Авторские букеты",
      },
      {
        name: "Цветы в коробке",
      },
      {
        name: "Цветы в корзине",
      },
      {
        name: "Цветы поштучно",
      },
      {
        name: "Букеты из сухоцветов",
      },
      {
        name: "Цветы для интерьера",
      },
      {
        name: "Цветы в ящиках",
      },
      {
        name: "Подарочные наборы",
      },
      {
        name: "Букеты невесты",
      },
      {
        name: "Стабилизированные цветы",
      },
      {
        name: "Мягкие игрушки",
      },
      {
        name: "Композиции из цветов",
      },
      {
        name: "Букеты из мыла",
      },
      {
        name: "Мишки из роз",
      },
      {
        name: "Искусственные цветы",
      },
      {
        name: "Открытки",
      },
      {
        name: "Траурные цветы",
      },
      {
        name: "Другое",
      },
    ],
  },
  {
    name: "Товары для праздника",
    subcategories: [
      {
        name: "Ёлки",
      },
      {
        name: "Хлопушки, конфетти",
      },
      {
        name: "Праздничный декор",
      },
      {
        name: "Оформление цветами",
      },
      {
        name: "Свечи для торта",
      },
      {
        name: "Ёлочные украшения",
      },
      {
        name: "Подарочная упаковка",
      },
      {
        name: "Карнавальные костюмы",
      },
      {
        name: "Свадебные товары",
      },
      {
        name: "Одноразовая посуда",
      },
      {
        name: "Другое",
      },
    ],
  },
  {
    name: "Подарочные сертификаты",
    subcategories: [
      {
        name: "Ёлки",
      },
      {
        name: "Хлопушки, конфетти",
      },
      {
        name: "Праздничный декор",
      },
      {
        name: "Оформление цветами",
      },
      {
        name: "Свечи для торта",
      },
      {
        name: "Ёлочные украшения",
      },
      {
        name: "Подарочная упаковка",
      },
      {
        name: "Карнавальные костюмы",
      },
      {
        name: "Свадебные товары",
      },
      {
        name: "Одноразовая посуда",
      },
      {
        name: "Другое",
      },
    ],
  },
  {
    name: "Комнатные растения",
    subcategories: [
      {
        name: "Ёлки",
      },
      {
        name: "Хлопушки, конфетти",
      },
      {
        name: "Праздничный декор",
      },
      {
        name: "Оформление цветами",
      },
      {
        name: "Свечи для торта",
      },
      {
        name: "Ёлочные украшения",
      },
      {
        name: "Подарочная упаковка",
      },
      {
        name: "Карнавальные костюмы",
      },
      {
        name: "Свадебные товары",
      },
      {
        name: "Одноразовая посуда",
      },
      {
        name: "Другое",
      },
    ],
  },
  {
    name: "Декор",
    subcategories: [
      {
        name: "Свечи",
      },
      {
        name: "Аромасвечи",
      },
      {
        name: "Подсвечники",
      },
      {
        name: "Ароматы для дома",
      },
      {
        name: "Вазы",
      },
      {
        name: "Светильники",
      },
      {
        name: "Ночники",
      },
      {
        name: "Постеры",
      },
      {
        name: "Скретч карты и карты мира",
      },
      {
        name: "Фоторамки, альбомы",
      },
      {
        name: "Магниты",
      },
      {
        name: "Копилки",
      },
      {
        name: "Статуэтки",
      },
      {
        name: "Часы",
      },
      {
        name: "Ключницы",
      },
      {
        name: "Будильники",
      },
      {
        name: "Декоративные подушки",
      },
      {
        name: "Пепельницы",
      },
      {
        name: "Предметы интерьера",
      },
      {
        name: "Подушки и игрушки антистресс",
      },
      {
        name: "Панно настенные",
      },
      {
        name: "Топиарии",
      },
      {
        name: "Держатели, подставки и подносы",
      },
      {
        name: "Матрешки",
      },
      {
        name: "Другое",
      },
    ],
  },
  {
    name: "Посуда",
    subcategories: [
      {
        name: "Свечи",
      },
      {
        name: "Аромасвечи",
      },
      {
        name: "Подсвечники",
      },
      {
        name: "Ароматы для дома",
      },
      {
        name: "Вазы",
      },
      {
        name: "Светильники",
      },
      {
        name: "Ночники",
      },
      {
        name: "Постеры",
      },
      {
        name: "Скретч карты и карты мира",
      },
      {
        name: "Фоторамки, альбомы",
      },
      {
        name: "Магниты",
      },
      {
        name: "Копилки",
      },
      {
        name: "Статуэтки",
      },
      {
        name: "Часы",
      },
      {
        name: "Ключницы",
      },
      {
        name: "Будильники",
      },
      {
        name: "Декоративные подушки",
      },
      {
        name: "Пепельницы",
      },
      {
        name: "Предметы интерьера",
      },
      {
        name: "Подушки и игрушки антистресс",
      },
      {
        name: "Панно настенные",
      },
      {
        name: "Топиарии",
      },
      {
        name: "Держатели, подставки и подносы",
      },
      {
        name: "Матрешки",
      },
      {
        name: "Другое",
      },
    ],
  },
  {
    name: "Хендмейд и хобби",
    subcategories: [
      {
        name: "Настольные игры",
      },
      {
        name: "Пазлы и головоломки",
      },
      {
        name: "Конструкторы",
      },
      {
        name: "Наборы для творчества",
      },
      {
        name: "Конструкторы из бумаги",
      },
      {
        name: "Картины по номерам",
      },
      {
        name: "Наборы для росписи",
      },
      {
        name: "Лепка",
      },
      {
        name: "Шитье и бисер",
      },
      {
        name: "Игрушки ручной работы",
      },
      {
        name: "Изготовление свечей",
      },
      {
        name: "Изготовление мыла",
      },
      {
        name: "Коллекции",
      },
      {
        name: "Румбоксы",
      },
      {
        name: "Фотоподарки",
      },
      {
        name: "Музыкальные инструменты",
      },
      {
        name: "Все для флористики",
      },
      {
        name: "Другое",
      },
    ],
  },
  {
    name: "Картины",
    subcategories: [
      {
        name: "Настольные игры",
      },
      {
        name: "Пазлы и головоломки",
      },
      {
        name: "Конструкторы",
      },
      {
        name: "Наборы для творчества",
      },
      {
        name: "Конструкторы из бумаги",
      },
      {
        name: "Картины по номерам",
      },
      {
        name: "Наборы для росписи",
      },
      {
        name: "Лепка",
      },
      {
        name: "Шитье и бисер",
      },
      {
        name: "Игрушки ручной работы",
      },
      {
        name: "Изготовление свечей",
      },
      {
        name: "Изготовление мыла",
      },
      {
        name: "Коллекции",
      },
      {
        name: "Румбоксы",
      },
      {
        name: "Фотоподарки",
      },
      {
        name: "Музыкальные инструменты",
      },
      {
        name: "Все для флористики",
      },
      {
        name: "Другое",
      },
    ],
  },
  {
    name: "Книги",
    subcategories: [
      {
        name: "Бестселлеры",
      },
      {
        name: "Художественная литература",
      },
      {
        name: "Бизнес-книги",
      },
      {
        name: "Психология",
      },
      {
        name: "Хобби, дом и досуг",
      },
      {
        name: "Искусство, дизайн и мода",
      },
      {
        name: "Детям",
      },
      {
        name: "Учебная литература",
      },
      {
        name: "Другое",
      },
    ],
  },
  {
    name: "Зоотовары",
    subcategories: [
      {
        name: "Бестселлеры",
      },
      {
        name: "Художественная литература",
      },
      {
        name: "Бизнес-книги",
      },
      {
        name: "Психология",
      },
      {
        name: "Хобби, дом и досуг",
      },
      {
        name: "Искусство, дизайн и мода",
      },
      {
        name: "Детям",
      },
      {
        name: "Учебная литература",
      },
      {
        name: "Другое",
      },
    ],
  },
  {
    name: "Для дома",
    subcategories: [
      {
        name: "Мебель",
      },
      {
        name: "Шторы",
      },
      {
        name: "Постельное белье",
      },
      {
        name: "Полотенца",
      },
      {
        name: "Ковры",
      },
      {
        name: "Для ванной",
      },
      {
        name: "Освещение",
      },
      {
        name: "Хранение",
      },
      {
        name: "Органайзеры",
      },
      {
        name: "Хозяйственные товары",
      },
      {
        name: "Зеркала",
      },
      {
        name: "Пледы",
      },
      {
        name: "Другое",
      },
    ],
  },
  {
    name: "Канцелярские товары",
    subcategories: [
      {
        name: "Мебель",
      },
      {
        name: "Шторы",
      },
      {
        name: "Постельное белье",
      },
      {
        name: "Полотенца",
      },
      {
        name: "Ковры",
      },
      {
        name: "Для ванной",
      },
      {
        name: "Освещение",
      },
      {
        name: "Хранение",
      },
      {
        name: "Органайзеры",
      },
      {
        name: "Хозяйственные товары",
      },
      {
        name: "Зеркала",
      },
      {
        name: "Пледы",
      },
      {
        name: "Другое",
      },
    ],
  },
  {
    name: "Кондитерские и пекарни",
    subcategories: [
      {
        name: "Мебель",
      },
      {
        name: "Шторы",
      },
      {
        name: "Постельное белье",
      },
      {
        name: "Полотенца",
      },
      {
        name: "Ковры",
      },
      {
        name: "Для ванной",
      },
      {
        name: "Освещение",
      },
      {
        name: "Хранение",
      },
      {
        name: "Органайзеры",
      },
      {
        name: "Хозяйственные товары",
      },
      {
        name: "Зеркала",
      },
      {
        name: "Пледы",
      },
      {
        name: "Другое",
      },
    ],
  },
  {
    name: "Магазины чая и кофе",
    subcategories: [
      {
        name: "Мебель",
      },
      {
        name: "Шторы",
      },
      {
        name: "Постельное белье",
      },
      {
        name: "Полотенца",
      },
      {
        name: "Ковры",
      },
      {
        name: "Для ванной",
      },
      {
        name: "Освещение",
      },
      {
        name: "Хранение",
      },
      {
        name: "Органайзеры",
      },
      {
        name: "Хозяйственные товары",
      },
      {
        name: "Зеркала",
      },
      {
        name: "Пледы",
      },
      {
        name: "Другое",
      },
    ],
  },
  {
    name: "Вкусные наборы",
    subcategories: [
      {
        name: "Фрукты, ягоды и фреши",
      },
      {
        name: "Сладости",
      },
      {
        name: "Сыры",
      },
      {
        name: "Мёд",
      },
      {
        name: "Сухофрукты",
      },
      {
        name: "Орехи",
      },
      {
        name: "Рыбные деликатесы",
      },
      {
        name: "Мясные деликатесы",
      },
    ],
  },
  {
    name: "Косметика и парфюмерия",
    subcategories: [
      {
        name: "Фрукты, ягоды и фреши",
      },
      {
        name: "Сладости",
      },
      {
        name: "Сыры",
      },
      {
        name: "Мёд",
      },
      {
        name: "Сухофрукты",
      },
      {
        name: "Орехи",
      },
      {
        name: "Рыбные деликатесы",
      },
      {
        name: "Мясные деликатесы",
      },
    ],
  },
  {
    name: "Sexual wellness",
    subcategories: [
      {
        name: "Для нее",
      },
      {
        name: "Для него",
      },
      {
        name: "Для пар",
      },
      {
        name: "Косметика и аксессуары",
      },
    ],
  },
  {
    name: "Украшения",
    subcategories: [
      {
        name: "Для нее",
      },
      {
        name: "Для него",
      },
      {
        name: "Для пар",
      },
      {
        name: "Косметика и аксессуары",
      },
    ],
  },
  {
    name: "Аксессуары",
    subcategories: [
      {
        name: "Сумки, рюкзаки",
      },
      {
        name: "Шопперы",
      },
      {
        name: "Ремни",
      },
      {
        name: "Кошельки",
      },
      {
        name: "Маски для сна",
      },
      {
        name: "Шапки, перчатки",
      },
      {
        name: "Шарфы, платки",
      },
      {
        name: "Носки",
      },
      {
        name: "Галстуки, бабочки",
      },
      {
        name: "Обувь",
      },
      {
        name: "Нагрудные платки",
      },
      {
        name: "Детские товары",
      },
      {
        name: "Очки",
      },
      {
        name: "Зонты",
      },
      {
        name: "Чемоданы",
      },
      {
        name: "Обложки для документов",
      },
      {
        name: "Аксессуары для телефона",
      },
      {
        name: "Аксессуары для авто",
      },
      {
        name: "Электроника",
      },
      {
        name: "Для компьютера",
      },
      {
        name: "Для отдыха",
      },
      {
        name: "Спортивные аксессуары",
      },
      {
        name: "Другое",
      },
    ],
  },
  {
    name: "Одежда",
    subcategories: [
      {
        name: "Сумки, рюкзаки",
      },
      {
        name: "Шопперы",
      },
      {
        name: "Ремни",
      },
      {
        name: "Кошельки",
      },
      {
        name: "Маски для сна",
      },
      {
        name: "Шапки, перчатки",
      },
      {
        name: "Шарфы, платки",
      },
      {
        name: "Носки",
      },
      {
        name: "Галстуки, бабочки",
      },
      {
        name: "Обувь",
      },
      {
        name: "Нагрудные платки",
      },
      {
        name: "Детские товары",
      },
      {
        name: "Очки",
      },
      {
        name: "Зонты",
      },
      {
        name: "Чемоданы",
      },
      {
        name: "Обложки для документов",
      },
      {
        name: "Аксессуары для телефона",
      },
      {
        name: "Аксессуары для авто",
      },
      {
        name: "Электроника",
      },
      {
        name: "Для компьютера",
      },
      {
        name: "Для отдыха",
      },
      {
        name: "Спортивные аксессуары",
      },
      {
        name: "Другое",
      },
    ],
  },
  {
    name: "Обувь",
    subcategories: [
      {
        name: "Домашняя обувь",
      },
    ],
  },
  {
    name: "Одежда для детей",
    subcategories: [
      {
        name: "Домашняя обувь",
      },
    ],
  },
]);
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
            to="/catalog/goldApple"
            class="cursor-pointer text-[#909090]"
          >
            Золотое яблоко
          </NuxtLink>
        </li>
        <li class="cursor-pointer">
          <NuxtLink
            to="/goldApple/buyouts"
            class="cursor-pointer text-[#909090]"
          >
            Выкупы
          </NuxtLink>
        </li>
        <li class="cursor-pointer text-[#1e2734]">Создать</li>
      </ul>
    </div>
    <div>
      <div
        v-if="loading"
        style="background-color: rgb(37, 37, 42); opacity: 80%; z-index: 9999"
        class="fixed z-[50] top-0 left-0 right-0 bottom-0 w-full h-screen overflow-hidden flex flex-col items-center justify-center"
      >
        <span class="text-white text-2xl text-center">
          До получения продукта осталось приблизительно {{ timer }} сек.
        </span>
        <div class="ease-linear rounded-full mb-4">
          <Icon name="mdi:loading" class="h-20 w-20 animate-spin text-white" />
        </div>
      </div>

      <div class="flex flex-col md:flex-row md:justify-between">
        <div class="mt-6 md:flex items-center gap-2.5 w-full">
          <div
            class="relative flex justify-end items-center flex-grow-0 md:w-80 gap-2.5 w-full"
          >
            <input
              ref="codeInput"
              v-model="article"
              placeholder="Введите ссылку на продукт"
              class="input input-sm w-full mb-2 md:mb-0 bg-base-200 border-base-200"
              @keydown.enter="addProduct"
            />
            <Icon
              class="absolute right-2 mb-2 md:mb-0 p-2 text-base-content text-opacity-50"
              name="tabler:search"
              size="20"
              @click="codeInput.focus()"
            />
          </div>
          <div class="flex gap-2.5">
            <button
              class="btn btn-primary btn-sm normal-case border-none text-white font-normal"
              :disabled="!article || article == ''"
              @click="addProduct"
            >
              Добавить
            </button>
            <label
              for="template-select-modal"
              class="btn btn-sm btn-primary normal-case bg-base-200 border-none text-base-content hover:text-white mr-0 md:mr-1 mb-2 md:mb-0 font-normal"
              @click="getTemplates"
              >Шаблоны</label
            >
          </div>
        </div>
      </div>
      <div class="flex gap-2 mt-4 flex-wrap">
        <div class="text-sm">
          <span class="text-gray-500">Товаров: </span>
          <span class="text-nowrap">{{ totalQuantity }} шт.</span>
        </div>
        <div class="text-sm">
          <span class="text-gray-500">Сумма: </span>
          <span>{{ currency.format(totalSum) }}</span>
        </div>
        <div class="text-sm">
          <span class="text-gray-500">Услуги: </span>
          <span>{{ currency.format(summ.serviceSumm) }}</span>
        </div>
        <div class="text-sm">
          <span class="text-gray-500">К списанию: </span>
          <span>{{ currency.format(summ.summ) }}</span>
        </div>
      </div>

      <ClientOnly>
        <div
          v-if="width < 1600"
          class="products-card grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 mt-4"
        >
          <!-- :loading="!pickpoints?.length" -->
          <BuyoutGoldAppleCreateCard
            v-for="(product, index) in products"
            :key="index"
            :loading="loadingPickpoints"
            :product="product"
            :index="index"
            :categories="categories"
            @point-modal-open="pointModalOpen"
            @rule-modal-open="ruleModalOpen"
          />
        </div>
        <div
          v-else
          class="products-table scrollbar-thumb-primary scrollbar-track-base-200 scrollbar-thin"
        >
          <table class="table table-xs w-full mt-4">
            <thead class="relative mb-2 text-sm text-base-content">
              <tr class="bg-[#f3e9dd] dark:bg-opacity-10">
                <!-- <th class="hidden 3xl:block">№</th> -->
                <th
                  class="w-12 text-center p-2 font-normal"
                  @click="openInfoModal('picture')"
                >
                  <!-- <Icon name="material-symbols:image-outline" size="20" /> -->
                  Фото
                </th>
                <th class="w-36 3xl:w-48 text-center font-normal">Название</th>
                <th
                  class="text-center font-normal"
                  @click="openInfoModal('price')"
                >
                  <div class="flex w-full items-center justify-center">
                    <span> Цена </span>
                    <!-- <span class="rounded-lg bg-base-200 px-1 text-xs"> ? </span> -->
                  </div>
                </th>

                <th class="font-normal">
                  <div class="text-center">
                    <span>Параметры </span>
                  </div>
                </th>
                <th class="font-normal" @click="openInfoModal('sex')">
                  <div class="text-center">
                    <span> Пол </span>
                  </div>
                </th>

                <th class="font-normal" @click="openInfoModal('rules')">
                  <div class="text-center">
                    <span> Правила </span>
                  </div>
                </th>
                <th class="font-normal" @click="openInfoModal('dates')">
                  <div class="text-center">
                    <span> Даты выкупов </span>
                    <!-- <span class="rounded-lg bg-base-200 px-1 text-xs"> ? </span> -->
                  </div>
                </th>

                <th
                  class="min-w-40 font-normal"
                  @click="openInfoModal('adress')"
                >
                  <div class="text-center">
                    <span> Тип доставки </span>
                  </div>
                </th>

                <th
                  class="min-w-40 font-normal"
                  @click="openInfoModal('adress')"
                >
                  <!-- <div class="flex justify-between w-full gap-1 items-center"> -->
                  <div class="text-center">
                    <span> Адрес </span>
                    <!-- <span class="rounded-lg bg-base-200 px-1 text-xs"> ? </span> -->
                  </div>
                </th>
                <!-- <th class="font-normal text-base-content">
                  <div class="flex justify-center items-center gap-1">
                    <span>Категории</span>

                  </div>
                </th> -->
                <!-- <th
                  class="font-normal text-base-content"
                  @click="openInfoModal('search')"
                >
                  <div class="flex justify-center items-center gap-1">
                    <span>ФИО</span>
           
                  </div>
                </th>
                <th
                  class="font-normal text-base-content"
                  @click="openInfoModal('search')"
                >
                  <div class="flex justify-center items-center gap-1">
                    <span>Номер телефона</span>
           
                  </div>
                </th> -->
                <th
                  class="font-normal text-base-content"
                  @click="openInfoModal('search')"
                >
                  <div class="flex justify-center items-center gap-1">
                    <span>Поисковые запросы</span>
                    <!-- <span class="rounded-lg bg-base-200 px-1 text-xs">?</span> -->
                  </div>
                </th>
                <th />

                <th class="text-base-content" />
              </tr>
            </thead>

            <tbody>
              <!-- :loading="!pickpoints?.length" -->
              <BuyoutGoldAppleCreateTableRow
                v-for="(product, index) in products"
                :key="index"
                :product="product"
                :index="index"
                :loading="loadingPickpoints"
                :categories="categories"
                @rule-modal-open="ruleModalOpen"
                @point-modal-open="pointModalOpen"
              />
            </tbody>
          </table>
        </div>
        <BuyoutGoldAppleSelectPointModal
          v-if="modalOpen"
          :state="modalOpen"
          :pickpoints="pickpoints"
          @callback="handleAddress"
          @close="closeModal"
        />
        <BuyoutGoldAppleSelectPointModalSelf
          v-if="modalOpenSelf"
          :state="modalOpenSelf"
          :pickpoints="pickpoints"
          @callback="handleAddress"
          @close="closeModal"
        />
        <BuyoutGoldAppleSelectPointModalMarket
          v-if="modalOpenMarket"
          :state="modalOpenMarket"
          :pickpoints="pickpointsMarket"
          @callback="handleAddress"
          @close="closeModal"
        />
        <BuyoutGoldAppleSelectPointModal5Post
          v-if="modalOpen5Post"
          :state="modalOpen5Post"
          :pickpoints="pickpoints5Post"
          @callback="handleAddress"
          @close="closeModal"
        />
        <BuyoutGoldAppleSelectPointModalYandex
          v-if="modalOpenYandex"
          :state="modalOpenYandex"
          :pickpoints="pickpointsYandex"
          @callback="handleAddress"
          @close="closeModal"
        />
      </ClientOnly>
      <div
        v-show="products.length"
        class="mt-6 md:flex justify-start lg:justify-end"
      >
        <div class="m-5 mb-20">
          <label
            class="btn btn-sm btn-primary normal-case bg-base-200 text-base-content border-none mt-2 md:mt-0 ml-1 md:ml-2 px-6 font-normal"
            for="template-modal"
          >
            Шаблон
          </label>

          <button
            class="btn btn-sm btn-primary normal-case border-none mt-1 ml-2 font-normal text-white"
            :disabled="disabledCreateButton"
            @click="openChecksModal"
          >
            Создать
          </button>
        </div>
      </div>

      <div v-if="ruleModal">
        <input id="ruleModal" type="checkbox" class="modal-toggle" />
        <label
          for="ruleModal"
          class="modal modal-open modal-bottom sm:modal-middle"
        >
          <label for="" class="modal-box relative">
            <label
              for="ruleModal"
              class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              @click="ruleModal = false"
              >✕</label
            >
            <h3 class="font-bold text-lg mb-2">
              Выберите нужные правила для этого выкупа
            </h3>
            <div v-for="rule of defaultRules" :key="rule.id" class="">
              <div
                v-if="rule.id === 1"
                class="label cursor-pointer flex gap-4 items-start justify-between"
              >
                <span class="label-text">{{
                  "Выкупить товар(-ы) прямо сейчас "
                }}</span>
                <div class="flex gap-2">
                  <input
                    :disabled="products[selectedRuleProductIndex].key"
                    v-model="products[selectedRuleProductIndex].purchaseSoon"
                    type="checkbox"
                    class="checkbox checkbox-primary border-base-content"
                  />
                  <span class="text-sm text-primary">{{ rule.price }}р.</span>
                </div>
              </div>
              <!-- <div
                v-if="rule.id === 1 && user?.ffEnabled"
                class="label cursor-pointer flex gap-4 items-start justify-between"
              >
                <span class="label-text">{{ "Выкуп под ключ " }}</span>
                <div class="flex gap-4">
                  <input
                  :disabled="products[selectedRuleProductIndex].purchaseSoon"
                    v-model="products[selectedRuleProductIndex].key"
                    type="checkbox"
                    class="checkbox checkbox-primary border-base-content"
                    @click="
                      [
                        refreshElements(),
                        (products[selectedRuleProductIndex].adress = ''),
                        (products[selectedRuleProductIndex].dateRange = [
                          new Date().setHours(new Date().getHours()),

                          new Date().setHours(new Date().getHours()),
                        ]),
                      ]
                    "
                  />
                </div>
              </div> -->
              <span
                v-if="rule.id === 1"
                class="text-[#AA4A44] text-sm font-bold"
              >
                Функционал по добавлению правил временно недоступен
              </span>
              <!-- <div
              v-if="rule.id === 1"
              class="label cursor-pointer flex gap-4 items-start justify-between"
            >
              <span class="label-text"
                >{{ 'Выкуп под ключ ' }}</span
              >
              <div class="flex gap-4">

                <input
                  type="checkbox"
                  v-model="products[selectedRuleProductIndex].key"
                  class="checkbox checkbox-primary border-base-content"
                />
              </div>
            </div> -->
              <div
                class="label cursor-pointer flex gap-4 items-start justify-between"
              >
                <span class="label-text"
                  >{{ rule.id }}. {{ rule.description }}</span
                >
                <div class="flex gap-2 justify-end">
                  <input
                    :disabled="
                      !!store.createProducts[
                        selectedRuleProductIndex
                      ].rules.find(
                        (item) =>
                          item.category === rule.category && item.id !== rule.id
                      ) ||
                      !!store.createProducts[
                        selectedRuleProductIndex
                      ].rules.find((item) => item.id === rule?.relies) || rule.disabled
                    "
                    type="checkbox"
                    class="checkbox checkbox-primary border-base-content"
                    :checked="
                      !!store.createProducts[
                        selectedRuleProductIndex
                      ].rules.find((item) => item.id === rule.id)
                    "
                    @change="
                      onRuleChange($event, selectedRuleProductIndex, rule.id)
                    "
                  />
                  <span class="text-sm text-primary">{{ rule.price }}р.</span>
                </div>
              </div>
            </div>
          </label>
        </label>
      </div>
      <BuyoutHelpModal ref="infoModal" :info-type="infoType" />
      <BuyoutGoldAppleCreateChecksModal
        v-if="checksModal"
        :is-create-button-disabled="isCreateButtonDisabled"
        :state="checksModal"
        @create="createBuyout"
        @close="checksModal = false"
      />

      <!-- <input id="warning-modal" type="checkbox" class="modal-toggle" />
      <div class="modal">
        <div class="modal-box">
          <label
            ref="closeWarningModal"
            for="warning-modal"
            class="btn btn-sm btn-circle btn-ghost absolute right-1 top-1"
            >✕</label
          >
          <h3 class="font-bold text-lg">Принимаете ли вы риски штрафа?</h3>
          <p class="py-4">
            Мы рекомендуем ограничить количество заказываемых товаров на один
            артикул на один пункт выдачи до 3 единиц в день.
          </p>
          <div class="modal-action flex justify-between">
            <div class="form-control md:block flex-row">
              <label class="label cursor-pointer md:mt-0 mt-16">
                <input
                  v-model="isWarningChecked"
                  type="checkbox"
                  class="checkbox checkbox-primary"
                />
                <span class="label-text ml-2">Запомнить</span>
              </label>
            </div>
            <div class="flex flex-col lg:flex-row">
              <label for="warning-modal" class="btn btn-ghost my-2 md:my-0"
                >Отмена</label
              >

              <label for="warning-modal" class="btn btn-primary" @click="warned"
                >Принимаю</label
              >
            </div>
          </div>
        </div>
      </div> -->
      <input id="template-modal" type="checkbox" class="modal-toggle" />
      <div class="modal">
        <div class="modal-box max-w-md py-3">
          <label
            ref="closeTemplateModal"
            for="template-modal"
            class="btn btn-sm btn-circle btn-ghost absolute right-1 top-1"
            >✕</label
          >
          <h3 class="font-semibold text-lg text-bas mr-4">
            Введите название шаблона
          </h3>
          <input
            v-model="templateTitle"
            type="text"
            :disabled="isCreatingTemplatesDisabled"
            placeholder="Название шаблона"
            class="input input-bordered w-full mt-2 bg-base-200 placeholder-base-content placeholder-opacity-50 border-base-200"
            @keyup.enter="createTemplate"
          />
          <div class="modal-action flex self-end">
            <label
              for="template-modal"
              class="btn btn-ghost my-2 md:my-0 w-[30%]"
              >Отмена</label
            >

            <button
              class="btn btn-primary w-[30%]"
              :disabled="isCreatingTemplatesDisabled"
              @click="createTemplate"
            >
              Сохранить
            </button>
          </div>
        </div>
      </div>
      <input id="template-select-modal" type="checkbox" class="modal-toggle" />
      <div class="modal" style="z-index: 9999">
        <div class="modal-box max-w-7xl min-h-[300px]">
          <label
            ref="closeTemplateSelectModal"
            for="template-select-modal"
            class="btn btn-sm btn-circle btn-ghost absolute right-1 top-1"
            >✕</label
          >
          <h3 class="font-bold text-lg mr-4 mb-4">
            {{ templates.length > 0 ? "Выберите шаблон" : "" }}
          </h3>
          <div v-if="templates.length > 0" class="flex items-center">
            <input
              id="openAll"
              v-model="openAll"
              type="checkbox"
              class="checkbox checkbox-primary checkbox-sm"
            />
            <label for="openAll" class="cursor-pointer select-none ml-2"
              >Развернуть все</label
            >
          </div>
          <div v-else-if="!loadingTemplates" class="hero">
            <Hero />
          </div>
          <div v-else class="hero mt-20">
            <span class="loading loading-spinner loading-lg" />
          </div>
          <div class="mb-10" />
          <BuyoutGoldAppleTemplateExpand
            v-for="template in templates"
            :key="template.uuid"
            class="mt-1"
            :uuid="template.uuid"
            :opened="openAll"
            :info="template"
            @get-templates="deleteTemplate"
            @close-modal="closeTemplateModalFN"
          />
          <div class="modal-action flex justify-between" />
        </div>
      </div>
    </div>

    <input
      id="removeAllModelCreateProducts"
      type="checkbox"
      class="modal-toggle"
    />
    <div class="modal backdrop-filter backdrop-blur-sm">
      <div class="modal-box max-w-xs">
        <h3 class="font-normal text-lg">
          Вы уверены что хотите удалить все товары?
        </h3>
        <div class="modal-action flex justify-around">
          <label
            for="removeAllModelCreateProducts"
            class="btn btn-sm h-[2.5rem] w-[45%] btn-ghost hover:bg-[#6675FF] hover:dark:bg-[#6467F2] hover:text-base-100 px-6"
            >Отмена</label
          >
          <label
            for="removeAllModelCreateProducts"
            class="btn btn-sm btn-primary h-[2.5rem] border-none text-base-content bg-opacity-20 w-[45%] hover:bg-[#6675FF] hover:dark:bg-[#6467F2] hover:text-base-100 px-6"
            @click="store.createProducts = []"
            >Удалить</label
          >
        </div>
      </div>
    </div>
  </div>
  <IntroductionModal
    :show="showSuspendedModal"
    :is-checked="false"
    @close="showSuspendedModal = false"
    @checkbox-toggle="() => {}"
  />
</template>

<style scoped>
th {
  @apply normal-case hover:text-primary hover:cursor-pointer;
}

table td,
table td * {
  vertical-align: top;
}

.b24-widget-button-wrapper {
  position: hidden;
  z-index: 0;
}

.b24-widget-button-shadow {
  position: hidden;
  z-index: 0;
}
</style>
