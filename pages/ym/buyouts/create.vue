<script setup lang="tsx">
import type { Rule } from "@/data/buyout/rules";
import { rules } from "@/data/buyout/rules";
import { useWindowSize } from "@vueuse/core";

const { notify } = useNotification();

const closeWarningModal = ref(null) as Ref<HTMLLabelElement | null>;
const closeTemplateModal = ref(null) as Ref<HTMLLabelElement | null>;
const closeTemplateSelectModal = ref(null) as Ref<HTMLLabelElement | null>;
const currency = useCurrency();
const isCreateButtonDisabled = ref(false);
const { width } = useWindowSize();

const isWarningChecked = ref(false);
const disabledCreateButton = ref(false);
const ruleModal = ref(false);
const selectedRuleProductIndex = ref(0);
const checksModal = ref(false);
const infoModal = ref<HTMLDialogElement>();
const store = useYandexMarketBuyoutStore();
const infoType = ref("");
const defaultRules: Rule[] = rules;
const route = useRoute();
const article = ref<string>();
const products = computed(() => store.createProducts);
const { user } = useUserSession();
const loadingTemplates = ref(false);
const openAll = ref(false);
const templateTitle = ref("");
const templates = ref<any>([]);
// const modalShow = ref(false);
const codeInput = ref();
const refreshKey = ref(1);
const lastItemDateRange = ref<any>([]);
const promoModal = ref(false);

const timer = ref(40);
const timerRunning = ref(false);
const timerFinished = ref(false);
let interval: any;

const currentProductIndex = ref(0);
const currentProductPrice = ref(0);

definePageMeta({
  layout: "app",
  middleware: "auth",
  title: "Добавить выкупы Yandex Market",
});
const isUserWarned: any = ref(false);
onMounted(() => {
  // isUserWarned.value = localStorage.getItem("isUserWarned") === "true";
  // if (products.value.length === 0 && !route.query.uuid) modalShow.value = true;
});

// products.value.forEach((product: any, i: number) => {
//   if ( wasRuleChanged) {
//     products.value[i].rules.push({
//       category: 3,
//       description:
//         'Не выкупать если товар не найден в поисковой выдаче (не выкупать по прямой ссылке)',
//       id: 5,
//     })
//   }
// })
const loading = ref(false);

async function addProduct() {
  if (!article.value) return;
  startTimer();
  loading.value = true;
  const string = article.value.toString().trim();
  if (string.includes(",")) {
    const articles = string.split(",");
    for (const item of articles) await store.addProduct(Number(item));
    loading.value = false;
  } else {
    store.addProduct(Number(article.value)).finally(() => {
      loading.value = false;
    });
  }
  article.value = "";
}

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

async function ruleModalOpen(index: number) {
  // if (user.ffEnabled) {
  //   if (
  //     // eslint-disable-next-line eqeqeq
  //     products.value[index].dateRange[0] != lastItemDateRange.value[0] ||
  //     // eslint-disable-next-line eqeqeq
  //     products.value[index].dateRange[1] != lastItemDateRange.value[1]
  //   ) {
  //     lastItemDateRange.value = products.value[index].dateRange;
  //     await getFFPickpoints(products.value[index].dateRange[0] || new Date());
  //   }
  // }

  ruleModal.value = true;
  selectedRuleProductIndex.value = index;

  // await getFFPickpoints(products.value[index].dateRange[0] || new Date());
}
// function removeSearchQuery(index: number, place: number) {
//   store.removeSearchQuery(index, place)
// }

// function addSearchQuery(index: number) {
//   store.addSearchQuery(index)
// }

// function onDateRangeChange(value: unknown[], index: number) {
//   store.changeDateRange(value, index)
// }

// function onSearchQueryChange(options: ISearchQueryChange) {
//   store.changeSearchQuery(options)
// }

// function onQuantityChange(value: number, index: number) {
//   store.changeQuantity(value, index)
// }

// function onSizeChange(event: Event, index: number) {
//   const target = event.target as HTMLInputElement
//   store.changeSize(target.value, index)
// }

// function onSexChange(event: Event, index: number) {
//   const target = event.target as HTMLInputElement
//   store.changeSex(target.value, index)
// }

function onRuleChange(event: Event, index: number, rule: number) {
  const target = event.target as HTMLInputElement;
  store.changeRule(target.checked, index, rule);
}

// function removeProduct(index: number) {
//   store.removeProduct(index)
// }

function handleAddress(address: string, lt: number, lg: number, id: string) {
  store.handleAddress(address, lt, lg, id);
}
function openInfoModal(type: string) {
  infoType.value = type;
  infoModal.value?.showModal();
}

const totalSum = computed(() => {
  return products.value.reduce((acc, item) => {
    return acc + item.price * item.quantity;
  }, 0);
});

const totalQuantity = computed(() => {
  return products.value.reduce((acc, item) => {
    return acc + item.quantity;
  }, 0);
});

const pickpoints = shallowRef();
// const ffPickpoints = shallowRef();
const modalOpen = ref(false);
const modalOpenFF = ref(false);
const modalOpenCourier = ref(false);

function closeModal() {
  modalOpen.value = false;
  modalOpenFF.value = false;
  modalOpenCourier.value = false;
}

function openCourierModal() {
  closeModal();
  store.createProducts[store.selectedItem].isCourier = true;
  modalOpenCourier.value = true;
}
function openPickpointModal() {
  closeModal();
  store.createProducts[store.selectedItem].isCourier = false;
  modalOpen.value = true;
}

