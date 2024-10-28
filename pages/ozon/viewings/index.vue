<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'

definePageMeta({
  layout: 'app',
  middleware: 'auth',
  title: 'Просмотры',
})
const store = useMainStore()
const mpStore = useMPStore()
const viewings = ref([]) as any
const sortPage = ref('all')
const sortPageDate = ref('')
const modalShow = ref<boolean>(false)
const route = useRoute()
const router = useRouter()
const logModal = ref(false)
const selectedQuest = ref({
  uuid: '',
})

const search = reactive({
  text: '',
  loading: false,
  error: false,
  type: 'article',
})
const codeInput = ref()

const loading = ref(false)
const limit = ref(50)
const skip = ref(0)
const end = ref(false)
const target = ref(null)
const targetIsVisible = ref(false)

watch(targetIsVisible, async (isVisible) => {
  if (!end.value && isVisible && viewings.value.length >= limit.value) {
    await getViewings()
  }
})

function clearViewings() {
  loading.value = true
  viewings.value = []
  skip.value = 0
  end.value = false
}

async function getViewings() {
  modalShow.value = false
  clearViewings()

  const { data, error } = await useFetch('/api/ozon/viewings/get', {
    method: 'GET',
    query: {
      statusQuery: sortPage.value,
      dateFilter: sortPageDate.value,
      string: search.text,
      type: search.type,
      limit: limit.value,
      skip: skip.value,
    },
  })
  if ((data.value as any)?.length === 0) {
    loading.value = false
    end.value = true
    return
  }
  if (data.value) {
    viewings.value = [...viewings.value, ...(data.value! as any)]
    loading.value = false
  }

  if (error.value) {
    notify({
      type: 'error',
      title: 'Не удалось получить просмотры',
      text: error.value.message,
    })
  }
  skip.value += limit.value
  loading.value = false
}
await getViewings()

function getStatus(status: string) {
  if (status === 'created') {
    return 'Создан'
  }
  else if (status === 'work') {
    return 'В работе'
  }
  else if (status === 'busy') {
    return 'В работе'
  }
  else if (status === 'completed') {
    return 'Завершен'
  }
  else if (status === 'nofunds') {
    return 'Недостаточно средств'
  }
  else if (status === 'archived') {
    return 'Архивирован'
  }
  else if (status === 'spam') {
    return 'Определен как спам'
  }
}

async function resumeStatus(item: any) {
  const { data, error } = await useFetch('/api/ozon/viewings/resume', {
    method: 'POST',
    body: {
      item,
    },
    watch: false,
  })
  if (error.value) {
    notify({
      title: 'Что-то пошло не так',
      text: error.value?.data?.message,
      type: 'error',
      duration: 3000,
    })
    return
  }
  if (data.value) {
    notify({
      type: 'success',
      title: 'Успешно',
      text: 'Просмотр успешно возвращен в работу',
      duration: 3000,
    })
    selectFilterDate({ value: sortPage.value })
  }
}

onMounted(() => {
  if (route.query.modalShow) {
    modalShow.value = route.query.modalShow === 'true'
    const query = { ...route.query }
    delete query.modalShow
    router.push({ query })
  }
})

async function selectFilterDate(e: any, date?: boolean) {
  if (date) {
    sortPageDate.value = e.value
  }
  else {
    sortPage.value = e.value
  }
  loading.value = true
  viewings.value = []
  skip.value = 0
  end.value = false
  await getViewings()
}

async function findBuyouts(value: string, _type: string) {
  viewings.value = []
  skip.value = 0
  end.value = false
  if (!value) {
    search.loading = false
    await getViewings()
    return
  }
  loading.value = true
  await getViewings()

  search.loading = false
}

const findBuyoutsDebounced = useDebounceFn(findBuyouts, 1000)

async function onSearchInput(_event: Event) {
  search.loading = true
  findBuyoutsDebounced(search.text, search.type)
}

