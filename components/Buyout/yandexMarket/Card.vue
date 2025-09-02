<script setup lang="ts">
const { notify } = useNotification();

const props = defineProps({
  info: {
    type: Object as any,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
});
const emit = defineEmits([
  "callback",
  "remove",
  "openModal",
  "archive",
  "unarchive",
  "unpause",
  "openLogModal",
  "removeBuyout",
]);
const theme = useColorMode();
const { width } = useWindowSize();

const currency = useCurrency();
const router = useRouter();
function cloneBuyout() {
  router.push({
    path: "/ym/buyouts/create",
    query: {
      uuid: props.info.uuid,
    },
  });
}

async function deleteBuyOut() {
  const { data, error } = await useFetch("/api/yandexMarket/buyout/delete", {
    method: "DELETE",
    body: {
      uuid: props.info.uuid,
    },
    headers: useRequestHeaders(["cookie"]) as HeadersInit,
  });
  if (error.value) {
    notify({
      title: "Что-то пошло не так",
      text: error.value?.data?.message,
     group: "error",
      duration: 3000,
    });
  } else {
    notify({
      title: "Успешно",
      text: "Выкуп успешно удален",
     group: "success",
      duration: 3000,
    });
    emit("remove", props.info.uuid);
  }
}
async function unpauseBuyout() {
  const { data, error } = await useFetch("/api/yandexMarket/buyout/unpause", {
    method: "PUT",
    body: JSON.stringify({
      uuid: props.info.uuid,
    }),
    headers: useRequestHeaders(["cookie"]) as HeadersInit,
  });
  if (error.value) {
    notify({
      title: "Что-то пошло не так",
      text: error.value?.data?.message,
     group: "error",
      duration: 3000,
    });
  } else {
    notify({
      title: "Успешно",
      text: "Выкуп успешно возобновлен",
     group: "success",
      duration: 3000,
    });
    emit("unpause", props.info.uuid);
  }
}
async function unarchiveBuyout() {
  const { data, error } = await useFetch("/api/yandexMarket/buyout/unarchive", {
    method: "PUT",
    body: JSON.stringify({
      uuid: props.info.uuid,
    }),
    headers: useRequestHeaders(["cookie"]) as HeadersInit,
    watch: false,
  });
  if (error.value) {
    notify({
      title: "Что-то пошло не так",
      text: error.value?.data?.message,
     group: "error",
      duration: 3000,
    });
  } else {
    notify({
      title: "Успешно",
      text: "Выкуп успешно восстановлен",
     group: "success",
      duration: 3000,
    });
    emit("unarchive", props.info.uuid);
  }
}

const confirmModal = ref(false);
const confirmModalFunction = ref(() => {});
function unarchiveBuyoutConfirm() {
  confirmModalFunction.value = unarchiveBuyout;
  confirmModal.value = true;
}

async function archiveBuyout() {
  const { data, error } = await useFetch("/api/yandexMarket/buyout/archive", {
    method: "PUT",
    body: JSON.stringify({
      uuid: props.info.uuid,
    }),
    headers: useRequestHeaders(["cookie"]) as HeadersInit,
  });
  if (error.value) {
    notify({
      title: "Что-то пошло не так",
      text: error.value?.data?.message,
     group: "error",
      duration: 3000,
    });
  } else {
    notify({
      title: "Успешно",
      text: "Выкуп успешно архивирован",
     group: "success",
      duration: 3000,
    });
    emit("archive", props.info.uuid);
  }
}
const getStatus = computed(() => {
  switch (props.info.status) {
    case "active":
      return "Активный";
    case "work":
      return "В работе";
    case "busy":
      return "В работе";
    case "completed":
      return "Завершен";
    case "archived":
      return "В архиве";
    case "paused":
      return "Пауза";
    case "nofunds":
      return "Недостаточно средств";
    default:
      return "Неизвестно";
  }
});

async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text);
  notify({
    title: "Успешно",
    text: "Скопировано в буфер обмена",
  });
}
</script>

