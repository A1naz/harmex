<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'
const theme = useColorMode()
const { width } = useWindowSize()

const props = defineProps({
  info: {
    type: Object as any,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
})
const emit = defineEmits([
  'callback',
  'remove',
  'openModal',
  'archive',
  'unarchive',
  'unpause',
  'openLogModal',
  'removeBuyout',
])
const currency = useCurrency()
const router = useRouter()
function cloneBuyout() {
  router.push({
    path: '/buyouts/create/ozon',
    query: {
      uuid: props.info.uuid,
    },
  })
}

async function deleteBuyOut() {
  const { data, error } = await useFetch('/api/ozon/buyout/delete', {
    method: 'DELETE',
    body: JSON.stringify({
      uuid: props.info.uuid,
    }),
    headers: useRequestHeaders(['cookie']) as HeadersInit,
  })
  if (error.value) {
    notify({
      title: 'Что-то пошло не так',
      text: error.value?.data?.message,
      type: 'error',
      duration: 3000,
    })
  } else {
    notify({
      title: 'Успешно',
      text: 'Выкуп успешно удален',
      type: 'success',
      duration: 3000,
    })
    emit('remove', props.info.uuid)
  }
}
async function unpauseBuyout() {
  const { data, error } = await useFetch('/api/ozon/buyout/unpause', {
    method: 'PUT',
    body: JSON.stringify({
      uuid: props.info.uuid,
    }),
    headers: useRequestHeaders(['cookie']) as HeadersInit,
  })
  if (error.value) {
    notify({
      title: 'Что-то пошло не так',
      text: error.value?.data?.message,
      type: 'error',
      duration: 3000,
    })
  } else {
    notify({
      title: 'Успешно',
      text: 'Выкуп успешно возобновлен',
      type: 'success',
      duration: 3000,
    })
    emit('unpause', props.info.uuid)
  }
}
async function unarchiveBuyout() {
  const { data, error } = await useFetch('/api/ozon/buyout/unarchive', {
    method: 'PUT',
    body: JSON.stringify({
      uuid: props.info.uuid,
    }),
    headers: useRequestHeaders(['cookie']) as HeadersInit,
  })
  if (error.value) {
    notify({
      title: 'Что-то пошло не так',
      text: error.value?.data?.message,
      type: 'error',
      duration: 3000,
    })
  } else {
    notify({
      title: 'Успешно',
      text: 'Выкуп успешно восстановлен',
      type: 'success',
      duration: 3000,
    })
    emit('unarchive', props.info.uuid)
  }
}
async function archiveBuyout() {
  const { data, error } = await useFetch('/api/ozon/buyout/archive', {
    method: 'PUT',
    body: JSON.stringify({
      uuid: props.info.uuid,
    }),
    headers: useRequestHeaders(['cookie']) as HeadersInit,
  })
  if (error.value) {
    notify({
      title: 'Что-то пошло не так',
      text: error.value?.data?.message,
      type: 'error',
      duration: 3000,
    })
  } else {
    notify({
      title: 'Успешно',
      text: 'Выкуп успешно архивирован',
      type: 'success',
      duration: 3000,
    })
    emit('archive', props.info.uuid)
  }
}
const getStatus = computed(() => {
  switch (props.info.status) {
    case 'active':
      return 'Активный'
    case 'work':
      return 'В работе'
    case 'busy':
      return 'В работе'
    case 'completed':
      return 'Завершен'
    case 'archived':
      return 'В архиве'
    case 'paused':
      return 'Пауза'
    case 'nofunds':
      return 'Недостаточно средств'
    case 'discountAwaiting':
      return 'Ожидание скидки'
    case 'discountGiven':
      return 'Скидка предоставлена'
  }
})
</script>

<template>
  <div class="buyout-card card bg-base-100 shadow-lg min-w-[320px]">
    <div
      class="card-body flex-shrink-0 flex flex-col justify-start gap-4 p-4 relative"
    >
      <div class="dropdown dropdown-end absolute right-1 top-2">
        <label tabindex="0" class="btn btn-sm btn-square btn-ghost">
          <Icon name="ph:dots-three-outline-vertical-fill" size="28" />
        </label>
        <ul
          tabindex="0"
          class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
        >
          <li>
            <a @click="$emit('openLogModal', index)">
              <img
                class="w-5 h-5"
                src="/icons/figma/buyouts/info.svg"
                alt="settings"
              />
              О выкупе
            </a>
          </li>
          <li>
            <a @click="cloneBuyout">
              <img
                class="w-5 h-5"
                src="/icons/figma/buyouts/copy.svg"
                alt="settings"
              />
              Дублировать
            </a>
          </li>
          <li
            v-if="
              info.status === 'archived' ||
              info.status === 'active' ||
              info.status === 'paused'
            "
          >
            <a v-if="info.status !== 'archived'" @click="archiveBuyout">
              <img
                class="w-5 h-5"
                src="/icons/figma/buyouts/archive.svg"
                alt="settings"
              />
              Архивировать
            </a>
            <a v-else @click="unarchiveBuyout">
              <img
                class="w-5 h-5"
                src="/icons/figma/buyouts/archive.svg"
                alt="settings"
              />
              Убрать из архива
            </a>
          </li>

          <li v-if="info.status !== 'work'" class="cursor-pointer">
            <a @click="$emit('removeBuyout', index)">
              <img
                class="w-5 h-5"
                src="/icons/figma/buyouts/delete.svg"
                alt="settings"
              />
              <label class="cursor-pointer">Удалить</label>
            </a>
          </li>
        </ul>
      </div>

      <div class="truncate">
        <div class="flex justify-between gap-1 items-center">
          <div class="flex gap-x-3 flex-wrap">
            <span class="text-xs text-gray-500 py-1"
              >Создан: {{ 
                $dayjs(info.createdAt).locale('ru').format(
                  'D MMMM YYYY HH:mm'
                ) }}
            </span>
            <div
              :class="{
                'opacity-0':
                  info.status !== 'active' &&
                  info.status !== 'paused' &&
                  info.status !== 'work' &&
                  info.status !== 'busy' &&
                  info.status !== 'archived',
              }"
              class="text-xs rounded-2xl px-2 bg-base-200 py-1"
            >
              Выкуплено {{ info.completed }} шт.
            </div>
            <button
              v-show="info.status === 'paused' || info.status === 'nofunds'"
              class="btn btn-sm btn-neutral"
              @click="unpauseBuyout"
            >
              Возобновить
            </button>
          </div>
        </div>

        <div class="flex gap-3 flex-wrap">
          <h2 class="card-title mt-2" >Выкуп №{{ info.place }}</h2>
         

          <a
            :href="`https://www.ozon.ru/product/${info.article}`"
            target="_blank"
            class="text-base text-primary link link-hover mt-0 flex items-center"
            :class="{
              'mt-2': width > 364,
            }"
          >
            {{ info.article }}
          </a>
        </div>
        <div
            class="mt-2 rounded-2xl py-0 px-2 text-md flex items-center w-fit"
            :class="{
              'bg-success ':
                info.status === 'active' ||
                info.status === 'work' ||
                info.status === 'busy' ||
                info.status === 'discountGiven',
              'text-base-content bg-green-600 ':
                (info.status === 'active' ||
                  info.status === 'work' ||
                  info.status === 'busy') &&
                theme.value === 'dark',
              'text-base-content bg-red-700':
                (info.status === 'completed' || info.status === 'nofunds') &&
                theme.value === 'dark',
              'text-base-content bg-red-200':
                (info.status === 'completed' || info.status === 'nofunds') &&
                theme.value === 'light',
              'text-base-content bg-yellow-300':
                info.status === 'archived' ||
                info.status === 'paused' ||
                info.status === 'discountAwaiting',
            }"
          >
            {{ getStatus }}
          </div>

        <div class="flex justify-between mt-2"></div>
      </div>

      <div class="flex gap-4 justify-center items-center">
        <div class="flex-none my-auto" style="width: 120px; height: 120px">
          <nuxt-img
            class="rounded-xl h-full"
            width="150"
            height="150"
            format="webp"
            loading="lazy"
            :src="info?.product?.image || '/logo/logocolor.svg'"
          />
        </div>
        <div class="flex flex-col">
          <div class="mb-2">
            <div class="text-xs text-gray-500 truncate max-w-[150px]">
              #{{ info.uuid }}
            </div>
            <div class="truncate text-bold max-w-[150px]">
              {{ info.product?.name }}
            </div>
          </div>
          <div class="flex flex-col gap-4">
            <div class="flex gap-2">
              <span class="text-sm text-gray-500 my-auto">Сумма: </span>
              <div class="rounded-md py-0 px-2 bg-success text-sm">
                {{ info.product?.priceText }}
              </div>
            </div>
            <div class="flex gap-2">
              <span class="text-sm text-gray-500 my-auto">Количество: </span>
              <div class="rounded-md py-0 px-2 bg-warning text-sm">
                {{ info.quantity }} шт.
              </div>
            </div>
            <div class="flex gap-2">
              <span class="text-sm text-gray-500 my-auto">Сумма: </span>
              <div
                class="rounded-md py-0 px-2 bg-primary bg-opacity-50 text-sm"
              >
                {{ currency.format(info.quantity * info.product?.price) }}
              </div>
            </div>
            <div class="flex gap-2">
              <span class="text-sm text-gray-500 my-auto">Скидка: </span>
              <div
                class="rounded-md py-0 px-2 bg-primary bg-opacity-20 text-sm"
              >
                {{
                  info.discountPrice == info.product?.price
                    ? 'нет'
                    : info.discountPrice + ' ₽'
                }}
              </div>
            </div>
            <div class="flex gap-2">
              <span class="text-sm text-gray-500 my-auto">Категория: </span>
              <div class="bg-base-300 rounded-md py-0 px-2 text-sm">Ozon</div>
            </div>
            
          </div>
        </div>
      </div>
      <div class="flex gap-2 ">
        <span class="text-sm text-gray-500 my-auto">ФИО: </span>
        <div class="rounded-md py-0 px-2 text-sm">{{ info.FIO ? info.FIO : '-' }}</div>
      </div>
      <div class="flex gap-2">
        <span class="text-sm text-gray-500 my-auto"
          >Дата запроса скидки:
        </span>
        <div class="rounded-md py-0 px-2 text-sm">
          {{
            info.discountRequestTime
              ? moscowDate(info.discountRequestTime)
                  .split('T')[0]
                  .replaceAll('-', '.') +
                ' ' +
                moscowDate(info.discountRequestTime)
                  .split('T')[1]
                  .slice(0, 5)
              : '-'
          }}
        </div>
      </div>
      <button
        class="btn text-[20px] rounded-2xl font-normal text-base-content bg-indigo-300 border-indigo-300 btn-primary mt-auto"
        @click="$emit('openModal', index)"
      >
        Открыть
      </button>
    </div>
  </div>
</template>

<style scoped></style>
