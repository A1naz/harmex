<script setup lang="ts">
import { SelectOptionsReviews as SelectOptions } from "~/data/enums";

const { notify } = useNotification();

definePageMeta({
  layout: "app",
  middleware: "auth",
  title: "Отзывы Ozon",
});

const { getData } = useApi();

const route = useRoute();
const end = ref(false);

const mpStore = useMPStore();
const router = useRouter();
const pvz = ref(route.query?.pvz === 'true');

const logModal = ref(false);
const infoModal = ref(false);
const selectedReview = ref({
  uuid: "",
});

const target = ref(null);
const targetIsVisible = ref(false);
const { stop } = useIntersectionObserver(target, ([{ isIntersecting }]) => {
  targetIsVisible.value = isIntersecting;
});

const tabs = [
  { value: "all", name: "Все отзывы" },
  { value: "published", name: "Опубликованные" },
  { value: "available", name: "Доступные" },
  { value: "work", name: "В работе" },
  { value: "canceled", name: "Отмененные" },
  // { value: 'deleting', name: 'На удалении' },
  { value: "deleted", name: "Удаленные" },
  { value: "nofunds", name: "Недостаточно средств" },
  { value: "reviewsUpdate", name: "На проверке" },
  { value: "archived", name: "В архиве" },
];

const searchOptions = ref([
  { value: SelectOptions.article, name: "Артикул" },
  { value: SelectOptions.uuidBuyout, name: "ID выкупа" },
  { value: SelectOptions.idReview, name: "ID отзыва" },
]);

const currentTab = ref<string>("");
const skip = ref<number>(0);
const limit = computed(() => (currentTab.value === "available" ? 1000 : 50));
const loading = ref(false);
const searchType = ref<SelectOptions>(SelectOptions.article);
const searchText = ref("");

const endpoint = computed(() =>
  currentTab.value === "available"
    ? "available"
    : currentTab.value === "all"
    ? "all"
    : "published"
);

const isFetch = ref(true);
const reviews = ref<any>([]);
const availableReviews = ref<any>([]);

function containsOnlyNumbers(str: string) {
  return /^[0-9]+$/.test(str);
}

async function fetchData() {
  isFetch.value = true;

  searchType.value = containsOnlyNumbers(searchText.value)
    ? SelectOptions.article
    : searchText.value.length >= 35
    ? SelectOptions.uuidBuyout
    : SelectOptions.idReview;

  const response: any = await $fetch(`/api/ozon/review/${endpoint.value}`, {
    method: "GET",
    params: {
      skip: skip.value,
      limit: limit.value,
      dateFilter: dateFilter.value,
      tab: currentTab.value,
      pvz: pvz.value,
      search:
        searchText.value.length > 0
          ? {
              [searchType.value]: searchText.value
                .replaceAll(" ", "")
                .replace("#", ""),
            }
          : {},
    },
  });
  if (response) {
    if (response.reviews) {
      reviews.value = [...reviews.value, ...response.reviews];
    }
    if (response.availableReviews) {
      availableReviews.value = response.availableReviews;
    }
    if (response.length < limit.value) end.value = true;
  }
  isFetch.value = false;
  // loading.value = false
}

function changeTab(tab: any) {
  reviews.value = [];
  skip.value = 0;
  end.value = false;
  currentTab.value = tab.value;
  router.push(`/ozon/reviews?status=${tab.value}&pvz=${pvz.value}`);
  fetchData();
}

function onSearchInput(_val: any) {
  if (searchText.value !== "" && searchText.value.trim() === "") {
    return;
  }
  reviews.value = [];
  availableReviews.value = [];
  skip.value = 0;
  end.value = false;
  // loading.value= true
  fetchData();
}

const openedPhoto = ref("");
const selectedUUID = ref("");

function openPhoto(src: string) {
  openedPhoto.value = src;
}
const selectedDelivery = ref("");
const modalOpen = ref(false);
const selectedArticle = ref<any>({});
const isEditMode = ref(false);
const editingReview = ref<any>(null);
  const modalOpenPVZ = ref(false)

function openModal(review: any, uuid: string, deliveryid: string) {
  selectedArticle.value = review;
  selectedUUID.value = uuid;
  selectedDelivery.value = deliveryid;
  isEditMode.value = false;
  editingReview.value = null;
   if (pvz.value == true) {
    modalOpenPVZ.value = true
  } else {

    modalOpen.value = true;
  }
}

