<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Моя команда',
})

const { width, height } = useWindowSize()
const myTeam = ref([]) as any

async function getMyTeam() {
  const { data, error } = await useFetch('/api/team/get')
  myTeam.value = data.value
}

const columns = [
    { field: 'username', header: 'Username' },
    { field: 'firstName', header: 'Firs tName' },
    { field: 'lastName', header: 'Last Name' },
    { field: 'email', header: 'E-Mail' },
    { field: 'acesses', header: 'Acesses' }
];

await getMyTeam()

const reviewRemoveModalClose: any = ref(null)

</script>

<template>
  <div>

    <h1 class="text-2xl font-bold mt-4">Моя команда</h1>
    <p class="text-xs font-light mt-1 lg:text-sm">
      Делигируйте задачи между вашими сотрудниками для эффективного продвижения товаров.
    </p>

    <div class="flex justify-end mb-8 mt-6 items-center">
      <NuxtLink
        to="/team/create"
        class="btn btn-primary btn-sm gap-2 font-medium normal-case self-end"
      >
        <Icon name="fluent:add-24-filled" size="24" />
        Добавить сотрудника
      </NuxtLink>
    </div>

    <div v-if="myTeam.length">


        <DataTable 
            :value="myTeam" 
            class="bg-base-200 hidden lg:block overflow-visible"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            >
            <Column
                v-for="col of columns"
                sortable
                :key=col.field 
                :field=col.field 
                :header=col.header
                >
                <template v-if="col.field == 'acesses'" #body="{ data }">
                    acesses: {{ data[col.field] }}
                </template>
                <template v-else #body="{ data }">
                    {{ data[col.field] }}
                </template>
            </Column>
        </DataTable>


<!-- 
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
                      :href="`https://www.wildberries.ru/catalog/${item.article}/detail.aspx`"
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
