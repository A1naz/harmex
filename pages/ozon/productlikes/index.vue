<script setup lang="ts">
const { notify } = useNotification()

definePageMeta({
  layout: 'app',
  middleware: 'auth',
  title: 'Лайки на товар/бренд',
})

const router = useRouter()
const route = useRoute()

const product_likes = ref([]) as any
const loading = ref(false)
const sortPage = ref('all')
const sortPageDate = ref('')
const modalShow = ref<boolean>(false)
const logModal = ref(false)
const selectedLike = ref({
  uuid: '',
})

const search = reactive({
  text: '',
  loading: false,
  error: false,
  type: 'name',
})
const codeInput = ref()

const limit = ref(50)
const skip = ref(0)
const end = ref(false)
const target = ref(null)
const targetIsVisible = ref(false)
// eslint-disable-next-line unused-imports/no-unused-vars
const { stop } = useIntersectionObserver(
  target,
  ([{ isIntersecting }]) => {
    targetIsVisible.value = isIntersecting
  },
)
watch(targetIsVisible, async (isVisible) => {
  if (!end.value && isVisible && product_likes.value.length >= limit.value) {
    await getProductLikes()
  }
})

async function getProductLikes() {
  modalShow.value = false
  loading.value = true
  const { data, error } = await useFetch('/api/ozon/productlikes/get', {
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
    product_likes.value = [...product_likes.value, ...(data.value! as any)]
    loading.value = false
  }

  if (error.value) {
    notify({
      type: 'error',
      title: 'Не удалось получить лайки',
      text: error.value.message,
    })
  }
  skip.value += limit.value
  loading.value = false
}
await getProductLikes()

function getStatus(status: string) {
  if (status === 'created')
    return 'Создан'
  else if (status === 'work')
    return 'В работе'
  else if (status === 'busy')
    return 'В работе'
  else if (status === 'completed')
    return 'Завершен'
  else if (status === 'nofunds')
    return 'Недостаточно средств'
  else if (status === 'canceled')
    return 'Отменен'
}

async function resumeStatus(item: any) {
  const { data, error } = await useFetch(`/api/ozon/productlikes/resume`, {
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
      text: 'Лайк на товар/бренд  успешно возвращен в работу',
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

const reviewRemoveModalClose: any = ref(null)
const idForRemove = ref('')

async function deleteLike() {
  const { data, error } = await useFetch('/api/ozon/productlikes/delete', {
    method: 'DELETE',
    body: {
      id: idForRemove.value,
    },
  })

  if (data.value) {
    getProductLikes()
  }
  else if (error.value) {
    notify({
      title: 'Что-то пошло не так',
      text: error.value.data?.message,
      type: 'error',
      duration: 3000,
    })
  }
}

async function selectFilterDate(e: any, date?: boolean) {
  if (date) {
    sortPageDate.value = e.value
  }
  else {
    sortPage.value = e.value
  }
  loading.value = true
  product_likes.value = []
  skip.value = 0
  end.value = false
  await getProductLikes()
}

async function findBuyouts(value: string) {
  product_likes.value = []
  skip.value = 0
  end.value = false
  if (!value) {
    search.loading = false
    await getProductLikes()
    return
  }
  loading.value = true
  await getProductLikes()

  search.loading = false
}

const findBuyoutsDebounced = useDebounceFn(findBuyouts, 1000)

async function onSearchInput() {
  search.loading = true
  findBuyoutsDebounced(search.text)
}
function updateSearchType(filter: any) {
  search.type = filter.value
}

const orgInfo = ref({}) as any
const isVisible = ref(false)

async function getOrgInfo() {
  const currentPath = router.currentRoute.value.path

  const pathSegments = currentPath.split('/').filter(Boolean)

  const mp = pathSegments[0]
  const serviceType = `/${pathSegments[1]}`

  const { data }: any = await useFetch('/api/catalog/getOrgInfo', {
    method: 'GET',
    query: {
      serviceType,
      mp,
    },
  })

  if (!data.value)
    return
  orgInfo.value = data.value.orgInfo
}
getOrgInfo()

async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text)
  notify({
    title: 'Успешно',
    text: 'Скопировано в буфер обмена',
  })
}
</script>

<template>
  <div class="px-4 sm:px-16 pt-8">
    <div class="breadcrumbs text-sm flex w-full justify-between flex-wrap-reverse">
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
          Лайки на продукты
        </li>
      </ul>
      <div v-if="orgInfo && orgInfo.title" class="flex gap-3">
        <div class=" bg-transparent rounded-lg shadow-xs flex gap-2 items-center text-center ">
          <div class="org-name font-semibold text-gray-800">
            {{ orgInfo.title.toUpperCase() }}
          </div>

          <CustomShopTooltip :visible="isVisible" :info="orgInfo" />
          <button class="p-1 flex flex-col justify-center items-center text-center bg-gray-10 hover:bg-gray-200 rounded-lg text-[#909090]" @click="copyToClipboard(`https://app.harmex.ru/register?uuid`)">
            <Icon name="ph:share-fat-fill" size="20" />
          </button>
        </div>
      </div>
    </div>
    <ProductLikesOzonCreateLike
      :show="modalShow"
      @close-modal="modalShow = false"
      @create="getProductLikes()"
    />

    <div class="flex relative gap-2 lg:gap-3 flex-col lg:flex-row w-full lg:w-full mt-4">
      <div class="flex gap-2 ">
        <button

          class="btn btn-primary dark:bg-primary border-none font-normal btn-sm"
          @click="modalShow = true"
          @click.stop
        >
          <Icon name="fluent:add-24-filled" size="25" />
        </button>
      </div>
      <div class="w-full flex gap-2 lg:gap-2 ">
        <div class="flex gap-1  lg:gap-3 flex-nowrap whitespace-nowrap">
          <span>
            <CustomSelect
              class="flex sm:min-w-[120px] h-[2rem]"
              :tabs="[
                { title: 'Все лайки', value: 'all' },
                { title: 'Активные', value: 'work' },
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
            :tabs="[{ title: 'Название', value: 'name' }]"
            @change-value="updateSearchType"
          />
        </div>
        <div class="absolute right-0 top-0 w-[calc(100%-55px)] lg:w-fit lg:static">
          <div class="relative justify-end flex-grow-0 w-full">
            <input
              ref="codeInput"
              v-model="search.text"
              type="text"
              class="input input-sm w-full bg-base-200 text-gray-500"
              placeholder="Поиск по лайкам"
              @input="onSearchInput()"
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
      </div>
    </div>

    <div v-if="product_likes.length" class="mt-6">
      <div v-if="loading" class="flex justify-center">
        <div>
          <span class="loading loading-dots loading-lg text-primary" />
        </div>
      </div>
      <table v-else class="table table-sm">
        <!-- head -->

        <thead>
          <tr class="bg-white">
            <!-- <th class="text-center">№</th> -->
            <th class="text-center rounded-tl-2xl">
              Фото
            </th>
            <th class="text-center">
              Название
            </th>
            <th class="text-center">
              Ссылка
            </th>
            <th class="text-center">
              Тип
            </th>
            <th class="text-center">
              Количество
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
            <th class="text-center rounded-tr-2xl ">
              Инфо
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in product_likes"
            :key="index"
            class="bg-white border-b-0 border-primary"
          >
            <!-- <td class="text-center border-x border-[#e8e8fd]">{{ item.place }}</td> -->
            <td
              class="text-center border-r border-[#e8e8fd] mx-auto bg-white"
              :class="{ 'rounded-bl-2xl': index === product_likes.length - 1 }"
            >
              <div
                style="width: 40px; height: 40px; border-radius: 4px"
                class="mx-auto"
              >
                <div v-if="item.image !== ''" class="dropdown dropdown-hover">
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
                      class="rounded-lg z-[1]"
                      loading="lazy"
                      fit="fill"
                      :src="item.image"
                    />
                  </ul>
                </div>
                <div v-else class="text-center">
                  no image
                </div>
              </div>
            </td>
            <td
              class="text-center border-r border-[#e8e8fd] text-base-content truncate bg-white"
            >
              <span class="whitespace-normal break-words max-w-[150px]">{{
                item.name ? item.name : 'неизвестно'
              }}</span>
            </td>
            <td
              class="text-center border-r border-[#e8e8fd] text-primary overflow-x-auto max-w-xs truncate bg-white"
            >
              <a
                :href="item.url"
                target="_blank"
                class="text-primary link link-hover whitespace-normal break-words"
              >
                <span class="max-w-[150px] truncate">{{ item.url }}</span>
              </a>
            </td>
            <td
              class="text-center border-r border-[#e8e8fd] bg-white"
            >
              <div class="flex flex-col">
                {{ item.type === 'brand' ? 'Лайк на бренд' : 'Лайк на товар' }}
              </div>
            </td>
            <td
              class="text-center border-r border-[#e8e8fd] bg-white"
            >
              <div class="flex flex-col">
                {{ item.amount }}
              </div>
            </td>

            <td class="text-center border-r border-[#e8e8fd] bg-white">
              <div
                :class="{
                  'text-red-500 rounded-full py-1 px-2  text-center':
                    item.status === 'nofunds',
                  'bg-error text-base-content rounded-full py-1 px-2  text-center':
                    item.status === 'deleted'
                    || item.status === 'canceled',
                  'bg-info bg-opacity-20  text-base-content rounded-full py-1 px-2  text-center':
                    item.status === 'created',
                  'bg-success text-base-content rounded-full py-0.5 px-1.5 text-center':
                    item.status === 'work' || item.status === 'busy',
                  'bg-success text-base-content rounded-full py-0.5 px-2 text-center':
                    item.status === 'completed',
                }"
                class="whitespace-nowrap"
              >
                {{ getStatus(item.status) }}
              </div>
              <button v-if="item.status === 'nofunds'" class="btn btn-ghost btn-sm btn-square text-base-content hover:text-primary w-full rounded-full mt-1 border-[#6675ff] dark:border-primary dark:border-opacity-20" @click="resumeStatus(item)">
                Возобновить
              </button>
            </td>
            <td
              class="text-center border-r border-[#e8e8fd] bg-white"
            >
              <div
                class="bg-primary bg-opacity-10 rounded-lg p-0.5 text-center"
              >
                {{ $dayjs(item.createdDate).format(
                  'DD.MM.YYYY',
                ) }}
              </div>
            </td>
            <td
              class="text-center border-r border-[#e8e8fd] bg-white"
            >
              <div
                v-if="item.endedDate"
                class="bg-primary bg-opacity-10 rounded-lg p-0.5 text-center"
              >
                {{ $dayjs(item.endedDate).format(
                  'DD.MM.YYYY',
                ) }}
              </div>
            </td>
            <td
              class="text-center whitespace-pre-wrap overflow-x-auto border-r border-[#e8e8fd] w-[40px]"
              :class="{ 'rounded-br-2xl': index === product_likes.length - 1 }"
            >
              <div class="rounded-lg p-0.5 text-center">
                <button
                  class="btn btn-primary btn-sm btn-square mb-2"
                  @click=";[(selectedLike = item), (logModal = true)]"
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
      <div ref="target" class="flex justify-center items-center h-4" />
    </div>

    <Hero v-else />

    <input id="reviewRemoveModal" type="checkbox" class="modal-toggle">
    <div class="modal">
      <div class="modal-box max-w-xs">
        <h3 class="font-normal text-lg text-center">
          Вы уверены, что хотитет удалить лайки к данному товару?
        </h3>
        <p class="py-2" />
        <div class="modal-action flex justify-between">
          <label
            ref="reviewRemoveModalClose"
            for="reviewRemoveModal"
            class="btn btn-primary"
          >Отмена</label>
          <label
            for="reviewRemoveModal"
            class="btn btn-error text-white"
            @click="deleteLike"
          >Удалить</label>
        </div>
      </div>
    </div>
    <LogModal :info="selectedLike" :state="logModal" @close="logModal = false" />
  </div>
</template>

<style scoped>
::v-deep(th) {
  background-color: rgba(99, 102, 241, 0.15) !important;
}
::v-deep(.p-column-header-content) {
  text-align: center !important;
  display: flex;
  justify-content: center;
}
</style>
