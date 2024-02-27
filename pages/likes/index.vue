<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'
import { useNotification } from '@kyvg/vue3-notification'

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Лайки на отзывы',
})
const store = useMainStore()
const review_likes = ref([]) as any
const { width, height } = useWindowSize()
const { data, error } = await useFetch('/api/likes/get')
const selectedMP = ref('wb')
onBeforeMount(() => {
  const savedMP = localStorage.getItem('selectedMP')
  if (savedMP) selectedMP.value = savedMP
})
const search = reactive({
  text: '',
  loading: false,
  error: false,
  type: 'article',
})
const codeInput = ref()
review_likes.value = data.value
function getStatus(status: string) {
  if (status === 'created') return 'Создан'
  else if (status === 'work') return 'В работе'
  else if (status === 'completed') return 'Завершен'
  else if (status === 'nofunds') return 'Недостаточно средств'
  else if (status === 'deleting') return 'На удалении'
  else if (status === 'deleted') return 'Удален'
}
onMounted(() => {
  review_likes.value = data.value
})

async function getLikes() {
  const { data, error } = await useFetch('/api/likes/get')
  review_likes.value = data.value
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
  const { data } = await useFetch('/api/likes/get', {
    method: 'GET',
    query: {
      dateFilter: target.value,
    },
    watch: false,
  })
  review_likes.value = data.value
}

