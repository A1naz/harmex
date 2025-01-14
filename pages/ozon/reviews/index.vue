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

const logModal = ref(false);
const selectedReview = ref({
  uuid: "",
});

const target = ref(null);
const targetIsVisible = ref(false);

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
async function fetchData() {
  isFetch.value = true;
  const response: any[] = await $fetch(`/api/ozon/review/${endpoint.value}`, {
    method: "GET",
    params: {
      skip: skip.value,
      limit: limit.value,
      tab: currentTab.value,
      search:
        searchText.value.length > 0
          ? { [searchType.value]: searchText.value }
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
  router.push(`/ozon/reviews?status=${tab.value}`);
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

function openModal(review: any, uuid: string, deliveryid: string) {
  selectedArticle.value = review;
  selectedUUID.value = uuid;
  selectedDelivery.value = deliveryid;
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
    },
  });
  if (data.value) {
    notify({
      title: "Отзыв удален",
      text: "Ваш отзыв выставлен на удаление",
      type: "success",
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
      type: "error",
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
  if (route.query?.idReview && route.query?.idReview.length > 0) {
    const idReview = route.query?.idReview;
    if (idReview && typeof idReview == "string") {
      currentTab.value = "published";
      searchType.value = SelectOptions.idReview;
      searchText.value = idReview;
    }
  } else if (route.query.status) {
    currentTab.value = route.query.status.toString();
  } else {
    currentTab.value = "available";
    router.push("/ozon/reviews?status=available");
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
    },
    watch: false,
  });
  if (error.value) {
    notify({
      title: "Что-то пошло не так",
      text: error.value?.data?.message,
      type: "error",
      duration: 3000,
    });
    return;
  }
  if (data.value) {
    notify({
      type: "success",
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
          <div class="export lg:absolute right-0 top-0">
            <ExportXls
              api="/api/avito/review/export"
              file-name="MARKETMONSTR Доступные отзывы"
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
              <CustomSelect
                class="h-[2rem] bg-[#f4f4f4]"
                :tabs="searchOptions.map((el: any) => ({ title: el.name, value: el.value }))"
                @change-value="(e: any) => (searchType = e.value)"
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
            class="cards grid grid-cols-1 gap-4"
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
        :review="selectedArticle"
        :deliveryid="selectedDelivery"
        :state="modalOpen"
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
            Вы уверенны что хотите удалить отзыв?
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
              class="btn btn-[#ebedff] hover:bg-[#b2baff] w-1/2"
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
        Как опубликовать отзыв?
      </h3>
      <p class="my-4">
        Публикация отзывов на выполненные заказы — важный этап для поддержания
        рейтинга вашего товара и нейтрализации негативных отзывов.
      </p>
      <p class="my-4">
        Для этого используйте меню <strong>"Отзывы"</strong> в вашем личном
        кабинете. Ниже приведена подробная инструкция с учетом всех нюансов.
      </p>
      <p class="divider"></p>
      <p class="mt-4 mb-2"><strong>Переход в меню "Отзывы"</strong></p>
      <ul class="list-disc ml-10">
        <li class="mt-1">Войдите в личный кабинет Harmex.</li>
        <li class="mt-1">Перейдите в раздел <strong>"Отзывы"</strong>.</li>
        <li class="mt-1">
          Здесь вы можете управлять всеми отзывами: планировать их публикацию,
          отслеживать статусы и редактировать данные.
        </li>
      </ul>

      <nuxt-img
        alt=""
        class="flex mx-auto w-full px-4 mt-4"
        src="https://ozonmpportal.hb.vkcs.cloud//ozonmpportal/harmex/manualImages/wildberries/buyout2_4.png"
      />
      <p class="divider"></p>
      <p class="mt-4 mb-2"><strong>Планирование публикации отзывов</strong></p>
      <ul class="list-disc ml-10">
        <li class="mt-1">
          В меню <strong>"Отзывы"</strong> вы можете запланировать публикацию
          отзывов <strong>на недели и месяцы вперед.</strong>
        </li>
        <li class="mt-1">
          Это помогает поддерживать рейтинг товара и перекрывать негативные
          отзывы.
        </li>
      </ul>
      <p class="divider"></p>
      <p class="mt-4 mb-2"><strong>Публикация отзыва</strong></p>
      <p class="mt-4 mb-2">
        Чтобы опубликовать отзыв, выполните следующие шаги:
      </p>
      <ul class="list-decimal ml-10">
        <li class="mt-1">
          <strong>Выберите доступный отзыв</strong>
          <ul class="list-disc ml-6">
            <li class="mt-1">
              В меню <strong>"Отзывы"</strong> найдите заказ, по которому хотите
              оставить отзыв.
            </li>
          </ul>
        </li>

        <li class="mt-1">
          <strong>Выберите нужный заказ</strong>
          <ul class="list-disc ml-6">
            <li class="mt-1">Нажмите на заказ, чтобы открыть детали.</li>
          </ul>
        </li>
        <li class="mt-1">
          <strong>Заполните поля данными</strong>
          <ul class="list-disc ml-6">
            <li class="mt-1">Введите текст отзыва.</li>
            <li class="mt-1">Укажите оценку (например, 5 звезд).</li>
            <li class="mt-1">Добавьте фото или видео, если это необходимо.</li>
          </ul>
        </li>
        <li class="mt-1">
          <strong>Запланируйте дату и время публикации</strong>
          <ul class="list-disc ml-6">
            <li class="mt-1">
              Выберите удобную дату и время для публикации отзыва.
            </li>
            <li class="mt-1">
              Это позволяет равномерно распределять отзывы и поддерживать
              активность.
            </li>
          </ul>
        </li>
        <li class="mt-1">
          <strong>Нажмите кнопку "Опубликовать"</strong>
          <ul class="list-disc ml-6">
            <li class="mt-1">
              После заполнения всех данных нажмите кнопку
              <strong>"Опубликовать"</strong>.
            </li>
            <li class="mt-1">Отзыв будет отправлен на модерацию.</li>
          </ul>
        </li>
      </ul>
      <p class="divider"></p>
      <p class="my-4"><strong>Статусы отзывов</strong></p>
      <ul class="list-decimal ml-10">
        <li class="mt-1">
          <strong>Активен</strong>
          <ul class="list-disc ml-6">
            <li class="mt-1">
              Отзыв взят в работу и ожидает своего окна для прохождения
              процедуры публикации.
            </li>
          </ul>
        </li>
        <li class="mt-1">
          <strong>В работе</strong>
          <ul class="list-disc ml-6">
            <li class="mt-1">
              Отзыв проходит модерацию на маркетплейсе и ожидает решения по
              публикации.
            </li>
          </ul>
        </li>
        <li class="mt-1">
          <strong>Опубликован</strong>
          <ul class="list-disc ml-6">
            <li class="mt-1">
              Отзыв успешно прошел модерацию и опубликован в списке отзывов.
            </li>
            <li class="mt-1">
              Списание за оказанную услугу вы найдете в меню
              <strong>"Финансы"</strong>.
            </li>
          </ul>
        </li>
        <li class="mt-1">
          <strong>Отменен</strong>
          <ul class="list-disc ml-6">
            <li class="mt-1">
              Отзыв не прошел модерацию и убран из списка ожидания.
            </li>
            <li class="mt-1">
              Услуга в этом случае <strong>не оплачивается</strong>.
            </li>
          </ul>
        </li>
      </ul>
      <p class="divider"></p>
      <p class="my-4"><strong>Важные примечания</strong></p>
      <ul class="list-disc ml-10">
        <li class="mt-1">
          <strong>Планируйте отзывы заранее.</strong>
          <br />
          Это помогает поддерживать равномерный поток положительных отзывов и
          улучшает рейтинг товара.
        </li>
        <li class="mt-1">
          <strong> Следите за статусами. </strong>
          <br />Регулярно проверяйте статусы отзывов, чтобы оперативно
          реагировать на изменения.
        </li>
        <li class="mt-1">
          <strong>Используйте фото и видео. </strong>
          <br />Отзывы с мультимедиа имеют больший вес и привлекают больше
          внимания покупателей.
        </li>
        <li class="mt-1">
          <strong> Избегайте шаблонных текстов.</strong>
          <br />Уникальные и подробные отзывы вызывают больше доверия.
        </li>
      </ul>

      <p class="divider"></p>
      <p class="my-4"><strong>Пример работы с меню "Отзывы"</strong></p>
      <ul class="list-decimal ml-10">
        <li>
          Вы заходите в меню <strong>"Отзывы"</strong> и видите список заказов,
          готовых к отзывам.
        </li>
        <li>Выбираете заказ, по которому хотите оставить отзыв.</li>
        <li>
          Заполняете текст отзыва, ставите оценку 5 звезд и добавляете фото
          товара.
        </li>
        <li>Планируете публикацию на удобную дату и время.</li>
        <li>Нажимаете кнопку <strong>"Опубликовать".</strong></li>
        <li>
          Отслеживаете статус отзыва: сначала <strong>"Активен"</strong>, затем
          <strong>"В работе"</strong>, и, наконец,
          <strong>"Опубликован"</strong>.
        </li>
        <li>
          Если отзыв отклонен (статус <strong>"Отменен"</strong>>), то ваша
          заявка не прошла модерацию и попытка опубликовать отзыв исчерпано
          согласно правилам маркетплейса.
        </li>
      </ul>
      <p class="divider"></p>
      <p class="my-4"><strong>Рекомендации</strong></p>
      <ul class="list-decimal ml-10">
        <li>
          Публикуйте отзывы регулярно, чтобы поддерживать высокий рейтинг
          товара.
        </li>
        <li>
          Используйте планирование для равномерного распределения отзывов.
        </li>
        <li>
          В случае проблем с публикацией отзыва обращайтесь в службу заботы
          Harmex.
        </li>
      </ul>
    </ManualModal>
    <LogModal
      :info="selectedReview"
      :state="logModal"
      @close="logModal = false"
    />
  </div>
</template>

<style scoped></style>
