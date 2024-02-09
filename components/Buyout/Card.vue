<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'
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
})
const emit = defineEmits([
  'callback',
  'remove',
  'openModal',
  'archive',
  'unarchive',
  'unpause',
  'openLogModal',
])
const currency = useCurrency()
const router = useRouter()
function cloneBuyout() {
  router.push({
    path: '/buyouts/create',
    query: {
      uuid: props.info.uuid,
    },
  })
}

async function deleteBuyOut() {
  const { data, error } = await useFetch('/api/buyout/delete', {
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
  const { data, error } = await useFetch('/api/buyout/unpause', {
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
  const { data, error } = await useFetch('/api/buyout/unarchive', {
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
  const { data, error } = await useFetch('/api/buyout/archive', {
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
    case 'completed':
      return 'Завершен'
    case 'archived':
      return 'В архиве'
    case 'paused':
      return 'Пауза'
    case 'nofunds':
      return 'Недостаточно средств'
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
            <a @click="$emit('openModal', index)">
              <Icon name="fluent:send-logging-24-filled" />Инфо о выкупе
            </a>
          </li>
          <li>
            <a @click="cloneBuyout">
              <Icon name="fluent:copy-24-filled" />Дублировать
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
              <Icon name="material-symbols:archive" />Архивировать
            </a>
            <a v-else @click="unarchiveBuyout">
              <Icon name="material-symbols:unarchive" />Убрать из архива
            </a>
          </li>

          <li v-if="info.status !== 'work'">
            <a :for="`removeAllModelCreateProducts:${props.info.uuid}`">
              <Icon name="fluent:delete-24-filled" />
              <label :for="`removeAllModelCreateProducts:${props.info.uuid}`"
                >Удалить</label
              >
            </a>
          </li>
        </ul>
      </div>

      <div class="truncate">
        <div class="flex justify-between gap-1 items-center">
          <div class="flex gap-x-3">
            <span class="text-xs text-gray-500"
              >Создан: {{ defaultDate(info.createdAt) }}
            </span>
            <div
              :class="{
                'opacity-0':
                  info.status !== 'active' &&
                  info.status !== 'paused' &&
                  info.status !== 'work' &&
                  info.status !== 'archived',
              }"
              class="text-xs rounded-2xl px-2 bg-base-200"
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

        <div class="flex gap-3">
          <h2 class="card-title mt-2">Выкуп №{{ info.place }}</h2>
          <div
            class="mt-2 rounded-2xl py-1 px-2"
            :class="{
              'bg-success ':
                (info.status === 'active' || info.status === 'work'),
              'text-green-200 bg-green-600 ':
                (info.status === 'active' || info.status === 'work') &&
                theme.value === 'dark',
              'text-red-200 bg-red-700':
                (info.status === 'completed' || info.status === 'nofunds') &&
                theme.value === 'dark',
              'text-error bg-red-200':
                (info.status === 'completed' || info.status === 'nofunds') &&
                theme.value === 'light',
              'text-warning bg-yellow-200':
                (info.status === 'archived' || info.status === 'paused') &&
                theme.value === 'light',
              'text-warning bg-yellow-400':
                (info.status === 'archived' || info.status === 'paused') &&
                theme.value === 'dark',
            }"
          >
            {{ getStatus }}
          </div>

          <a
            :href="`https://www.ozon.ru/product/${info.article}`"
            target="_blank"
            class="text-base text-primary link link-hover mt-3"
          >
            {{ info.article }}
          </a>
        </div>

        <div class="flex justify-between mt-2"></div>
      </div>

      <div class="flex gap-4">
        <div class="flex-none" style="width: 100px; height: 150px">
          <nuxt-img
            class="rounded-xl h-full"
            width="100"
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
              <span class="text-sm text-gray-500 mt-1">Цена: </span>
              <div class="rounded-lg bg-success p-1">
                {{ info.product?.priceText }}
              </div>
            </div>
            <div class="flex gap-2">
              <span class="text-sm text-gray-500 mt-1">Количество: </span>
              <div class="rounded-lg p-1 bg-warning">
                {{ info.quantity }} шт.
              </div>
            </div>
            <div class="flex gap-2">
              <span class="text-sm text-gray-500 mt-1">Сумма: </span>
              <div class="rounded-lg p-1 bg-info">
                {{ currency.format(info.quantity * info.product?.price) }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <button
        class="btn mt-2 bg-indigo-400 border-indigo-400 btn-primary"
        @click="$emit('openModal', index)"
      >
        Открыть
      </button>
    </div>
    <input
      type="checkbox"
      :id="`removeAllModelCreateProducts:${props.info.uuid}`"
      class="modal-toggle"
    />
    <div class="modal backdrop-filter backdrop-blur-sm">
      <div class="modal-box max-w-xs">
        <h3 class="font-bold text-md">
          Вы уверенны что хотите удалить выкуп № {{ info.place }} ?
        </h3>
        <div class="modal-action flex justify-around">
          <label
            :for="`removeAllModelCreateProducts:${props.info.uuid}`"
            class="btn px-6"
            >Отмена</label
          >
          <label
            :for="`removeAllModelCreateProducts:${props.info.uuid}`"
            class="btn btn-primary px-6"
            @click="deleteBuyOut"
            >Удалить</label
          >
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