function openEditModal(review: any) {
  editingReview.value = review;
  isEditMode.value = true;
  modalOpen.value = true;
}
function closeModal() {
  modalOpen.value = false;
}
function goToPublished() {
  closeModal();
  reviews.value = [];
  availableReviews.value = [];
  skip.value = 0;
  end.value = false;
  fetchData();
}

const uuidForRemove = ref("");
const reviewRemoveModalClose: any = ref(null);
function openRemoveReviewModal(uuid: any) {
  uuidForRemove.value = uuid;
  reviewRemoveModalClose.value?.click();
}

async function removeReview() {
  const { data, error } = await useFetch("/api/ozon/review/delete", {
    method: "POST",
    query: {
      id: uuidForRemove.value,
      pvz: pvz.value,
    },
  });
  if (data.value) {
    notify({
      title: "Отзыв удален",
      text: "Ваш отзыв выставлен на удаление",
     group: "success",
    });
    const startIn = reviews.value.find(
      (rev: any) => rev.uuid === uuidForRemove.value
    );
    reviews.value.splice(startIn, 1);
  }
  if (error.value) {
    notify({
      title: "Что-то пошло не так",
      text: error.value.data?.message,
     group: "error",
      duration: 3000,
    });
  }
}

watch(
  () => targetIsVisible.value,
  (isVisible) => {
    if (isVisible && !end.value) {
      skip.value += limit.value;
      fetchData();
    }
  }
);

onMounted(() => {
  if (route.query.status) {
    currentTab.value = route.query.status.toString();
  }

  if (route.query?.uuid && route.query?.uuid.length > 0) {
    const uuidReview = route.query?.uuid;
    if (uuidReview && typeof uuidReview == "string") {
      // currentTab.value = 'published'
      searchType.value = SelectOptions.idReview;
      searchText.value = uuidReview;
    }
  } else {
    currentTab.value = "all";
    router.push(`/ozon/reviews?status=all&pvz=${pvz.value}`);
  }
  fetchData();
});

async function changeMP(e: any) {
  mpStore.changeMp(
    e.value,
    "reviews",
    route.query?.status ? `?status=${route.query.status}` : ""
  );
}
function selectText() {
  const index = tabs.findIndex((item) =>
    route.query?.status
      ? item.value === route.query?.status
      : item.value === "available"
  );
  if (index === -1) {
    return "Доступные";
  }
  return tabs[index].name;
}
const customLinks = tabs.map((filter) => ({
  title: filter.name,
  value: filter.value,
}));

async function resumeStatus(item: any) {
  const { data, error } = await useFetch(`/api/ozon/review/resume`, {
    method: "POST",
    body: {
      item,
      pvz: pvz.value,
    },
    watch: false,
  });
  if (error.value) {
    notify({
      title: "Что-то пошло не так",
      text: error.value?.data?.message,
     group: "error",
      duration: 3000,
    });
    return;
  }
  if (data.value) {
    notify({
     group: "success",
      title: "Успешно",
      text: "Отзыв успешно возвращен в работу",
      duration: 3000,
    });
    reviews.value = [];
    skip.value = 0;
    end.value = false;
    fetchData();
  }
}

const orgInfo = ref({}) as any;
const isVisible = ref(false);

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
  const type = "reviews";
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
  const type = "reviews";
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

const dateFilter = ref("all");
async function selectFilterDate(e: any) {
  dateFilter.value = e.value;
  reviews.value = [];
  availableReviews.value = [];
  skip.value = 0;
  end.value = false;
  fetchData();
}

async function cancelReview(item: any) {
  const { data, error } = await useFetch(`/api/ozon/review/cancel`, {
    method: "POST",
    body: {
      uuid: item.uuid,
      pvz: pvz.value,
    },
  });
  if (error.value) {
    notify({
      title: "Что-то пошло не так",
      text: error.value?.data?.message,
      group: "error",
    });
    return;
  }
  if (data.value) {
    notify({
      title: "Успешно",
      text: "Заявка на отзыв успешно отменена",
      group: "success",
    });
    reviews.value = [];
    skip.value = 0;
    end.value = false;
    fetchData();
  }
}
</script>

