<script setup lang="tsx">
import type { Rule } from "@/data/buyout/rules";
import { rules } from "@/data/buyout/rules";
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
  title: "Добавить выкупы Avito",
});
const store = useAvitoBuyoutStore();
const route = useRoute();
const products: any = computed(() => store.createProducts);

onMounted(() => {
  getPickpoints();
  getAvitoPickpoints();
  // if (products.value.length === 0 && !route.query.uuid)
  // modalShow.value = true
});

const isWarningChecked = ref(false);

const disabledCreateButton = ref(false);
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

function handleAddress(address: string, lt: number, lg: number, id: string) {
  modalOpen.value = false;
  store.handleAddress(address, lt, lg, id);
}
function openInfoModal(type: string) {
  infoType.value = type;
  infoModal.value?.showModal();
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

const modalOpen = ref(false);
function closeModal() {
  modalOpen.value = false;
  modalOpenAvito.value = false;
  modalOpenRussianPost.value = false;
  modalOpenDPD.value = false;
  modalOpenSDEK.value = false;
  modalOpenBoxberry.value = false;
  modalOpenPostamat5Post.value = false;
  modalOpenCassa5Post.value = false;
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
        errorMsg = "Не у всех товаров указан поисковый запрос или категория";
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
  const { data, error } = await useFetch("/api/avito/buyout/create", {
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
    navigateTo({ path: "/avito/buyouts" });
  }
}

watch(products.value, (old, value) => {
  value.forEach((item: { quantity: number }, index: string | number) => {
    if (item.quantity < 1) products.value[index].quantity = 1;

    if (item.quantity > 1000) products.value[index].quantity = 1000;
  });
});

async function pointModalOpen(index: number) {
  store.selectedItem = index;
  if (!products.value[index].pvzType) {
    notify({
      title: "Что-то пошло не так",
      text: "Выберите тип пункта выдачи",
      group: "error",
      duration: 3000,
    });
    return;
  }
  if (products.value[index].pvzType == "Почта России") {
    modalOpenRussianPost.value = true;
  }
  if (products.value[index].pvzType == "Boxberry") {
    modalOpenBoxberry.value = true;
  }
  if (products.value[index].pvzType == "СДЭК") {
    modalOpenSDEK.value = true;
  }
  if (products.value[index].pvzType == "DPD") {
    modalOpenDPD.value = true;
  }
  if (products.value[index].pvzType == "Яндекс Доставка") {
    modalOpen.value = true;
  }
  if (products.value[index].pvzType == "Авито") {
    modalOpenAvito.value = true;
  }
  if (products.value[index].pvzType == "Постамат 5Post") {
    modalOpenPostamat5Post.value = true;
  }
  if (products.value[index].pvzType == "Касса 5Post") {
    modalOpenCassa5Post.value = true;
  }
}

onMounted(async () => {
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

  const { data } = await useFetch("/api/avito/buyout/createBuyoutTemplate", {
    method: "POST",
    query: {
      title: templateTitle,
    },
    body: products.value,
    watch: false,
  });

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
  const { data }: any = await useFetch("/api/avito/buyout/templates");
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

const pickpointsLoading = ref(false);
const pickpoints = shallowRef();
const yandexPickpoints = shallowRef();
const avitoPickpoints = shallowRef();
const modalOpenAvito = ref(false);
const DPDPickpoints = shallowRef();
const modalOpenDPD = ref(false);
const SDEKPickpoints = shallowRef();
const modalOpenSDEK = ref(false);
const BoxberryPickpoints = shallowRef();
const modalOpenBoxberry = ref(false);
const RussianPostPickpoints = shallowRef();
const modalOpenRussianPost = ref(false);
const postamat5PostPickpoints = shallowRef();
const modalOpenPostamat5Post = ref(false);
const cassa5PostPickpoints = shallowRef();
const modalOpenCassa5Post = ref(false);

async function getPickpoints() {
  try {
    const data = await $fetch("/api/yandexMarket/buyout/pickpoints", {
      method: "GET",
    });
    yandexPickpoints.value = (data as any).points;
  } catch (e: any) {
    notify({
      title: "Что-то пошло не так",
      text: e?.message,
      group: "error",
      duration: 3000,
    });
  }
}

async function getAvitoPickpoints() {
  pickpointsLoading.value = true;
  try {
    const data = await $fetch("/api/avito/buyout/pickpoints", {
      method: "GET",
    });

    avitoPickpoints.value = (data as any).avitoPickpoints;
    DPDPickpoints.value = (data as any).DPDPickpoints;
    SDEKPickpoints.value = (data as any).SDEKPickpoints;
    BoxberryPickpoints.value = (data as any).BoxberryPickpoints;
    RussianPostPickpoints.value = (data as any).RussianPostPickpoints;
    postamat5PostPickpoints.value = (data as any).postamat5PostPickpoints;
    cassa5PostPickpoints.value = (data as any).cassa5PostPickpoints;
  } catch (e: any) {
    notify({
      title: "Что-то пошло не так",
      text: e?.message,
      group: "error",
      duration: 3000,
    });
  }

  pickpointsLoading.value = false;
}

const prices = ref({
  minPrice: 50,
  price: 10,
  type: "price",
});
const mainStore = useMainStore();
prices.value = await mainStore.getPrices("avito");

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

const categories = ref<any>([
  {
    name: "Транспорт",
    subcategories: [
      {
        name: "Автомобили ",
        subcategories: [],
      },
      {
        name: "Мотоциклы и мототехника ",
        subcategories: [
          {
            name: "Вездеходы",
          },
          {
            name: "Картинг",
          },
          {
            name: "Квадроциклы и багги",
          },
          {
            name: "Мопеды и скутеры",
          },
          {
            name: "Мотоциклы",
          },
          {
            name: "Снегоходы",
          },
        ],
      },
      {
        name: "Грузовики и спецтехника ",
        subcategories: [
          {
            name: "Грузовики",
          },
          {
            name: "Сельхозтехника",
          },
          {
            name: "Седельные тягачи",
          },
          {
            name: "Прицепы",
          },
          {
            name: "Экскаваторы",
          },
          {
            name: "Автобусы",
          },
          {
            name: "Автодома",
          },
          {
            name: "Автокраны",
          },
          {
            name: "Бульдозеры",
          },
          {
            name: "Коммунальная техника",
          },
          {
            name: "Лёгкий коммерческий транспорт",
          },
          {
            name: "Навесное оборудование",
          },
          {
            name: "Погрузчики",
          },
          {
            name: "Строительная техника",
          },
          {
            name: "Техника для лесозаготовки",
          },
          {
            name: "Другое",
          },
        ],
      },
      {
        name: "Аренда спецтехники ",
        subcategories: [
          {
            name: "Подъёмная техника",
          },
          {
            name: "Землеройная техника",
          },
          {
            name: "Коммунальная техника",
          },
          {
            name: "Дорожно-строительная техника",
          },
          {
            name: "Грузовой транспорт",
          },
          {
            name: "Погрузочная техника",
          },
          {
            name: "Навесное оборудование",
          },
          {
            name: "Прицепы",
          },
          {
            name: "Сельхозтехника",
          },
          {
            name: "Другое",
          },
        ],
      },
      {
        name: "Водный транспорт ",
        subcategories: [
          {
            name: "Вёсельные лодки",
          },
          {
            name: "Гидроциклы",
          },
          {
            name: "Катера и яхты",
          },
          {
            name: "Моторные лодки и моторы",
          },
        ],
      },
      {
        name: "Запчасти и аксессуары ",
        subcategories: [
          {
            name: "Запчасти",
          },
          {
            name: "Шины, диски и колёса",
          },
          {
            name: "Аудио- и видеотехника",
          },
          {
            name: "Аксессуары",
          },
          {
            name: "Багажники и фаркопы",
          },
          {
            name: "Инструменты",
          },
          {
            name: "Прицепы",
          },
          {
            name: "Экипировка",
          },
          {
            name: "Масла и автохимия",
          },
          {
            name: "Противоугонные устройства",
          },
          {
            name: "GPS-навигаторы",
          },
        ],
      },
    ],
  },
  {
    name: "Недвижимость",
    subcategories: [
      {
        name: "Купить жильё",
        subcategories: [
          {
            name: "Все квартиры",
          },
          {
            name: "Вторичка",
          },
          {
            name: "Новостройки",
          },
          {
            name: "Каталог новостроек",
          },
          {
            name: "Дома, дачи, коттеджи",
          },
          {
            name: "Комнаты",
          },
        ],
      },
      {
        name: "Путешествия",
        subcategories: [
          {
            name: "Квартиры посуточно",
          },
          {
            name: "Дома, дачи и коттеджи",
          },
          {
            name: "Комнаты и койко-места",
          },
          {
            name: "Отели",
          },
        ],
      },
      {
        name: "Снять долгосрочно",
        subcategories: [
          {
            name: "Квартиры",
          },
          {
            name: "Дома, дачи и коттеджи",
          },
          {
            name: "Комнаты и койко-места",
          },
        ],
      },
      {
        name: "Коммерческая недвижимость",
        subcategories: [
          {
            name: "Купить",
          },
          {
            name: "Снять",
          },
        ],
      },
      {
        name: "Другие категории",
        subcategories: [
          {
            name: "Земельные участки",
          },
          {
            name: "Гаражи и машиноместа",
          },
          {
            name: "Зарубежная недвижимость",
          },
        ],
      },
    ],
  },
  {
    name: "Работа",
    subcategories: [
      {
        name: "Ищу работу ",
        subcategories: [
          {
            name: "Архитектура и дизайн",
          },
          {
            name: "Банковские и финансовые услуги",
          },
          {
            name: "Бытовые и персональные услуги",
          },
          {
            name: "Госслужба",
          },
          {
            name: "Гостиничный бизнес и туризм",
          },
          {
            name: "Добыча, переработка угля, руд и других полезных ископаемых",
          },
          {
            name: "Добыча, переработка, транспортировка нефти и газа",
          },
          {
            name: "Доставка, грузоперевозки и логистика",
          },
          {
            name: "ЖКХ и городская инфраструктура",
          },
          {
            name: "Игорный бизнес",
          },
          {
            name: "Информационные технологии",
          },
          {
            name: "Искусство и развлечения",
          },
          {
            name: "Клининг",
          },
          {
            name: "Консалтинг",
          },
          {
            name: "Лесная и деревообрабатывающая промышленность",
          },
          {
            name: "Маркетинг, реклама и PR",
          },
          {
            name: "Медицина и фармацевтика",
          },
          {
            name: "Металлургическая промышленность",
          },
          {
            name: "НКО и общественная деятельность",
          },
          {
            name: "Оборонная промышленность",
          },
          {
            name: "Образование и наука",
          },
          {
            name: "Общественное питание",
          },
          {
            name: "Организация мероприятий",
          },
          {
            name: "Охрана и общественный порядок",
          },
          {
            name: "Переработка отходов",
          },
          {
            name: "Пищевая промышленность",
          },
          {
            name: "Продажа и обслуживание автомобилей",
          },
          {
            name: "Продажа и управление недвижимостью",
          },
          {
            name: "Производство непродовольственных потребительских товаров",
          },
          {
            name: "Производство промышленного оборудования и станков",
          },
          {
            name: "Производство тканей, одежды и обуви",
          },
          {
            name: "Производство электро- и оптического оборудования",
          },
          {
            name: "Производство электроники и бытовой техники",
          },
          {
            name: "Ракетно-космическая промышленность",
          },
          {
            name: "Ремонт и отделка помещений",
          },
          {
            name: "Ритуальные услуги",
          },
          {
            name: "Розничная и оптовая торговля",
          },
          {
            name: "Сельское хозяйство",
          },
          {
            name: "Склады и хранилища",
          },
          {
            name: "СМИ и издательское дело",
          },
          {
            name: "Страхование",
          },
          {
            name: "Строительство жилых и коммерческих объектов",
          },
          {
            name: "Строительство промышленных и инфраструктурных объектов",
          },
          {
            name: "Такси и пассажирские перевозки",
          },
          {
            name: "Телекоммуникации и связь",
          },
          {
            name: "Техническое обслуживание, ремонт техники и оборудования",
          },
          {
            name: "Транспортное машиностроение",
          },
          {
            name: "Тяжёлое машиностроение",
          },
          {
            name: "Управление персоналом",
          },
          {
            name: "Управление транспортной инфраструктурой",
          },
          {
            name: "Фитнес-клубы, спа и салоны красоты",
          },
          {
            name: "Химическая промышленность",
          },
          {
            name: "Энергетика",
          },
          {
            name: "Юриспруденция",
          },
        ],
      },
      {
        name: "Ищу сотрудника ",
        subcategories: [
          {
            name: "IT, интернет, телеком",
          },
          {
            name: "Автомобильный бизнес",
          },
          {
            name: "Административная работа",
          },
          {
            name: "Банки, инвестиции",
          },
          {
            name: "Без опыта, студенты",
          },
          {
            name: "Бухгалтерия, финансы",
          },
          {
            name: "Высший менеджмент",
          },
          {
            name: "Госслужба, НКО",
          },
          {
            name: "Домашний персонал",
          },
          {
            name: "ЖКХ, эксплуатация",
          },
          {
            name: "Искусство, развлечения",
          },
          {
            name: "Консультирование",
          },
          {
            name: "Курьерская доставка",
          },
          {
            name: "Маркетинг, реклама, PR",
          },
          {
            name: "Медицина, фармацевтика",
          },
          {
            name: "Образование, наука",
          },
          {
            name: "Охрана, безопасность",
          },
          {
            name: "Продажи",
          },
          {
            name: "Производство, сырьё, с/х",
          },
          {
            name: "Страхование",
          },
          {
            name: "Строительство",
          },
          {
            name: "Такси",
          },
          {
            name: "Транспорт, логистика",
          },
          {
            name: "Туризм, рестораны",
          },
          {
            name: "Управление персоналом",
          },
          {
            name: "Фитнес, салоны красоты",
          },
          {
            name: "Юриспруденция",
          },
        ],
      },
    ],
  },
  {
    name: "Услуги",
    subcategories: [
      {
        name: "Автосервис, аренда ",
        subcategories: [
          {
            name: "Автосервисы для автомобилей",
          },
          {
            name: "Автосервисы для грузовиков и спецтехники",
          },
          {
            name: "Автосервисы для другой техники",
          },
          {
            name: "Аренда авто",
          },
          {
            name: "Аренда спецтехники",
          },
        ],
      },
      {
        name: "Грузоперевозки ",
        subcategories: [
          {
            name: "По городу",
          },
          {
            name: "Между городами",
          },
          {
            name: "Международные",
          },
        ],
      },
      {
        name: "Пассажирские перевозки ",
        subcategories: [
          {
            name: "Трансфер",
          },
          {
            name: "Авто под заказ",
          },
          {
            name: "Другое",
          },
        ],
      },
      {
        name: "Грузчики, складские услуги ",
        subcategories: [
          {
            name: "Грузчики",
          },
          {
            name: "Фулфилмент",
          },
        ],
      },
      {
        name: "Услуги эвакуатора ",
        subcategories: [],
      },
      {
        name: "Ремонт и отделка ",
        subcategories: [
          {
            name: "Ремонт квартир и домов под ключ",
          },
          {
            name: "Дизайн интерьеров",
          },
          {
            name: "Сантехника",
          },
          {
            name: "Электрика",
          },
          {
            name: "Сборка и ремонт мебели",
          },
          {
            name: "Окна и балконы",
          },
          {
            name: "Поклейка обоев и малярные работы",
          },
          {
            name: "Потолки",
          },
          {
            name: "Полы и напольные покрытия",
          },
          {
            name: "Штукатурные работы",
          },
          {
            name: "Двери",
          },
          {
            name: "Плиточные работы",
          },
          {
            name: "Столярные и плотницкие работы",
          },
          {
            name: "Гипсокартонные работы",
          },
          {
            name: "Высотные работы",
          },
          {
            name: "Изоляция и утепление",
          },
          {
            name: "Ремонт коммерческих помещений",
          },
          {
            name: "Вентиляция",
          },
          {
            name: "Другое",
          },
        ],
      },
      {
        name: "Строительство ",
        subcategories: [
          {
            name: "Строительство домов под ключ",
          },
          {
            name: "Строительство гаражей, бань, веранд",
          },
          {
            name: "Отделка деревянных домов, бань, саун",
          },
          {
            name: "Кладочные работы",
          },
          {
            name: "Кровельные работы",
          },
          {
            name: "Сварка, ковка, металлоконструкции",
          },
          {
            name: "Фундаментные и бетонные работы",
          },
          {
            name: "Алмазное сверление и резка",
          },
          {
            name: "Снос и демонтаж",
          },
          {
            name: "Фасадные работы",
          },
          {
            name: "Проектирование и сметы",
          },
          {
            name: "Разнорабочие",
          },
          {
            name: "Изыскательные работы",
          },
          {
            name: "Лестницы",
          },
          {
            name: "Газификация",
          },
          {
            name: "Другое",
          },
        ],
      },
      {
        name: "Мастер на час и вскрытие замков ",
        subcategories: [
          {
            name: "Вскрытие и ремонт замков",
          },
          {
            name: "Мастер на час",
          },
        ],
      },
      {
        name: "Сад, благоустройство ",
        subcategories: [
          {
            name: "Скважины, септики, колодцы",
          },
          {
            name: "Водоёмы и фонтаны",
          },
          {
            name: "Дорожное строительство",
          },
          {
            name: "Ограждения, навесы, рольставни",
          },
          {
            name: "Земляные работы",
          },
          {
            name: "Озеленение, уход за садом и огородом",
          },
          {
            name: "Другое",
          },
        ],
      },
      {
        name: "Красота ",
        subcategories: [
          {
            name: "Маникюр, педикюр",
          },
          {
            name: "Услуги парикмахера",
          },
          {
            name: "Ресницы, брови",
          },
          {
            name: "Перманентный макияж",
          },
          {
            name: "Косметология",
          },
          {
            name: "Эпиляция",
          },
          {
            name: "Макияж",
          },
          {
            name: "СПА-услуги, массаж",
          },
          {
            name: "Тату, пирсинг",
          },
          {
            name: "Аренда рабочего места",
          },
          {
            name: "Другое",
          },
        ],
      },
      {
        name: "Здоровье ",
        subcategories: [
          {
            name: "Психология",
          },
          {
            name: "Диетология",
          },
          {
            name: "Фитнес, йога",
          },
        ],
      },
      {
        name: "Ремонт и обслуживание техники ",
        subcategories: [
          {
            name: "Телевизоры",
          },
          {
            name: "Мобильные устройства",
          },
          {
            name: "Фото-, аудио-, видеотехника",
          },
          {
            name: "Кондиционеры, вентиляция",
          },
          {
            name: "Стиральные, сушильные машины",
          },
          {
            name: "Посудомоечные машины",
          },
          {
            name: "Холодильники, морозильные камеры",
          },
          {
            name: "Варочные панели, духовые шкафы",
          },
          {
            name: "Газовые котлы, водонагреватели",
          },
          {
            name: "Кофемашины",
          },
          {
            name: "Швейные машины, оверлоки",
          },
          {
            name: "Другое",
          },
        ],
      },
      {
        name: "Компьютерная помощь ",
        subcategories: [
          {
            name: "Компьютеры",
          },
          {
            name: "Принтеры",
          },
          {
            name: "Оборудование для майнинга",
          },
          {
            name: "Игровые приставки",
          },
          {
            name: "ОС и программы",
          },
          {
            name: "Интернет и другие сети",
          },
        ],
      },
      {
        name: "Монтаж и установка техники ",
        subcategories: [],
      },
      {
        name: "Оборудование, производство ",
        subcategories: [
          {
            name: "Аренда оборудования",
          },
          {
            name: "Производство, обработка",
          },
        ],
      },
      {
        name: "Обучение, курсы ",
        subcategories: [
          {
            name: "Предметы школы и вуза",
          },
          {
            name: "Иностранные языки",
          },
          {
            name: "Детское развитие, логопеды",
          },
          {
            name: "IT, бизнес",
          },
          {
            name: "Дизайн, рисование",
          },
          {
            name: "Красота, здоровье",
          },
          {
            name: "Спорт, танцы",
          },
          {
            name: "Вождение",
          },
          {
            name: "Музыка, театр",
          },
          {
            name: "Профессиональная подготовка",
          },
          {
            name: "Другое",
          },
        ],
      },
      {
        name: "Деловые услуги ",
        subcategories: [
          {
            name: "Бухгалтерия, финансы",
          },
          {
            name: "Консультирование",
          },
          {
            name: "Консультации по недвижимости",
          },
          {
            name: "Полиграфия, наружная реклама",
          },
          {
            name: "Юридические услуги",
          },
        ],
      },
      {
        name: "Страхование ",
        subcategories: [],
      },
      {
        name: "IT, дизайн, маркетинг ",
        subcategories: [
          {
            name: "Реклама, PR, маркетинг",
          },
          {
            name: "Графический дизайн",
          },
          {
            name: "Программирование, настройка CRM",
          },
          {
            name: "Создание сайтов и приложений",
          },
          {
            name: "Тексты, переводы",
          },
          {
            name: "Маркетплейсы, сервисы объявлений",
          },
          {
            name: "Продвижение, соцсети",
          },
          {
            name: "SEO, контекстная реклама",
          },
          {
            name: "Веб- и мобильный дизайн",
          },
          {
            name: "Инфографика для маркетплейсов",
          },
        ],
      },
      {
        name: "Вывоз мусора и вторсырья ",
        subcategories: [
          {
            name: "Вывоз мусора",
          },
          {
            name: "Приём вторсырья",
          },
        ],
      },
      {
        name: "Уборка ",
        subcategories: [
          {
            name: "Генеральная уборка",
          },
          {
            name: "Мойка окон",
          },
          {
            name: "Простая уборка",
          },
          {
            name: "Чистка ковров",
          },
          {
            name: "Чистка мягкой мебели",
          },
        ],
      },
      {
        name: "Дезинфекция, дезинсекция, спецуборка ",
        subcategories: [],
      },
      {
        name: "Бытовые услуги ",
        subcategories: [
          {
            name: "Изготовление ключей",
          },
          {
            name: "Пошив и ремонт одежды",
          },
          {
            name: "Ремонт часов",
          },
          {
            name: "Химчистка, стирка",
          },
          {
            name: "Ювелирные услуги",
          },
        ],
      },
      {
        name: "Праздники, мероприятия ",
        subcategories: [
          {
            name: "Организация и проведение мероприятий",
          },
          {
            name: "Оформление и декор",
          },
          {
            name: "Прокат и аренда для мероприятий",
          },
          {
            name: "Организация досуга и отдыха",
          },
        ],
      },
      {
        name: "Доставка еды и продуктов ",
        subcategories: [
          {
            name: "Доставка готовой еды",
          },
          {
            name: "Другое",
          },
        ],
      },
      {
        name: "Фото- и видеосъёмка ",
        subcategories: [
          {
            name: "Фотосъёмка",
          },
          {
            name: "Видеосъёмка",
          },
          {
            name: "Аренда фотостудии",
          },
        ],
      },
      {
        name: "Няни, сиделки ",
        subcategories: [],
      },
      {
        name: "Уход за животными ",
        subcategories: [],
      },
      {
        name: "Искусство ",
        subcategories: [],
      },
      {
        name: "Охрана, безопасность ",
        subcategories: [],
      },
      {
        name: "Другое ",
        subcategories: [],
      },
    ],
  },
  {
    name: "Личные вещи",
    subcategories: [
      {
        name: "Одежда, обувь, аксессуары ",
        subcategories: [
          {
            name: "Женская одежда",
          },
          {
            name: "Женская обувь",
          },
          {
            name: "Мужская одежда",
          },
          {
            name: "Мужская обувь",
          },
          {
            name: "Сумки, рюкзаки и чемоданы",
          },
          {
            name: "Аксессуары",
          },
        ],
      },
      {
        name: "Детская одежда и обувь ",
        subcategories: [
          {
            name: "Для девочек",
          },
          {
            name: "Для мальчиков",
          },
        ],
      },
      {
        name: "Товары для детей и игрушки ",
        subcategories: [
          {
            name: "Детские коляски",
          },
          {
            name: "Детская мебель",
          },
          {
            name: "Велосипеды и самокаты",
          },
          {
            name: "Товары для кормления",
          },
          {
            name: "Автомобильные кресла",
          },
          {
            name: "Постельные принадлежности",
          },
          {
            name: "Игрушки",
          },
          {
            name: "Товары для купания",
          },
          {
            name: "Товары для школы",
          },
        ],
      },
      {
        name: "Красота и здоровье ",
        subcategories: [
          {
            name: "Приборы и аксессуары",
          },
          {
            name: "Парфюмерия",
          },
          {
            name: "Уход и гигиена",
          },
          {
            name: "Макияж и маникюр",
          },
          {
            name: "Средства для волос",
          },
          {
            name: "Медицинские изделия",
          },
          {
            name: "Другое",
          },
        ],
      },
      {
        name: "Часы и украшения ",
        subcategories: [
          {
            name: "Ювелирные изделия",
          },
          {
            name: "Часы",
          },
          {
            name: "Бижутерия",
          },
        ],
      },
    ],
  },
  {
    name: "Для дома и дачи",
    subcategories: [
      {
        name: "Автосервис, аренда ",
        subcategories: [
          {
            name: "Автосервисы для автомобилей",
          },
          {
            name: "Автосервисы для грузовиков и спецтехники",
          },
          {
            name: "Автосервисы для другой техники",
          },
          {
            name: "Аренда авто",
          },
          {
            name: "Аренда спецтехники",
          },
        ],
      },
      {
        name: "Грузоперевозки ",
        subcategories: [
          {
            name: "По городу",
          },
          {
            name: "Между городами",
          },
          {
            name: "Международные",
          },
        ],
      },
      {
        name: "Пассажирские перевозки ",
        subcategories: [
          {
            name: "Трансфер",
          },
          {
            name: "Авто под заказ",
          },
          {
            name: "Другое",
          },
        ],
      },
      {
        name: "Грузчики, складские услуги ",
        subcategories: [
          {
            name: "Грузчики",
          },
          {
            name: "Фулфилмент",
          },
        ],
      },
      {
        name: "Услуги эвакуатора ",
        subcategories: [],
      },
      {
        name: "Ремонт и отделка ",
        subcategories: [
          {
            name: "Ремонт квартир и домов под ключ",
          },
          {
            name: "Дизайн интерьеров",
          },
          {
            name: "Сантехника",
          },
          {
            name: "Электрика",
          },
          {
            name: "Сборка и ремонт мебели",
          },
          {
            name: "Ещё 14",
          },
        ],
      },
      {
        name: "Строительство ",
        subcategories: [
          {
            name: "Строительство домов под ключ",
          },
          {
            name: "Строительство гаражей, бань, веранд",
          },
          {
            name: "Отделка деревянных домов, бань, саун",
          },
          {
            name: "Кладочные работы",
          },
          {
            name: "Кровельные работы",
          },
          {
            name: "Ещё 11",
          },
        ],
      },
      {
        name: "Мастер на час и вскрытие замков ",
        subcategories: [
          {
            name: "Вскрытие и ремонт замков",
          },
          {
            name: "Мастер на час",
          },
        ],
      },
      {
        name: "Сад, благоустройство ",
        subcategories: [
          {
            name: "Скважины, септики, колодцы",
          },
          {
            name: "Водоёмы и фонтаны",
          },
          {
            name: "Дорожное строительство",
          },
          {
            name: "Ограждения, навесы, рольставни",
          },
          {
            name: "Земляные работы",
          },
          {
            name: "Ещё 2",
          },
        ],
      },
      {
        name: "Красота ",
        subcategories: [
          {
            name: "Маникюр, педикюр",
          },
          {
            name: "Услуги парикмахера",
          },
          {
            name: "Ресницы, брови",
          },
          {
            name: "Перманентный макияж",
          },
          {
            name: "Косметология",
          },
          {
            name: "Ещё 6",
          },
        ],
      },
      {
        name: "Здоровье ",
        subcategories: [
          {
            name: "Психология",
          },
          {
            name: "Диетология",
          },
          {
            name: "Фитнес, йога",
          },
        ],
      },
      {
        name: "Ремонт и обслуживание техники ",
        subcategories: [
          {
            name: "Телевизоры",
          },
          {
            name: "Мобильные устройства",
          },
          {
            name: "Фото-, аудио-, видеотехника",
          },
          {
            name: "Кондиционеры, вентиляция",
          },
          {
            name: "Стиральные, сушильные машины",
          },
          {
            name: "Ещё 7",
          },
        ],
      },
      {
        name: "Компьютерная помощь ",
        subcategories: [
          {
            name: "Компьютеры",
          },
          {
            name: "Принтеры",
          },
          {
            name: "Оборудование для майнинга",
          },
          {
            name: "Игровые приставки",
          },
          {
            name: "ОС и программы",
          },
          {
            name: "Интернет и другие сети",
          },
        ],
      },
      {
        name: "Монтаж и установка техники ",
        subcategories: [],
      },
      {
        name: "Оборудование, производство ",
        subcategories: [
          {
            name: "Аренда оборудования",
          },
          {
            name: "Производство, обработка",
          },
        ],
      },
      {
        name: "Обучение, курсы ",
        subcategories: [
          {
            name: "Предметы школы и вуза",
          },
          {
            name: "Иностранные языки",
          },
          {
            name: "Детское развитие, логопеды",
          },
          {
            name: "IT, бизнес",
          },
          {
            name: "Дизайн, рисование",
          },
          {
            name: "Ещё 6",
          },
        ],
      },
      {
        name: "Деловые услуги ",
        subcategories: [
          {
            name: "Бухгалтерия, финансы",
          },
          {
            name: "Консультирование",
          },
          {
            name: "Консультации по недвижимости",
          },
          {
            name: "Полиграфия, наружная реклама",
          },
          {
            name: "Юридические услуги",
          },
        ],
      },
      {
        name: "Страхование ",
        subcategories: [],
      },
      {
        name: "IT, дизайн, маркетинг ",
        subcategories: [
          {
            name: "Реклама, PR, маркетинг",
          },
          {
            name: "Графический дизайн",
          },
          {
            name: "Программирование, настройка CRM",
          },
          {
            name: "Создание сайтов и приложений",
          },
          {
            name: "Тексты, переводы",
          },
          {
            name: "Ещё 5",
          },
        ],
      },
      {
        name: "Вывоз мусора и вторсырья ",
        subcategories: [
          {
            name: "Вывоз мусора",
          },
          {
            name: "Приём вторсырья",
          },
        ],
      },
      {
        name: "Уборка ",
        subcategories: [
          {
            name: "Генеральная уборка",
          },
          {
            name: "Мойка окон",
          },
          {
            name: "Простая уборка",
          },
          {
            name: "Чистка ковров",
          },
          {
            name: "Чистка мягкой мебели",
          },
        ],
      },
      {
        name: "Дезинфекция, дезинсекция, спецуборка ",
        subcategories: [],
      },
      {
        name: "Бытовые услуги ",
        subcategories: [
          {
            name: "Изготовление ключей",
          },
          {
            name: "Пошив и ремонт одежды",
          },
          {
            name: "Ремонт часов",
          },
          {
            name: "Химчистка, стирка",
          },
          {
            name: "Ювелирные услуги",
          },
        ],
      },
      {
        name: "Праздники, мероприятия ",
        subcategories: [
          {
            name: "Организация и проведение мероприятий",
          },
          {
            name: "Оформление и декор",
          },
          {
            name: "Прокат и аренда для мероприятий",
          },
          {
            name: "Организация досуга и отдыха",
          },
        ],
      },
      {
        name: "Доставка еды и продуктов ",
        subcategories: [
          {
            name: "Доставка готовой еды",
          },
          {
            name: "Другое",
          },
        ],
      },
      {
        name: "Фото- и видеосъёмка ",
        subcategories: [
          {
            name: "Фотосъёмка",
          },
          {
            name: "Видеосъёмка",
          },
          {
            name: "Аренда фотостудии",
          },
        ],
      },
      {
        name: "Няни, сиделки ",
        subcategories: [],
      },
      {
        name: "Уход за животными ",
        subcategories: [],
      },
      {
        name: "Искусство ",
        subcategories: [],
      },
      {
        name: "Охрана, безопасность ",
        subcategories: [],
      },
      {
        name: "Другое ",
        subcategories: [],
      },
    ],
  },
  {
    name: "Запчасти и аксессуары",
    subcategories: [
      {
        name: "Запчасти ",
        subcategories: [
          {
            name: "Для автомобилей",
          },
          {
            name: "Для мототехники",
          },
          {
            name: "Для грузовиков и спецтехники",
          },
          {
            name: "Для водного транспорта",
          },
        ],
      },
      {
        name: "Шины, диски и колёса ",
        subcategories: [
          {
            name: "Шины",
          },
          {
            name: "Шины для грузовиков и спецтехники",
          },
          {
            name: "Мотошины",
          },
          {
            name: "Диски",
          },
          {
            name: "Колпаки",
          },
          {
            name: "Колёса",
          },
        ],
      },
      {
        name: "Аудио- и видеотехника ",
        subcategories: [
          {
            name: "Аксессуары для автоакустики",
          },
          {
            name: "Другое",
          },
          {
            name: "Магнитолы",
          },
          {
            name: "Автоакустика",
          },
          {
            name: "Видеорегистраторы",
          },
          {
            name: "Усилители",
          },
          {
            name: "Переходные рамки",
          },
          {
            name: "Короба и подиумы",
          },
        ],
      },
      {
        name: "Аксессуары ",
        subcategories: [
          {
            name: "Для мото- и водного транспорта",
          },
          {
            name: "Щётки стеклоочистителя",
          },
          {
            name: "Для салона",
          },
          {
            name: "Защита и декор",
          },
          {
            name: "Набор автомобилиста",
          },
          {
            name: "Для колёс",
          },
          {
            name: "Отопительное оборудование",
          },
          {
            name: "Уход",
          },
        ],
      },
      {
        name: "Багажники и фаркопы ",
        subcategories: [
          {
            name: "Поперечные дуги и комплектующие",
          },
          {
            name: "Рейлинги на крышу",
          },
          {
            name: "Фаркопы и комплектующие",
          },
          {
            name: "Крепления для перевозки велосипедов и лыж",
          },
          {
            name: "Экспедиционные багажники",
          },
          {
            name: "Автобоксы",
          },
          {
            name: "КУНГ",
          },
        ],
      },
      {
        name: "Инструменты ",
        subcategories: [],
      },
      {
        name: "Прицепы ",
        subcategories: [
          {
            name: "Бортовые",
          },
          {
            name: "Для водного транспорта",
          },
          {
            name: "Эвакуаторы",
          },
          {
            name: "Запчасти и комплектующие",
          },
          {
            name: "Другое",
          },
        ],
      },
      {
        name: "Экипировка ",
        subcategories: [],
      },
      {
        name: "Масла и автохимия ",
        subcategories: [
          {
            name: "Моторные масла",
          },
          {
            name: "Трансмиссионные масла",
          },
          {
            name: "Охлаждающие жидкости",
          },
          {
            name: "Тормозные жидкости",
          },
          {
            name: "Гидравлические жидкости",
          },
          {
            name: "Жидкости для омывателя стекла",
          },
          {
            name: "Промывочные жидкости, присадки и смазки",
          },
          {
            name: "Другие масла",
          },
          {
            name: "Автокосметика и аксессуары",
          },
          {
            name: "Топливо",
          },
        ],
      },
      {
        name: "Противоугонные устройства ",
        subcategories: [
          {
            name: "Автосигнализации",
          },
          {
            name: "Иммобилайзеры",
          },
          {
            name: "Механические блокираторы",
          },
          {
            name: "Спутниковые системы",
          },
        ],
      },
      {
        name: "GPS-навигаторы ",
        subcategories: [],
      },
    ],
  },
  {
    name: "Электроника",
    subcategories: [
      {
        name: "Телефоны ",
        subcategories: [
          {
            name: "Мобильные телефоны",
          },
          {
            name: "Аксессуары",
          },
          {
            name: "Рации",
          },
          {
            name: "Стационарные телефоны",
          },
        ],
      },
      {
        name: "Аудио и видео ",
        subcategories: [
          {
            name: "Телевизоры и проекторы",
          },
          {
            name: "Наушники",
          },
          {
            name: "Акустика, колонки, сабвуферы",
          },
          {
            name: "Аксессуары",
          },
          {
            name: "Музыкальные центры, магнитолы",
          },
          {
            name: "Усилители и ресиверы",
          },
          {
            name: "Видеокамеры",
          },
          {
            name: "Видео, DVD и Blu-ray плееры",
          },
          {
            name: "Кабели и адаптеры",
          },
          {
            name: "Музыка и фильмы",
          },
          {
            name: "Микрофоны",
          },
          {
            name: "MP3-плееры",
          },
        ],
      },
      {
        name: "Товары для компьютера ",
        subcategories: [
          {
            name: "Комплектующие",
          },
          {
            name: "Мониторы и запчасти",
          },
          {
            name: "Сетевое оборудование",
          },
          {
            name: "Клавиатуры и мыши",
          },
          {
            name: "Аксессуары",
          },
          {
            name: "Джойстики и рули",
          },
          {
            name: "Флэшки и карты памяти",
          },
          {
            name: "Акустика",
          },
          {
            name: "Переносные жёсткие диски",
          },
          {
            name: "Веб-камеры",
          },
          {
            name: "ТВ-тюнеры",
          },
        ],
      },
      {
        name: "Игры, приставки и программы ",
        subcategories: [
          {
            name: "Игровые приставки и аксессуары",
          },
          {
            name: "Игры для приставок",
          },
          {
            name: "Программы",
          },
          {
            name: "Компьютерные игры",
          },
        ],
      },
      {
        name: "Ноутбуки ",
        subcategories: [],
      },
      {
        name: "Настольные компьютеры ",
        subcategories: [
          {
            name: "Системные блоки",
          },
          {
            name: "Моноблоки",
          },
          {
            name: "Другое",
          },
        ],
      },
      {
        name: "Фототехника ",
        subcategories: [
          {
            name: "Оборудование и аксессуары",
          },
          {
            name: "Объективы",
          },
          {
            name: "Компактные фотоаппараты",
          },
          {
            name: "Плёночные фотоаппараты",
          },
          {
            name: "Зеркальные фотоаппараты",
          },
          {
            name: "Бинокли и телескопы",
          },
        ],
      },
      {
        name: "Планшеты и электронные книги ",
        subcategories: [
          {
            name: "Планшеты",
          },
          {
            name: "Аксессуары",
          },
          {
            name: "Электронные книги",
          },
        ],
      },
      {
        name: "Оргтехника и расходники ",
        subcategories: [
          {
            name: "МФУ, копиры и сканеры",
          },
          {
            name: "Принтеры",
          },
          {
            name: "Канцелярия",
          },
          {
            name: "ИБП, сетевые фильтры",
          },
          {
            name: "Телефония",
          },
          {
            name: "Уничтожители бумаг",
          },
          {
            name: "Расходные материалы",
          },
        ],
      },
    ],
  },
  {
    name: "Хобби и отдых",
    subcategories: [
      {
        name: "Билеты и путешествия ",
        subcategories: [
          {
            name: "Карты, купоны",
          },
          {
            name: "Концерты",
          },
          {
            name: "Путешествия",
          },
          {
            name: "Спорт",
          },
          {
            name: "Театр, опера, балет",
          },
          {
            name: "Цирк, кино",
          },
          {
            name: "Шоу, мюзикл",
          },
        ],
      },
      {
        name: "Велосипеды ",
        subcategories: [
          {
            name: "ВМХ",
          },
          {
            name: "Городские",
          },
          {
            name: "Шоссейные",
          },
          {
            name: "Детские",
          },
          {
            name: "Горные",
          },
          {
            name: "Запчасти и аксессуары",
          },
        ],
      },
      {
        name: "Книги и журналы ",
        subcategories: [
          {
            name: "Журналы, газеты, брошюры",
          },
          {
            name: "Книги",
          },
          {
            name: "Учебная литература",
          },
        ],
      },
      {
        name: "Коллекционирование ",
        subcategories: [
          {
            name: "Банкноты",
          },
          {
            name: "Билеты",
          },
          {
            name: "Вещи знаменитостей, автографы",
          },
          {
            name: "Военные вещи",
          },
          {
            name: "Грампластинки",
          },
          {
            name: "Документы",
          },
          {
            name: "Жетоны, медали, значки",
          },
          {
            name: "Игры",
          },
          {
            name: "Календари",
          },
          {
            name: "Картины",
          },
          {
            name: "Киндер-сюрприз",
          },
          {
            name: "Конверты и почтовые карточки",
          },
          {
            name: "Марки",
          },
          {
            name: "Модели",
          },
          {
            name: "Монеты",
          },
          {
            name: "Открытки",
          },
          {
            name: "Пепельницы, зажигалки",
          },
          {
            name: "Пластиковые карточки",
          },
          {
            name: "Спортивные карточки",
          },
          {
            name: "Фотографии, письма",
          },
          {
            name: "Этикетки, бутылки, пробки",
          },
          {
            name: "Другое",
          },
        ],
      },
      {
        name: "Музыкальные инструменты ",
        subcategories: [
          {
            name: "Аккордеоны, гармони, баяны",
          },
          {
            name: "Гитары и другие струнные",
          },
          {
            name: "Духовые",
          },
          {
            name: "Клавишные и синтезаторы",
          },
          {
            name: "Скрипки и другие смычковые",
          },
          {
            name: "Ударные",
          },
          {
            name: "Для студии и концертов",
          },
          {
            name: "Аксессуары",
          },
        ],
      },
      {
        name: "Охота и рыбалка ",
        subcategories: [
          {
            name: "Ножи, мультитулы, топоры",
          },
          {
            name: "Охота",
          },
          {
            name: "Рыбалка",
          },
          {
            name: "Костюмы для охоты и рыбалки",
          },
        ],
      },
      {
        name: "Спорт и отдых ",
        subcategories: [
          {
            name: "Фитнес и тренажёры",
          },
          {
            name: "Зимний спорт",
          },
          {
            name: "Туризм и отдых на природе",
          },
          {
            name: "Единоборства",
          },
          {
            name: "Настольные игры",
          },
          {
            name: "Дайвинг и водный спорт",
          },
          {
            name: "Игры с мячом",
          },
          {
            name: "Ролики и скейтбординг",
          },
          {
            name: "Теннис, бадминтон, пинг-понг",
          },
          {
            name: "Спортивное питание",
          },
          {
            name: "Пейнтбол и страйкбол",
          },
          {
            name: "Бильярд и боулинг",
          },
          {
            name: "Другое",
          },
        ],
      },
    ],
  },
  {
    name: "Животные",
    subcategories: [
      {
        name: "Собаки ",
        subcategories: [],
      },
      {
        name: "Кошки ",
        subcategories: [],
      },
      {
        name: "Птицы ",
        subcategories: [],
      },
      {
        name: "Аквариум ",
        subcategories: [],
      },
      {
        name: "Другие животные ",
        subcategories: [
          {
            name: "Амфибии",
          },
          {
            name: "Грызуны",
          },
          {
            name: "Кролики",
          },
          {
            name: "Лошади",
          },
          {
            name: "Рептилии",
          },
          {
            name: "С/х животные",
          },
          {
            name: "Хорьки",
          },
          {
            name: "Другое",
          },
        ],
      },
      {
        name: "Товары для животных ",
        subcategories: [],
      },
    ],
  },
  {
    name: "Бизнес и оборудование",
    subcategories: [
      {
        name: "Билеты и путешествия ",
        subcategories: [
          {
            name: "Карты, купоны",
          },
          {
            name: "Концерты",
          },
          {
            name: "Путешествия",
          },
          {
            name: "Спорт",
          },
          {
            name: "Театр, опера, балет",
          },
          {
            name: "Ещё 2",
          },
        ],
      },
      {
        name: "Велосипеды ",
        subcategories: [
          {
            name: "ВМХ",
          },
          {
            name: "Городские",
          },
          {
            name: "Шоссейные",
          },
          {
            name: "Детские",
          },
          {
            name: "Горные",
          },
          {
            name: "Запчасти и аксессуары",
          },
        ],
      },
      {
        name: "Книги и журналы ",
        subcategories: [
          {
            name: "Журналы, газеты, брошюры",
          },
          {
            name: "Книги",
          },
          {
            name: "Учебная литература",
          },
        ],
      },
      {
        name: "Коллекционирование ",
        subcategories: [
          {
            name: "Банкноты",
          },
          {
            name: "Билеты",
          },
          {
            name: "Вещи знаменитостей, автографы",
          },
          {
            name: "Военные вещи",
          },
          {
            name: "Грампластинки",
          },
          {
            name: "Ещё 17",
          },
        ],
      },
      {
        name: "Музыкальные инструменты ",
        subcategories: [
          {
            name: "Аккордеоны, гармони, баяны",
          },
          {
            name: "Гитары и другие струнные",
          },
          {
            name: "Духовые",
          },
          {
            name: "Клавишные и синтезаторы",
          },
          {
            name: "Скрипки и другие смычковые",
          },
          {
            name: "Ещё 3",
          },
        ],
      },
      {
        name: "Охота и рыбалка ",
        subcategories: [
          {
            name: "Ножи, мультитулы, топоры",
          },
          {
            name: "Охота",
          },
          {
            name: "Рыбалка",
          },
          {
            name: "Костюмы для охоты и рыбалки",
          },
        ],
      },
      {
        name: "Спорт и отдых ",
        subcategories: [
          {
            name: "Фитнес и тренажёры",
          },
          {
            name: "Зимний спорт",
          },
          {
            name: "Туризм и отдых на природе",
          },
          {
            name: "Единоборства",
          },
          {
            name: "Настольные игры",
          },
          {
            name: "Ещё 8",
          },
        ],
      },
    ],
  },
  {
    name: "Молл",
    subcategories: [
      {
        name: "Одежда и обувь ",
        subcategories: [
          {
            name: "Женская одежда",
          },
          {
            name: "Женская обувь",
          },
          {
            name: "Мужская одежда",
          },
          {
            name: "Мужская обувь",
          },
          {
            name: "Сумки, рюкзаки и чемоданы",
          },
          {
            name: "Аксессуары",
          },
        ],
      },
      {
        name: "Мебель и интерьер ",
        subcategories: [
          {
            name: "Кровати, диваны и кресла",
          },
          {
            name: "Шкафы, комоды и стеллажи",
          },
          {
            name: "Столы и стулья",
          },
          {
            name: "Кухонные гарнитуры",
          },
          {
            name: "Текстиль и ковры",
          },
          {
            name: "Предметы интерьера, искусство",
          },
          {
            name: "Освещение",
          },
          {
            name: "Детская мебель",
          },
          {
            name: "Посуда и товары для кухни",
          },
        ],
      },
      {
        name: "Хобби и отдых ",
        subcategories: [
          {
            name: "Книги и журналы",
          },
          {
            name: "Музыкальные инструменты",
          },
          {
            name: "Спорт и отдых",
          },
        ],
      },
      {
        name: "Электроника ",
        subcategories: [
          {
            name: "Смартфоны",
          },
          {
            name: "Бытовая техника",
          },
          {
            name: "Ноутбуки",
          },
          {
            name: "Настольные компьютеры",
          },
          {
            name: "Аудио и видео",
          },
          {
            name: "Игры, приставки и программы",
          },
          {
            name: "Планшеты и электронные книги",
          },
          {
            name: "Товары для компьютера",
          },
          {
            name: "Фототехника",
          },
          {
            name: "Оргтехника и расходники",
          },
        ],
      },
      {
        name: "Детские товары ",
        subcategories: [
          {
            name: "Одежда для девочек",
          },
          {
            name: "Обувь для девочек",
          },
          {
            name: "Одежда для мальчиков",
          },
          {
            name: "Обувь для мальчиков",
          },
          {
            name: "Игрушки",
          },
          {
            name: "Автокресла",
          },
          {
            name: "Коляски",
          },
          {
            name: "Велосипеды, самокаты",
          },
        ],
      },
      {
        name: "Красота ",
        subcategories: [],
      },
      {
        name: "Стройка ",
        subcategories: [
          {
            name: "Двери",
          },
          {
            name: "Сантехника, водоснабжение и сауна",
          },
          {
            name: "Инструменты",
          },
          {
            name: "Окна и балконы",
          },
          {
            name: "Готовые строения и срубы",
          },
        ],
      },
      {
        name: "Запчасти ",
        subcategories: [
          {
            name: "Запчасти",
          },
          {
            name: "Аудио- и видеотехника",
          },
          {
            name: "GPS-навигаторы",
          },
          {
            name: "Инструменты",
          },
          {
            name: "Аксессуары",
          },
          {
            name: "Противоугонные устройства",
          },
          {
            name: "Экипировка",
          },
        ],
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
          <NuxtLink to="/catalog/avito" class="cursor-pointer text-[#909090]">
            Avito
          </NuxtLink>
        </li>
        <li class="cursor-pointer">
          <NuxtLink to="/avito/buyouts" class="cursor-pointer text-[#909090]">
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
              placeholder="Введите артикул"
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
            <!-- <label
              for="template-select-modal"
              class="btn btn-sm btn-primary normal-case bg-base-200 border-none text-base-content hover:text-white mr-0 md:mr-1 mb-2 md:mb-0 font-normal"
              @click="getTemplates"
              >Шаблоны</label
            > -->
          </div>
        </div>
      </div>
      <div class="flex gap-2 mt-4  flex-wrap">
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
          <BuyoutAvitoCreateCard
            v-for="(product, index) in products"
            :key="index"
            :loading="pickpointsLoading"
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
                  <!-- <Iconme="material-symbols:image-outline" size="20" /> -->
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
                    <span>Пол </span>
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
                <th class="font-normal" @click="openInfoModal('dates')">
                  <div class="text-center">
                    <span> Варинат доставки </span>
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
                <!-- <th
                  class="font-normal text-base-content"
                  @click="openInfoModal('search')"
                >
                  <div class="flex justify-center items-center gap-1">
                    <span>№ квартиры</span>
      
                  </div>
                </th> -->
                <th class="font-normal text-base-content">
                  <div class="flex justify-center items-center gap-1">
                    <span>Категории</span>
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
                    <span>Регион поиска</span>
                    <!-- <span class="rounded-lg bg-base-200 px-1 text-xs">?</span> -->
                  </div>
                </th>
                <th />

                <th class="text-base-content" />
              </tr>
            </thead>

            <tbody>
              <BuyoutAvitoCreateTableRow
                v-for="(product, index) in products"
                :key="index"
                :product="product"
                :index="index"
                :loading="pickpointsLoading"
                :categories="categories"
                @rule-modal-open="ruleModalOpen"
                @point-modal-open="pointModalOpen"
              />
            </tbody>
          </table>
        </div>
        <BuyoutAvitoSelectPointModalYandexMarket
          v-if="modalOpen"
          :state="modalOpen"
          :pickpoints="yandexPickpoints"
          @callback="handleAddress"
          @close="closeModal"
        />
        <BuyoutAvitoSelectPointModalAvito
          v-if="modalOpenAvito"
          :state="modalOpenAvito"
          :pickpoints="avitoPickpoints"
          @callback="handleAddress"
          @close="closeModal"
        />
        <BuyoutAvitoSelectPointModalRussianPost
          v-if="modalOpenRussianPost"
          :state="modalOpenRussianPost"
          :pickpoints="RussianPostPickpoints"
          @callback="handleAddress"
          @close="closeModal"
        />
        <BuyoutAvitoSelectPointModalBoxberry
          v-if="modalOpenBoxberry"
          :state="modalOpenBoxberry"
          :pickpoints="BoxberryPickpoints"
          @callback="handleAddress"
          @close="closeModal"
        />
        <BuyoutAvitoSelectPointModalRussianSDEK
          v-if="modalOpenSDEK"
          :state="modalOpenSDEK"
          :pickpoints="SDEKPickpoints"
          @callback="handleAddress"
          @close="closeModal"
        />
        <BuyoutAvitoSelectPointModalDPD
          v-if="modalOpenDPD"
          :state="modalOpenDPD"
          :pickpoints="DPDPickpoints"
          @callback="handleAddress"
          @close="closeModal"
        />
        <BuyoutAvitoSelectPointModal5Cassa
          v-if="modalOpenCassa5Post"
          :state="modalOpenCassa5Post"
          :pickpoints="cassa5PostPickpoints"
          @callback="handleAddress"
          @close="closeModal"
        />
        <BuyoutAvitoSelectPointModal5Post
          v-if="modalOpenPostamat5Post"
          :state="modalOpenPostamat5Post"
          :pickpoints="postamat5PostPickpoints"
          @callback="handleAddress"
          @close="closeModal"
        />
      </ClientOnly>
      <div
        v-show="products.length"
        class="mt-6 md:flex justify-start lg:justify-end"
      >
        <div class="m-5 mb-20">
          <!-- <label
            class="btn btn-sm btn-primary normal-case bg-base-200 text-base-content border-none mt-2 md:mt-0 ml-1 md:ml-2 px-6 font-normal"
            for="template-modal"
          >
            Шаблон
          </label> -->

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
                    v-model="products[selectedRuleProductIndex].purchaseSoon"
                    type="checkbox"
                    class="checkbox checkbox-primary border-base-content"
                  />
                  <span class="text-sm text-primary">{{ rule.price }}р.</span>
                </div>
              </div>

              <div
                class="label cursor-pointer flex gap-4 items-start justify-between"
              >
                <span class="label-text"
                  >{{ rule.id }}. {{ rule.description }}</span
                >

                <div class="flex gap-2 justify-end">
                <input
                  disabled
                  type="checkbox"
                  class="checkbox checkbox-primary border-base-content"
                  :checked="
                    !!store.createProducts[selectedRuleProductIndex].rules.find(
                      (item: any) => item.id === rule.id,
                    )
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
            <p v-if="infoType === 'quantity'">
              <span class="font-bold"> Количество </span>
              - Указывайте желаемое количество выкупов, но не более 1 выкупа на
              1 ПВЗ в сутки
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
      <BuyoutFlowwowCreateChecksModal
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
          <!-- <BuyoutFlowwowTemplateExpand
            v-for="template in templates"
            :key="template.uuid"
            class="mt-1"
            :uuid="template.uuid"
            :opened="openAll"
            :info="template"
            @get-templates="deleteTemplate"
            @close-modal="closeTemplateModalFN"
          /> -->
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
