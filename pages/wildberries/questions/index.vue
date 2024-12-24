<script setup lang="ts">
const { notify } = useNotification();

definePageMeta({
  layout: "app",
  middleware: "auth",
  title: "Вопросы",
});
const mpStore = useMPStore();
const questions = ref([]) as any;
const sortPage = ref("all");
const sortPageDate = ref("");
const modalShow = ref<boolean>(false);
const logModal = ref(false);
const selectedQuest = ref({
  uuid: "",
});

const search = reactive({
  text: "",
  loading: false,
  error: false,
  type: "article",
});
const codeInput = ref();

const loading = ref(false);
const limit = ref(50);
const skip = ref(0);
const end = ref(false);
const target = ref(null);
const targetIsVisible = ref(false);
// eslint-disable-next-line unused-imports/no-unused-vars
const { stop } = useIntersectionObserver(target, ([{ isIntersecting }]) => {
  targetIsVisible.value = isIntersecting;
});
watch(targetIsVisible, async (isVisible) => {
  if (!end.value && isVisible && questions.value.length >= limit.value) {
    await getQuestions();
  }
});

async function getQuestions() {
  modalShow.value = false;
  // eslint-disable-next-line ts/ban-ts-comment
  // @ts-ignore
  const { data, error } = await useFetch("/api/wildberries/questions/get", {
    method: "GET",
    query: {
      statusQuery: sortPage.value,
      dateFilter: sortPageDate.value,
      string: search.text,
      type: search.type,
      limit: limit.value,
      skip: skip.value,
    },
  });
  if ((data.value as any)?.length === 0) {
    loading.value = false;
    end.value = true;
    return;
  }
  if (data.value) {
    questions.value = [...questions.value, ...(data.value! as any)];
    loading.value = false;
  }

  if (error.value) {
    notify({
      type: "error",
      title: "Не удалось получить вопросы",
      text: error.value.message,
    });
  }
  skip.value += limit.value;
  loading.value = false;
}
await getQuestions();

function getStatus(status: string) {
  if (status === "created") {
    return "Создан";
  } else if (status === "work") {
    return "В работе";
  } else if (status === "busy") {
    return "В работе";
  } else if (status === "completed") {
    return "Завершен";
  } else if (status === "nofunds") {
    return "Недостаточно средств";
  } else if (status === "archived") {
    return "Архивирован";
  } else if (status === "spam") {
    return "Определен как спам";
  }
}

async function resumeStatus(item: any) {
  const { data, error } = await useFetch("/api/wildberries/questions/resume", {
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
      text: "Вопрос успешно возвращен в работу",
      duration: 3000,
    });
    selectFilterDate({ value: sortPage.value });
  }
}

async function selectFilterDate(e: any, date?: boolean) {
  if (date) {
    sortPageDate.value = e.value;
  } else {
    sortPage.value = e.value;
  }
  loading.value = true;
  questions.value = [];
  skip.value = 0;
  end.value = false;
  await getQuestions();
}

async function findBuyouts(value: string) {
  questions.value = [];
  skip.value = 0;
  end.value = false;
  if (!value) {
    search.loading = false;
    await getQuestions();
    return;
  }
  loading.value = true;
  await getQuestions();

  search.loading = false;
}

const findBuyoutsDebounced = useDebounceFn(findBuyouts, 1000);

async function onSearchInput() {
  search.loading = true;
  findBuyoutsDebounced(search.text, search.type);
}

