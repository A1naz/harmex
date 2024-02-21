<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Лайки на отзывы',
})
const store = useMainStore()
const review_likes = ref([]) as any
const { width, height } = useWindowSize()
const { data, error } = await useFetch('/api/likes/get')
const search = reactive({
  text: '',
  loading: false,
  error: false,
  type: 'name',
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
</script>

<template>
  <div>
    <!-- <h1 class="text-2xl font-bold mt-4">Лайки на отзывы</h1> -->
    <!-- <p class="text-xs font-light mt-4 lg:text-sm">
      Лайки на отзывах, помогут вашим покупателям обратить внимание только на
      самые важные отзывы.
    </p>
    <p class="text-xs font-light mt-1 lg:text-sm">
      Стоимость одного лайка -
      <span class="font-bold"> {{ store.tariffString('likeReview') }} </span>
      Все услуги оказываются по Московскому времени.
    </p> -->
    <!-- <p class="font-bold text-error mt-5">
      Создание новых лайков на отзывы временно отключено.
    </p>
    <div class="flex justify-end mb-8 mt-6 items-center">
      <NuxtLink
        to="/likes/create"
        class="btn btn-primary btn-sm gap-2 font-medium normal-case self-end"
      >
        <Icon name="fluent:add-24-filled" size="24" />
        Добавить лайки
      </NuxtLink>
    </div> -->

    
    <div v-if="review_likes.length">
      <DataTable 
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
      </DataTable>
      <ul v-else class="w-full lg:hidden">
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
      </ul>
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