<template>
  <div class="px-4 sm:px-16">
    <div>
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
          <li class="cursor-pointer text-[#1e2734]">Отзывы</li>
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
              @click="copyToClipboard(`${siteUrl}/ozon/reviews`)"
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
          <div class="export lg:absolute right-0 top-0">
            <ExportXls
              api="/api/ozon/review/export"
              file-name="HARMEX Доступные отзывы"
              :is-visible="true"
            />
          </div>
          <div class="w-full flex gap-1 lg:gap-2">
            <div class="flex gap-1 lg:gap-3 flex-nowrap whitespace-nowrap">
              <span
                ><CustomSelect
                  class="h-[2rem] min-w-[95px]"
                  :tabs="customLinks"
                  :status-text="selectText()"
                  @change-value="changeTab"
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
              <!-- <CustomSelect
                class="h-[2rem] bg-[#f4f4f4]"
                :tabs="searchOptions.map((el: any) => ({ title: el.name, value: el.value }))"
                @change-value="(e: any) => (searchType = e.value)"
              /> -->
            </div>
            <div class="flex lg:ml-auto gap-0.5 lg:gap-3">
                <CustomSelect
                     class="h-[2rem] min-w-[95px]"
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
              class="absolute right-0 top-0 w-[calc(100%-60px)] lg:w-fit lg:static lg:mr-[60px]"
            >
              <label
                class="w-full flex bg-[#ececed] rounded-lg items-center justify-between"
              >
                <input
                  v-model="searchText"
                  type="text"
                  class="input input-sm w-[134px] bg-transparent bg-opacity-40 rounded-r-none"
                  placeholder="Поиск"
                  @change="onSearchInput"
                />
                <div
                  class="hover:bg-transparent bg-transparent bg-opacity-40 flex items-center px-2 rounded-r-lg cursor-pointer"
                  @click="onSearchInput"
                >
                  <span
                    v-if="loading"
                    class="loading loading-spinner loading-xs"
                  />
                  <Icon
                    v-else
                    class="text-gray-500"
                    name="tabler:search"
                    size="20"
                  />
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
      <div style="min-height: 500px">
        <div
          v-if="
            (reviews && reviews.length > 0) ||
            (availableReviews && availableReviews.length > 0)
          "
          class="mt-6"
        >
          <div
            v-if="currentTab === 'available' || currentTab === 'all'"
          class="cards grid grid-cols-1 gap-4 lg:grid-cols-3 2xl:grid-cols-4"
          >
            <ReviewOzonCard
              v-for="(review, index) of availableReviews"
              :key="index"
              :index="index"
              :info="review"
              @open-modal="(b: string, d: string) => openModal(review, b, d)"
            />
          </div>
          <div
            class="mt-2 mb-5 divider"
            v-if="currentTab == 'all' && availableReviews.length"
          ></div>
          <div
            v-if="currentTab !== 'available'"
            class="cards grid grid-cols-1 gap-4 lg:grid-cols-3 2xl:grid-cols-4"
          >
            <ReviewOzonPublishedCard
              v-for="(review, index) of reviews"
              :key="index"
              :index="index"
              :info="review"
              @remove-review="openRemoveReviewModal"
              @open-image="openPhoto"
              @resume-status="resumeStatus"
              @get-review="fetchData()"
              @log-modal="(item: any) => [(selectedReview = item), (logModal = true)]"
              @info-modal="(item: any) => [(selectedReview = item), (infoModal = true)]"
              @cancelReview="cancelReview"
              @edit-review="openEditModal"
            />
          </div>

          <div
            v-if="!isFetch && reviews && reviews.length > 0"
            ref="target"
            class="flex justify-center items-center h-4 mb-10"
          />
        </div>
        <div
          v-else-if="isFetch"
          class="w-full mt-5 flex justify-center items-center"
        >
          <span class="loading loading-dots loading-lg text-primary" />
        </div>
        <Hero v-if="!reviews.length && !isFetch && !availableReviews.length" />
      </div>

      <ReviewOzonModal
        v-if="modalOpen"
        :review="isEditMode ? editingReview : selectedArticle"
        :deliveryid="isEditMode ? '' : selectedDelivery"
        :state="modalOpen"
        :uuid="isEditMode ? editingReview?.uuid : selectedUUID"
        :is-edit-mode="isEditMode"
        :existing-review="isEditMode ? editingReview : null"
        @publish="goToPublished"
        @close="closeModal"
      />

      <ReviewOzonModalPVZ
        v-if="modalOpenPVZ"
        :review="selectedArticle"
        :deliveryid="selectedDelivery"
        :state="modalOpenPVZ"
        :uuid="selectedUUID"
        @publish="goToPublished"
        @close="closeModal"
      />

      <!-- Put this part before </body> tag -->
      <input id="reviewImageModal" type="checkbox" class="modal-toggle" />

      <label for="reviewImageModal" class="modal cursor-pointer">
        <label for="" class="modal-box p-0 overflow-hidden">
          <label
            for="reviewImageModal"
            class="btn btn-sm btn-ghost btn-circle absolute right-2 top-2"
            >✕</label
          >
          <nuxt-img
            v-if="openedPhoto"
            fit="contain"
            class="object-contain m-auto max-h-[80vh]"
            :src="openedPhoto || ''"
            loading="lazy"
          />
        </label>
      </label>
    </div>
    <div>
      <input id="reviewRemoveModal" type="checkbox" class="modal-toggle" />
      <div class="modal">
        <div class="modal-box max-w-xs py-6 px-3">
          <h3 class="font-bold text-xl">
            Вы уверены что хотите удалить отзыв?
          </h3>
          <p class="py-2.5">Стоимость услуги 100 рублей!</p>
          <div class="flex justify-between">
            <label
              ref="reviewRemoveModalClose"
              for="reviewRemoveModal"
              class="btn btn-ghost w-1/2"
              >Отмена</label
            >
            <label
              for="reviewRemoveModal"
              class="btn btn-[#ebedff] hover:bg-primary w-1/2"
              @click="removeReview"
              >Удалить</label
            >
          </div>
        </div>
      </div>
    </div>
    <ManualModal
      :show="manualModal"
      @close="manualModal = false"
      :is-checked="isChecked"
      @checkbox-toggle="toggleCheckbox"
    >
      <h3 class="text-xl font-bold mb-2 flex items-center gap-1">
        Как опубликовать отзыв после получения товара на ПВЗ?
      </h3>
      <p class="my-4">
        Публикация отзывов — важная часть продвижения товара на маркетплейсах.
        Чтобы отзыв был принят и прошёл модерацию без задержек, следуйте
        приведённой ниже пошаговой инструкции.
      </p>


      <hr class="my-4 border-gray-300" />

      <p class="font-bold mb-3">Шаг 1. Условия для публикации</p>

      <p class="mb-3">Перед публикацией отзыва необходимо:</p>

      <ul class="list-disc ml-6 mb-4 space-y-1">
        <li>Совершить выкуп товара через меню «Выкупы».</li>
        <li>После получения товара в разделе «Доставки» — используйте коды для выдачи товара на ПВЗ.</li>
        <li>На следующий день после подтверждения получения у вас автоматически появится заявка на публикацию отзыва.</li>
      </ul>

      <hr class="my-4 border-gray-300" />

      <p class="font-bold mb-3">Шаг 2. Группировка заявок</p>

      <p class="mb-3">Все заявки формируются <strong>по артикулу товара</strong>.</p>

      <p class="mb-4">
        Например: если вы выкупили 10 единиц одного артикула, у вас появится одна общая заявка, внутри которой можно выбрать конкретные доставки для публикации отзыва.
      </p>

      <NuxtImg
        src="https://ozonmpportal.hb.vkcs.cloud/harmex/introduction/wildberries/13.png"
        class="mx-1 my-2"
      />

      <hr class="my-4 border-gray-300" />

      <p class="font-bold mb-3">Шаг 3. Форматы отзывов</p>

      <p class="mb-3">Вы можете публиковать отзывы в трёх форматах:</p>

      <ul class="list-disc ml-6 mb-4 space-y-1">
        <li>Текстовый</li>
        <li>Фото</li>
        <li>Видео</li>
      </ul>

      <p class="mb-4">
        Если хотите, чтобы Harmex подготовил 3 варианта текстового отзыва с помощью искусственного интеллекта, нажмите кнопку «Сгенерировать отзывы» (цена — 30 руб).
      </p>

      <NuxtImg
        src="https://ozonmpportal.hb.vkcs.cloud/harmex/introduction/wildberries/14.png"
        class="mx-1 my-2"
      />

      <hr class="my-4 border-gray-300" />

      <p class="font-bold mb-3">Шаг 4. Планирование публикации</p>

      <p class="mb-3">После создания отзыва:</p>

      <ol class="list-decimal ml-6 mb-4 space-y-1">
        <li>Укажите <strong>дату и время</strong> публикации — это поможет равномерно распределить активность.</li>
        <li>Нажмите <strong>«Отправить»</strong>.</li>
        <li>Отзыв будет отправлен на публикацию в заданное вами время.</li>
      </ol>

      <hr class="my-4 border-gray-300" />

      <p class="font-bold mb-3">Шаг 5. Модерация и результат</p>

      <p class="mb-3">
        Публикация отзывов проходит <strong>ручную модерацию маркетплейса</strong>.
      </p>
      <p class="mb-3">
        Скорость и результат зависят от:
      </p>

      <ul class="list-disc ml-6 mb-4 space-y-1">
        <li>состояния вашего магазина;</li>
        <li>соотношения выкупов и отзывов (не более 30% от общего количества выкупов);</li>
        <li>стабильности публикаций (избегайте резких всплесков активности);</li>
        <li>разнообразия ПВЗ (не публикуйте все отзывы с одного пункта выдачи).</li>
      </ul>

      <p class="mb-4">
        Маркетплейсы ценят постепенный рост и стабильность — ориентируйтесь на увеличение активности примерно на 10% в месяц.
      </p>

      <hr class="my-4 border-gray-300" />

      <p class="font-bold mb-3">Шаг 6. Статусы отзывов</p>

      <p class="mb-3">
        В разделе <strong>«Отзывы»</strong> вы можете отслеживать статус каждой заявки:
      </p>

      <ul class="list-disc ml-6 mb-4 space-y-2">
        <li><strong>Активен</strong> - отзыв готов к публикации, ожидает планируемого времени.</li>
        <li><strong>В работе</strong> - отзыв проходит модерацию маркетплейса.</li>
        <li><strong>Опубликован</strong> - отзыв успешно опубликован. Списание за услугу отображается в меню «Финансы».</li>
        <li><strong>Отменён</strong> - отзыв не прошёл модерацию, услуга не оплачивается.</li>
        <li><strong>В архиве</strong> - отзыв отклонён маркетплейсом, ожидает оспаривания.</li>
      </ul>

      <hr class="my-4 border-gray-300" />

      <p class="font-bold mb-3">Шаг 7. Если отзыв отклонён</p>

      <p class="mb-3">
        Если заявка перешла в статус <strong>«В архиве»</strong>:
      </p>

      <ol class="list-decimal ml-6 mb-4 space-y-1">
        <li>Нажмите <strong>кнопку → «Оспорить отзыв»</strong>.</li>
        <li>Если в течение 7 дней статус не изменится, значит маркетплейс заблокировал публикацию окончательно.</li>
      </ol>

      <NuxtImg
        src="https://ozonmpportal.hb.vkcs.cloud/harmex/introduction/wildberries/15.png"
        class="mx-1 my-2"
      />

      <hr class="my-4 border-gray-300" />

      <p class="font-bold mb-3">Шаг 8. Дополнение к отзыву</p>

      <p class="mb-3">
        Если вы хотите внести изменения или добавить фото/видео:
      </p>

      <ul class="list-disc ml-6 mb-4 space-y-1">
        <li>Нажмите <strong>«Дополнить отзыв»</strong>.</li>
        <li>Укажите новые данные и отправьте повторно.</li>
        <li>Стоимость публикации дополнения — <strong>50 руб.</strong></li>
      </ul>

      <hr class="my-4 border-gray-300" />

      <p class="font-bold mb-3">Рекомендации по успешной публикации</p>

      <ul class="list-disc ml-6 mb-4 space-y-1">
        <li>Публикуйте ежедневно и равномерно, без резких скачков.</li>
        <li>Соблюдайте соотношение отзывов к выкупам ≤ 30%.</li>
        <li>Используйте разные ПВЗ для выкупов.</li>
        <li>Поддерживайте стабильный прирост отзывов — маркетплейсы доверяют стабильным магазинам.</li>
      </ul>


    </ManualModal>
    <LogModal
      :info="selectedReview"
      :state="logModal"
      @close="logModal = false"
    />
    <ReviewOzonInfoModal
      :info="selectedReview"
      :state="infoModal"
      @close="infoModal = false"
    />
  </div>
</template>

<style scoped></style>
