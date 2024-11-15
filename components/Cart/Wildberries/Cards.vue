<script setup lang="ts">
interface IProps {
  carts: any[]
  getStatus: (status: string) => string
}
const props = defineProps<IProps>()
</script>

<template>
  <div class="cards grid grid-cols-1 gap-4 lg:hidden">
    <div v-for="(item, index) in carts" :key="index" class="card card-compact bg-base-100 ">
      <div class="card-body">
        <div class="flex gap-4">
          <div class="image">
            <nuxt-img width="32" class="rounded-lg object-contain" :src="item.image" loading="lazy" />
          </div>
          <div class="article flex flex-col gap-0.5">
            <div class="text-xs">
              Артикул
            </div>
            <a
            :href="`https://www.wildberries.ru/catalog/${item.article}/detail.aspx`" target="_blank"
              class="text-primary link link-hover text-sm"
            >
              {{ item.article }}
            </a>
          </div>
          <div class="status flex flex-col gap-0.5">
            <div class="text-xs">
              Статус
            </div>
            <div
            class="whitespace-nowrap text-sm"
              :class="{
                  'bg-info text-base-content rounded-full py-1 px-1.5 text-center':
                    item.status === 'created',
                  'bg-info text-base-content rounded-full py-1 px-2 text-center':
                    item.status === 'work' || item.status === 'busy',
                  'bg-success text-base-content rounded-full py-0.5 px-2 text-center':
                    item.status === 'completed',
              }"
            >
              <div>
                {{ getStatus(item.status) }}
              </div>
            </div>
          </div>
          <div class="flex flex-col gap-0.5">
            <div class="text-xs">
              Количество
            </div>
            <div class="text-sm">
              {{ item.amount }}
            </div>
          </div>
        </div>
        <div class="flex gap-0.5">
          <div>
            <div class="text-xs">
              Размер
            </div>
            <div class="text-sm">
              {{ item.size == "none" ? "Нет" : item.size }}
            </div>
          </div>
        </div>
        <div class="card-actions justify-start mt-2">
          <div>Дата Создания:</div>
          <div class="date text-end bg-primary bg-opacity-10 rounded-lg p-0.5 px-3">
            {{ defaultDate(item.createdDate) }}
          </div>
          <div>Дата Завершения:</div>
          <div>
            <div v-if="item.endedDate" class="bg-primary bg-opacity-10 rounded-lg p-0.5 text-end px-3" >
              {{ defaultDate(item.endedDate) }}
            </div>
            <div v-else>
              Нет
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
