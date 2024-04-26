<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'
import { useNotification } from '@kyvg/vue3-notification'

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Лайки на отзывы',
})
const store = useMainStore()
const mpStore = useMPStore()
const router = useRouter()
const review_likes = ref<any>([])
const MPSelect = ref()
const loading = ref(true)
const selectedMP = ref<any>(
  mpStore.selectedMP.charAt(0).toUpperCase() + mpStore.selectedMP.slice(1) ||
    'Wildberries'
)
const { width, height } = useWindowSize()
// const { data, error } = await useFetch(`/api/${selectedMP.value}/likes/get`)
// review_likes.value = data.value

onMounted(() => {
  setText()
})

async function setText() {
  loading.value = true
  MPSelect.value?.updateText(mpStore.selectedMP || 'wildberries')
  setTimeout(() => getLikes(), 100)
}

const search = reactive({
  text: '',
  loading: false,
  error: false,
  type: 'article',
})
const codeInput = ref()
// review_likes.value = data.value
function getStatus(status: string) {
  if (status === 'created') return 'Создан'
  else if (status === 'work') return 'В работе'
  else if (status === 'completed') return 'Завершен'
  else if (status === 'nofunds') return 'Недостаточно средств'
  else if (status === 'deleting') return 'На удалении'
  else if (status === 'deleted') return 'Удален'
  else if (status === 'canceled') return 'Отменен'
}

async function getLikes() {
  loading.value = true

  const { data, error } = await useFetch(
    `/api/${mpStore.selectedMP ? mpStore.selectedMP : 'wildberries'}/likes/get`
  )
  if (data.value) {
    review_likes.value = data.value
  }
  loading.value = false
}

const reviewRemoveModalClose: any = ref(null)
const idForRemove = ref('')
function openRemoveReviewModal(id: any) {
  idForRemove.value = id

  reviewRemoveModalClose.value?.click()
}

async function deleteLike() {
  const { data, error } = await useFetch('/api/likes/delete', {
    method: 'DELETE',
    body: {
      id: idForRemove.value,
    },
  })

  if (data.value) {
    getLikes()
  } else if (error.value) {
    notify({
      title: 'Что-то пошло не так',
      text: error.value.data?.message,
      type: 'error',
      duration: 3000,
    })
  }
}

async function selectFilterDate(e: any) {
  const target = e
  const { data } = await useFetch(`/api/${mpStore.selectedMP}/likes/get`, {
    method: 'GET',
    query: {
      dateFilter: target.value,
    },
    watch: false,
  })
  if (data.value) {
    review_likes.value = data.value
  }
}

async function findBuyouts(value: string, type: string) {
  if (!value) {
    search.loading = false
    getLikes()
    return
  }
  const { data, error } = await useFetch(
    `/api/${mpStore.selectedMP}/likes/search`,
    {
      query: {
        string: value,
        type,
      },
      watch: false,
    }
  )
  if (data.value) review_likes.value = data.value

  search.loading = false
}

const findBuyoutsDebounced = useDebounceFn(findBuyouts, 1000)

async function onSearchInput(event: Event) {
  const newValue = (event.target as HTMLInputElement).value
  search.loading = true
  findBuyoutsDebounced(search.text, search.type)
}
const updateSearchType = (filter: any) => {
  search.type = filter.value
}

async function selectMP(value: any) {
  selectedMP.value = value.value
  mpStore.setSelectedMP(value.value)
  getLikes()
}
</script>