async function openChecksModal() {
  const productCountsByAddress: any = {};

  if (!isUserWarned.value) {
    const { data }: any = await useFetch(
      "/api/yandexMarket/buyout/checkPVZRestrictions",
      {
        method: "GET",
      }
    );

    if (data.value) {
      const productsForTest = [...products.value, ...data.value.lastBuyouts];

      for (const item of productsForTest) {
        const dateStart: any = new Date(item.dateRange[0]);
        const dateEnd: any = new Date(item.dateRange[1]);
        const timeDiff = dateEnd - dateStart;
        const millisecondsPerDay = 24 * 60 * 60 * 1000;
        const daysBetween = Math.ceil(timeDiff / millisecondsPerDay);

        productCountsByAddress[`${item.adress}:${item.article} `] =
          (productCountsByAddress[`${item.adress}:${item.article} `] || 0) +
          item.quantity;
        // if (
        //   Math.ceil(productCountsByAddress[`${item.adress}:${item.article} `]) /
        //     daysBetween >
        //   3
        // ) {
        //   closeWarningModal.value?.click();
        //   return;
        // }
      }
    }
  }

  let valid = true;
  let errorMsg = "";
  products.value.forEach((item: any) => {
    if (!item.adress) {
      valid = false;
      errorMsg = "Не у всех товаров указан адрес доставки";
    }
    if (!item.dateRange[0] || !item.dateRange[1]) {
      valid = false;
      errorMsg = "Не у всех товаров указаны даты выкупов";
    }
    if (
      !item.searchQuery[0].value &&
      (!item.category || !item.category.length)
    ) {
      valid = false;
      errorMsg = "Не у всех товаров указан поисковый запрос или категория";
    }
    if (!item.selectedSize) item.selectedSize = "none";

    const minDate = new Date(item.dateRange[0]);
    const maxDate = new Date(item.dateRange[1]);
    const minDay = minDate.getDate();
    const maxDay = maxDate.getDate();

    // eslint-disable-next-line eqeqeq
    if (item.key && minDay != maxDay) {
      valid = false;
      errorMsg = `Выберите точную дату для выкупа под ключ ${item.article}`;
    }
  });

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
  const { data, error } = await useFetch("/api/yandexMarket/buyout/create", {
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
    navigateTo({ path: "/ym/buyouts" });
  }
}

watch(products.value, (old, value) => {
  value.forEach((item, index) => {
    if (item.quantity < 1) products.value[index].quantity = 1;

    if (item.quantity > 1000) products.value[index].quantity = 1000;
  });
});

async function getPickpoints() {
  try {
    const data = await $fetch("/api/yandexMarket/buyout/pickpoints", {
      method: "GET",
    });
    pickpoints.value = (data as any).points;
  } catch (e: any) {
    notify({
      title: "Что-то пошло не так",
      text: e?.message,
      group: "error",
      duration: 3000,
    });
  }
}
// async function getFFPickpoints(date: Date = new Date()) {
//   try {
//     const data = await $fetch("/api/yandexMarket/ff/userPickpoints", {
//       method: "GET",
//       query: {
//         date: new Date(date).toISOString(),
//       },
//     });
//     ffPickpoints.value = (data as any).points;
//   } catch (e: any) {
//     notify({
//       title: "Что-то пошло не так",
//       text: e?.message,
//      group: "error",
//       duration: 3000,
//     });
//   }
// }

async function pointModalOpen(index: number) {
  if (!pickpoints.value) loading.value = true;

  store.selectedItem = index;

  // if (products.value[index].key) {
  //   if (
  //     // eslint-disable-next-line eqeqeq
  //     products.value[index].dateRange[0] != lastItemDateRange.value[0] ||
  //     // eslint-disable-next-line eqeqeq
  //     products.value[index].dateRange[1] != lastItemDateRange.value[1]
  //   ) {
  //     lastItemDateRange.value = products.value[index].dateRange;
  //     await getFFPickpoints(products.value[index].dateRange[0] || new Date());
  //   }

  //   modalOpenFF.value = true;
  // } else {
  //   modalOpen.value = true;
  // }
  if (products.value[index].isCourier) {
    modalOpenCourier.value = true;
  } else {
    modalOpen.value = true;
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

function warned() {
  isUserWarned.value = true;
  // eslint-disable-next-line eqeqeq
  if (isWarningChecked.value == true) {
    localStorage.setItem("isUserWarned", "true");
  }
  openChecksModal();
}

const isCreatingTemplatesDisabled = ref(false);
async function createTemplate() {
  isCreatingTemplatesDisabled.value = true;

  const { data } = await useFetch(
    "/api/yandexMarket/buyout/createBuyoutTemplate",
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
  const { data }: any = await useFetch("/api/yandexMarket/buyout/templates");
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

function refreshElements() {
  // eslint-disable-next-line eqeqeq
  refreshKey.value == 1 ? (refreshKey.value = 0) : (refreshKey.value = 1);
}

function handleAddressCourier(address: string, lt: number, lg: number) {
  console.log(address, lt, lg);
  modalOpenCourier.value = false;

  store.handleAddressCourier(address, lt, lg, addressForm);
}

const addressForm = reactive({
  apartment: "",
  entrance: "",
  floor: "",
  intercom: "",
  comment: "",
  nameLastName: "",
  phone: "",
});

function openPromo(productIndex: number, price: number) {
  currentProductIndex.value = productIndex;
  currentProductPrice.value = price;
  promoModal.value = true;
}

function removePromo(index: number) {
  console.log(index);
  store.createProducts[index].promoCode = "";
}

const prices = ref({
  minPrice: 50,
  price: 10,
  type: "price",
});
const mainStore = useMainStore();
prices.value = await mainStore.getPrices("ym");

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
    name: "Одежда и обувь",
    subcategories: [
      {
        name: "Обувь",
        subcategories: [
          {
            name: "Женская обувь",
          },
          {
            name: "Мужская обувь",
          },
          {
            name: "Для девочек",
          },
          {
            name: "Для мальчиков",
          },
          {
            name: "Для малышей",
          },
        ],
      },
      {
        name: "Мужчинам",
        subcategories: [
          {
            name: "Аксессуары",
          },
          {
            name: "Брюки",
          },
          {
            name: "Верхняя одежда",
          },
          {
            name: "Водолазки",
          },
          {
            name: "Джемперы, свитеры, кардиганы",
          },
        ],
      },
      {
        name: "Аксессуары",
        subcategories: [
          {
            name: "Сумки, рюкзаки, чемоданы",
          },
          {
            name: "Кошельки, визитницы, косметички",
          },
          {
            name: "Ювелирные украшения",
          },
          {
            name: "Бижутерия",
          },
          {
            name: "Часы",
          },
        ],
      },
      {
        name: "Детям",
        subcategories: [
          {
            name: "Аксессуары",
          },
          {
            name: "Для девочек",
          },
          {
            name: "Для мальчиков",
          },
          {
            name: "Для малышей",
          },
          {
            name: "Обувь",
          },
        ],
      },
      {
        name: "Ресейл",
        subcategories: [
          {
            name: "Блузы и рубашки",
          },
          {
            name: "Брюки",
          },
          {
            name: "Джинсы",
          },
          {
            name: "Куртки",
          },
          {
            name: "Очки",
          },
        ],
      },
    ],
  },
  {
    name: "Дом",
    subcategories: [
      {
        name: "Хозяйственные товары",
        subcategories: [
          {
            name: "Хозяйственные сумки",
          },
          {
            name: "Аксессуары для ванной и туалета",
          },
          {
            name: "Инвентарь для уборки",
          },
          {
            name: "Безмены",
          },
        ],
      },
      {
        name: "Антиквариат",
        subcategories: [
          {
            name: "Атрибутика религиозная антикварная и винтажная",
          },
          {
            name: "Банки антикварные и винтажные",
          },
          {
            name: "Бинокли антикварные и винтажные",
          },
          {
            name: "Блюда антикварные и винтажные",
          },
          {
            name: "Бокалы и стаканы антикварные и винтажные",
          },
        ],
      },
      {
        name: "Товары для праздников",
        subcategories: [
          {
            name: "Фейерверки",
          },
          {
            name: "Воздушные шары",
          },
          {
            name: "Подарочная упаковка",
          },
          {
            name: "Украшения для организации праздников",
          },
          {
            name: "Дипломы, медали, значки",
          },
        ],
      },
      {
        name: "Освещение",
        subcategories: [
          {
            name: "Потолочные светильники",
          },
          {
            name: "Настенно-потолочные светильники",
          },
          {
            name: "Настенные светильники",
          },
          {
            name: "Настольные светильники",
          },
          {
            name: "Напольные светильники",
          },
        ],
      },
      {
        name: "Хранение в доме",
        subcategories: [
          {
            name: "Корзины, коробки и органайзеры",
          },
          {
            name: "Вакуумные пакеты",
          },
          {
            name: "Вешалки напольные",
          },
          {
            name: "Вешалки настенные",
          },
          {
            name: "Вешалки-плечики",
          },
        ],
      },
      {
        name: "Интерьер",
        subcategories: [
          {
            name: "Зеркала",
          },
          {
            name: "Шторы, карнизы, декор окна",
          },
          {
            name: "Растения, кашпо, горшки",
          },
          {
            name: "Декор стен",
          },
          {
            name: "Декор интерьера",
          },
        ],
      },
      {
        name: "Умный дом",
        subcategories: [
          {
            name: "Бытовая техника",
          },
          {
            name: "Климат",
          },
          {
            name: "Красота и здоровье",
          },
          {
            name: "Электроника",
          },
          {
            name: "Освещение и электрика",
          },
        ],
      },
      {
        name: "Уход за одеждой и обувью",
        subcategories: [
          {
            name: "Гладильные доски",
          },
          {
            name: "Сушилки для белья",
          },
          {
            name: "Товары для ухода за одеждой и бельем",
          },
          {
            name: "Аксессуары для ухода за обувью",
          },
          {
            name: "Хранение вещей",
          },
        ],
      },
      {
        name: "Текстиль",
        subcategories: [
          {
            name: "Постельное белье",
          },
          {
            name: "Подушки",
          },
          {
            name: "Одеяла",
          },
          {
            name: "Наматрасники и чехлы для матрасов",
          },
          {
            name: "Пледы и покрывала",
          },
        ],
      },
      {
        name: "Мебель",
        subcategories: [
          {
            name: "Мягкая мебель",
          },
          {
            name: "Гардеробы, шкафы и комоды",
          },
          {
            name: "Кухонные столы и стулья",
          },
          {
            name: "Рабочее место",
          },
          {
            name: "Мебель для спальни",
          },
        ],
      },
      {
        name: "Все для Нового года",
        subcategories: [
          {
            name: "Ёлки искусственные",
          },
          {
            name: "Электрогирлянды",
          },
          {
            name: "Уличные гирлянды",
          },
          {
            name: "Ёлочные украшения",
          },
          {
            name: "Символ года",
          },
        ],
      },
    ],
  },
  {
    name: "Детские товары",
    subcategories: [
      {
        name: "Подгузники, гигиена и уход",
        subcategories: [
          {
            name: "Подгузники, салфетки и пеленки",
          },
          {
            name: "Горшки и сиденья",
          },
          {
            name: "Пеленальные столики и доски",
          },
          {
            name: "Принадлежности для купания",
          },
          {
            name: "Косметика и гигиена",
          },
        ],
      },
      {
        name: "Детская комната",
        subcategories: [
          {
            name: "Детская мебель и аксессуары",
          },
          {
            name: "Матрасы и текстиль",
          },
          {
            name: "Защита и безопасность",
          },
        ],
      },
      {
        name: "Книги для детей",
        subcategories: [
          {
            name: "Топ-200 книг для детей",
          },
          {
            name: "Детская художественная литература",
          },
          {
            name: "Познавательная литература",
          },
          {
            name: "Книги для малышей",
          },
          {
            name: "Книги для родителей",
          },
        ],
      },
      {
        name: "Детский спорт",
        subcategories: [
          {
            name: "Детский транспорт",
          },
          {
            name: "Летний спорт",
          },
          {
            name: "Детская площадка",
          },
          {
            name: "Спорт дома",
          },
          {
            name: "Танцы и гимнастика",
          },
        ],
      },
      {
        name: "Питание и кормление",
        subcategories: [
          {
            name: "Детское питание",
          },
          {
            name: "Стульчики для кормления",
          },
          {
            name: "Бутылочки и аксессуары для кормления",
          },
          {
            name: "Молокоотсосы",
          },
          {
            name: "Стерилизаторы",
          },
        ],
      },
      {
        name: "Товары для школы и офиса",
        subcategories: [
          {
            name: "Рюкзаки, ранцы, сумки",
          },
          {
            name: "Тетради, блокноты, дневники",
          },
          {
            name: "Пеналы и письменные принадлежности",
          },
          {
            name: "Чертежные инструменты",
          },
          {
            name: "Канцелярские товары",
          },
        ],
      },
      {
        name: "Товары для мам и малышей",
        subcategories: [
          {
            name: "Питание и кормление",
          },
          {
            name: "Подгузники, гигиена и уход",
          },
          {
            name: "Стульчики для кормления",
          },
          {
            name: "Грудное вскармливание",
          },
          {
            name: "Искусственное вскармливание",
          },
        ],
      },
      {
        name: "Прогулки и путешествия",
        subcategories: [
          {
            name: "Автокресла",
          },
          {
            name: "Коляски",
          },
          {
            name: "Рюкзаки и сумки-кенгуру",
          },
          {
            name: "Слинги и накидки для кормления",
          },
          {
            name: "Конверты и спальные мешки",
          },
        ],
      },
      {
        name: "Хобби и творчество",
        subcategories: [
          {
            name: "Рисование и роспись",
          },
          {
            name: "Шитье и вышивание",
          },
          {
            name: "Пазлы и головоломки",
          },
          {
            name: "Поделки",
          },
          {
            name: "Сборные модели и аксессуары",
          },
        ],
      },
      {
        name: "Развитие и обучение",
        subcategories: [
          {
            name: "ТОП товары для лепки и развития моторики",
          },
          {
            name: "Развивающие пособия и материалы",
          },
          {
            name: "Наборы для опытов и исследований",
          },
          {
            name: "Пазлы",
          },
          {
            name: "Головоломки",
          },
        ],
      },
      {
        name: "Детская одежда и обувь",
        subcategories: [
          {
            name: "Для девочек",
          },
          {
            name: "Для мальчиков",
          },
          {
            name: "Для малышей",
          },
          {
            name: "Обувь",
          },
          {
            name: "Школьная одежда и обувь",
          },
        ],
      },
    ],
  },
  {
    name: "Красота",
    subcategories: [
      {
        name: "Телевизоры и аксессуары",
        subcategories: [
          {
            name: "Телевизоры",
          },
          {
            name: "Кронштейны и стойки",
          },
          {
            name: "Пульты ДУ",
          },
          {
            name: "3D-очки",
          },
          {
            name: "Антенны и запчасти для телевизоров",
          },
        ],
      },
      {
        name: "Наушники и аудиотехника",
        subcategories: [
          {
            name: "Акустические системы",
          },
          {
            name: "Наушники и Bluetooth-гарнитуры",
          },
          {
            name: "Аксессуары для наушников и гарнитур",
          },
          {
            name: "Умные колонки",
          },
          {
            name: "Беспроводные колонки",
          },
        ],
      },
      {
        name: "Фото- и видеокамеры",
        subcategories: [
          {
            name: "Цифровые фотоаппараты",
          },
          {
            name: "Объективы",
          },
          {
            name: "Экшн-камеры",
          },
          {
            name: "Видеокамеры",
          },
          {
            name: "Штативы, держатели и стедикамы",
          },
        ],
      },
      {
        name: "Умный дом",
        subcategories: [
          {
            name: "Умный дом Яндекса с Алисой",
          },
          {
            name: "Бытовая техника",
          },
          {
            name: "Климат",
          },
          {
            name: "Красота и здоровье",
          },
          {
            name: "Электроника",
          },
        ],
      },
      {
        name: "Робототехника и 3D-конструирование",
        subcategories: [
          {
            name: "Квадрокоптеры",
          },
          {
            name: "3D-принтеры",
          },
          {
            name: "Расходные материалы и аксессуары для 3D-принтеров",
          },
          {
            name: "3D-ручки",
          },
          {
            name: "Робототехника и конструкторы",
          },
        ],
      },
      {
        name: "Ноутбуки, планшеты и электронные книги",
        subcategories: [
          {
            name: "Ноутбуки",
          },
          {
            name: "Аксессуары для ноутбуков",
          },
          {
            name: "Гейминг",
          },
          {
            name: "Планшеты",
          },
          {
            name: "Аксессуары для планшетов",
          },
        ],
      },
      {
        name: "Умные колонки",
        subcategories: [
          {
            name: "Умные колонки Яндекс",
          },
          {
            name: "Умные колонки JBL",
          },
          {
            name: "Умные колонки Apple",
          },
          {
            name: "Умные колонки VK",
          },
          {
            name: "Умные колонки RAINBO",
          },
        ],
      },
      {
        name: "Гейминг",
        subcategories: [
          {
            name: "Все игровые приставки",
          },
          {
            name: "Ретроконсоли",
          },
          {
            name: "Игровые ноутбуки",
          },
          {
            name: "Игровые компьютеры",
          },
          {
            name: "Игры",
          },
        ],
      },
      {
        name: "Оргтехника и расходные материалы",
        subcategories: [
          {
            name: "Принтеры и МФУ",
          },
          {
            name: "Сканеры",
          },
          {
            name: "Уничтожители бумаг (шредеры)",
          },
          {
            name: "Режущие плоттеры",
          },
          {
            name: "Брошюровщики",
          },
        ],
      },
      {
        name: "Электронные музыкальные инструменты",
        subcategories: [
          {
            name: "Синтезаторы и MIDI-клавиатуры",
          },
          {
            name: "Аксессуары для клавишных",
          },
          {
            name: "Электрогитары и бас-гитары",
          },
          {
            name: "Электронные скрипки и контрабасы",
          },
          {
            name: "Электронные ударные установки",
          },
        ],
      },
      {
        name: "Услуги установки",
        subcategories: [],
      },
      {
        name: "Компьютеры и комплектующие",
        subcategories: [
          {
            name: "Мониторы",
          },
          {
            name: "Моноблоки",
          },
          {
            name: "Системные блоки",
          },
          {
            name: "Гейминг",
          },
          {
            name: "Комплектующие для компьютера",
          },
        ],
      },
      {
        name: "Цифровые товары",
        subcategories: [
          {
            name: "Цифровые и подарочные сертификаты",
          },
          {
            name: "Онлайн-подписки",
          },
          {
            name: "Карты пополнения счета",
          },
          {
            name: "Игры для приставок и ПК",
          },
          {
            name: "Программы",
          },
        ],
      },
      {
        name: "Видеотехника",
        subcategories: [
          {
            name: "Мультимедиа-проекторы",
          },
          {
            name: "Экраны",
          },
          {
            name: "Интерактивные доски и аксессуары",
          },
          {
            name: "Оверхед и слайд-проекторы",
          },
          {
            name: "Аксессуары и запчасти для проекторов",
          },
        ],
      },
      {
        name: "Сетевое оборудование и связь",
        subcategories: [
          {
            name: "Беспроводное оборудование",
          },
          {
            name: "Проводные маршрутизаторы и коммутаторы",
          },
          {
            name: "Сетевые хранилища (NAS)",
          },
          {
            name: "3G/4G LTE и ADSL модемы",
          },
          {
            name: "Оборудование для конференций",
          },
        ],
      },
      {
        name: "Автомобильная электроника",
        subcategories: [
          {
            name: "Видеорегистраторы",
          },
          {
            name: "Автомагнитолы",
          },
          {
            name: "Автоакустика",
          },
          {
            name: "Усилители",
          },
          {
            name: "Автомобильные телевизоры",
          },
        ],
      },
      {
        name: "Аксессуары для электроники",
        subcategories: [
          {
            name: "Кабели, разъемы, переходники",
          },
          {
            name: "Удлинители и сетевые фильтры",
          },
          {
            name: "USB-концентраторы",
          },
          {
            name: "Держатели для проводов",
          },
          {
            name: "Батарейки и аккумуляторы",
          },
        ],
      },
    ],
  },
  {
    name: "Электроника",
    subcategories: [
      {
        name: "Рабочее место",
        subcategories: [
          {
            name: "Рабочие столы",
          },
          {
            name: "Рабочие кресла",
          },
          {
            name: "Офисные тумбы и комоды",
          },
          {
            name: "Шкафы для документов",
          },
          {
            name: "Стеллажи и этажерки",
          },
        ],
      },
      {
        name: "Мебель для геймеров",
        subcategories: [
          {
            name: "Столы для геймеров",
          },
          {
            name: "Стулья для геймеров",
          },
        ],
      },
      {
        name: "Мебель для гостиной",
        subcategories: [
          {
            name: "Мягкая мебель",
          },
          {
            name: "Журнальные столики",
          },
          {
            name: "Стеллажи и этажерки",
          },
          {
            name: "Шкафы витрины",
          },
          {
            name: "Стенки для гостиной",
          },
        ],
      },
      {
        name: "Садовая и уличная мебель",
        subcategories: [
          {
            name: "Столы для сада и улицы",
          },
          {
            name: "Стулья и кресла для сада и улицы",
          },
          {
            name: "Подвесные кресла",
          },
          {
            name: "Скамейки и диваны",
          },
          {
            name: "Гамаки",
          },
        ],
      },
      {
        name: "Столы и стулья",
        subcategories: [
          {
            name: "Компьютерные кресла",
          },
          {
            name: "Столы компьютерные и письменные",
          },
          {
            name: "Столы и столики",
          },
          {
            name: "Стулья, табуретки",
          },
          {
            name: "Банкетки, пуфики, скамьи",
          },
        ],
      },
      {
        name: "Гардеробы, шкафы и комоды",
        subcategories: [
          {
            name: "Гардеробные системы",
          },
          {
            name: "Шкафы для одежды",
          },
          {
            name: "Тумбы и комоды",
          },
        ],
      },
      {
        name: "Мебель для спальни",
        subcategories: [
          {
            name: "Кровати",
          },
          {
            name: "Матрасы",
          },
          {
            name: "Прикроватные тумбы",
          },
          {
            name: "Кушетки",
          },
          {
            name: "Раскладушки",
          },
        ],
      },
      {
        name: "Мебель для прихожей",
        subcategories: [
          {
            name: "Обувницы",
          },
          {
            name: "Вешалки (рейлы)",
          },
          {
            name: "Пуфики, банкетки и скамьи",
          },
          {
            name: "Шкафы",
          },
          {
            name: "Комплекты для прихожей",
          },
        ],
      },
      {
        name: "Детская мебель",
        subcategories: [
          {
            name: "Кровати",
          },
          {
            name: "Матрасы",
          },
          {
            name: "Шкафы для детской",
          },
          {
            name: "Комоды",
          },
          {
            name: "Стеллажи для детской",
          },
        ],
      },
      {
        name: "Надувная мебель",
        subcategories: [
          {
            name: "Надувные диваны",
          },
          {
            name: "Надувные кресла",
          },
          {
            name: "Надувные матрасы",
          },
          {
            name: "Диваны надувные",
          },
          {
            name: "Комплекты надувной мебели",
          },
        ],
      },
      {
        name: "Шкафы",
        subcategories: [
          {
            name: "Шкафы для одежды",
          },
          {
            name: "Шкафы для гостиной",
          },
          {
            name: "Шкафы для ванных",
          },
          {
            name: "Шкафы кухонные навесные",
          },
          {
            name: "Антресоли мебельные",
          },
        ],
      },
      {
        name: "Кухонные столы и стулья",
        subcategories: [
          {
            name: "Кухонные столы",
          },
          {
            name: "Кухонные стулья и табуретки",
          },
          {
            name: "Обеденные группы",
          },
          {
            name: "Кухонные уголки и диваны",
          },
          {
            name: "Барные столы",
          },
        ],
      },
      {
        name: "Мебель для кухни",
        subcategories: [
          {
            name: "Кухонные гарнитуры",
          },
          {
            name: "Модули кухонные напольные",
          },
          {
            name: "Шкафы витрины",
          },
          {
            name: "Столешницы кухонные",
          },
          {
            name: "Кухонные фартуки на стену",
          },
        ],
      },
      {
        name: "Мебель для ванной",
        subcategories: [
          {
            name: "Тумбы для ванной",
          },
          {
            name: "Шкафы для ванных комнат",
          },
          {
            name: "Мебель для ванных комнат",
          },
          {
            name: "Тележки и этажерки на колесах",
          },
          {
            name: "Полки, этажерки",
          },
        ],
      },
      {
        name: "Готовые комплекты",
        subcategories: [
          {
            name: "Спальни",
          },
          {
            name: "Кухонные гарнитуры",
          },
          {
            name: "Гостиные",
          },
          {
            name: "Прихожие",
          },
          {
            name: "Мебель для ванных комнат",
          },
        ],
      },
      {
        name: "Фурнитура для мебели и комплектующие",
        subcategories: [
          {
            name: "Фурнитура для мебели",
          },
          {
            name: "Комплектующие",
          },
          {
            name: "Насосы и аксессуары",
          },
        ],
      },
      {
        name: "Услуги установки мебели",
        subcategories: [],
      },
    ],
  },
  {
    name: "Бытовая техника",
    subcategories: [
      {
        name: "Уход за телом",
        subcategories: [
          {
            name: "Для душа",
          },
          {
            name: "Мыло",
          },
          {
            name: "Кремы и масла",
          },
          {
            name: "Дезодоранты для женщин",
          },
          {
            name: "Дезодоранты для мужчин",
          },
        ],
      },
      {
        name: "Защита от солнца",
        subcategories: [
          {
            name: "Детские солнцезащитные средства",
          },
          {
            name: "Защита от солнца для лица",
          },
          {
            name: "Защита от солнца для тела",
          },
          {
            name: "Средства для загара",
          },
          {
            name: "Автозагар",
          },
        ],
      },
      {
        name: "Мужчинам",
        subcategories: [
          {
            name: "Электробритвы",
          },
          {
            name: "Бритвы и лезвия",
          },
          {
            name: "Средства для бритья",
          },
          {
            name: "Уход для бороды и усов",
          },
          {
            name: "Аксессуары для бороды и усов",
          },
        ],
      },
      {
        name: "Профессиональная косметика",
        subcategories: [
          {
            name: "Уход за волосами",
          },
          {
            name: "Уход за лицом",
          },
          {
            name: "Уход за телом",
          },
          {
            name: "Макияж",
          },
          {
            name: "Мужчинам",
          },
        ],
      },
      {
        name: "Натуральная косметика",
        subcategories: [
          {
            name: "Уход за волосами",
          },
          {
            name: "Уход за лицом",
          },
          {
            name: "Уход за телом",
          },
          {
            name: "Детям и мамам",
          },
          {
            name: "Макияж",
          },
        ],
      },
      {
        name: "Уход за волосами",
        subcategories: [
          {
            name: "Шампуни",
          },
          {
            name: "Маски и сыворотки",
          },
          {
            name: "Бальзамы и ополаскиватели",
          },
          {
            name: "Сухие и твердые шампуни",
          },
          {
            name: "Наборы",
          },
        ],
      },
      {
        name: "Макияж",
        subcategories: [
          {
            name: "Снятие макияжа",
          },
          {
            name: "Для лица",
          },
          {
            name: "Для глаз",
          },
          {
            name: "Для бровей",
          },
          {
            name: "Для губ",
          },
        ],
      },
      {
        name: "Косметические наборы",
        subcategories: [
          {
            name: "Мужские",
          },
          {
            name: "Парфюмерные",
          },
          {
            name: "Для волос",
          },
          {
            name: "Для лица",
          },
          {
            name: "Для тела",
          },
        ],
      },
      {
        name: "Уход за ногтями",
        subcategories: [
          {
            name: "Принадлежности для маникюра и педикюра",
          },
          {
            name: "Уход и лечение",
          },
          {
            name: "Уход за руками",
          },
          {
            name: "Уход за ногами",
          },
          {
            name: "Окрашивание ногтей",
          },
        ],
      },
      {
        name: "Азиатская косметика",
        subcategories: [
          {
            name: "Уход за волосами",
          },
          {
            name: "Уход за лицом",
          },
          {
            name: "Уход за телом",
          },
          {
            name: "Макияж",
          },
          {
            name: "Мужчинам",
          },
        ],
      },
      {
        name: "Детская косметика и духи",
        subcategories: [],
      },
      {
        name: "Уход за лицом",
        subcategories: [
          {
            name: "Кремы и сыворотки",
          },
          {
            name: "Уход за кожей вокруг глаз",
          },
          {
            name: "Средства для умывания",
          },
          {
            name: "Наборы",
          },
          {
            name: "Маски",
          },
        ],
      },
      {
        name: "Парфюмерия",
        subcategories: [
          {
            name: "Женская",
          },
          {
            name: "Мужская",
          },
          {
            name: "Унисекс",
          },
          {
            name: "Нишевая",
          },
          {
            name: "Люксовая",
          },
        ],
      },
      {
        name: "Премиальная косметика",
        subcategories: [
          {
            name: "Уход за лицом",
          },
          {
            name: "Уход за телом",
          },
          {
            name: "Макияж",
          },
          {
            name: "Уход за волосами",
          },
          {
            name: "Парфюмерия",
          },
        ],
      },
      {
        name: "Инструменты и аксессуары",
        subcategories: [
          {
            name: "Зеркала косметические",
          },
          {
            name: "Кисти, спонжи для макияжа",
          },
          {
            name: "Роллеры для лица",
          },
          {
            name: "Роллеры для тела",
          },
          {
            name: "Лампы-лупы",
          },
        ],
      },
      {
        name: "Ароматерапия",
        subcategories: [
          {
            name: "Эфирные масла",
          },
          {
            name: "Аксессуары",
          },
          {
            name: "Благовония",
          },
          {
            name: "Аромалампы",
          },
        ],
      },
    ],
  },
  {
    name: "Цветы",
    subcategories: [
      {
        name: "Выбор флориста",
        subcategories: [],
      },
      {
        name: "Монобукеты",
        subcategories: [
          {
            name: "Букеты из роз",
          },
          {
            name: "Букеты из хризантем",
          },
          {
            name: "Букеты из орхидей",
          },
          {
            name: "Букеты из пионов",
          },
        ],
      },
      {
        name: "Выгодно",
        subcategories: [],
      },
      {
        name: "Эксклюзивно на Маркете",
        subcategories: [],
      },
      {
        name: "Премиальные букеты",
        subcategories: [
          {
            name: "Монобукеты",
          },
          {
            name: "Сборные букеты",
          },
        ],
      },
      {
        name: "Сезон пионов",
        subcategories: [],
      },
      {
        name: "Авторские букеты",
        subcategories: [],
      },
    ],
  },
  {
    name: "Дача и сад",
    subcategories: [
      {
        name: "Уход за растениями",
        subcategories: [
          {
            name: "Удобрения",
          },
          {
            name: "Средства для защиты растений",
          },
          {
            name: "Выращивание рассады",
          },
          {
            name: "Фитолампы",
          },
          {
            name: "Субстраты, грунты, мульча",
          },
        ],
      },
      {
        name: "Души, умывальники, туалеты",
        subcategories: [
          {
            name: "Биотуалеты",
          },
          {
            name: "Души",
          },
          {
            name: "Умывальники",
          },
          {
            name: "Жидкости и наполнители для биотуалетов",
          },
          {
            name: "Аксессуары и комплектующие",
          },
        ],
      },
      {
        name: "Аксессуары для полива",
        subcategories: [
          {
            name: "Шланги и комплекты для полива",
          },
          {
            name: "Капельный полив",
          },
          {
            name: "Системы управления поливом",
          },
          {
            name: "Пистолеты, насадки, дождеватели",
          },
          {
            name: "Катушки, кронштейны и направляющие",
          },
        ],
      },
      {
        name: "Садовые инструменты",
        subcategories: [
          {
            name: "Снегоуборочные лопаты",
          },
          {
            name: "Ледорубы и скребки",
          },
          {
            name: "Топоры",
          },
          {
            name: "Канистры",
          },
          {
            name: "Секаторы, высоторезы, сучкорезы",
          },
        ],
      },
      {
        name: "Газоны, саженцы, семена",
        subcategories: [
          {
            name: "Газоны",
          },
          {
            name: "Луковичные растения",
          },
          {
            name: "Лук севок, семенной картофель, чеснок",
          },
          {
            name: "Рассада, саженцы, кустарники, деревья",
          },
          {
            name: "Семена овощей, ягод и цветов",
          },
        ],
      },
      {
        name: "Бассейны и аксессуары",
        subcategories: [
          {
            name: "Бассейны",
          },
          {
            name: "Фильтры, насосы и хлоргенераторы",
          },
          {
            name: "Пылесосы",
          },
          {
            name: "Аксессуары",
          },
          {
            name: "Химические средства",
          },
        ],
      },
      {
        name: "Фонтаны и садовый декор",
        subcategories: [
          {
            name: "Садовый декор",
          },
          {
            name: "Фонтаны и пруды",
          },
        ],
      },
      {
        name: "Сауны и бани",
        subcategories: [
          {
            name: "Сауны",
          },
          {
            name: "Печи для бани",
          },
          {
            name: "Парогенераторы",
          },
          {
            name: "Аксессуары",
          },
          {
            name: "Бочки и купели",
          },
        ],
      },
      {
        name: "Пикник, барбекю, гриль",
        subcategories: [
          {
            name: "Грили, барбекю, коптильни",
          },
          {
            name: "Мангалы",
          },
          {
            name: "Средства для розжига",
          },
          {
            name: "Аксессуары для грилей и мангалов",
          },
          {
            name: "Шампуры",
          },
        ],
      },
      {
        name: "Садовая мебель",
        subcategories: [
          {
            name: "Качели и аксессуары",
          },
          {
            name: "Подвесные кресла",
          },
          {
            name: "Лежаки и шезлонги",
          },
          {
            name: "Шатры",
          },
          {
            name: "Зонты от солнца",
          },
        ],
      },
      {
        name: "Парники и теплицы",
        subcategories: [
          {
            name: "Теплицы и каркасы",
          },
          {
            name: "Парники и дуги",
          },
        ],
      },
    ],
  },
  {
    name: "Продукты питания",
    subcategories: [
      {
        name: "Вода, соки, напитки",
        subcategories: [
          {
            name: "Вода",
          },
          {
            name: "Соки и нектары",
          },
          {
            name: "Лимонады и газированные напитки",
          },
          {
            name: "Растительные напитки",
          },
          {
            name: "Холодный чай",
          },
        ],
      },
      {
        name: "Макароны, крупы",
        subcategories: [
          {
            name: "Макароны",
          },
          {
            name: "Этнические макаронные изделия",
          },
          {
            name: "Геркулес и хлопья",
          },
          {
            name: "Готовые завтраки, мюсли, гранола",
          },
          {
            name: "Рис",
          },
        ],
      },
      {
        name: "Консервация",
        subcategories: [
          {
            name: "Мясная",
          },
          {
            name: "Рыбная",
          },
          {
            name: "Овощная",
          },
          {
            name: "Блюда готовые",
          },
          {
            name: "Маслины, оливки, каперсы",
          },
        ],
      },
      {
        name: "Все для выпечки",
        subcategories: [
          {
            name: "Мука и смеси для выпечки",
          },
          {
            name: "Сахарозаменители",
          },
          {
            name: "Сахар",
          },
          {
            name: "Дрожжи",
          },
          {
            name: "Сухое молоко, сливки",
          },
        ],
      },
      {
        name: "Здоровое питание",
        subcategories: [
          {
            name: "Без глютена",
          },
          {
            name: "Без лактозы",
          },
          {
            name: "Без сахара",
          },
          {
            name: "Полезные жиры",
          },
          {
            name: "Полезный перекус",
          },
        ],
      },
      {
        name: "Мясная гастрономия",
        subcategories: [
          {
            name: "Мясо",
          },
          {
            name: "Птица",
          },
          {
            name: "Субпродукты мясные",
          },
          {
            name: "Полуфабрикаты из мяса",
          },
          {
            name: "Субпродукты из птицы",
          },
        ],
      },
      {
        name: "Фрукты, овощи и грибы",
        subcategories: [
          {
            name: "Грибы",
          },
          {
            name: "Овощи",
          },
          {
            name: "Фрукты",
          },
          {
            name: "Ягоды",
          },
          {
            name: "Зелень, салаты",
          },
        ],
      },
      {
        name: "Подарочные сертификаты",
        subcategories: [],
      },
      {
        name: "Кондитерские изделия",
        subcategories: [
          {
            name: "Конфеты",
          },
          {
            name: "Шоколадная плитка",
          },
          {
            name: "Шоколадная и ореховая паста",
          },
          {
            name: "Шоколадные яйца и фигурный шоколад",
          },
          {
            name: "Шоколадные батончики",
          },
        ],
      },
      {
        name: "Снеки",
        subcategories: [
          {
            name: "Батончики мюсли",
          },
          {
            name: "Чипсы",
          },
          {
            name: "Сухарики",
          },
          {
            name: "Снеки, закуски",
          },
          {
            name: "Попкорн",
          },
        ],
      },
      {
        name: "Соусы, кетчупы",
        subcategories: [
          {
            name: "Соусы",
          },
          {
            name: "Кетчуп",
          },
          {
            name: "Томатная паста",
          },
          {
            name: "Уксус",
          },
          {
            name: "Аджика, маринады",
          },
        ],
      },
      {
        name: "Приправы и специи",
        subcategories: [
          {
            name: "Специи",
          },
          {
            name: "Приправы",
          },
          {
            name: "Подарочные наборы с пряностями и специями",
          },
          {
            name: "Соль",
          },
        ],
      },
      {
        name: "Десертные соусы, варенье, мед",
        subcategories: [
          {
            name: "Десертные соусы и топпинги",
          },
          {
            name: "Варенье, повидло, протертые ягоды",
          },
          {
            name: "Мед и продукты пчеловодства",
          },
          {
            name: "Фрукты и ягоды консервированные",
          },
          {
            name: "Сгущенное молоко",
          },
        ],
      },
      {
        name: "Хлеб и хлебобулочные изделия",
        subcategories: [
          {
            name: "Хлеб, лаваши",
          },
          {
            name: "Выпечка и сдоба",
          },
          {
            name: "Хлебцы",
          },
        ],
      },
      {
        name: "Рыбная гастрономия",
        subcategories: [
          {
            name: "Икра",
          },
          {
            name: "Рыба соленая, копченая",
          },
          {
            name: "Пресервы",
          },
          {
            name: "Крабовое мясо и палочки",
          },
          {
            name: "Морепродукты свежие",
          },
        ],
      },
      {
        name: "Кулинария",
        subcategories: [
          {
            name: "Завтраки",
          },
          {
            name: "Оладьи, блинчики, пирожки",
          },
          {
            name: "Холодные блюда и закуски",
          },
          {
            name: "Соленые овощи и грибы",
          },
          {
            name: "Салаты",
          },
        ],
      },
      {
        name: "Алкоголь",
        subcategories: [
          {
            name: "Безалкогольное пиво и вино",
          },
          {
            name: "Вино",
          },
          {
            name: "Шампанское и игристое вино",
          },
          {
            name: "Крепленое вино",
          },
          {
            name: "Коньяк и бренди",
          },
        ],
      },
      {
        name: "Орехи, семена, сухофрукты",
        subcategories: [
          {
            name: "Орехи",
          },
          {
            name: "Смеси из орехов и сухофруктов",
          },
          {
            name: "Сухофрукты",
          },
          {
            name: "Семечки и семена",
          },
          {
            name: "Суперфуды",
          },
        ],
      },
      {
        name: "Масло растительное",
        subcategories: [
          {
            name: "Подсолнечное",
          },
          {
            name: "Оливковое",
          },
          {
            name: "Кокосовое",
          },
          {
            name: "Льняное",
          },
          {
            name: "Кунжутное",
          },
        ],
      },
      {
        name: "Блюда быстрого приготовления",
        subcategories: [
          {
            name: "Каши",
          },
          {
            name: "Пюре и лапша",
          },
          {
            name: "Супы, бульоны",
          },
        ],
      },
      {
        name: "Этническая кухня",
        subcategories: [
          {
            name: "Наборы и ингредиенты",
          },
          {
            name: "Этнические макаронные изделия",
          },
        ],
      },
      {
        name: "Молоко, сыр, яйца",
        subcategories: [
          {
            name: "Молоко",
          },
          {
            name: "Сливки",
          },
          {
            name: "Растительные продукты",
          },
          {
            name: "Кисломолочная продукция",
          },
          {
            name: "Творог",
          },
        ],
      },
      {
        name: "Замороженные продукты",
        subcategories: [
          {
            name: "Рыба и морепродукты",
          },
          {
            name: "Блюда и полуфабрикаты",
          },
          {
            name: "Мясо и птица",
          },
          {
            name: "Овощи, фрукты, грибы",
          },
          {
            name: "Мороженое",
          },
        ],
      },
      {
        name: "Подарочные наборы",
        subcategories: [],
      },
    ],
  },
  {
    name: "Строительство и ремонт",
    subcategories: [
      {
        name: "Водоснабжение",
        subcategories: [
          {
            name: "Насосы и комплектующие",
          },
          {
            name: "Фильтры для воды и комплектующие",
          },
          {
            name: "Септики",
          },
          {
            name: "Сифоны и трапы",
          },
          {
            name: "Расширительные баки и комплектующие",
          },
        ],
      },
      {
        name: "Электрика",
        subcategories: [
          {
            name: "Провода, кабели",
          },
          {
            name: "Автоматы, УЗО, дифавтоматы",
          },
          {
            name: "Изделия для электромонтажа",
          },
          {
            name: "Системы безопасности",
          },
          {
            name: "Устройства электропитания и электростанции",
          },
        ],
      },
      {
        name: "Двери, окна, лестницы и аксессуары",
        subcategories: [
          {
            name: "Входные двери",
          },
          {
            name: "Межкомнатные двери и коробки",
          },
          {
            name: "Окна, балконные двери, подоконники",
          },
          {
            name: "Ручки, замки и фурнитура для окон и дверей",
          },
          {
            name: "Домофоны, звонки и системы безопасности",
          },
        ],
      },
      {
        name: "Силовая техника",
        subcategories: [
          {
            name: "Генераторы",
          },
          {
            name: "Сварочное оборудование",
          },
          {
            name: "Воздушные компрессоры",
          },
          {
            name: "Пневмоинструмент",
          },
          {
            name: "Грузоподъемная техника",
          },
        ],
      },
      {
        name: "Отопление",
        subcategories: [
          {
            name: "Отопительные котлы и комплектующие для котлов",
          },
          {
            name: "Обогреватели",
          },
          {
            name: "Тепловые пушки",
          },
          {
            name: "Полотенцесушители и аксессуары",
          },
          {
            name: "Радиаторы и комплектующие",
          },
        ],
      },
      {
        name: "Строительные материалы",
        subcategories: [
          {
            name: "Лакокрасочные материалы",
          },
          {
            name: "Изоляционные материалы",
          },
          {
            name: "Строительные смеси",
          },
          {
            name: "Листовые материалы",
          },
          {
            name: "Кирпич и общестроительные материалы",
          },
        ],
      },
      {
        name: "Крепеж и фурнитура",
        subcategories: [
          {
            name: "Крепеж",
          },
          {
            name: "Ручки, замки для окон и дверей",
          },
          {
            name: "Фурнитура для мебели",
          },
          {
            name: "Такелаж",
          },
        ],
      },
      {
        name: "Сантехника",
        subcategories: [
          {
            name: "Смесители",
          },
          {
            name: "Ванны",
          },
          {
            name: "Раковины, пьедесталы",
          },
          {
            name: "Кухонные мойки",
          },
          {
            name: "Унитазы, писсуары, биде, инсталляции",
          },
        ],
      },
      {
        name: "Вентиляция",
        subcategories: [
          {
            name: "Вентиляционные установки",
          },
          {
            name: "Вентиляторы вытяжные",
          },
          {
            name: "Канальные вентиляторы",
          },
          {
            name: "Вентиляционные решетки, диффузоры и анемостаты",
          },
          {
            name: "Канальные нагреватели и охладители",
          },
        ],
      },
      {
        name: "Отделочные материалы",
        subcategories: [
          {
            name: "Керамическая плитка и керамогранит",
          },
          {
            name: "Лакокрасочные материалы",
          },
          {
            name: "Обои",
          },
          {
            name: "Напольные покрытия",
          },
          {
            name: "Декоративные настенные покрытия",
          },
        ],
      },
      {
        name: "Строительная техника",
        subcategories: [],
      },
    ],
  },
  {
    name: "Мебель",
    subcategories: [
      {
        name: "Рабочее место",
        subcategories: [
          {
            name: "Рабочие столы",
          },
          {
            name: "Рабочие кресла",
          },
          {
            name: "Офисные тумбы и комоды",
          },
          {
            name: "Шкафы для документов",
          },
          {
            name: "Стеллажи и этажерки",
          },
        ],
      },
      {
        name: "Мебель для геймеров",
        subcategories: [
          {
            name: "Столы для геймеров",
          },
          {
            name: "Стулья для геймеров",
          },
        ],
      },
      {
        name: "Мебель для гостиной",
        subcategories: [
          {
            name: "Мягкая мебель",
          },
          {
            name: "Журнальные столики",
          },
          {
            name: "Стеллажи и этажерки",
          },
          {
            name: "Шкафы витрины",
          },
          {
            name: "Стенки для гостиной",
          },
        ],
      },
      {
        name: "Садовая и уличная мебель",
        subcategories: [
          {
            name: "Столы для сада и улицы",
          },
          {
            name: "Стулья и кресла для сада и улицы",
          },
          {
            name: "Подвесные кресла",
          },
          {
            name: "Скамейки и диваны",
          },
          {
            name: "Гамаки",
          },
        ],
      },
      {
        name: "Столы и стулья",
        subcategories: [
          {
            name: "Компьютерные кресла",
          },
          {
            name: "Столы компьютерные и письменные",
          },
          {
            name: "Столы и столики",
          },
          {
            name: "Стулья, табуретки",
          },
          {
            name: "Банкетки, пуфики, скамьи",
          },
        ],
      },
      {
        name: "Гардеробы, шкафы и комоды",
        subcategories: [
          {
            name: "Гардеробные системы",
          },
          {
            name: "Шкафы для одежды",
          },
          {
            name: "Тумбы и комоды",
          },
        ],
      },
      {
        name: "Мебель для спальни",
        subcategories: [
          {
            name: "Кровати",
          },
          {
            name: "Матрасы",
          },
          {
            name: "Прикроватные тумбы",
          },
          {
            name: "Кушетки",
          },
          {
            name: "Раскладушки",
          },
        ],
      },
      {
        name: "Мебель для прихожей",
        subcategories: [
          {
            name: "Обувницы",
          },
          {
            name: "Вешалки (рейлы)",
          },
          {
            name: "Пуфики, банкетки и скамьи",
          },
          {
            name: "Шкафы",
          },
          {
            name: "Комплекты для прихожей",
          },
        ],
      },
      {
        name: "Детская мебель",
        subcategories: [
          {
            name: "Кровати",
          },
          {
            name: "Матрасы",
          },
          {
            name: "Шкафы для детской",
          },
          {
            name: "Комоды",
          },
          {
            name: "Стеллажи для детской",
          },
        ],
      },
      {
        name: "Надувная мебель",
        subcategories: [
          {
            name: "Надувные диваны",
          },
          {
            name: "Надувные кресла",
          },
          {
            name: "Надувные матрасы",
          },
          {
            name: "Диваны надувные",
          },
          {
            name: "Комплекты надувной мебели",
          },
        ],
      },
      {
        name: "Шкафы",
        subcategories: [
          {
            name: "Шкафы для одежды",
          },
          {
            name: "Шкафы для гостиной",
          },
          {
            name: "Шкафы для ванных",
          },
          {
            name: "Шкафы кухонные навесные",
          },
          {
            name: "Антресоли мебельные",
          },
        ],
      },
      {
        name: "Кухонные столы и стулья",
        subcategories: [
          {
            name: "Кухонные столы",
          },
          {
            name: "Кухонные стулья и табуретки",
          },
          {
            name: "Обеденные группы",
          },
          {
            name: "Кухонные уголки и диваны",
          },
          {
            name: "Барные столы",
          },
        ],
      },
      {
        name: "Мебель для кухни",
        subcategories: [
          {
            name: "Кухонные гарнитуры",
          },
          {
            name: "Модули кухонные напольные",
          },
          {
            name: "Шкафы витрины",
          },
          {
            name: "Столешницы кухонные",
          },
          {
            name: "Кухонные фартуки на стену",
          },
        ],
      },
      {
        name: "Мебель для ванной",
        subcategories: [
          {
            name: "Тумбы для ванной",
          },
          {
            name: "Шкафы для ванных комнат",
          },
          {
            name: "Мебель для ванных комнат",
          },
          {
            name: "Тележки и этажерки на колесах",
          },
          {
            name: "Полки, этажерки",
          },
        ],
      },
      {
        name: "Готовые комплекты",
        subcategories: [
          {
            name: "Спальни",
          },
          {
            name: "Кухонные гарнитуры",
          },
          {
            name: "Гостиные",
          },
          {
            name: "Прихожие",
          },
          {
            name: "Мебель для ванных комнат",
          },
        ],
      },
      {
        name: "Фурнитура для мебели и комплектующие",
        subcategories: [
          {
            name: "Фурнитура для мебели",
          },
          {
            name: "Комплектующие",
          },
          {
            name: "Насосы и аксессуары",
          },
        ],
      },
      {
        name: "Услуги установки мебели",
        subcategories: [],
      },
    ],
  },
  {
    name: "Скидки и акции",
    subcategories: [
      {
        name: "Вода, соки, напитки",
        subcategories: [
          {
            name: "Вода",
          },
          {
            name: "Соки и нектары",
          },
          {
            name: "Лимонады и газированные напитки",
          },
          {
            name: "Растительные напитки",
          },
          {
            name: "Холодный чай",
          },
        ],
      },
      {
        name: "Макароны, крупы",
        subcategories: [
          {
            name: "Макароны",
          },
          {
            name: "Этнические макаронные изделия",
          },
          {
            name: "Геркулес и хлопья",
          },
          {
            name: "Готовые завтраки, мюсли, гранола",
          },
          {
            name: "Рис",
          },
        ],
      },
      {
        name: "Консервация",
        subcategories: [
          {
            name: "Мясная",
          },
          {
            name: "Рыбная",
          },
          {
            name: "Овощная",
          },
          {
            name: "Блюда готовые",
          },
          {
            name: "Маслины, оливки, каперсы",
          },
        ],
      },
      {
        name: "Все для выпечки",
        subcategories: [
          {
            name: "Мука и смеси для выпечки",
          },
          {
            name: "Сахарозаменители",
          },
          {
            name: "Сахар",
          },
          {
            name: "Дрожжи",
          },
          {
            name: "Сухое молоко, сливки",
          },
        ],
      },
      {
        name: "Здоровое питание",
        subcategories: [
          {
            name: "Без глютена",
          },
          {
            name: "Без лактозы",
          },
          {
            name: "Без сахара",
          },
          {
            name: "Полезные жиры",
          },
          {
            name: "Полезный перекус",
          },
        ],
      },
      {
        name: "Мясная гастрономия",
        subcategories: [
          {
            name: "Мясо",
          },
          {
            name: "Птица",
          },
          {
            name: "Субпродукты мясные",
          },
          {
            name: "Полуфабрикаты из мяса",
          },
          {
            name: "Субпродукты из птицы",
          },
        ],
      },
      {
        name: "Фрукты, овощи и грибы",
        subcategories: [
          {
            name: "Грибы",
          },
          {
            name: "Овощи",
          },
          {
            name: "Фрукты",
          },
          {
            name: "Ягоды",
          },
          {
            name: "Зелень, салаты",
          },
        ],
      },
      {
        name: "Подарочные сертификаты",
        subcategories: [],
      },
      {
        name: "Кондитерские изделия",
        subcategories: [
          {
            name: "Конфеты",
          },
          {
            name: "Шоколадная плитка",
          },
          {
            name: "Шоколадная и ореховая паста",
          },
          {
            name: "Шоколадные яйца и фигурный шоколад",
          },
          {
            name: "Шоколадные батончики",
          },
        ],
      },
      {
        name: "Снеки",
        subcategories: [
          {
            name: "Батончики мюсли",
          },
          {
            name: "Чипсы",
          },
          {
            name: "Сухарики",
          },
          {
            name: "Снеки, закуски",
          },
          {
            name: "Попкорн",
          },
        ],
      },
      {
        name: "Соусы, кетчупы",
        subcategories: [
          {
            name: "Соусы",
          },
          {
            name: "Кетчуп",
          },
          {
            name: "Томатная паста",
          },
          {
            name: "Уксус",
          },
          {
            name: "Аджика, маринады",
          },
        ],
      },
      {
        name: "Приправы и специи",
        subcategories: [
          {
            name: "Специи",
          },
          {
            name: "Приправы",
          },
          {
            name: "Подарочные наборы с пряностями и специями",
          },
          {
            name: "Соль",
          },
        ],
      },
      {
        name: "Десертные соусы, варенье, мед",
        subcategories: [
          {
            name: "Десертные соусы и топпинги",
          },
          {
            name: "Варенье, повидло, протертые ягоды",
          },
          {
            name: "Мед и продукты пчеловодства",
          },
          {
            name: "Фрукты и ягоды консервированные",
          },
          {
            name: "Сгущенное молоко",
          },
        ],
      },
      {
        name: "Хлеб и хлебобулочные изделия",
        subcategories: [
          {
            name: "Хлеб, лаваши",
          },
          {
            name: "Выпечка и сдоба",
          },
          {
            name: "Хлебцы",
          },
        ],
      },
      {
        name: "Рыбная гастрономия",
        subcategories: [
          {
            name: "Икра",
          },
          {
            name: "Рыба соленая, копченая",
          },
          {
            name: "Пресервы",
          },
          {
            name: "Крабовое мясо и палочки",
          },
          {
            name: "Морепродукты свежие",
          },
        ],
      },
      {
        name: "Кулинария",
        subcategories: [
          {
            name: "Завтраки",
          },
          {
            name: "Оладьи, блинчики, пирожки",
          },
          {
            name: "Холодные блюда и закуски",
          },
          {
            name: "Соленые овощи и грибы",
          },
          {
            name: "Салаты",
          },
        ],
      },
      {
        name: "Алкоголь",
        subcategories: [
          {
            name: "Безалкогольное пиво и вино",
          },
          {
            name: "Вино",
          },
          {
            name: "Шампанское и игристое вино",
          },
          {
            name: "Крепленое вино",
          },
          {
            name: "Коньяк и бренди",
          },
        ],
      },
      {
        name: "Орехи, семена, сухофрукты",
        subcategories: [
          {
            name: "Орехи",
          },
          {
            name: "Смеси из орехов и сухофруктов",
          },
          {
            name: "Сухофрукты",
          },
          {
            name: "Семечки и семена",
          },
          {
            name: "Суперфуды",
          },
        ],
      },
      {
        name: "Масло растительное",
        subcategories: [
          {
            name: "Подсолнечное",
          },
          {
            name: "Оливковое",
          },
          {
            name: "Кокосовое",
          },
          {
            name: "Льняное",
          },
          {
            name: "Кунжутное",
          },
        ],
      },
      {
        name: "Блюда быстрого приготовления",
        subcategories: [
          {
            name: "Каши",
          },
          {
            name: "Пюре и лапша",
          },
          {
            name: "Супы, бульоны",
          },
        ],
      },
      {
        name: "Этническая кухня",
        subcategories: [
          {
            name: "Наборы и ингредиенты",
          },
          {
            name: "Этнические макаронные изделия",
          },
        ],
      },
      {
        name: "Молоко, сыр, яйца",
        subcategories: [
          {
            name: "Молоко",
          },
          {
            name: "Сливки",
          },
          {
            name: "Растительные продукты",
          },
          {
            name: "Кисломолочная продукция",
          },
          {
            name: "Творог",
          },
        ],
      },
      {
        name: "Замороженные продукты",
        subcategories: [
          {
            name: "Рыба и морепродукты",
          },
          {
            name: "Блюда и полуфабрикаты",
          },
          {
            name: "Мясо и птица",
          },
          {
            name: "Овощи, фрукты, грибы",
          },
          {
            name: "Мороженое",
          },
        ],
      },
      {
        name: "Подарочные наборы",
        subcategories: [],
      },
    ],
  },
  {
    name: "Автотовары",
    subcategories: [
      {
        name: "Рабочее место",
        subcategories: [
          {
            name: "Рабочие столы",
          },
          {
            name: "Рабочие кресла",
          },
          {
            name: "Офисные тумбы и комоды",
          },
          {
            name: "Шкафы для документов",
          },
          {
            name: "Стеллажи и этажерки",
          },
        ],
      },
      {
        name: "Мебель для геймеров",
        subcategories: [
          {
            name: "Столы для геймеров",
          },
          {
            name: "Стулья для геймеров",
          },
        ],
      },
      {
        name: "Мебель для гостиной",
        subcategories: [
          {
            name: "Мягкая мебель",
          },
          {
            name: "Журнальные столики",
          },
          {
            name: "Стеллажи и этажерки",
          },
          {
            name: "Шкафы витрины",
          },
          {
            name: "Стенки для гостиной",
          },
        ],
      },
      {
        name: "Садовая и уличная мебель",
        subcategories: [
          {
            name: "Столы для сада и улицы",
          },
          {
            name: "Стулья и кресла для сада и улицы",
          },
          {
            name: "Подвесные кресла",
          },
          {
            name: "Скамейки и диваны",
          },
          {
            name: "Гамаки",
          },
        ],
      },
      {
        name: "Столы и стулья",
        subcategories: [
          {
            name: "Компьютерные кресла",
          },
          {
            name: "Столы компьютерные и письменные",
          },
          {
            name: "Столы и столики",
          },
          {
            name: "Стулья, табуретки",
          },
          {
            name: "Банкетки, пуфики, скамьи",
          },
        ],
      },
      {
        name: "Гардеробы, шкафы и комоды",
        subcategories: [
          {
            name: "Гардеробные системы",
          },
          {
            name: "Шкафы для одежды",
          },
          {
            name: "Тумбы и комоды",
          },
        ],
      },
      {
        name: "Мебель для спальни",
        subcategories: [
          {
            name: "Кровати",
          },
          {
            name: "Матрасы",
          },
          {
            name: "Прикроватные тумбы",
          },
          {
            name: "Кушетки",
          },
          {
            name: "Раскладушки",
          },
        ],
      },
      {
        name: "Мебель для прихожей",
        subcategories: [
          {
            name: "Обувницы",
          },
          {
            name: "Вешалки (рейлы)",
          },
          {
            name: "Пуфики, банкетки и скамьи",
          },
          {
            name: "Шкафы",
          },
          {
            name: "Комплекты для прихожей",
          },
        ],
      },
      {
        name: "Детская мебель",
        subcategories: [
          {
            name: "Кровати",
          },
          {
            name: "Матрасы",
          },
          {
            name: "Шкафы для детской",
          },
          {
            name: "Комоды",
          },
          {
            name: "Стеллажи для детской",
          },
        ],
      },
      {
        name: "Надувная мебель",
        subcategories: [
          {
            name: "Надувные диваны",
          },
          {
            name: "Надувные кресла",
          },
          {
            name: "Надувные матрасы",
          },
          {
            name: "Диваны надувные",
          },
          {
            name: "Комплекты надувной мебели",
          },
        ],
      },
      {
        name: "Шкафы",
        subcategories: [
          {
            name: "Шкафы для одежды",
          },
          {
            name: "Шкафы для гостиной",
          },
          {
            name: "Шкафы для ванных",
          },
          {
            name: "Шкафы кухонные навесные",
          },
          {
            name: "Антресоли мебельные",
          },
        ],
      },
      {
        name: "Кухонные столы и стулья",
        subcategories: [
          {
            name: "Кухонные столы",
          },
          {
            name: "Кухонные стулья и табуретки",
          },
          {
            name: "Обеденные группы",
          },
          {
            name: "Кухонные уголки и диваны",
          },
          {
            name: "Барные столы",
          },
        ],
      },
      {
        name: "Мебель для кухни",
        subcategories: [
          {
            name: "Кухонные гарнитуры",
          },
          {
            name: "Модули кухонные напольные",
          },
          {
            name: "Шкафы витрины",
          },
          {
            name: "Столешницы кухонные",
          },
          {
            name: "Кухонные фартуки на стену",
          },
        ],
      },
      {
        name: "Мебель для ванной",
        subcategories: [
          {
            name: "Тумбы для ванной",
          },
          {
            name: "Шкафы для ванных комнат",
          },
          {
            name: "Мебель для ванных комнат",
          },
          {
            name: "Тележки и этажерки на колесах",
          },
          {
            name: "Полки, этажерки",
          },
        ],
      },
      {
        name: "Готовые комплекты",
        subcategories: [
          {
            name: "Спальни",
          },
          {
            name: "Кухонные гарнитуры",
          },
          {
            name: "Гостиные",
          },
          {
            name: "Прихожие",
          },
          {
            name: "Мебель для ванных комнат",
          },
        ],
      },
      {
        name: "Фурнитура для мебели и комплектующие",
        subcategories: [
          {
            name: "Фурнитура для мебели",
          },
          {
            name: "Комплектующие",
          },
          {
            name: "Насосы и аксессуары",
          },
        ],
      },
      {
        name: "Услуги установки мебели",
        subcategories: [],
      },
    ],
  },
  {
    name: "Аптека",
    subcategories: [
      {
        name: "Для птиц",
        subcategories: [
          {
            name: "Кормушки, поилки",
          },
          {
            name: "Наполнители",
          },
          {
            name: "Корма",
          },
          {
            name: "Лакомства",
          },
          {
            name: "Клетки",
          },
        ],
      },
      {
        name: "Для лошадей",
        subcategories: [
          {
            name: "Витамины и добавки для лошадей",
          },
        ],
      },
      {
        name: "Для собак",
        subcategories: [
          {
            name: "Сухие корма",
          },
          {
            name: "Влажные корма",
          },
          {
            name: "Лакомства",
          },
          {
            name: "Витамины и добавки",
          },
          {
            name: "Амуниция",
          },
        ],
      },
      {
        name: "Для грызунов и хорьков",
        subcategories: [
          {
            name: "Корма",
          },
          {
            name: "Лакомства",
          },
          {
            name: "Клетки и домики",
          },
          {
            name: "Сено и наполнители",
          },
          {
            name: "Поилки и кормушки",
          },
        ],
      },
      {
        name: "Фермерское хозяйство",
        subcategories: [
          {
            name: "Содержание с/х животных и птиц",
          },
          {
            name: "Товары для пчеловодства",
          },
          {
            name: "Инкубаторы",
          },
          {
            name: "Комбикорма",
          },
          {
            name: "Весы для животных",
          },
        ],
      },
      {
        name: "Для рыб и рептилий",
        subcategories: [
          {
            name: "Аквариумы",
          },
          {
            name: "Террариумы",
          },
          {
            name: "Оборудование для аквариумов и террариумов",
          },
          {
            name: "Декор для аквариумов и террариумов",
          },
          {
            name: "Корма",
          },
        ],
      },
      {
        name: "Ветаптека",
        subcategories: [
          {
            name: "Средства от блох и клещей",
          },
          {
            name: "Средства от глистов",
          },
          {
            name: "Витамины для животных и птиц",
          },
          {
            name: "Ветеринарные препараты",
          },
          {
            name: "Воротники и попоны",
          },
        ],
      },
    ],
  },
  {
    name: "Спорт и отдых",
    subcategories: [
      {
        name: "Фитнес и йога",
        subcategories: [
          {
            name: "Фитнес",
          },
          {
            name: "Йога и пилатес",
          },
          {
            name: "Гимнастика",
          },
          {
            name: "Подарочные сертификаты на фитнес и спорт",
          },
        ],
      },
      {
        name: "Рюкзаки и сумки",
        subcategories: [
          {
            name: "Рюкзаки",
          },
          {
            name: "Спортивные сумки",
          },
        ],
      },
      {
        name: "Командный спорт",
        subcategories: [
          {
            name: "Футбол",
          },
          {
            name: "Баскетбол",
          },
          {
            name: "Хоккей",
          },
          {
            name: "Волейбол",
          },
          {
            name: "Регби и гандбол",
          },
        ],
      },
      {
        name: "Конный спорт и товары для гольфа",
        subcategories: [
          {
            name: "Аксессуары для гольфа",
          },
          {
            name: "Амуниции для защиты лошадей",
          },
          {
            name: "Амуниции для седловки",
          },
          {
            name: "Амуниции для управления лошадьми",
          },
          {
            name: "Клюшки для гольфа",
          },
        ],
      },
      {
        name: "Бег и спортивная ходьба",
        subcategories: [
          {
            name: "Гаджеты для бега",
          },
          {
            name: "Поясные спортивные сумки",
          },
          {
            name: "Рюкзаки для бега",
          },
          {
            name: "Женская обувь для бега",
          },
          {
            name: "Мужская обувь для бега",
          },
        ],
      },
      {
        name: "Велоспорт",
        subcategories: [
          {
            name: "Велосипеды",
          },
          {
            name: "Электровелосипеды",
          },
          {
            name: "Детские",
          },
          {
            name: "Женские",
          },
          {
            name: "Складные",
          },
        ],
      },
      {
        name: "Детский спорт",
        subcategories: [
          {
            name: "Зимний спорт",
          },
          {
            name: "Спорт дома",
          },
          {
            name: "Детская площадка",
          },
          {
            name: "Детский транспорт",
          },
          {
            name: "Летний спорт",
          },
        ],
      },
      {
        name: "Спортпит",
        subcategories: [
          {
            name: "Протеины",
          },
          {
            name: "Протеиновые батончики",
          },
          {
            name: "Гейнеры",
          },
          {
            name: "Аминокислоты и BCAA",
          },
          {
            name: "Препараты для укрепления связок и суставов",
          },
        ],
      },
      {
        name: "Бокс и единоборства",
        subcategories: [
          {
            name: "Перчатки",
          },
          {
            name: "Тренировочные снаряды",
          },
          {
            name: "Шлемы и защита",
          },
          {
            name: "Аксессуары и принадлежности",
          },
          {
            name: "Мужская одежда",
          },
        ],
      },
      {
        name: "Охота и рыбалка",
        subcategories: [
          {
            name: "Товары для рыбалки",
          },
          {
            name: "Товары для охоты",
          },
          {
            name: "Сумки и ящики",
          },
          {
            name: "Одежда для охоты и рыбалки",
          },
          {
            name: "Обувь для охоты и рыбалки",
          },
        ],
      },
      {
        name: "Спортивные игры",
        subcategories: [
          {
            name: "Большой теннис",
          },
          {
            name: "Настольный теннис",
          },
          {
            name: "Бадминтон",
          },
          {
            name: "Сквош",
          },
          {
            name: "Дартс",
          },
        ],
      },
      {
        name: "Стрелковый спорт",
        subcategories: [
          {
            name: "Луки и арбалеты",
          },
          {
            name: "Аксессуары и запчасти",
          },
          {
            name: "Пневматическое и страйкбольное оружие",
          },
        ],
      },
      {
        name: "Спортивная одежда и обувь",
        subcategories: [
          {
            name: "Женщинам",
          },
          {
            name: "Мужчинам",
          },
          {
            name: "Детям",
          },
        ],
      },
      {
        name: "Самокаты и аксессуары",
        subcategories: [
          {
            name: "Самокаты",
          },
          {
            name: "Электросамокаты",
          },
          {
            name: "Детские",
          },
          {
            name: "Для взрослых",
          },
          {
            name: "Аксессуары",
          },
        ],
      },
      {
        name: "Фитнес-клубы",
        subcategories: [
          {
            name: "Абонементы",
          },
        ],
      },
      {
        name: "Тренажеры",
        subcategories: [
          {
            name: "Кардиотренажеры",
          },
          {
            name: "Свободные веса",
          },
          {
            name: "Силовые тренажеры",
          },
          {
            name: "Собственный вес",
          },
          {
            name: "Инверсионные столы",
          },
        ],
      },
      {
        name: "Спортивная защита",
        subcategories: [
          {
            name: "Защита голени, голеностопа и стопы",
          },
          {
            name: "Защита запястий и предплечий",
          },
          {
            name: "Защита колена",
          },
          {
            name: "Защита локтя",
          },
          {
            name: "Защита пальцев",
          },
        ],
      },
      {
        name: "Туризм и активный отдых",
        subcategories: [
          {
            name: "Палатки, тенты и спальники",
          },
          {
            name: "Рюкзаки для туризма",
          },
          {
            name: "Гермомешки",
          },
          {
            name: "Походная мебель",
          },
          {
            name: "Палки для скандинавской ходьбы и треккинга",
          },
        ],
      },
      {
        name: "Альпинизм",
        subcategories: [
          {
            name: "Аксессуары",
          },
          {
            name: "Скальные туфли",
          },
          {
            name: "Карабины",
          },
          {
            name: "Веревки и шнуры",
          },
          {
            name: "Каски",
          },
        ],
      },
      {
        name: "Водный спорт",
        subcategories: [
          {
            name: "Лодки, байдарки и комплектующие",
          },
          {
            name: "Серфинг и водные лыжи",
          },
          {
            name: "Плавание в бассейне",
          },
          {
            name: "Круги и матрасы для плавания",
          },
          {
            name: "Спасательные жилеты и круги",
          },
        ],
      },
      {
        name: "Электротранспорт",
        subcategories: [
          {
            name: "Электровелосипеды",
          },
          {
            name: "Моноколеса",
          },
          {
            name: "Гироскутеры",
          },
          {
            name: "Электросамокаты",
          },
          {
            name: "Электроскейты",
          },
        ],
      },
      {
        name: "Скейты, ролики",
        subcategories: [
          {
            name: "Скейтборды и лонгборды",
          },
          {
            name: "Роликовые коньки",
          },
          {
            name: "Лыжероллеры",
          },
          {
            name: "Спортивная защита",
          },
        ],
      },
    ],
  },
  {
    name: "Товары ИКЕА",
    subcategories: [
      {
        name: "Интерьер",
        subcategories: [
          {
            name: "Искусственные растения и сухоцветы",
          },
          {
            name: "Горшки, подставки для цветов",
          },
          {
            name: "Шторы",
          },
          {
            name: "Картины, постеры, гобелены, панно",
          },
          {
            name: "Декоративные свечи",
          },
        ],
      },
      {
        name: "Организация пространства",
        subcategories: [
          {
            name: "Корзины, коробки и органайзеры",
          },
          {
            name: "Вешалки настенные",
          },
          {
            name: "Вешалки-плечики для одежды",
          },
        ],
      },
      {
        name: "Ванная",
        subcategories: [
          {
            name: "Мыльницы, стаканы и дозаторы",
          },
          {
            name: "Коврики для ванной и туалета",
          },
          {
            name: "Держатели и крючки для ванной и туалета",
          },
          {
            name: "Зеркала косметические",
          },
          {
            name: "Мочалки и щетки для ванны и душа",
          },
        ],
      },
      {
        name: "Бытовая техника",
        subcategories: [
          {
            name: "Кухонные вытяжки",
          },
          {
            name: "Кухонные весы",
          },
        ],
      },
      {
        name: "Товары для животных",
        subcategories: [
          {
            name: "Лежаки, домики, спальные места для кошек и собак",
          },
          {
            name: "Поилки и кормушки для кошек и собак, птиц",
          },
        ],
      },
      {
        name: "Упаковочные материалы",
        subcategories: [],
      },
      {
        name: "Кухни",
        subcategories: [
          {
            name: "Фасады и дверцы",
          },
          {
            name: "Комплектующие",
          },
          {
            name: "Фурнитура для мебели",
          },
          {
            name: "Кухонные мойки",
          },
          {
            name: "Смесители",
          },
        ],
      },
      {
        name: "Освещение",
        subcategories: [
          {
            name: "Настольные лампы и светильники",
          },
          {
            name: "Шнуры и плафоны",
          },
          {
            name: "Люстры и потолочные светильники",
          },
          {
            name: "Лампочки",
          },
          {
            name: "Интерьерная подсветка",
          },
        ],
      },
      {
        name: "Уборка",
        subcategories: [
          {
            name: "Мусорные ведра и баки",
          },
          {
            name: "Швабры и насадки",
          },
          {
            name: "Маски и шапочки защитные",
          },
          {
            name: "Мешки для мусора",
          },
        ],
      },
      {
        name: "Аксессуары для электроники и компьютерной техники",
        subcategories: [
          {
            name: "Батарейки и аккумуляторы для аудио- и видеотехники",
          },
          {
            name: "Аксессуары для наушников и гарнитур",
          },
          {
            name: "Шлюзы умного дома",
          },
          {
            name: "Подставки и держатели для мобильных устройств",
          },
          {
            name: "Кабели, разъемы, переходники для компьютеров и электроники",
          },
        ],
      },
      {
        name: "Строительство и ремонт",
        subcategories: [
          {
            name: "Сантехника",
          },
          {
            name: "Электрика",
          },
          {
            name: "Материалы и инструменты",
          },
        ],
      },
      {
        name: "Одежда, обувь и аксессуары",
        subcategories: [
          {
            name: "Сумки",
          },
          {
            name: "Дорожные и спортивные сумки",
          },
          {
            name: "Брелоки и ключницы",
          },
          {
            name: "Дорожные аксессуары",
          },
          {
            name: "Подставки и держатели для украшений",
          },
        ],
      },
      {
        name: "Новый год. Распродажа",
        subcategories: [
          {
            name: "Подарочная упаковка",
          },
          {
            name: "Электрические гирлянды",
          },
          {
            name: "Новогодний декор",
          },
          {
            name: "Открытки",
          },
          {
            name: "Украшения для организации праздников",
          },
        ],
      },
      {
        name: "Текстиль",
        subcategories: [
          {
            name: "Декоративные подушки",
          },
          {
            name: "Ковры и ковровые дорожки",
          },
          {
            name: "Комплекты постельного белья",
          },
          {
            name: "Полотенца",
          },
          {
            name: "Простыни",
          },
        ],
      },
      {
        name: "Кухонная посуда",
        subcategories: [
          {
            name: "Сковороды и сотейники",
          },
          {
            name: "Кухонная навеска",
          },
          {
            name: "Посуда и формы для выпечки и запекания",
          },
          {
            name: "Кастрюли и ковши",
          },
          {
            name: "Крышки для посуды",
          },
        ],
      },
      {
        name: "Уход за одеждой и обувью",
        subcategories: [
          {
            name: "Сушилки и формодержатели для обуви",
          },
        ],
      },
      {
        name: "Детские товары",
        subcategories: [
          {
            name: "Игрушки и игры",
          },
          {
            name: "Товары для мам и малышей",
          },
          {
            name: "Товары для школы",
          },
          {
            name: "Хобби и творчество",
          },
        ],
      },
      {
        name: "Дача, сад и огород",
        subcategories: [
          {
            name: "Инструменты для приготовления барбекю",
          },
          {
            name: "Садовые кресла и стулья",
          },
          {
            name: "Садовые шатры",
          },
        ],
      },
      {
        name: "Спорт и отдых",
        subcategories: [
          {
            name: "Рюкзаки спортивные и городские",
          },
          {
            name: "Тенты и шатры туристические",
          },
        ],
      },
    ],
  },
  {
    name: "Ювелирные украшения",
    subcategories: [
      {
        name: "Цепи",
        subcategories: [
          {
            name: "Цепочки ювелирные",
          },
          {
            name: "Шнурки ювелирные",
          },
        ],
      },
      {
        name: "Колье",
        subcategories: [
          {
            name: "Бусы ювелирные",
          },
          {
            name: "Колье ювелирные",
          },
          {
            name: "Чётки ювелирные",
          },
          {
            name: "Чокеры ювелирные",
          },
        ],
      },
      {
        name: "Запонки и зажимы",
        subcategories: [
          {
            name: "Зажимы ювелирные",
          },
          {
            name: "Запонки ювелирные",
          },
        ],
      },
      {
        name: "Ювелирная посуда и сувениры",
        subcategories: [
          {
            name: "Посуда ювелирная",
          },
          {
            name: "Предметы интерьера ювелирные",
          },
          {
            name: "Предметы религии ювелирные",
          },
          {
            name: "Приборы столовые ювелирные",
          },
          {
            name: "Сувениры ювелирные",
          },
        ],
      },
      {
        name: "Украшения для женщин",
        subcategories: [],
      },
      {
        name: "Серебряные украшения",
        subcategories: [],
      },
      {
        name: "Украшения с рубинами",
        subcategories: [],
      },
      {
        name: "Украшения с фианитами",
        subcategories: [],
      },
      {
        name: "Чистящие средства",
        subcategories: [],
      },
      {
        name: "Кольца и перстни",
        subcategories: [
          {
            name: "Кольца ювелирные",
          },
          {
            name: "Наборы ювелирных колец",
          },
        ],
      },
      {
        name: "Кулоны и подвески",
        subcategories: [
          {
            name: "Иконки ювелирные",
          },
          {
            name: "Крестики ювелирные",
          },
          {
            name: "Наборы подвесок ювелирных",
          },
          {
            name: "Подвески ювелирные",
          },
          {
            name: "Шармы ювелирные",
          },
        ],
      },
      {
        name: "Броши",
        subcategories: [
          {
            name: "Броши ювелирные",
          },
          {
            name: "Знаки различия ВС ювелирные",
          },
          {
            name: "Значки ювелирные",
          },
        ],
      },
      {
        name: "Комплекты",
        subcategories: [],
      },
      {
        name: "Религиозные изделия",
        subcategories: [],
      },
      {
        name: "Украшения для мужчин",
        subcategories: [],
      },
      {
        name: "Золотые украшения",
        subcategories: [],
      },
      {
        name: "Украшения с изумрудами",
        subcategories: [],
      },
      {
        name: "Украшения с топазами",
        subcategories: [],
      },
      {
        name: "Обручальные кольца",
        subcategories: [],
      },
      {
        name: "Браслеты",
        subcategories: [
          {
            name: "Браслеты ювелирные",
          },
          {
            name: "Наборы браслетов ювелирных",
          },
          {
            name: "Платежные аксессуары ювелирные",
          },
        ],
      },
      {
        name: "Пирсинг",
        subcategories: [
          {
            name: "Браслеты на ногу ювелирные",
          },
          {
            name: "Диадемы ювелирные",
          },
          {
            name: "Заколки ювелирные",
          },
          {
            name: "Клипсы для имитации пирсинга ювелирные",
          },
          {
            name: "Кольца на палец ноги ювелирные",
          },
        ],
      },
      {
        name: "Часы",
        subcategories: [
          {
            name: "Браслеты для часов ювелирные",
          },
          {
            name: "Часы-кулон ювелирные",
          },
          {
            name: "Часы ювелирные карманные",
          },
          {
            name: "Часы ювелирные наручные",
          },
        ],
      },
      {
        name: "Шармы",
        subcategories: [],
      },
      {
        name: "Детские ювелирные украшения",
        subcategories: [],
      },
      {
        name: "Украшения с бриллиантами",
        subcategories: [],
      },
      {
        name: "Украшения с жемчугом",
        subcategories: [],
      },
      {
        name: "Украшения с сапфирами",
        subcategories: [],
      },
    ],
  },
  {
    name: "Книги",
    subcategories: [
      {
        name: "Новинки",
        subcategories: [],
      },
      {
        name: "Эзотерика",
        subcategories: [],
      },
      {
        name: "Книги для детей",
        subcategories: [
          {
            name: "Премия «Ясная Поляна»",
          },
          {
            name: "Премия «Просветитель»",
          },
          {
            name: "Книги для малышей",
          },
          {
            name: "Детская художественная литература",
          },
          {
            name: "Познавательная литература",
          },
        ],
      },
      {
        name: "Бизнес и финансы",
        subcategories: [
          {
            name: "Бизнес-планирование",
          },
          {
            name: "Бухгалтерский учет и аудит",
          },
          {
            name: "Инвестиции и трейдинг",
          },
          {
            name: "Истории успеха",
          },
          {
            name: "Культура бизнеса и деловой этикет",
          },
        ],
      },
      {
        name: "Нехудожественная литература",
        subcategories: [
          {
            name: "Государство и право",
          },
          {
            name: "Информационные технологии",
          },
          {
            name: "Искусство и культура",
          },
          {
            name: "История",
          },
          {
            name: "Красота и образ жизни",
          },
        ],
      },
      {
        name: "Журналы и газеты",
        subcategories: [],
      },
      {
        name: "Любовь и эротика",
        subcategories: [],
      },
      {
        name: "Цифровые книги на физическом носителе",
        subcategories: [],
      },
      {
        name: "Топ-100",
        subcategories: [],
      },
      {
        name: "Премия «Большая книга»",
        subcategories: [],
      },
      {
        name: "Аудиокниги",
        subcategories: [],
      },
      {
        name: "Художественная литература",
        subcategories: [
          {
            name: "Фантастика и фэнтези",
          },
          {
            name: "Детективы, триллеры, ужасы",
          },
          {
            name: "Современная проза",
          },
          {
            name: "Любовные романы",
          },
          {
            name: "Исторические романы",
          },
        ],
      },
      {
        name: "Психология и саморазвитие",
        subcategories: [
          {
            name: "Деньги и успех",
          },
          {
            name: "Детская психология и воспитание",
          },
          {
            name: "Личная эффективность и мотивация",
          },
          {
            name: "Личность и характер",
          },
          {
            name: "Научная психология",
          },
        ],
      },
      {
        name: "Литература на иностранных языках",
        subcategories: [
          {
            name: "Английский",
          },
          {
            name: "Китайский",
          },
          {
            name: "Испанский",
          },
          {
            name: "Итальянский",
          },
          {
            name: "Немецкий",
          },
        ],
      },
      {
        name: "Календари",
        subcategories: [],
      },
      {
        name: "Букинистика",
        subcategories: [
          {
            name: "Нехудожественная литература",
          },
          {
            name: "Художественная литература",
          },
          {
            name: "Комиксы и манга",
          },
          {
            name: "Журналы и газеты",
          },
          {
            name: "Учебная литература",
          },
        ],
      },
      {
        name: "Раскраски",
        subcategories: [],
      },
      {
        name: "Топ-100 детских книг",
        subcategories: [],
      },
      {
        name: "Азиатская литература",
        subcategories: [],
      },
      {
        name: "Цифровые книги",
        subcategories: [],
      },
      {
        name: "Учебная литература",
        subcategories: [
          {
            name: "Подготовка к школе",
          },
          {
            name: "Школьникам",
          },
          {
            name: "Иностранные языки",
          },
          {
            name: "Дополнительное образование для детей",
          },
          {
            name: "Студентам и абитуриентам",
          },
        ],
      },
      {
        name: "Дом и хобби",
        subcategories: [
          {
            name: "Дом и сад",
          },
          {
            name: "Рукоделие",
          },
          {
            name: "Домашние животные",
          },
          {
            name: "Досуг",
          },
          {
            name: "Кулинария",
          },
        ],
      },
      {
        name: "Комиксы и манга",
        subcategories: [
          {
            name: "Комиксы",
          },
          {
            name: "Манга",
          },
          {
            name: "Артбуки, игровые вселенные",
          },
          {
            name: "Экранизации",
          },
          {
            name: "Образовательные комиксы",
          },
        ],
      },
      {
        name: "Подарочные издания",
        subcategories: [],
      },
      {
        name: "Аудиокниги на физическом носителе",
        subcategories: [],
      },
      {
        name: "Книги Азии",
        subcategories: [],
      },
    ],
  },
  {
    name: "Хобби и творчество",
    subcategories: [
      {
        name: "Поделки",
        subcategories: [
          {
            name: "Поделки и аппликации",
          },
          {
            name: "3D-ручки",
          },
          {
            name: "Товары для декорирования",
          },
          {
            name: "Наклейки для творчества",
          },
          {
            name: "Выжигание и выпиливание",
          },
        ],
      },
      {
        name: "Вязание",
        subcategories: [
          {
            name: "Пряжа",
          },
          {
            name: "Спицы",
          },
          {
            name: "Крючки",
          },
          {
            name: "Наборы для вязания",
          },
          {
            name: "Инструменты и аксессуары",
          },
        ],
      },
      {
        name: "Декупаж",
        subcategories: [
          {
            name: "Лак и клей",
          },
          {
            name: "Наборы для декупажа",
          },
          {
            name: "Карты, салфетки, бумага",
          },
        ],
      },
      {
        name: "Наборы для опытов и исследований",
        subcategories: [
          {
            name: "Наборы для исследований",
          },
          {
            name: "Детские микроскопы и телескопы",
          },
        ],
      },
      {
        name: "Шитье и вышивание",
        subcategories: [
          {
            name: "Ткани, кожа и замша",
          },
          {
            name: "Канва и наборы для вышивания",
          },
          {
            name: "Инструменты и аксессуары",
          },
          {
            name: "Декоративные элементы",
          },
          {
            name: "Нитки, мулине, шнуры",
          },
        ],
      },
      {
        name: "Сборные модели и аксессуары",
        subcategories: [
          {
            name: "Сборные модели",
          },
          {
            name: "Румбоксы",
          },
          {
            name: "Аксессуары",
          },
        ],
      },
      {
        name: "Лепка",
        subcategories: [
          {
            name: "Пластилин и масса для лепки",
          },
          {
            name: "Гипс для литья и лепки",
          },
          {
            name: "Глина для лепки",
          },
          {
            name: "Кинетический песок",
          },
          {
            name: "Инструменты для лепки",
          },
        ],
      },
      {
        name: "Скрапбукинг",
        subcategories: [
          {
            name: "Бумага и наборы",
          },
          {
            name: "Украшения и декоративные элементы",
          },
          {
            name: "Инструменты и аксессуары",
          },
        ],
      },
      {
        name: "Пазлы и головоломки",
        subcategories: [
          {
            name: "Пазлы",
          },
          {
            name: "Головоломки",
          },
        ],
      },
      {
        name: "Рукоделие",
        subcategories: [
          {
            name: "Алмазная мозаика",
          },
          {
            name: "Валяние",
          },
          {
            name: "Квиллинг",
          },
        ],
      },
      {
        name: "Бисер и создание украшений",
        subcategories: [
          {
            name: "Наборы для создания украшений",
          },
          {
            name: "Фурнитура для украшений",
          },
        ],
      },
      {
        name: "Изготовление мыла, свечей, косметики",
        subcategories: [
          {
            name: "Изготовление свечей",
          },
          {
            name: "Мыльная основа, краситель, отдушка",
          },
          {
            name: "Изготовление косметики",
          },
          {
            name: "Формы для мыла",
          },
          {
            name: "Наборы для мыловарения",
          },
        ],
      },
    ],
  },
  {
    name: "Досуг и развлечения",
    subcategories: [
      {
        name: "Цепи",
        subcategories: [
          {
            name: "Цепочки ювелирные",
          },
          {
            name: "Шнурки ювелирные",
          },
        ],
      },
      {
        name: "Колье",
        subcategories: [
          {
            name: "Бусы ювелирные",
          },
          {
            name: "Колье ювелирные",
          },
          {
            name: "Чётки ювелирные",
          },
          {
            name: "Чокеры ювелирные",
          },
        ],
      },
      {
        name: "Запонки и зажимы",
        subcategories: [
          {
            name: "Зажимы ювелирные",
          },
          {
            name: "Запонки ювелирные",
          },
        ],
      },
      {
        name: "Ювелирная посуда и сувениры",
        subcategories: [
          {
            name: "Посуда ювелирная",
          },
          {
            name: "Предметы интерьера ювелирные",
          },
          {
            name: "Предметы религии ювелирные",
          },
          {
            name: "Приборы столовые ювелирные",
          },
          {
            name: "Сувениры ювелирные",
          },
        ],
      },
      {
        name: "Украшения для женщин",
        subcategories: [],
      },
      {
        name: "Серебряные украшения",
        subcategories: [],
      },
      {
        name: "Украшения с рубинами",
        subcategories: [],
      },
      {
        name: "Украшения с фианитами",
        subcategories: [],
      },
      {
        name: "Чистящие средства",
        subcategories: [],
      },
      {
        name: "Кольца и перстни",
        subcategories: [
          {
            name: "Кольца ювелирные",
          },
          {
            name: "Наборы ювелирных колец",
          },
        ],
      },
      {
        name: "Кулоны и подвески",
        subcategories: [
          {
            name: "Иконки ювелирные",
          },
          {
            name: "Крестики ювелирные",
          },
          {
            name: "Наборы подвесок ювелирных",
          },
          {
            name: "Подвески ювелирные",
          },
          {
            name: "Шармы ювелирные",
          },
        ],
      },
      {
        name: "Броши",
        subcategories: [
          {
            name: "Броши ювелирные",
          },
          {
            name: "Знаки различия ВС ювелирные",
          },
          {
            name: "Значки ювелирные",
          },
        ],
      },
      {
        name: "Комплекты",
        subcategories: [],
      },
      {
        name: "Религиозные изделия",
        subcategories: [],
      },
      {
        name: "Украшения для мужчин",
        subcategories: [],
      },
      {
        name: "Золотые украшения",
        subcategories: [],
      },
      {
        name: "Украшения с изумрудами",
        subcategories: [],
      },
      {
        name: "Украшения с топазами",
        subcategories: [],
      },
      {
        name: "Обручальные кольца",
        subcategories: [],
      },
      {
        name: "Браслеты",
        subcategories: [
          {
            name: "Браслеты ювелирные",
          },
          {
            name: "Наборы браслетов ювелирных",
          },
          {
            name: "Платежные аксессуары ювелирные",
          },
        ],
      },
      {
        name: "Пирсинг",
        subcategories: [
          {
            name: "Браслеты на ногу ювелирные",
          },
          {
            name: "Диадемы ювелирные",
          },
          {
            name: "Заколки ювелирные",
          },
          {
            name: "Клипсы для имитации пирсинга ювелирные",
          },
          {
            name: "Кольца на палец ноги ювелирные",
          },
        ],
      },
      {
        name: "Часы",
        subcategories: [
          {
            name: "Браслеты для часов ювелирные",
          },
          {
            name: "Часы-кулон ювелирные",
          },
          {
            name: "Часы ювелирные карманные",
          },
          {
            name: "Часы ювелирные наручные",
          },
        ],
      },
      {
        name: "Шармы",
        subcategories: [],
      },
      {
        name: "Детские ювелирные украшения",
        subcategories: [],
      },
      {
        name: "Украшения с бриллиантами",
        subcategories: [],
      },
      {
        name: "Украшения с жемчугом",
        subcategories: [],
      },
      {
        name: "Украшения с сапфирами",
        subcategories: [],
      },
    ],
  },
  {
    name: "Для школы и офиса",
    subcategories: [
      {
        name: "Пеналы и письменные принадлежности",
        subcategories: [
          {
            name: "Пеналы",
          },
          {
            name: "Ручки",
          },
          {
            name: "Канцелярские наборы",
          },
          {
            name: "Стержни, чернила для ручек",
          },
          {
            name: "Карандаши чернографитные",
          },
        ],
      },
      {
        name: "Развивающие пособия и материалы",
        subcategories: [
          {
            name: "Авторские методики и материалы",
          },
          {
            name: "Учебные пособия",
          },
          {
            name: "Дидактические карточки",
          },
          {
            name: "Детские компьютеры",
          },
          {
            name: "Обучающие плакаты",
          },
        ],
      },
      {
        name: "Уроки рисования",
        subcategories: [
          {
            name: "Альбомы для рисования",
          },
          {
            name: "Кисти",
          },
          {
            name: "Краски",
          },
          {
            name: "Пастель и мелки",
          },
          {
            name: "Цветные карандаши",
          },
        ],
      },
      {
        name: "Демонстрационные доски",
        subcategories: [
          {
            name: "Флипчарты",
          },
          {
            name: "Магнитно-маркерные доски",
          },
          {
            name: "Пробковые доски",
          },
          {
            name: "Меловые доски",
          },
          {
            name: "Магнитно-меловые доски",
          },
        ],
      },
      {
        name: "Школьная форма для мальчиков",
        subcategories: [
          {
            name: "Брюки",
          },
          {
            name: "Рубашки",
          },
          {
            name: "Жилеты",
          },
          {
            name: "Пиджаки",
          },
          {
            name: "Комплекты и форма",
          },
        ],
      },
      {
        name: "Тетради, блокноты, дневники",
        subcategories: [
          {
            name: "Тетради для школы",
          },
          {
            name: "Дневники",
          },
          {
            name: "Нотные тетради",
          },
          {
            name: "Обложки",
          },
          {
            name: "Ежедневники",
          },
        ],
      },
      {
        name: "Чертежные инструменты",
        subcategories: [
          {
            name: "Готовальни",
          },
          {
            name: "Доски чертёжные",
          },
          {
            name: "Изографы",
          },
          {
            name: "Линейки чертежные",
          },
          {
            name: "Наборы чертёжные",
          },
        ],
      },
      {
        name: "Школьные глобусы",
        subcategories: [],
      },
      {
        name: "Уроки технологии",
        subcategories: [
          {
            name: "Металлические конструкторы",
          },
          {
            name: "Цветная бумага и картон",
          },
          {
            name: "Клей",
          },
          {
            name: "Ножницы",
          },
          {
            name: "Одежда для уроков труда",
          },
        ],
      },
      {
        name: "Комната ученика",
        subcategories: [
          {
            name: "Парты",
          },
          {
            name: "Столы компьютерные и письменные",
          },
          {
            name: "Компьютерные кресла",
          },
          {
            name: "Настольные лампы и светильники",
          },
          {
            name: "Стеллажи",
          },
        ],
      },
      {
        name: "Офисная бумага и пленка",
        subcategories: [],
      },
      {
        name: "Канцелярские товары",
        subcategories: [
          {
            name: "Файлы и папки",
          },
          {
            name: "Канцелярские наборы",
          },
          {
            name: "Лотки для бумаги",
          },
          {
            name: "Точилки",
          },
          {
            name: "Калькуляторы",
          },
        ],
      },
      {
        name: "Карты",
        subcategories: [],
      },
      {
        name: "Доски и мольберты",
        subcategories: [],
      },
      {
        name: "Школьная форма для девочек",
        subcategories: [
          {
            name: "Платья",
          },
          {
            name: "Юбки",
          },
          {
            name: "Брюки",
          },
          {
            name: "Рубашки и блузы",
          },
          {
            name: "Жилеты",
          },
        ],
      },
    ],
  },
  {
    name: "Ноутбуки и компьютеры",
    subcategories: [
      {
        name: "Мониторы и аксессуары",
        subcategories: [
          {
            name: "Мониторы",
          },
          {
            name: "Кабели, разъемы, переходники",
          },
          {
            name: "Кронштейны, держатели и подставки",
          },
          {
            name: "Чистящие принадлежности",
          },
          {
            name: "Очки для компьютера",
          },
        ],
      },
      {
        name: "Оргтехника и расходные материалы",
        subcategories: [
          {
            name: "Принтеры, сканеры, копиры",
          },
          {
            name: "Ламинаторы, брошюровщики, резаки",
          },
          {
            name: "Уничтожители бумаг (шредеры)",
          },
          {
            name: "Аксессуары и запчасти",
          },
          {
            name: "Оборудование для связи",
          },
        ],
      },
      {
        name: "Программное обеспечение",
        subcategories: [
          {
            name: "Все программы",
          },
          {
            name: "Игры для приставок и ПК",
          },
          {
            name: "Антивирусы",
          },
          {
            name: "Операционные системы",
          },
          {
            name: "Офисные программы",
          },
        ],
      },
      {
        name: "Батарейки и электропитание",
        subcategories: [
          {
            name: "Батарейки и аккумуляторы",
          },
          {
            name: "Зарядные устройства для стандартных аккумуляторов",
          },
          {
            name: "Удлинители и сетевые фильтры",
          },
          {
            name: "Источники бесперебойного питания",
          },
          {
            name: "Аккумуляторные батареи",
          },
        ],
      },
      {
        name: "Настольные ПК и моноблоки",
        subcategories: [
          {
            name: "Настольные компьютеры",
          },
          {
            name: "Моноблоки",
          },
        ],
      },
      {
        name: "Гейминг",
        subcategories: [
          {
            name: "Игровые ноутбуки",
          },
          {
            name: "Игры",
          },
          {
            name: "Мобильный гейминг",
          },
          {
            name: "PlayStation",
          },
          {
            name: "Xbox",
          },
        ],
      },
      {
        name: "Сетевое оборудование",
        subcategories: [
          {
            name: "Роутеры",
          },
          {
            name: "Модемы",
          },
          {
            name: "Беспроводное оборудование",
          },
          {
            name: "3G/4G модемы и роутеры",
          },
          {
            name: "Сетевые хранилища (NAS)",
          },
        ],
      },
      {
        name: "Оборудование для презентаций",
        subcategories: [
          {
            name: "Мультимедиа-проекторы",
          },
          {
            name: "Экраны",
          },
          {
            name: "Аксессуары и запчасти для проекторов",
          },
          {
            name: "Лампы для проекторов",
          },
          {
            name: "Интерактивные доски и аксессуары",
          },
        ],
      },
      {
        name: "Компьютерная мебель",
        subcategories: [
          {
            name: "Кронштейны, держатели и подставки",
          },
          {
            name: "Подставки для ног",
          },
        ],
      },
      {
        name: "Комплектующие для ПК",
        subcategories: [
          {
            name: "Видеокарты",
          },
          {
            name: "Процессоры (CPU)",
          },
          {
            name: "Внутренние SSD накопители",
          },
          {
            name: "Оперативная память",
          },
          {
            name: "Внешние жесткие диски и SSD",
          },
        ],
      },
      {
        name: "Периферийные устройства",
        subcategories: [
          {
            name: "Мониторы",
          },
          {
            name: "Клавиатуры",
          },
          {
            name: "Мыши",
          },
          {
            name: "Комплекты клавиатур и мышей",
          },
          {
            name: "Рули, джойстики, геймпады",
          },
        ],
      },
      {
        name: "Накопители данных",
        subcategories: [
          {
            name: "Внутренние SSD накопители",
          },
          {
            name: "Внешние жесткие диски и SSD",
          },
          {
            name: "Внутренние жесткие диски",
          },
          {
            name: "Сетевые хранилища (NAS)",
          },
          {
            name: "Карты памяти",
          },
        ],
      },
      {
        name: "Серверы и СКС",
        subcategories: [
          {
            name: "Серверы",
          },
          {
            name: "Аксессуары для серверов",
          },
          {
            name: "Комплектующие для серверов",
          },
          {
            name: "СКС оборудование",
          },
        ],
      },
    ],
  },
  {
    name: "Все для гейминга",
    subcategories: [
      {
        name: "Игровые компьютеры",
        subcategories: [],
      },
      {
        name: "PlayStation",
        subcategories: [
          {
            name: "Игровые приставки",
          },
          {
            name: "Игры для PlayStation",
          },
          {
            name: "Геймпады и рули для PlayStation",
          },
          {
            name: "Шлемы VR",
          },
          {
            name: "Карты оплаты и подписки",
          },
        ],
      },
      {
        name: "4K гейминг",
        subcategories: [
          {
            name: "Игровые приставки с поддержкой 4К игр",
          },
          {
            name: "Игровые ноутбуки с 4К разрешением",
          },
          {
            name: "Игровые ПК для 4К игр",
          },
          {
            name: "Игровые мониторы с 4K разрешением",
          },
        ],
      },
      {
        name: "Настольные игры",
        subcategories: [],
      },
      {
        name: "Стриминг",
        subcategories: [
          {
            name: "Видеозахват",
          },
          {
            name: "Хромакеи",
          },
          {
            name: "Микрофоны",
          },
          {
            name: "Веб-камеры",
          },
        ],
      },
      {
        name: "Аксессуары для консолей",
        subcategories: [],
      },
      {
        name: "Ретроконсоли",
        subcategories: [],
      },
      {
        name: "Игры",
        subcategories: [
          {
            name: "Игры для PlayStation 4",
          },
          {
            name: "Игры для Xbox ONE",
          },
          {
            name: "Игры для Nintendo Switch",
          },
          {
            name: "Игры для PC",
          },
          {
            name: "Все игры",
          },
        ],
      },
      {
        name: "Xbox",
        subcategories: [
          {
            name: "Игровые приставки",
          },
          {
            name: "Игры для Xbox",
          },
          {
            name: "Геймпады и рули",
          },
          {
            name: "Карты оплаты и подписки",
          },
          {
            name: "Аксессуары для приставок",
          },
        ],
      },
      {
        name: "Игровая периферия",
        subcategories: [
          {
            name: "Рули, джойстики, геймпады",
          },
          {
            name: "Игровые мышки",
          },
          {
            name: "Коврики для мышек",
          },
          {
            name: "Игровые клавиатуры",
          },
          {
            name: "Комплекты клавиатур и мышек",
          },
        ],
      },
      {
        name: "Очки виртуальной реальности",
        subcategories: [],
      },
      {
        name: "Столы для гейминга",
        subcategories: [],
      },
      {
        name: "Фигурки Funko для настоящих фанатов",
        subcategories: [],
      },
      {
        name: "Игровые ноутбуки",
        subcategories: [],
      },
      {
        name: "Мобильный гейминг",
        subcategories: [
          {
            name: "Игровые телефоны",
          },
          {
            name: "Триггеры и геймпады для телефонов",
          },
          {
            name: "Игровые планшеты",
          },
          {
            name: "Портативные игровые приставки",
          },
          {
            name: "Очки виртуальной реальности для смартфонов",
          },
        ],
      },
      {
        name: "Nintendo",
        subcategories: [
          {
            name: "Игровые приставки",
          },
          {
            name: "Игры для Nintendo",
          },
          {
            name: "Геймпады и рули",
          },
          {
            name: "Аксессуары для приставок",
          },
        ],
      },
      {
        name: "Игровые комплектующие",
        subcategories: [
          {
            name: "Видеокарты",
          },
          {
            name: "Процессоры",
          },
          {
            name: "Оперативная память",
          },
          {
            name: "SSD накопители",
          },
          {
            name: "Материнские платы",
          },
        ],
      },
      {
        name: "Аксессуары для очков виртуальной реальности",
        subcategories: [],
      },
      {
        name: "Компьютерные кресла",
        subcategories: [],
      },
    ],
  },
  {
    name: "Умные колонки",
    subcategories: [
      {
        name: "Умные колонки VK",
        subcategories: [],
      },
      {
        name: "Умные колонки Xiaomi",
        subcategories: [],
      },
      {
        name: "Умные колонки Google",
        subcategories: [],
      },
      {
        name: "Умные колонки JBL",
        subcategories: [],
      },
      {
        name: "Умные колонки RAINBO",
        subcategories: [],
      },
      {
        name: "Умные колонки Harman/Kardon",
        subcategories: [],
      },
      {
        name: "Умные колонки Bose",
        subcategories: [],
      },
      {
        name: "Умные колонки Apple",
        subcategories: [],
      },
      {
        name: "Умные колонки Sonos",
        subcategories: [],
      },
      {
        name: "Умные колонки SBER",
        subcategories: [],
      },
      {
        name: "Умные колонки Amazon",
        subcategories: [],
      },
    ],
  },
  {
    name: "Гигиена",
    subcategories: [
      {
        name: "Умные колонки VK",
        subcategories: [],
      },
      {
        name: "Умные колонки Xiaomi",
        subcategories: [],
      },
      {
        name: "Умные колонки Google",
        subcategories: [],
      },
      {
        name: "Умные колонки JBL",
        subcategories: [],
      },
      {
        name: "Умные колонки RAINBO",
        subcategories: [],
      },
      {
        name: "Умные колонки Harman/Kardon",
        subcategories: [],
      },
      {
        name: "Умные колонки Bose",
        subcategories: [],
      },
      {
        name: "Умные колонки Apple",
        subcategories: [],
      },
      {
        name: "Умные колонки Sonos",
        subcategories: [],
      },
      {
        name: "Умные колонки SBER",
        subcategories: [],
      },
      {
        name: "Умные колонки Amazon",
        subcategories: [],
      },
    ],
  },
  {
    name: "Бытовая химия",
    subcategories: [
      {
        name: "Умные колонки VK",
        subcategories: [],
      },
      {
        name: "Умные колонки Xiaomi",
        subcategories: [],
      },
      {
        name: "Умные колонки Google",
        subcategories: [],
      },
      {
        name: "Умные колонки JBL",
        subcategories: [],
      },
      {
        name: "Умные колонки RAINBO",
        subcategories: [],
      },
      {
        name: "Умные колонки Harman/Kardon",
        subcategories: [],
      },
      {
        name: "Умные колонки Bose",
        subcategories: [],
      },
      {
        name: "Умные колонки Apple",
        subcategories: [],
      },
      {
        name: "Умные колонки Sonos",
        subcategories: [],
      },
      {
        name: "Умные колонки SBER",
        subcategories: [],
      },
      {
        name: "Умные колонки Amazon",
        subcategories: [],
      },
    ],
  },
  {
    name: "Зоотовары",
    subcategories: [
      {
        name: "Для птиц",
        subcategories: [
          {
            name: "Кормушки, поилки",
          },
          {
            name: "Наполнители",
          },
          {
            name: "Корма",
          },
          {
            name: "Лакомства",
          },
          {
            name: "Клетки",
          },
        ],
      },
      {
        name: "Для лошадей",
        subcategories: [
          {
            name: "Витамины и добавки для лошадей",
          },
        ],
      },
      {
        name: "Для собак",
        subcategories: [
          {
            name: "Сухие корма",
          },
          {
            name: "Влажные корма",
          },
          {
            name: "Лакомства",
          },
          {
            name: "Витамины и добавки",
          },
          {
            name: "Амуниция",
          },
        ],
      },
      {
        name: "Для грызунов и хорьков",
        subcategories: [
          {
            name: "Корма",
          },
          {
            name: "Лакомства",
          },
          {
            name: "Клетки и домики",
          },
          {
            name: "Сено и наполнители",
          },
          {
            name: "Поилки и кормушки",
          },
        ],
      },
      {
        name: "Фермерское хозяйство",
        subcategories: [
          {
            name: "Содержание с/х животных и птиц",
          },
          {
            name: "Товары для пчеловодства",
          },
          {
            name: "Инкубаторы",
          },
          {
            name: "Комбикорма",
          },
          {
            name: "Весы для животных",
          },
        ],
      },
      {
        name: "Для рыб и рептилий",
        subcategories: [
          {
            name: "Аквариумы",
          },
          {
            name: "Террариумы",
          },
          {
            name: "Оборудование для аквариумов и террариумов",
          },
          {
            name: "Декор для аквариумов и террариумов",
          },
          {
            name: "Корма",
          },
        ],
      },
      {
        name: "Ветаптека",
        subcategories: [
          {
            name: "Средства от блох и клещей",
          },
          {
            name: "Средства от глистов",
          },
          {
            name: "Витамины для животных и птиц",
          },
          {
            name: "Ветеринарные препараты",
          },
          {
            name: "Воротники и попоны",
          },
        ],
      },
    ],
  },
  {
    name: "Товары для взрослых",
    subcategories: [
      {
        name: "Стимуляторы",
        subcategories: [
          {
            name: "Стимуляторы эротические",
          },
          {
            name: "Эрекционные кольца",
          },
        ],
      },
      {
        name: "Косметика и парфюмерия",
        subcategories: [
          {
            name: "Интимная косметика и гигиена",
          },
          {
            name: "Интимная парфюмерия",
          },
          {
            name: "Средства возбуждающие",
          },
          {
            name: "Уход и хранение секс-игрушек и одежды",
          },
        ],
      },
      {
        name: "Одежда, белье, обувь",
        subcategories: [
          {
            name: "Комплекты нижнего белья",
          },
          {
            name: "Обувь",
          },
          {
            name: "Одежда, костюмы для женщин",
          },
          {
            name: "Одежда, костюмы для мужчин",
          },
          {
            name: "Аксессуары",
          },
        ],
      },
      {
        name: "Мебель, качели, подушки",
        subcategories: [
          {
            name: "Аксессуары для секса",
          },
          {
            name: "Мебель для секса",
          },
        ],
      },
      {
        name: "Интимные смазки",
        subcategories: [
          {
            name: "Интимные смазки",
          },
          {
            name: "Шприцы для интимной смазки",
          },
        ],
      },
      {
        name: "Мастурбаторы для мужчин",
        subcategories: [
          {
            name: "Аксессуары для мастурбаторов",
          },
          {
            name: "Мастурбаторы",
          },
        ],
      },
      {
        name: "BDSM-атрибутика",
        subcategories: [
          {
            name: "BDSM-атрибутика",
          },
          {
            name: "BDSM-наборы",
          },
          {
            name: "Атрибуты для бондажа и фиксации",
          },
          {
            name: "Ошейники, ремни, сбруи, поводки, аксессуары",
          },
          {
            name: "Расширители уретральные",
          },
        ],
      },
      {
        name: "Сувениры для взрослых",
        subcategories: [
          {
            name: "Сувенирная одежда 18+",
          },
          {
            name: "Сувениры 18+",
          },
          {
            name: "Съедобные сувениры 18+",
          },
        ],
      },
      {
        name: "Игры, книги, журналы",
        subcategories: [
          {
            name: "Игры и наборы 18+",
          },
          {
            name: "Печатная и видеопродукция 18+",
          },
        ],
      },
      {
        name: "Вагинальные и анальные вибраторы и стимуляторы",
        subcategories: [
          {
            name: "Вибраторы и аксессуары",
          },
          {
            name: "Стимуляторы анальные",
          },
          {
            name: "Стимуляторы и тренажеры вагинальные",
          },
          {
            name: "Страпоны и аксессуары",
          },
          {
            name: "Фаллоимитаторы и аксессуары",
          },
        ],
      },
      {
        name: "Секс-куклы",
        subcategories: [],
      },
      {
        name: "Вакуумные помпы",
        subcategories: [
          {
            name: "Комплектующие и аксессуары для помп",
          },
          {
            name: "Помпы вакуумные",
          },
        ],
      },
      {
        name: "Секс-машины",
        subcategories: [
          {
            name: "Аксессуары для секс-машин",
          },
          {
            name: "Насадки для секс-машины",
          },
          {
            name: "Секс-машины",
          },
        ],
      },
    ],
  },
  {
    name: "Оптика",
    subcategories: [
      {
        name: "Линзы для очков",
        subcategories: [],
      },
      {
        name: "Растворы для контактных линз",
        subcategories: [],
      },
      {
        name: "Очки",
        subcategories: [
          {
            name: "Очки для компьютера",
          },
          {
            name: "Очки для зрения",
          },
          {
            name: "Очки для водителей",
          },
          {
            name: "Очки для водителей и рыболовов",
          },
          {
            name: "Очки для зрения",
          },
        ],
      },
      {
        name: "Футляры",
        subcategories: [],
      },
      {
        name: "Капли для глаз",
        subcategories: [],
      },
      {
        name: "Оправы",
        subcategories: [],
      },
      {
        name: "Аксессуары",
        subcategories: [
          {
            name: "Аксессуары для контактных линз",
          },
          {
            name: "Аксессуары для ухода за очками",
          },
          {
            name: "Комплектующие для очков",
          },
        ],
      },
    ],
  },
  {
    name: "Ремёсла",
    subcategories: [
      {
        name: "Текстиль",
        subcategories: [
          {
            name: "Сувениры Яндекс Маркет",
          },
        ],
      },
      {
        name: "Интерьер",
        subcategories: [
          {
            name: "Статуэтки и фигурки",
          },
          {
            name: "Декоративная посуда",
          },
          {
            name: "Подсвечники и канделябры",
          },
          {
            name: "Шкатулки",
          },
          {
            name: "Вазы для цветов",
          },
        ],
      },
    ],
  },
  {
    name: "Цифровые товары",
    subcategories: [
      {
        name: "Игры для приставок и ПК",
        subcategories: [],
      },
      {
        name: "Игровая валюта",
        subcategories: [],
      },
      {
        name: "Онлайн-подписки",
        subcategories: [],
      },
      {
        name: "Программы",
        subcategories: [],
      },
      {
        name: "Цифровые книги",
        subcategories: [],
      },
      {
        name: "Карты пополнения счета",
        subcategories: [],
      },
      {
        name: "Тарифные планы и номера",
        subcategories: [],
      },
      {
        name: "Видеофильмы в электронном формате",
        subcategories: [],
      },
    ],
  },
  {
    name: "Оборудование",
    subcategories: [
      {
        name: "Оборудование для автосервисов",
        subcategories: [],
      },
      {
        name: "Рабочая одежда и обувь",
        subcategories: [
          {
            name: "Обувь",
          },
          {
            name: "Рабочие головные уборы",
          },
          {
            name: "Одежда",
          },
        ],
      },
      {
        name: "Оборудование для ремонта электроники",
        subcategories: [
          {
            name: "Мультиметры и тестеры",
          },
          {
            name: "Осциллографы",
          },
          {
            name: "Программаторы",
          },
          {
            name: "Радиодетали и электронные компоненты",
          },
          {
            name: "Запчасти для принтеров и МФУ",
          },
        ],
      },
      {
        name: "Строительство",
        subcategories: [
          {
            name: "Резчики швов и стенорезные машины",
          },
          {
            name: "Бетономешалки и растворосмесители",
          },
          {
            name: "Строительные вибраторы",
          },
          {
            name: "Сварочные аппараты",
          },
          {
            name: "Затирочные машины",
          },
        ],
      },
      {
        name: "Рекламные конструкции и информационные материалы",
        subcategories: [
          {
            name: "Рекламные конструкции и материалы",
          },
          {
            name: "Оформление ПВЗ Яндекс Маркет",
          },
          {
            name: "Информационные табло",
          },
          {
            name: "Предупредительные наклейки",
          },
        ],
      },
      {
        name: "Лабораторное оборудование",
        subcategories: [],
      },
      {
        name: "Оборудование для салонов красоты",
        subcategories: [
          {
            name: "Для маникюра и педикюра",
          },
          {
            name: "Для парикмахеров и барберов",
          },
          {
            name: "Для косметологов",
          },
          {
            name: "Тату оборудование",
          },
          {
            name: "Стерилизация для салонов красоты",
          },
        ],
      },
      {
        name: "Оборудование для прачечной и химчистки",
        subcategories: [],
      },
      {
        name: "Промышленное производство",
        subcategories: [
          {
            name: "Промышленные насосы",
          },
          {
            name: "Швейное производство",
          },
          {
            name: "Грузоподъемное оборудование",
          },
          {
            name: "Производственно-техническое оборудование",
          },
          {
            name: "Промышленные компьютеры",
          },
        ],
      },
      {
        name: "Чистящая и моющая техника",
        subcategories: [
          {
            name: "Промышленные пылесосы и парогенераторы",
          },
          {
            name: "Поломойные и подметальные машины",
          },
          {
            name: "Аксессуары и принадлежности",
          },
          {
            name: "Противогололедные реагенты",
          },
          {
            name: "Машинки для чистки обуви",
          },
        ],
      },
      {
        name: "Издательство и полиграфия",
        subcategories: [
          {
            name: "Контрольно-измерительное оборудование",
          },
          {
            name: "Полиграфическое оборудование",
          },
          {
            name: "Расходные материалы",
          },
          {
            name: "Режущие плоттеры",
          },
        ],
      },
      {
        name: "Оборудование для животноводства",
        subcategories: [
          {
            name: "Весы для животных",
          },
          {
            name: "Инкубаторы",
          },
        ],
      },
      {
        name: "Инструменты и расходные материалы для медучреждений",
        subcategories: [],
      },
      {
        name: "Охрана и безопасность",
        subcategories: [
          {
            name: "Сейфы",
          },
          {
            name: "Противопожарное оборудование и безопасность",
          },
          {
            name: "Системы видеонаблюдения",
          },
          {
            name: "Шлагбаумы и автоматика для ворот",
          },
          {
            name: "Средства индивидуальной бронезащиты",
          },
        ],
      },
      {
        name: "Пищевое оборудование",
        subcategories: [
          {
            name: "Изготовление мучных и кондитерских изделий",
          },
          {
            name: "Промышленные плиты",
          },
          {
            name: "Жарочные и пекарские шкафы",
          },
          {
            name: "Промышленные миксеры",
          },
          {
            name: "Пароконвектоматы",
          },
        ],
      },
      {
        name: "Сценическое и аудиооборудование",
        subcategories: [
          {
            name: "Оборудование для звукозаписывающих студий",
          },
          {
            name: "Концертное и трансляционное аудиооборудование",
          },
          {
            name: "Световое и сценическое оборудование",
          },
          {
            name: "Аксессуары для перевозки и хранения",
          },
          {
            name: "Коммутационное аудио- и видеооборудование",
          },
        ],
      },
      {
        name: "Банковское оборудование",
        subcategories: [
          {
            name: "Детекторы и счетчики банкнот",
          },
          {
            name: "Инкассация и опломбирование",
          },
        ],
      },
      {
        name: "Промышленное климатическое оборудование",
        subcategories: [],
      },
    ],
  },
  {
    name: "Уценка",
    subcategories: [
      {
        name: "Поделки",
        subcategories: [
          {
            name: "Поделки и аппликации",
          },
          {
            name: "3D-ручки",
          },
          {
            name: "Товары для декорирования",
          },
          {
            name: "Наклейки для творчества",
          },
          {
            name: "Выжигание и выпиливание",
          },
        ],
      },
      {
        name: "Вязание",
        subcategories: [
          {
            name: "Пряжа",
          },
          {
            name: "Спицы",
          },
          {
            name: "Крючки",
          },
          {
            name: "Наборы для вязания",
          },
          {
            name: "Инструменты и аксессуары",
          },
        ],
      },
      {
        name: "Декупаж",
        subcategories: [
          {
            name: "Лак и клей",
          },
          {
            name: "Наборы для декупажа",
          },
          {
            name: "Карты, салфетки, бумага",
          },
        ],
      },
      {
        name: "Наборы для опытов и исследований",
        subcategories: [
          {
            name: "Наборы для исследований",
          },
          {
            name: "Детские микроскопы и телескопы",
          },
        ],
      },
      {
        name: "Шитье и вышивание",
        subcategories: [
          {
            name: "Ткани, кожа и замша",
          },
          {
            name: "Канва и наборы для вышивания",
          },
          {
            name: "Инструменты и аксессуары",
          },
          {
            name: "Декоративные элементы",
          },
          {
            name: "Нитки, мулине, шнуры",
          },
        ],
      },
      {
        name: "Сборные модели и аксессуары",
        subcategories: [
          {
            name: "Сборные модели",
          },
          {
            name: "Румбоксы",
          },
          {
            name: "Аксессуары",
          },
        ],
      },
      {
        name: "Лепка",
        subcategories: [
          {
            name: "Пластилин и масса для лепки",
          },
          {
            name: "Гипс для литья и лепки",
          },
          {
            name: "Глина для лепки",
          },
          {
            name: "Кинетический песок",
          },
          {
            name: "Инструменты для лепки",
          },
        ],
      },
      {
        name: "Скрапбукинг",
        subcategories: [
          {
            name: "Бумага и наборы",
          },
          {
            name: "Украшения и декоративные элементы",
          },
          {
            name: "Инструменты и аксессуары",
          },
        ],
      },
      {
        name: "Пазлы и головоломки",
        subcategories: [
          {
            name: "Пазлы",
          },
          {
            name: "Головоломки",
          },
        ],
      },
      {
        name: "Рукоделие",
        subcategories: [
          {
            name: "Алмазная мозаика",
          },
          {
            name: "Валяние",
          },
          {
            name: "Квиллинг",
          },
        ],
      },
      {
        name: "Бисер и создание украшений",
        subcategories: [
          {
            name: "Наборы для создания украшений",
          },
          {
            name: "Фурнитура для украшений",
          },
        ],
      },
      {
        name: "Изготовление мыла, свечей, косметики",
        subcategories: [
          {
            name: "Изготовление свечей",
          },
          {
            name: "Мыльная основа, краситель, отдушка",
          },
          {
            name: "Изготовление косметики",
          },
          {
            name: "Формы для мыла",
          },
          {
            name: "Наборы для мыловарения",
          },
        ],
      },
    ],
  },
]);
</script>

<template>
  <div class="px-4 sm:px-16 pt-8">
    <!-- <div v-if="selectedCategory" class="mt-4 text-green-700">
      Вы выбрали: {{ selectedCategory.name }}
    </div> -->
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
          <NuxtLink to="/catalog/ym" class="cursor-pointer text-[#909090]">
            Yandex Market
          </NuxtLink>
        </li>
        <li class="cursor-pointer">
          <NuxtLink to="/ym/buyouts" class="cursor-pointer text-[#909090]">
            Выкупы
          </NuxtLink>
        </li>
        <li class="cursor-pointer text-[#1e2734]">Создать</li>
      </ul>
    </div>
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
    <div>
      <!-- <h1 class="text-2xl font-bold mt-4">Добавить выкупы</h1>
    <p class="text-xs text-gray-500 font-light mt-1 lg:text-sm">
      Создайте новые выкупы. Введите артикулы товаров и заполните необходимые
      данные.
    </p> -->
      <div class="flex flex-col md:flex-row md:justify-between">
        <div class="mt-6 md:flex items-center gap-2.5 w-full">
          <div
            class="relative flex justify-end items-center flex-grow-0 md:w-80 gap-2.5 w-full"
          >
            <input
              ref="codeInput"
              v-model="article"
              placeholder="Введите артикул"
              class="input input-sm w-full mb-2 md:mb-0 bg-base-200 border-base-200"
              @keydown.enter="Number(item)"
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
              class="btn btn-primary text-white hover:text-base-100 btn-sm normal-case border-none font-normal"
              :disabled="!article || article == ''"
              @click="addProduct"
            >
              Добавить
            </button>
            <!-- <label
              for="template-select-modal"
              class="btn btn-sm btn-primary normal-case border-none bg-base-200 text-base-content mr-0 md:mr-1 mb-2 md:mb-0 font-normal hover:bg-primary hover:text-base-100"
              @click="getTemplates"
              >Шаблоны</label
            > -->
          </div>
        </div>
      </div>
      <div class="flex gap-2 mt-4">
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
          <BuyoutYandexMarketCreateCard
            v-for="(product, index) in products"
            :key="`${index}_${refreshKey}`"
            :loading="!pickpoints?.length"
            :product="product"
            :index="index"
            :open-promo="openPromo"
            :categories="categories"
            @point-modal-open="pointModalOpen"
            @rule-modal-open="ruleModalOpen"
            @removePromo="removePromo"
          />
        </div>
        <div
          v-else
          class="products-table scrollbar-thumb-primary scrollbar-track-base-200 scrollbar-thin"
        >
          <table class="table table-xs w-full mt-4">
            <thead class="relative mb-2 text-sm text-base-content">
              <tr class="bg-[#f3e9dd]">
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

                <th class="font-normal" @click="openInfoModal('size')">
                  <!-- <div class="flex justify-between w-full gap-1 items-center"> -->
                  <div class="text-center">
                    <span> Размер </span>
                    <!-- <span class="rounded-lg bg-base-200 px-1 text-xs"> ? </span> -->
                  </div>
                </th>
                <th class="font-normal" @click="openInfoModal('sex')">
                  <!-- <div class="flex justify-between w-full gap-1 items-center"> -->
                  <div class="text-center">
                    <span> Пол </span>
                    <!-- <span class="rounded-lg bg-base-200 px-1 text-xs"> ? </span> -->
                  </div>
                </th>

                <th class="font-normal" @click="openInfoModal('rules')">
                  <!-- <div class="flex justify-between w-full gap-1 items-center"> -->
                  <div class="text-center">
                    <span> Правила </span>
                    <!-- <span class="rounded-lg bg-base-200 px-1 text-xs"> ? </span> -->
                  </div>
                </th>
                <th class="font-normal" @click="openInfoModal('dates')">
                  <!-- <div class="flex justify-between w-full gap-1 items-center"> -->
                  <div class="text-center">
                    <span> Даты выкупов </span>
                    <!-- <span class="rounded-lg bg-base-200 px-1 text-xs"> ? </span> -->
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
                <th class="font-normal text-base-content">
                  <div class="flex justify-center items-center gap-1">
                    <span>Категория</span>
                    <!-- <span class="rounded-lg bg-base-200 px-1 text-xs">?</span> -->
                  </div>
                </th>
                <th
                  class="font-normal text-base-content"
                  @click="openInfoModal('search')"
                >
                  <div class="flex justify-center items-center gap-1">
                    <span>Поисковые запросы</span>
                    <!-- <span class="rounded-lg bg-base-200 px-1 text-xs">?</span> -->
                  </div>
                </th>
                <th class="font-normal text-base-content">
                  <div class="flex justify-center items-center gap-1">
                    <span>Промокод</span>
                    <!-- <span class="rounded-lg bg-base-200 px-1 text-xs">?</span> -->
                  </div>
                </th>

                <th class="text-base-content" />
              </tr>
            </thead>

            <tbody>
              <BuyoutYandexMarketCreateTableRow
                v-for="(product, index) in products"
                :key="`${index}_${refreshKey}`"
                :product="product"
                :index="index"
                :categories="categories"
                :loading="!pickpoints?.length"
                @rule-modal-open="ruleModalOpen"
                @point-modal-open="pointModalOpen"
                :open-promo="openPromo"
                @removePromo="removePromo"
              />
            </tbody>
          </table>
        </div>
        <BuyoutYandexMarketSelectPointModal
          v-if="modalOpen"
          :state="modalOpen"
          :pickpoints="pickpoints"
          @callback="handleAddress"
          @close="closeModal"
          @openCourierModal="openCourierModal"
        />
        <!-- <BuyoutYandexMarketSelectCourierModal
          v-if="modalOpenCourier"
          :state="modalOpenCourier"
          :pickpoints="ffPickpoints"
          v-model:addressInfo="addressForm"
          @callback="handleAddressCourier"
          @close="closeModal"
          @openPickpointModal="openPickpointModal"
        /> -->
      </ClientOnly>
      <div
        v-show="products.length"
        class="mt-6 md:flex justify-start lg:justify-end"
      >
        <div class="m-5 mb-20">
          <!-- <label
          v-if="store.createProducts.length > 0"
          class="btn btn-sm btn-error bg-red-400 normal-case mt-1 ml-0 md:mt-0 md:ml-2 z-0"
          for="removeAllModelCreateProducts"
          >Удалить все</label
        > -->
          <!-- <label
            class="btn btn-sm btn-primary normal-case border-none bg-base-200 text-base-content mt-2 md:mt-0 ml-1 md:ml-2 px-6 font-normal"
            for="template-modal"
          >
            Шаблон
          </label> -->

          <button
            class="btn btn-sm btn-primary normal-case border-none text-white mt-1 ml-2 font-normal"
            :disabled="disabledCreateButton"
            @click="openChecksModal"
          >
            <!-- {{
            products.length > 1
              ? `Создать
          выкупы`
              : `Создать выкуп`
          }} -->
            Создать
          </button>
        </div>
      </div>

      <div v-if="ruleModal">
        <input id="ruleModal" type="checkbox" class="modal-toggle" />
        <label
          for="ruleModal"
          class="modal modal-open modal-bottom sm:modal-middle cursor-pointer"
          @click="ruleModal = false"
        >
          <label for="" class="modal-box relative" @click.stop>
            <label
              for="ruleModal"
              class="btn btn-sm btn-circle btn-ghost absolute right-6 top-2"
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
                <div class="flex gap-4">
                  <input
                    :disabled="products[selectedRuleProductIndex].key"
                    v-model="products[selectedRuleProductIndex].purchaseSoon"
                    type="checkbox"
                    class="checkbox checkbox-primary border-base-content"
                  />
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

                <input
                  :disabled="
                    // !!store.createProducts[selectedRuleProductIndex].rules.find(
                    //   (item) =>
                    //     item.category === rule.category && item.id !== rule.id
                    // ) ||
                    // !!store.createProducts[selectedRuleProductIndex].rules.find(
                    //   (item) => item.id === rule?.relies
                    // )
                    true
                  "
                  type="checkbox"
                  class="checkbox checkbox-primary border-base-content"
                  :checked="
                    !!store.createProducts[selectedRuleProductIndex].rules.find(
                      (item) => item.id === rule.id
                    )
                  "
                  @change="
                    onRuleChange($event, selectedRuleProductIndex, rule.id)
                  "
                />
              </div>
            </div>
          </label>
        </label>
      </div>
      <dialog id="infoModal" ref="infoModal" class="modal">
        <form method="dialog" class="modal-box p-4">
          <h3 class="font-bold text-lg">Информация</h3>
          <div class="py-4 flex flex-col gap-2">
            <p v-if="infoType === 'picture'">
              <span class="font-bold"> Изображение </span>
              - Увеличивайте изображение товара просто наводя на него курсором
            </p>
            <p v-if="infoType === 'price'">
              <span class="font-bold"> Цена </span>
              - Цена товара указана без СПП
            </p>

            <p v-if="infoType === 'size'">
              <span class="font-bold"> Размер </span>
              - Выберите желаемый размер товара
            </p>
            <p v-if="infoType === 'sex'">
              <span class="font-bold"> Пол </span>
              - Выберите желаемый Пол для выкупов
            </p>
            <div v-if="infoType === 'search'">
              <div>
                <span class="font-bold"> Поисковые запросы </span>
                - Введите поисковые запросы, чем больше, тем лучше нажимая на
                "+"
              </div>
              <div class="text-sm">
                Например, при указании 5 поисковых запросов - каждый будет
                выкупаться по своему запросу, если по данному запросу товар не
                найден, то запрос игнорируется.
              </div>
            </div>
            <p v-if="infoType === 'adress'">
              <span class="font-bold"> Адрес </span>
              - Добавьте Адрес желаемого ПВЗ от куда вы будете забирать товар
            </p>
            <p v-if="infoType === 'dates'">
              <span class="font-bold"> Даты выкупов </span>
              - Выберите желаемый диапазон дат и времени для выкупов
            </p>
            <p v-if="infoType === 'rules'">
              <span class="font-bold"> Правила </span>
              - Используйте Правила для создания дополнительной безопасности
              ваших выкупов
            </p>
          </div>
          <div class="modal-action mt-0">
            <button class="btn btn-sm">Закрыть</button>
          </div>
        </form>
      </dialog>
      <BuyoutYandexMarketCreateChecksModal
        v-if="checksModal"
        :is-create-button-disabled="isCreateButtonDisabled"
        :state="checksModal"
        @create="createBuyout"
        @close="checksModal = false"
      />

      <input id="warning-modal" type="checkbox" class="modal-toggle" />
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
      </div>
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
          <BuyoutYandexMarketTemplateExpand
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
    <BuyoutYandexMarketPromoModal
      :show="promoModal"
      :index="currentProductIndex"
      :price="currentProductPrice"
      @close-modal="promoModal = false"
    />
  </div>
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