function updateSearchType(filter: any) {
  search.type = filter.value;
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
    <QuestionsWildberriesCreateQuest
      :show="modalShow"
      @close-modal="modalShow = false"
      @create="getQuestions()"
    />

    <div
      class="breadcrumbs text-sm flex w-full justify-between flex-wrap-reverse"
    >
      <ul class="font-medium text-[18px] text-[#909090]">
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
        <li class="cursor-pointer text-[#1e2734]">Вопросы</li>
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
            @click="copyToClipboard(`${siteUrl}/wildberries/questions`)"
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
          <button
            class="btn btn-primary dark:bg-primary border-none font-normal btn-sm"
            @click="modalShow = true"
          >
            <Icon name="fluent:add-24-filled" size="25" />
          </button>
        </div>
        <div class="w-full flex gap-2 lg:gap-2">
          <div class="flex gap-1 lg:gap-3 flex-nowrap whitespace-nowrap">
            <span>
              <CustomSelect
                class="flexx sm:min-w-[120px] h-[2rem]"
                :tabs="[
                  { title: 'Все вопросы', value: 'all' },
                  { title: 'Активные', value: 'created' },
                  { title: 'Завершенные', value: 'completed' },
                  { title: 'Недостаточно средств', value: 'nofunds' },
                  { title: 'В архиве', value: 'archived' },
                ]"
                @change-value="selectFilterDate"
              />
            </span>
          </div>
          <div class="flex lg:ml-auto gap-2 lg:gap-3">
            <CustomSelect
              class="bg-[#f4f4f4] sm:min-w-[120px] h-[2rem]"
              :tabs="[
                { title: 'За все время', value: 'all' },
                { title: 'Сегодня', value: 'today' },
                { title: '3 дня', value: '3days' },
                { title: 'Неделя', value: '7days' },
              ]"
              @change-value="selectFilterDate($event, true)"
            />

            <CustomSelect
              class="bg-[#f4f4f4] h-[2rem]"
              :tabs="[{ title: 'Артикул', value: 'article' }]"
              @change-value="updateSearchType"
            />
          </div>
          <div
            class="absolute right-0 top-0 w-[calc(100%-45px)] lg:w-fit lg:static"
          >
            <div class="relative justify-end flex-grow-0 w-full">
              <input
                ref="codeInput"
                v-model="search.text"
                type="text"
                class="input input-sm w-full bg-base-200 text-gray-500"
                placeholder="Поиск"
                @input="onSearchInput()"
              />
              <span
                v-if="search.loading"
                class="absolute right-2 top-2 loading loading-spinner loading-xs p-2"
              />
              <Icon
                v-else
                class="absolute right-0.5 p-2 my-auto text-gray-500"
                name="tabler:search"
                size="35"
                @click="codeInput.focus()"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="questions.length && !loading" class="mt-4 rounded-lg">
      <ClientOnly>
        <table class="table table-sm">
          <thead>
            <tr class="bg-secondary">
              <!-- <th class="text-center">№</th> -->
              <th class="text-center">Фото</th>
              <th class="text-center">Артикул</th>
              <th class="text-center">Маркетплейс</th>
              <th class="text-center">Пол</th>
              <th class="text-center">Вопрос</th>
              <th class="text-center">Статус</th>
              <th class="text-center">Дата создания</th>
              <th class="text-center">Дата публикации</th>
              <th class="text-center">Инфо</th>
            </tr>
          </thead>
          <tbody class="rounded-b-lg">
            <tr
              v-for="(item, index) in questions"
              :key="index"
              class="bg-white border-b-0 rounded-b-lg"
            >
              <!-- <td class="text-center border-x border-[#f9fafb]">{{ item.place }}</td> -->
              <td class="text-center border-r border-[#f9fafb] mx-auto">
                <div
                  style="width: 28px; height: 36px; border-radius: 4px"
                  class="mx-auto"
                >
                  <div class="dropdown dropdown-hover">
                    <label tabindex="0">
                      <nuxt-img
                        class="rounded-lg z-0"
                        alt=""
                        loading="lazy"
                        fit="fill"
                        :src="item.image"
                      />
                    </label>
                    <ul
                      tabindex="0"
                      class="dropdown-content mt-4 p-2 shadow bg-base-100 rounded-box w-52 z-[1]"
                    >
                      <nuxt-img
                        class="rounded-lg z-[9999]"
                        loading="lazy"
                        fit="fill"
                        :src="item.image"
                      />
                    </ul>
                  </div>
                </div>
              </td>
              <td
                class="text-center border-r border-[#f9fafb] text-base-content truncate"
              >
                <a
                  :href="`https://www.wildberries.ru/catalog/${item.article}/detail.aspx`"
                  target="_blank"
                  class="text-primary link link-hover text-sm"
                >
                  {{ item.article }}
                </a>
              </td>
              <td
                class="text-center border-r border-[#f9fafb] overflow-x-auto max-w-[250px] truncate"
              >
                Wildberries
              </td>
              <td
                class="text-center border-r border-[#f9fafb] overflow-x-auto max-w-[250px] truncate"
              >
                {{ item.gender === "male" ? "М" : "Ж" }}
              </td>
              <td
                class="text-center border-r border-[#f9fafb] overflow-x-auto max-w-[250px] whitespace-normal break-words"
              >
                <div class="flex flex-col">
                  {{ item.text }}
                </div>
              </td>

              <td class="text-center border-r border-[#f9fafb]">
                <div
                  :class="{
                    'text-red-500 rounded-full py-1 px-2  text-center':
                      item.status === 'nofunds' || item.status === 'archived',
                    'text-error rounded-full py-1 px-2  text-center':
                      item.status === 'spam',
                    'bg-info bg-opacity-20 text-base-content rounded-full py-1 px-2  text-center':
                      item.status === 'created',
                    'bg-success text-base-content rounded-full py-0.5 px-1.5 text-center':
                      item.status === 'work' || item.status === 'busy',
                    'bg-success text-base-content rounded-full py-0.5 px-2 text-center':
                      item.status === 'completed',
                  }"
                >
                  {{ getStatus(item.status) }}
                </div>
                <button
                  v-if="item.status === 'nofunds'"
                  class="btn btn-ghost btn-sm btn-square text-base-content hover:text-primary w-full rounded-full mt-1 border-[#6675ff] dark:border-primary dark:border-opacity-20"
                  @click="resumeStatus(item)"
                >
                  Возобновить
                </button>
              </td>
              <td class="text-center border-r border-[#f9fafb]">
                <div
                  class="bg-primary bg-opacity-10 rounded-lg p-0.5 text-center"
                >
                  <!-- {{ defaultDateShort(item.createdDate) }} -->
                  {{ $dayjs(item.createdDate).format("DD.MM.YYYY") }}
                </div>
              </td>
              <td class="text-center border-r border-[#f9fafb]">
                <div
                  v-if="item.publishDate"
                  class="bg-primary bg-opacity-10 rounded-lg p-0.5 text-center"
                >
                  <!-- {{ defaultDateShort(item.publishDate) }} -->
                  {{ $dayjs(item.publishDate).format("DD.MM.YYYY") }}
                </div>
              </td>
              <td
                class="text-center whitespace-pre-wrap overflow-x-auto border-r border-[#f9fafb] w-[40px]"
              >
                <div class="rounded-lg p-0.5 text-center">
                  <button
                    class="btn btn-primary btn-sm btn-square mb-2"
                    @click="[(selectedQuest = item), (logModal = true)]"
                  >
                    <svg
                      data-v-f136eeaa=""
                      data-v-a5d236d9=""
                      xmlns="http://www.w3.org/2000/svg"
                      xmlns:xlink="http://www.w3.org/1999/xlink"
                      aria-hidden="true"
                      role="img"
                      class="icon"
                      width="20px"
                      height="20px"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        fill-rule="evenodd"
                        d="M4 7h8.17a3.001 3.001 0 0 1 5.66 0H20a1 1 0 1 1 0 2h-2.17a3.001 3.001 0 0 1-5.66 0H4a1 1 0 0 1 0-2m0 8h2.17a3.001 3.001 0 0 1 5.66 0H20a1 1 0 1 1 0 2h-8.17a3.001 3.001 0 0 1-5.66 0H4a1 1 0 1 1 0-2"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div
          v-if="!loading"
          ref="target"
          class="flex justify-center items-center h-10"
        />
      </ClientOnly>
    </div>
    <div v-else-if="!loading">
      <Hero />
    </div>
    <div
      v-if="loading"
      class="w-full mt-5 flex justify-center items-center h-80"
    >
      <span class="loading loading-dots loading-lg text-primary" />
    </div>
    <LogModal
      :info="selectedQuest"
      :state="logModal"
      @close="logModal = false"
    />
  </div>
</template>

<style scoped></style>