<template>
  <div class="buyout-card card bg-base-100 shadow-lg min-w-[214px]">
    <div
      class="card-body flex-shrink-0 flex flex-col justify-start gap-4 p-3 relative"
    >
      <button
        v-show="info.status === 'paused' || info.status === 'nofunds'"
        class="btn btn-xs btn-neutral absolute left-3 top-3"
        @click="unpauseBuyout"
      >
        Возобновить
      </button>
      <div class="dropdown dropdown-end absolute -right-1 top-2">
        <label tabindex="0" class="btn btn-sm btn-square btn-ghost">
          <Icon name="ph:dots-three-outline-vertical-fill" size="22" />
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
            <a v-else @click="unarchiveBuyoutConfirm">
              <img
                class="w-5 h-5"
                src="/icons/figma/buyouts/archive.svg"
                alt="settings"
              />
              Убрать из архива
            </a>
          </li>

          <li v-if="info.status == 'archived'" class="cursor-pointer">
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

      <div class="flex gap-3 w-full truncate mt-6">
        <div
          class="flex-none"
          style="
            width: 80px;
            height: 124px;
            margin-top: auto;
            margin-bottom: auto;
          "
        >
          <nuxt-img
            class="rounded-xl h-full"
            width="120"
            height="150"
            format="webp"
            loading="lazy"
            :src="info?.product?.image || '/logo/logocolor.svg'"
          />
        </div>
        <div class="flex flex-col w-full">
          <div class="flex flex-col gap-1.5">
            <div class="flex gap-2">
              <span class="text-sm text-[0.725rem] text-gray-500 my-auto"
                >Создано:
              </span>
              <div class="rounded-md py-0 px-2 text-sm text-[0.725rem]">
                {{ $dayjs(info.createdAt).format("DD.MM.YYYY") }}
              </div>
            </div>
            <div class="flex gap-2">
              <span class="text-sm text-[0.725rem] text-gray-500 my-auto"
                >Статус:
              </span>
              <div
                class="rounded-md py-0 px-2 text-sm text-[0.725rem]"
                :class="{
                  ' bg-[#b5ffbc] dark:bg-success':
                    info.status === 'active' ||
                    info.status === 'work' ||
                    info.status === 'busy' ||
                    info.status === 'discountGiven',
                  'dark:text-base-content text-[#ac5858] bg-[#fecaca] dark:bg-red-700':
                    info.status === 'completed' || info.status === 'nofunds',
                  'text-base-content bg-yellow-300':
                    info.status === 'archived' ||
                    info.status === 'paused' ||
                    info.status === 'discountAwaiting',
                }"
              >
                {{ getStatus }}
              </div>
            </div>
            <div class="flex gap-2" v-if="info.executionTime">
              <span class="text-sm text-[0.725rem] text-gray-500 my-auto"
                >Выполнено:
              </span>
              <div class="rounded-md py-0 px-2 text-sm text-[0.725rem]">
                {{ $dayjs(info.executionTime).format("DD.MM.YYYY") }}
              </div>
            </div>
            <div class="flex gap-2 w-2/3">
              <span class="text-sm text-[0.725rem] text-gray-500 my-auto"
                >ID заказа:
              </span>
              <button
                class="rounded-md py-0 px-2 text-sm text-[0.725rem] truncate"
                @click="copyToClipboard(info.uuid)"
              >
                #{{ info.uuid }}
              </button>
            </div>
            <div class="flex gap-2">
              <span class="text-sm text-[0.725rem] text-gray-500 my-auto"
                >Товар:
              </span>
              <div
                class="rounded-md py-0 px-2 text-sm text-[0.725rem] text-primary"
              >
                <a
                  :href="`https://market.yandex.ru/pr/${info.article}`"
                  target="_blank"
                  class="link link-hover"
                >
                  {{ info.article }}
                </a>
              </div>
            </div>

            <div class="flex gap-2 w-2/3">
              <span class="text-sm text-[0.725rem] text-gray-500 my-auto"
                >Название:
              </span>
              <div class="truncate text-[0.9rem] text-bold">
                {{ info.product?.name }}
              </div>
            </div>
            <div class="flex gap-2">
              <span class="text-sm text-[0.725rem] text-gray-500 my-auto"
                >Цена:
              </span>
              <div class="rounded-md py-0 px-2 text-sm text-[0.725rem]">
                {{ info.product?.priceText }}
              </div>
            </div>
            <div class="flex gap-2">
              <span class="text-sm text-gray-500 my-auto text-[0.725rem]"
                >Скидка:
              </span>
              <div
                class="text-[0.725rem] rounded-md py-0 px-2 bg-opacity-20 text-sm"
                :class="{
                  ' bg-[#b5ffbc] dark:bg-success': info.discount,
                  'dark:text-base-content text-[#ac5858] bg-[#fecaca] dark:bg-red-700':
                    !info.discount,
                }"
              >
                {{
                  info.discountPrice == info.product?.price
                    ? "нет"
                    : info.discountPrice
                    ? `${info.discountPrice} ₽`
                    : "нет"
                }}
              </div>
            </div>
            <div class="flex gap-2">
              <span class="text-sm text-[0.725rem] text-gray-500 my-auto"
                >Площадка:
              </span>
              <div class="rounded-md py-0 px-2 text-sm text-[0.725rem]">
                Yandex market
              </div>
            </div>
            <div class="mt-[20px]" v-if="!info.executionTime" />
          </div>
        </div>
      </div>
      <button
        class="btn btn-sm h-[2.5rem] mt-2 text-[20px] rounded-2xl font-normal text-white btn-primary"
        @click="$emit('openModal', index)"
      >
        Детали
      </button>
    </div>
    <StaticConfirmModal
      v-model:state="confirmModal"
      title="Подтвердите действие"
      description="Вы действительно хотите разархивировать выкуп?"
      :confirmFunction="confirmModalFunction"
    />
  </div>
</template>

<style scoped></style>
