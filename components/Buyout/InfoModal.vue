<script setup lang="ts">
const props = defineProps({
  info: {
    type: Object as any,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  state: {
    type: Boolean,
    required: true,
  },
})
const emit = defineEmits(['close'])
const currency = useCurrency()
const store = useMainStore()
const getStatus = computed(() => {
  switch (props.info.status) {
    case 'active':
      return 'Активный'
    case 'work':
      return 'В работе'
    case 'completed':
      return 'Завершен'
    case 'archived':
      return 'В архиве'
    case 'paused':
      return 'Пауза'
  }
})

const getGender = computed(() => {
  switch (props.info.gender) {
    case 'male':
      return 'Мужской'
    case 'female':
      return 'Женский'
    case 'none':
      return 'Нет'
  }
})

onKeyStroke('Escape', (e) => {
  e.preventDefault()
  emit('close')
})
</script>

<template>
  <div id="buyoutInfoModal" :class="{ 'modal-open': state }" class="modal">
    <div v-if="state" class="modal-box max-w-lg max-h-2xl p-0">
      <div class="">
        <div class="p-5">
          <a
            class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            @click="$emit('close')"
            >✕</a
          >
          <span class="text-sm text-gray-500"
            >Создан: {{ defaultDate(info.createdAt) }}</span
          >
          <div class="flex gap-3">
            <div class="text-md font-bold mb-2">
              Информация о выкупе № {{ info.place }}
            </div>
            <span
              class="rounded-2xl py-1 px-2 max-h-9"
              :class="{
                'text-green-600 bg-green-200':
                  info.status === 'active' || info.status === 'work',
                'text-error bg-red-400':
                  info.status === 'completed' || info.status === 'nofunds',
                'text-warning bg-yellow-400':
                  info.status === 'archived' || info.status === 'paused',
              }"
              >{{ getStatus }}</span
            >
          </div>

          <div class="text-xs text-gray-500">#{{ info.uuid }}</div>

          <div class="flex gap-3 mt-2">
            <div class="flex-none" style="width: 100px; height: 150px">
              <nuxt-img
                class="rounded-xl h-full"
                width="100"
                height="150"
                :src="info?.product?.image || '/logo/logocolor.svg'"
                loading="lazy"
              />
            </div>
            <div class="flex flex-col truncate gap-4">
              <div class="flex flex-col gap-3">
                <div class="text-md font-bold truncate">
                  {{ info.product?.name }}
                </div>
                <div>
                  <span class="text-sm text-gray-500 mr-2">Артикул: </span>
                  <a
                    :href="`https://www.ozon.ru/product/${info.article}`"
                    target="_blank"
                    class="text-sm text-primary link link-hover"
                  >
                    {{ info.article }}
                  </a>
                </div>

                <div>
                  <span class="text-sm text-gray-500 mr-2">Размер: </span>
                  <span class="bg-base-300 rounded-md p-1">{{
                    info.sizeparam === 'none' ? 'Не указан' : info.sizeparam
                  }}</span>
                </div>
              </div>
              <div>
                <span class="text-sm text-gray-500 mr-2">Цена: </span>
                <span class="bg-green-200 rounded-lg p-1">{{
                  info.product?.priceText
                }}</span>
              </div>
              <div>
                <span class="text-sm text-gray-500 mr-2">Количество: </span>
                <span class="bg-amber-100 rounded-lg p-1"
                  >{{ info.quantity }} шт.</span
                >
              </div>
              <div>
                <span class="text-sm text-gray-500 mr-2">Сумма: </span>
                <span class="bg-indigo-300 rounded-lg p-1">{{
                  currency.format(info.quantity * info.product?.price)
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 
        <div class="divider" /> -->

        <div class="flex flex-col gap-2 mt-2 justify-center bg-indigo-100 p-5">
          <div class="flex justify-between"></div>
          <!-- <div class="flex justify-between items-center flex-wrap">
            <span class="text-gray-500 text-sm">Поисковый запрос:</span>
            <span class="text-sm">{{ info.searchQuery }}</span>
          </div> -->
          <div
            class="flex items-start justify-between flex-col md:flex-row gap-2"
          >
            <div class="flex items-start flex-col">
              <span class="text-lg font-bold mb-1">Пол:</span>
              <span class="text-sm">{{ getGender }}</span>
            </div>

            <div class="flex justify-between flex-col self-start md:self-end">
              <span class="text-lg font-bold mb-1">Даты выкупов:</span>
              <div class="bg-white rounded-lg p-2">
                <span class="text-sm flex flex-col justify-center items-end">
                  <div>
                    {{ `С ${defaultDate(info.dateStart)}` }}
                  </div>
                  <div>{{ `По ${defaultDate(info.dateEnd)}` }}</div>
                </span>
              </div>
            </div>
          </div>
          <div class="flex items-start flex-col">
            <span class="text-lg font-bold mb-1">Адрес:</span>
            <a
              target="_blank"
              class="text-sm link link-hover truncate"
              :href="`https://yandex.ru/maps/?mode=search&text=${info.point}`"
            >
              {{ info.point }}
            </a>
          </div>
          <div class="flex items-start flex-col">
            <span class="text-lg font-bold mb-1">Правила:</span>
            <span class="text-sm">{{
              !info.rules.length ? 'Не выбраны' : info.rules.join(', ')
            }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
