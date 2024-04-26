<script setup lang="ts">
interface IProps {
  carts: any[]
  getStatus: (status: string) => string
  resumeStatus: (item: any) => any
}
const props = defineProps<IProps>()
const { $dayjs } = useNuxtApp()

const removeCart = (index: number) => {
  
}
</script>

<template>
  <ClientOnly>
    <table class="table table-sm">
        <thead>
          <tr class="bg-primary bg-opacity-5">
            <!-- <th class="text-center">№</th> -->
            <th class="text-center">Фото</th>
            <th class="text-center">Артикул</th>
            <th class="text-center">Маркетплейс</th>
            <th class="text-center">Размер</th>
            <th class="text-center">Количество</th>
            <th class="text-center">Ключевой запрос</th>
            <th class="text-center">Статус</th>
            <th class="text-center">Дата создания</th>
            <th class="text-center">Дата завершения</th>
            <!-- <th class="text-center"></th> -->
          </tr>
        </thead>
        <tbody class="rounded-b-lg">
          <tr
            class="bg-base-100 border-b-0 rounded-b-lg"
            v-for="(item, index) in carts"
            :key="index"
          >
            <!-- <td class="text-center border-x border-primary border-opacity-5">{{ item.place }}</td> -->
            <td
              class="text-center border-r  border-primary border-opacity-5 mx-auto"
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
              :href="`https://www.wildberries.ru/catalog/${item.article}/detail.aspx`" target="_blank"
                class="text-sm text-primary link link-hover"
              >
                {{ item.article }}
              </a>
            </td>
            <td class="text-center border-r border-primary border-opacity-5">
              Wildberries
            </td>
            <td
              class="text-center border-r border-primary border-opacity-5 overflow-x-auto max-w-[250px] truncate"
            >
            {{ item.size == "none" ? "-" : item.size }}
            </td>
            <td class="text-center border-r border-primary border-opacity-5 overflow-x-auto max-w-[250px] whitespace-normal break-words">
              <div class="flex flex-col">
                {{  item.amount  }}
              </div>
            </td>

            <td class="text-center border-r border-primary border-opacity-5 overflow-x-auto max-w-[250px] whitespace-normal break-words truncate">
              <div class="flex flex-col">
                {{  item.query  }}
              </div>
            </td>

            <td class="text-center  border-r border-primary border-opacity-5">
              <div
                :class="{
                  ' text-red-500 rounded-full py-1 px-2  text-center':
                    item.status === 'nofunds',
                  'text-error rounded-full py-1 px-2  text-center':
                  item.status === 'spam',
                  'bg-[#f0f5ff] dark:bg-primary dark:bg-opacity-20 text-base-content rounded-full py-1 px-2  text-center':
                    item.status === 'created',
                  'bg-success text-base-content rounded-full py-0.5 px-1.5 text-center':
                    item.status === 'work',
                  'bg-success text-base-content rounded-full py-0.5 px-2 text-center':
                    item.status === 'completed',
                }"
              >
                {{ getStatus(item.status) }}
               
              </div>
              <button v-if="item.status === 'nofunds'" class="btn btn-ghost btn-sm btn-square text-base-content hover:text-primary w-full rounded-full mt-1 border-[#6675ff] dark:border-primary dark:border-opacity-20" @click="resumeStatus(item)">
                Возобновить  
              </button>
            </td>
            <td class="text-center border-r border-primary border-opacity-5">
              <div
                class="bg-primary bg-opacity-10 rounded-lg p-0.5 text-center"
              >
                {{ defaultDate(item.createdDate) }}
              </div>
            </td>
            <td class="text-center border-r border-primary border-opacity-5">
              <div
                v-if="item.endedDate"
                class="bg-primary bg-opacity-10 rounded-lg p-0.5 text-center"
              >
              {{ defaultDate(item.endedDate) }}
              </div>
              <div v-else>
                Нет
              </div>
            </td>
            <!-- <td class="text-center max-w-[60px]">
              <div class="w-5 btn btn-ghost btn-sm btn-square text-base-300 hover:text-primary" @click="removeCart(item.id)">
                <IconCSS name="material-symbols:close" size="15" />
              </div>
              <div class="w-5 btn btn-ghost btn-sm btn-square text-base-300 hover:text-primary" @click="">
                <IconCSS name="fluent:copy-20-filled" size="15" />
              </div>
            
            </td> -->
          </tr>
        </tbody>
    </table>


    <!-- <DataTable class="bg-base-200 hidden lg:block" :value="carts">
      <Column field="place" header="№" />
      <Column field="image" header="Фото">
        <template #body="{ data }">
          <div
            style="width: 28px; height: 36px; overflow: visible; position: relative; border-radius: 4px"
          >
            <div class="dropdown dropdown-hover">
              <label tabindex="0"> <nuxt-img
                class="rounded-lg z-0" alt="" loading="lazy" fit="fill"
                :src="data.image"
              />
              </label>
              <ul
                tabindex="0"
                class="dropdown-content mt-4 p-2 shadow bg-base-100 rounded-box w-52 z-[1]"
              >
                <nuxt-img
                  class="rounded-lg z-[1]" loading="lazy" fit="fill"
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
          :href="`https://www.ozon.ru/product/${data.article}`" target="_blank"
            class="text-sm text-secondary link link-hover"
          >
            {{ data.article }}
          </a>
        </template>
      </Column>
      <Column field="size" header="Размер">
        <template #body="{ data }">
          <div>{{ data.size }}</div>
        </template>
      </Column>
      <Column field="amount" header="Кол-во">
        <template #body="{ data }">
          <div>{{ data.amount }}</div>
        </template>
      </Column>
      <Column field="query" header="Ключевой запрос">
        <template #body="{ data }">
          <p class="max-w-xs truncate">
            {{ data.query }}
          </p>
        </template>
      </Column>

      <Column field="status" header="Статус">
        <template #body="{ data }">
          <div
            :class="{
              'text-error': data.status === 'nofunds',
              'text-primary': data.status === 'created',
              'text-warning': data.status === 'work',
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
          <div v-else>
            Нет
          </div>
        </template>
      </Column>
    </DataTable> -->
  </ClientOnly>
</template>

<style scoped>

</style>