function updateSearchType(filter: any) {
  search.type = filter.value
}

function changeFilter(e: any) {
  mpStore.changeMp(e.value, 'viewings')
}
</script>

<template>
  <div>
    <div class="breadcrumbs text-sm mt-8">
      <ul class="font-medium text-[18px] text-[#909090]">
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
        <li class="cursor-pointer text-[#1e2734]">
          Просмотры
        </li>
      </ul>
    </div>
    <ViewingsOzonCreateView
      :show="modalShow"
      @close-modal="modalShow = false"
      @create=";[(skip = 0), getViewings()]"
    />

    <div class="breadcrumbs text-sm mt-8">
      <ul class="font-medium text-[18px] text-[#909090]">
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
        <li class="cursor-pointer text-[#1e2734]">
          Просмотры
        </li>
      </ul>
    </div>

    <div class="flex mt-4 flex-col lg:flex-row lg:justify-between gap-2">
      <div class="flex gap-1 lg:gap-4">
        <button
          :disabled="store.client.username !== 'test'"
          class="btn btn-primary dark:bg-primary bg-[#6675ff] border-none font-normal btn-sm"
          @click="navigateTo(`/viewings/create/`)"
        >
          <Icon name="fluent:add-24-filled" size="17" />
          <span class="hidden lg:flex">Просмотр</span>
        </button>
        <!-- <CustomSelect
          class="hidden lg:flex sm:min-w-[120px]"

          status-text="Ozon"
          :tabs="mpStore.sortMp('viewings')"
          @change-value="changeFilter"
        /> -->
        <CustomSelect
          class="hidden lg:flex sm:min-w-[120px]"

          :tabs="[
            { title: 'Все просмотры', value: 'all' },
            { title: 'Активные', value: 'created' },
            { title: 'Завершенные', value: 'completed' },
            { title: 'Недостаточно средств', value: 'nofunds' },
            { title: 'В архиве', value: 'archived' },
          ]"
          @change-value="selectFilterDate"
        />

        <div class="relative justify-end flex-grow-0 w-full lg:hidden">
          <input
            ref="codeInput"
            v-model="search.text"
            type="text"
            class="input input-sm w-full bg-base-300 bg-opacity-40 text-gray-500"
            placeholder="Поиск"
            @input="onSearchInput($event)"
          >
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
      <div class="flex gap-2 lg:gap-5">
        <CustomSelect
          class="lg:hidden min-w-[80px] sm:min-w-[120px]"

          status-text="Ozon"
          :tabs="mpStore.sortMp('viewings')"
          @change-value="changeFilter"
        />
        <CustomSelect
          class="lg:hidden sm:min-w-[120px]"

          :tabs="[
            { title: 'Все просмотры', value: 'all' },
            { title: 'Активные', value: 'created' },
            { title: 'Завершенные', value: 'completed' },
            { title: 'Недостаточно средств', value: 'nofunds' },
            { title: 'В архиве', value: 'archived' },
          ]"
          @change-value="selectFilterDate"
        />

        <CustomSelect
          class="bg-[#f4f4f4] sm:min-w-[120px]"
          :tabs="[
            { title: 'За все время', value: 'all' },
            { title: 'Сегодня', value: 'today' },
            { title: '3 дня', value: '3days' },
            { title: 'Неделя', value: '7days' },
          ]"
          @change-value="selectFilterDate($event, true)"
        />

        <CustomSelect
          class="bg-[#f4f4f4]"
          :tabs="[{ title: 'Артикул', value: 'article' }]"
          @change-value="updateSearchType"
        />
        <div class="relative justify-end flex-grow-0 w-full hidden lg:flex">
          <input
            ref="codeInput"
            v-model="search.text"
            type="text"
            class="input input-sm w-full bg-base-300 bg-opacity-40 text-gray-500"
            placeholder="Поиск"
            @input="onSearchInput($event)"
          >
          <span
            v-if="search.loading"
            class="absolute right-2 loading loading-spinner loading-xs p-2 mt-2"
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
    <div v-if="store.client.username !== 'test'" class="text-red-500 ml-1 mt-1">
      Функционал временно недоступен
    </div>

    <div v-if="viewings.length && !loading" class="mt-4 rounded-lg">
      <ClientOnly>
        <table class="table table-sm">
          <thead>
            <tr class="bg-primary bg-opacity-5">
              <!-- <th class="text-center">№</th> -->
              <th class="text-center">
                Фото
              </th>
              <th class="text-center">
                Товар
              </th>
              <th class="text-center">
                Маркетплейс
              </th>
              <th class="text-center">
                Кол-во
              </th>
              <th class="text-center">
                Ключевой запрос
              </th>

              <th class="text-center">
                Статус
              </th>
              <th class="text-center">
                Дата создания
              </th>
              <th class="text-center">
                Дата завершения
              </th>
              <th class="text-center">
                Инфо
              </th>
            </tr>
          </thead>
          <tbody class="rounded-b-lg">
            <tr
              v-for="(item, index) in viewings"
              :key="index"
              class="bg-base-100 border-b-0 rounded-b-lg"
            >
              <td
                class="text-center border-r border-primary border-opacity-5 mx-auto"
              >
                <div
                  style="width: 40px; height: 40px; border-radius: 4px"
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
                class="text-center border-r border-primary border-opacity-5 text-base-content truncate"
              >
                <a
                  :href="`https://www.ozon.ru/product/${item.article}`"
                  target="_blank"
                  class="text-primary link link-hover text-sm"
                >
                  {{ item.article }}
                </a>
              </td>
              <td
                class="text-center border-r border-primary border-opacity-5 overflow-x-auto max-w-[250px] truncate"
              >
                Ozon
              </td>
              <td
                class="text-center border-r border-primary border-opacity-5 overflow-x-auto max-w-[250px] truncate"
              >
                {{ item.amount }}
              </td>
              <td
                class="text-center border-r border-primary border-opacity-5 overflow-x-auto max-w-[250px] whitespace-normal break-words"
              >
                <div class="flex flex-col">
                  {{ item.text }}
                </div>
              </td>

              <td class="text-center border-r border-primary border-opacity-5">
                <div
                  :class="{
                    'text-red-500 rounded-full py-1 px-2  text-center':
                      item.status === 'nofunds',
                    'text-error rounded-full py-1 px-2  text-center':
                      item.status === 'spam',
                    'bg-primary bg-opacity-20 text-base-content rounded-full py-1 px-2  text-center':
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
              <td class="text-center border-r border-primary border-opacity-5">
                <div
                  class="bg-primary bg-opacity-10 rounded-lg p-0.5 text-center"
                >
                  <!-- {{ defaultDateShort(item.createdDate) }} -->
                  {{ $dayjs(item.createdDate).format('DD.MM.YYYY') }}
                </div>
              </td>
              <td class="text-center border-r border-primary border-opacity-5">
                <div
                  v-if="item.publishDate"
                  class="bg-primary bg-opacity-10 rounded-lg p-0.5 text-center"
                >
                  <!-- {{ defaultDateShort(item.publishDate) }} -->
                  {{ $dayjs(item.publishDate).format('DD.MM.YYYY') }}
                </div>
              </td>
              <td
                class="text-center whitespace-pre-wrap overflow-x-auto border-r border-primary border-opacity-5 w-[40px]"
              >
                <div class="rounded-lg p-0.5 text-center my-2">
                  <button
                    class="btn btn-primary btn-sm btn-square mb-2"
                    @click=";[(selectedQuest = item), (logModal = true)]"
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
          class="flex justify-center items-center h-4"
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
    <LogModal :info="selectedQuest" :state="logModal" @close="logModal = false" />
  </div>
</template>

<style scoped></style>