async function findBuyouts(value: string, type: string) {
  if (!value) {
    search.loading = false
    getLikes()
    return
  }
  const { data, error } = await useFetch('/api/likes/search', {
    query: {
      string: value,
      type,
    },
    watch: false,
  })
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
</script>

<template>
  <div>
    <div class="flex mt-4 flex-col lg:flex-row lg:justify-between gap-2 m-4">
      <div class="flex gap-1 lg:gap-4">
        <NuxtLink to="/likes/create" class="btn btn-primary font-normal btn-sm">
          <Icon name="fluent:add-24-filled" size="24" />
          <span class="hidden lg:flex">Лайки</span>
        </NuxtLink>
        {{ selectedMP }}
        <CustomSelect
          class="hidden lg:flex"
          :class="'sm:min-w-[120px]'"
          :tabs="[
            { title: 'ozon', value: 'ozon' },
            { title: 'willberries', value: 'wb' },
          ]"
          @change-value="selectFilterDate"
        />
        <CustomSelect
          class="hidden lg:flex"
          :class="'sm:min-w-[120px]'"
          :tabs="[
            { title: 'Все лайки', value: 'all' },
            { title: 'Активные', value: 'work' },
            { title: 'Завершенные', value: 'completed' },
          ]"
          :links="[{ title: 'Товар/бренд', slot: '/productlikes', query: '' }]"
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
          class="lg:hidden"
          :class="'sm:min-w-[120px]'"
          :tabs="[
            { title: 'Все лайки', value: 'all' },
            { title: 'Активные', value: 'work' },
            { title: 'Завершенные', value: 'completed' },
          ]"
          :links="[{ title: 'Товар/бренд', slot: '/productlikes', query: '' }]"
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
            placeholder="Поиск по лайкам"
            @input="onSearchInput($event)"
          />
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
    <div v-if="review_likes.length">
      <table class="table table-sm">
        <!-- head -->
        <thead>
          <tr class="bg-primary bg-opacity-5">
            <!-- <th class="text-center">№</th> -->
            <th class="text-center">Фото</th>
            <th class="text-center">Артикул</th>
            <th class="text-center">Количество</th>
            <th class="text-center">Статус</th>
            <th class="text-center">Дата создания</th>
            <th class="text-center">Дата завершения</th>
            <th class="text-center">Сроки выполнения</th>
          </tr>
        </thead>
        <tbody>
          <tr
            class="bg-base-200"
            v-for="(item, index) in review_likes"
            :key="index"
          >
            <!-- <td class="text-center border-x border-primary border-opacity-5">{{ item.place }}</td> -->
            <td
              class="text-center border-r border-primary border-opacity-5 mx-auto"
            >
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
              {{ item.article }}
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
                class="bg-primary bg-opacity-10 rounded-lg p-0.5 text-center"
              >
                {{ defaultDateShort(item.endedDate) }}
              </div>
            </td>
            <td
              class="text-center whitespace-pre-wrap max-w-[300px] overflow-x-auto border-r border-primary border-opacity-5"
            >
              <div
                v-if="item.period"
                class="bg-primary bg-opacity-10 rounded-lg p-0.5 text-center"
              >
                <div>{{ defaultDateShort(item.period) }}</div>
              </div>
              <div v-else>Нет</div>
            </td>
          </tr>
          <div ref="target" class="flex justify-center items-center h-4" />
        </tbody>
      </table>
      <!-- <DataTable
        v-if="width > 1024"
        class="bg-base-200 hidden lg:block overflow-visible"
        :value="review_likes"
      >
        <Column field="place" header="№" />
        <Column field="image" header="Фото">
          <template #body="{ data }">
            <div
              style="
                width: 28px;
                height: 36px;
                overflow: visible;
                position: relative;
                border-radius: 4px;
              "
            >
              <div class="dropdown dropdown-hover">
                <label tabindex="0">
                  <nuxt-img
                    class="rounded-lg z-0"
                    alt=""
                    loading="lazy"
                    fit="fill"
                    :src="data.image"
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
                    :src="data.image"
                  />
                </ul>
              </div>
            </div>
          </template>
        </Column>
        <Column field="article" header="Артикул">
          <template #body="{ data }">
            <a
              :href="`https://www.ozon.ru/product/${data.article}`"
              target="_blank"
              class="text-secondary link link-hover"
            >
              {{ data.article }}
            </a>
          </template>
        </Column>
        <Column field="likes" header="Лайки" />
        <Column field="dislikes" header="Дизлайки" />
        <Column field="status" header="Статус">
          <template #body="{ data }">
            <div
              :class="{
                'text-error':
                  data.status === 'nofunds' || data.status === 'deleted',
                'text-primary': data.status === 'created',
                'text-warning':
                  data.status === 'work' || data.status === 'deleting',
                'text-success': data.status === 'completed',
              }"
            >
              {{ getStatus(data.status) }}
            </div>
          </template>
        </Column>
        <Column field="createdDate" header="Дата создания">
          <template #body="{ data }">
            <div>
              {{ defaultDate(data.createdDate) }}
            </div>
          </template>
        </Column>
        <Column field="endedDate" header="Дата завершения">
          <template #body="{ data }">
            <div v-if="data.endedDate">
              {{ defaultDate(data.endedDate) }}
            </div>
            <div v-else>Нет</div>
          </template>
        </Column>
        <Column header="Сроки выполнения">
          <template #body="{ data }">
            <div v-if="data.dateStart">
              <div>с {{ defaultDate(data.dateStart) }}</div>
              <div>по {{ defaultDate(data.dateEnd) }}</div>
            </div>
            <div v-else>Нет</div>
          </template>
        </Column>
        <Column header=" ">
          <template #body="{ data }">
            <div v-if="data.status === 'created'">
              <button
                class="btn btn-error btn-sm -ml-16 -mr-4"
                @click="openRemoveReviewModal(data.id)"
              >
                Удалить
              </button>
            </div>
          </template>
        </Column>
      </DataTable> -->
      <!-- <ul v-else class="w-full lg:hidden">
        <li
          v-for="(item, index) in review_likes"
          :key="index"
          class="pb-3 sm:pb-4"
        >
          <div
            tabindex="0"
            class="relative collapse collapse-arrow bg-base-200 rounded-box"
          >
            <div class="collapse-title font-medium">
              <div class="flex gap-6 items-center w-full">
                <div class="flex gap-4 items-start">
                  <div class="image">
                    <nuxt-img
                      width="32"
                      class="rounded-lg object-contain"
                      :src="item.image"
                      loading="lazy"
                    />
                  </div>
                  <div class="article flex flex-col gap-0.5">
                    <div class="text-xs">Артикул</div>
                    <a
                      :href="`https://www.ozon.ru/product/${item.article}`"
                      target="_blank"
                      class="text-secondary link link-hover text-sm"
                    >
                      {{ item.article }}
                    </a>
                  </div>
                  <div class="status flex flex-col gap-0.5">
                    <div class="text-xs">Статус</div>
                    <div
                      class="text-sm"
                      :class="{
                        'text-warning':
                          item.status === 'created' || item.status === 'work',
                        'text-success': item.status === 'completed',
                      }"
                    >
                      <div>
                        {{ getStatus(item.status) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                class="absolute top-0 text-gray-400 right-3 date text-xs text-center mt-2 xs:bottom-0 xs:top-20"
              >
                <div>
                  {{ defaultDate(item.createdDate) }}
                </div>
              </div>
            </div>
            <div class="collapse-content flex gap-4">
              <div class="flex flex-col">
                <dt class="mb-1 text-gray-500 text-sm dark:text-gray-400">
                  Лайков
                </dt>
                <dd class="font-semibold text-sm">
                  {{ item.likes }}
                </dd>
              </div>
              <div class="flex flex-col">
                <dt class="mb-1 text-gray-500 text-sm dark:text-gray-400">
                  Дизлайков
                </dt>
                <dd class="font-semibold text-sm">
                  {{ item.dislikes }}
                </dd>
              </div>
              <div class="flex flex-col">
                <dt class="mb-1 text-gray-500 text-sm dark:text-gray-400">
                  Дата завершения
                </dt>
                <dd class="font-semibold text-sm">
                  <div v-if="item.endedDate">
                    {{ defaultDate(item.endedDate) }}
                  </div>
                  <div v-else>Нет</div>
                </dd>
              </div>
              <div class="flex flex-col">
                <dt class="mb-1 text-gray-500 text-sm dark:text-gray-400">
                  Сроки выполнения
                </dt>
                <dd class="font-semibold text-sm flex">
                  <div v-if="item.dateEnd">
                    <div>
                      {{ `С ${defaultDate(item.dateStart)}` }}
                    </div>
                    <div>
                      {{ `По ${defaultDate(item.dateEnd)}` }}
                    </div>
                  </div>
                  <div v-else>Нет</div>
                </dd>
              </div>
            </div>
            <div class="ml-4 mb-2" v-if="item.status === 'created'">
              <button
                class="btn btn-sm btn-error"
                @click="openRemoveReviewModal(item.id)"
              >
                Удалить
              </button>
            </div>
          </div>
        </li>
      </ul> -->
    </div>

    <Hero v-else />
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
