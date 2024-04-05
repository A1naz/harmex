<script setup lang="ts">
const theme = useColorMode()
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
    <div v-if="state" class="modal-box max-w-md max-h-[90%] p-0">
      <div class="">
        <div class="p-5">
          <a
            class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            @click="$emit('close')"
            >✕</a
          >
          <div class="flex gap-2 mb-1">
            <span class="text-sm text-gray-500"
              >Создан: {{ defaultDate(info.createdAt) }}</span
            >
            <div
              :class="{
                'opacity-0':
                  info.status !== 'active' &&
                  info.status !== 'paused' &&
                  info.status !== 'work' &&
                  info.status !== 'archived',
              }"
              class="text-xs rounded-2xl px-2 bg-base-200 py-1 -mt-1"
            >
              Выкуплено {{ info.completed }} шт.
            </div>
          </div>
          <div class="flex gap-3">
            <div class="text-xl font-bold mb-2">
              Информация о выкупе № {{ info.place }}
            </div>
            <span
              class="rounded-2xl py-0 px-2 text-md mb-2 max-h-7 text-[9-px] whitespace-nowrap"
              :class="{
                'bg-success ':
                  info.status === 'active' || info.status === 'work',
                'text-base-content bg-green-600 ':
                  (info.status === 'active' || info.status === 'work') &&
                  theme.value === 'dark',
                'text-base-content bg-red-700':
                  (info.status === 'completed' || info.status === 'nofunds') &&
                  theme.value === 'dark',
                'text-base-content bg-red-200':
                  (info.status === 'completed' || info.status === 'nofunds') &&
                  theme.value === 'light',
                'text-base-content bg-yellow-300':
                  info.status === 'archived' || info.status === 'paused',
              }"
              >{{ getStatus }}</span
            >
          </div>

          <div class="text-xs text-gray-500">#{{ info.uuid }}</div>

          <div class="flex gap-3 mt-2 justify-center items-center">
            <div class="flex-none" style="width: 100px; height: 150px">
              <nuxt-img
                class="rounded-xl h-full"
                width="100"
                height="150"
                :src="info?.product?.image || '/logo/logocolor.svg'"
                loading="lazy"
              />
            </div>
            <div class="flex flex-col truncate gap-2">
              <div class="flex flex-col gap-2">
                <div class="text-md font-bold truncate">
                  {{ info.product?.name }}
                </div>
                <div>
                  <span class="text-sm text-gray-500 mr-2">Артикул: </span>
                  <a
                    :href="`https://www.avito.ru/${info.article}`"
                    target="_blank"
                    class="text-sm text-primary link link-hover font-bold"
                  >
                    {{ info.article }}
                  </a>
                </div>
              </div>
              <div>
                <span class="text-sm text-gray-500 mr-2 my-auto">Цена: </span>
                <span
                  class="rounded-md py-0 px-2 text-sm"
                  :class="{
                    'bg-green-600': theme.value === 'dark',
                    'bg-green-200': theme.value === 'light',
                  }"
                  >{{ info.product?.priceText }}</span
                >
              </div>
              <div>
                <span class="text-sm text-gray-500 mr-2 my-auto"
                  >Количество:
                </span>
                <span
                  class="rounded-md py-0 px-2 text-sm"
                  :class="{
                    'bg-amber-500': theme.value === 'dark',
                    'bg-amber-100': theme.value === 'light',
                  }"
                  >{{ info.quantity }} шт.</span
                >
              </div>
              <div>
                <span class="text-sm text-gray-500 mr-2 my-auto">Сумма: </span>
                <span
                  class="rounded-md py-0 px-2 text-sm"
                  :class="{
                    'bg-indigo-500': theme.value === 'dark',
                    'bg-indigo-300': theme.value === 'light',
                  }"
                  >{{
                    currency.format(info.quantity * info.product?.price)
                  }}</span
                >
              </div>
              <div>
                <span class="text-sm text-gray-500 mr-2">Размер: </span>
                <span class="bg-base-200 rounded-md py-0 px-2 text-sm">{{
                  info.sizeparam === 'none' ? 'Не указан' : info.sizeparam
                }}</span>
              </div>
              <div class="flex gap-2">
                <span class="text-sm text-gray-500 my-auto">Категория: </span>
                <div class="bg-base-300 rounded-md py-0 px-2 text-sm">
                  Avito
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 
        <div class="divider" /> -->

        <div
          class="flex flex-col gap-2 mt-2 justify-center p-5 bg-primary bg-opacity-10"
        >
          <div class="flex justify-between"></div>

          <div
            class="flex items-start justify-between flex-col md:flex-row gap-2"
          >
            <div class="flex items-start flex-col">
              <span class="text-md font-bold mb-1">Поисковый запрос:</span>
              <span class="text-sm">{{ info.searchQuery }}</span>
            </div>

            <div class="flex justify-between flex-col self-start md:self-end">
              <span class="text-md font-bold mb-1">Даты выкупов:</span>
              <div
                :class="{
                  'bg-base-200': theme.value === 'dark',
                  'bg-base-100': theme.value === 'light',
                }"
                class="rounded-lg p-2"
              >
                <span class="text-sm flex flex-col justify-start">
                  <div class="text-sm">
                    {{ `С ${defaultDate(info.dateStart)}` }}
                  </div>
                  <div class="text-sm">
                    {{ `По ${defaultDate(info.dateEnd)}` }}
                  </div>
                </span>
              </div>
            </div>
          </div>
          <div class="flex items-start flex-col -mt-1">
            <span class="text-lg font-bold mb-1">Пол:</span>
            <span class="text-sm">{{ getGender || 'Нет' }}</span>
          </div>
          <div class="flex items-start flex-col">
            <span class="text-lg font-bold mb-1">Адрес:</span>
            <a
              target="_blank"
              class="text-sm link link-hover truncate max-w-[90%] whitespace-normal"
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