<template>
  <div>
    <div class="flex mt-4 flex-col lg:flex-row lg:justify-between gap-2 mb-4">
      <div class="flex gap-1 navbar:gap-2 lg:gap-3">
        <NuxtLink
          :to="`/likes/create`"
          class="btn btn-primary font-normal btn-sm"
        >
          <Icon name="fluent:add-24-filled" size="24" />
          <span class="hidden lg:flex">Лайки</span>
        </NuxtLink>
        <CustomSelect
          ref="MPSelect"
          class="hidden lg:flex"
          :class="'min-w-[105px]'"
          :status-text="selectedMP"
          :tabs="
            store.client.username == 'test'
              ? mpStore.MPTabsTest
              : mpStore.MPTabs
          "
          @change-value="selectMP"
        />
        <CustomSelect
          class="hidden lg:flex"
          :class="'navbar:min-w-[120px]'"
          :tabs="[
            { title: 'Все лайки', value: 'all' },
            { title: 'Активные', value: 'work' },
            { title: 'Завершенные', value: 'completed' },
          ]"
          :links="[
            { title: 'Товар/бренд', slot: '/productlikes', query: '' },
            { title: 'Вопрос', slot: '/questionlikes', query: '' },
          ]"
          @change-value="selectFilterDate"
        />
        <div class="relative justify-end flex-grow-0 w-full lg:hidden">
          <input
            type="text"
            class="input input-sm w-full bg-base-300 bg-opacity-40 text-gray-500"
            placeholder="Поиск по лайкам"
            ref="codeInput"
            v-model="search.text"
            @input="onSearchInput($event)"
          />
          <span
            v-if="search.loading"
            class="absolute right-2 top-2 loading loading-spinner loading-xs p-2"
          />
          <Icon
            v-if="search.text == '' && !search.loading"
            class="absolute right-0.5 p-2 my-auto text-gray-500"
            name="tabler:search"
            size="35"
            @click="codeInput.focus()"
          />
        </div>
      </div>
      <div class="flex gap-2 lg:gap-3">
        <CustomSelect
          ref="MPSelect"
          class="lg:hidden"
          :class="'min-w-[105px]'"
          :status-text="selectedMP"
          :tabs="
            store.client.username == 'test'
              ? mpStore.MPTabsTest
              : mpStore.MPTabs
          "
          @change-value="selectMP"
        />
        <CustomSelect
          class="lg:hidden"
          :class="'navbar:min-w-[120px]'"
          :tabs="[
            { title: 'Все лайки', value: 'all' },
            { title: 'Активные', value: 'work' },
            { title: 'Завершенные', value: 'completed' },
          ]"
          :links="[
            { title: 'Товар/бренд', slot: '/productlikes', query: '' },
            { title: 'Вопрос', slot: '/questionlikes', query: '' },
          ]"
          @change-value="selectFilterDate"
        />

        <CustomSelect
          :class="'bg-base-300 sm:min-w-[120px]'"
          :tabs="[
            { title: 'За все время', value: 'all' },
            { title: 'Сегодня', value: 'today' },
            { title: '3 дня', value: '3days' },
            { title: 'Неделя', value: '7days' },
          ]"
          @change-value="selectFilterDate"
        />

        <CustomSelect
          :class="'bg-base-300'"
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
          />
          <span
            v-if="search.loading"
            class="absolute right-2 loading loading-spinner loading-xs p-2 mt-2"
          />
          <Icon
            v-if="search.text == '' && !search.loading"
            class="absolute right-0.5 p-2 my-auto text-gray-500"
            name="tabler:search"
            size="35"
            @click="codeInput.focus()"
          />
        </div>
      </div>
    </div>
    <div v-if="review_likes.length && !loading">
      <table class="table table-sm">
        <!-- head -->
        <thead>
          <tr class="bg-primary bg-opacity-5">
            <!-- <th class="text-center">№</th> -->
            <th class="text-center rounded-tl-2xl">Фото</th>
            <th class="text-center">Артикул</th>
            <th class="text-center">Количество</th>
            <th class="text-center">Статус</th>
            <th class="text-center">Дата создания</th>
            <th class="text-center">Дата завершения</th>
            <th class="text-center rounded-tr-2xl">Сроки выполнения</th>
          </tr>
        </thead>
        <tbody>
          <tr
            class="bg-base-100 border-b-0"
            v-for="(item, index) in review_likes"
            :key="index"
          >
            <!-- <td class="text-center border-x border-primary border-opacity-5">{{ item.place }}</td> -->
            <td
              class="text-center border-r border-primary border-opacity-5 mx-auto"
              :class="{ 'rounded-bl-2xl': index === review_likes.length - 1 }"
            >
              <div
                :style="`width: ${
                  selectedMP === 'Ozon' ? '40px' : '28px'
                }; height: ${
                  selectedMP === 'Ozon' ? '40px' : '36px'
                }; border-radius: 4px;`"
                class="mx-auto"
              >
                <div class="dropdown dropdown-hover">
                  <label tabindex="0">
                    <nuxt-img
                      class="rounded-lg z-0 w-full"
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
              </div>
            </td>
            <td
              class="text-center border-r border-primary border-opacity-5 text-primary"
            >
              <a
                :href="
                  mpStore.selectedMP === 'wildberries'
                    ? `https://www.wildberries.ru/catalog/${item.article}/detail.aspx`
                    : mpStore.selectedMP === 'avito'
                    ? `https://www.avito.ru/${item.article}`
                    : `https://www.ozon.ru/product/${item.article}`
                "
                target="_blank"
                class="text-primary link link-hover"
              >
                {{ item.article }}
              </a>
            </td>
            <td class="text-center border-r border-primary border-opacity-5">
              <div class="flex flex-col">
                <span>Да: {{ item.likes }}</span>
                <span>Нет: {{ item.dislikes }}</span>
              </div>
            </td>

            <td class="text-center border-r border-primary border-opacity-5">
              <div
                :class="{
                  'bg-error text-base-content rounded-full py-1 px-2  text-center':
                    item.status === 'nofunds',
                  'bg-primary bg-opacity-20 text-base-content rounded-full py-1 px-2  text-center':
                    item.status === 'created',
                  'bg-success text-base-content rounded-full py-0.5 px-1.5 text-center':
                    item.status === 'work',
                  'bg-success text-base-content rounded-full py-0.5 px-2 text-center':
                    item.status === 'completed',
                }"
              >
                {{ getStatus(item.status) }}
              </div>
            </td>
            <td class="text-center border-r border-primary border-opacity-5">
              <div
                class="bg-primary bg-opacity-10 rounded-lg p-0.5 text-center"
              >
                {{ defaultDateShort(item.createdDate) }}
              </div>
            </td>
            <td class="text-center border-r border-primary border-opacity-5">
              <div
                v-if="item.endedDate"
                class="bg-primary bg-opacity-10 rounded-lg p-0.5 text-center"
              >
                {{ defaultDateShort(item.endedDate) }}
              </div>
            </td>
            <td
              class="text-center whitespace-pre-wrap max-w-[300px] overflow-x-auto border-r border-primary border-opacity-5"
              :class="{ 'rounded-br-2xl': index === review_likes.length - 1 }"
            >
              <div
                v-if="item.period"
                class="bg-primary bg-opacity-10 rounded-lg p-0.5 text-center"
              >
                <div>{{ item.period }}</div>
              </div>
              <div v-else>Нет</div>
            </td>
          </tr>
          <div ref="target" class="flex justify-center items-center h-4" />
        </tbody>
      </table>
    </div>

    <Hero v-else-if="!loading" />
    <div v-else class="w-full mt-5 flex justify-center items-center">
      <span class="loading loading-dots loading-lg text-primary"></span>
    </div>
    <input type="checkbox" id="reviewRemoveModal" class="modal-toggle" />
    <div class="modal">
      <div class="modal-box max-w-xs">
        <h3 class="font-bold text-lg text-center">Вы уверены?</h3>
        <p class="py-2"></p>
        <div class="modal-action flex justify-between">
          <label
            for="reviewRemoveModal"
            class="btn btn-primary"
            ref="reviewRemoveModalClose"
            >Отмена</label
          >
          <label
            for="reviewRemoveModal"
            class="btn btn-error"
            @click="deleteLike"
            >Удалить</label
          >
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.p-datatable-wrapper {
  @apply overflow-visible !important;
}
</style>
