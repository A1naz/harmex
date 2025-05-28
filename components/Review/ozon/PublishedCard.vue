<script setup lang="ts">
import { UseImage } from "@vueuse/components";

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
  "openImage",
  "removeReview",
  "resumeStatus",
  "logModal",
  "infoModal",
]);
const router = useRouter();
const config = useRuntimeConfig();

const { $dayjs } = useNuxtApp();
onMounted(() => {});
const getStatus = computed(() => {
  switch (props.info.status) {
    case "created":
      return "Создан";
    case "waiting":
      return "В очереди";
    case "working":
      return "В работе";
    case "busy":
      return "В работе";
    case "published":
      return "Опубликован";
    case "canceled":
      return "Отменен";
    case "nofunds":
      return "Недостаточно средств";
    case "deleted":
      return "Удален";
    case "deleting":
      return "На удалении";
    case "archived":
      return "В архиве";
    case "completed":
      return "Опубликован";
  }
});

function openBuyout() {
  router.push(`/ozon/buyouts?uuid=${props.info.buyoutuuid}`);
}

function removeReview() {
  emit("removeReview", props.info.id);
}
async function resumeStatus(item: any) {
  emit("resumeStatus", item);
}
</script>

<template>
  <div class="buyout-card card bg-base-100 shadow-lg">
    <div
      class="card-body flex-shrink-0 flex flex-col justify-start p-4 relative"
    >
      <div class="dropdown dropdown-end absolute right-1 top-2">
        <label tabindex="0" class="btn btn-sm btn-square btn-ghost">
          <Icon name="ph:dots-three-outline-vertical-fill" size="22" />
        </label>
        <ul
          tabindex="0"
          class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
        >
          <li>
            <a @click="emit('logModal', info)">
              <img
                class="w-5 h-5"
                src="/icons/figma/buyouts/info.svg"
                alt="settings"
              />
              Об отзыве
            </a>
          </li>
           <li v-if="info.status === 'nofunds'">
            <a @click="emit('resumeStatus', info)">
              <Icon name="material-symbols:resume-outline-rounded" size="22" />
              Возобновить
            </a>
          </li>

          <li v-if="info.status === 'published'" class="cursor-pointer">
            <a @click="emit('removeReview', info.id)">
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
            height: 80px;
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
            <div class="flex gap-2 w-2/3">
              <span class="text-sm text-[0.725rem] text-gray-500 my-auto"
                >Создано:
              </span>
              <button
                class="rounded-md py-0 px-2 text-sm text-[0.725rem] truncate"
              >
                {{ $dayjs(info.date).format("DD.MM.YYYY HH:mm") }}
              </button>
            </div>
            <div class="flex gap-2 w-2/3">
              <span class="text-sm text-[0.725rem] text-gray-500 my-auto"
                >Статус:
              </span>
              <button class="rounded-md py-0 px-2 text-sm text-[0.725rem]">
                <span
                  :class="{
                    'bg-success bg-opacity-50 text-green-500':
                      info.status === 'published' ||
                      info.status === 'completed',
                    'bg-[#F8C68A] text-[#D67500]':
                      info.status === 'waiting' || info.status === 'created',
                    'bg-[#F8C68A]  text-red-500':
                      info.status === 'nofunds' || info.status === 'archived',
                    'bg-[#FF685E] text-white':
                      info.status === 'working' ||
                      info.status === 'busy' ||
                      info.status === 'canceled' ||
                      info.status === 'deleted' ||
                      info.status === 'deleting',
                  }"
                  class="text-black p-0.5 px-4 rounded-2xl text-center w-fit text-sm my-2.5"
                  >{{ getStatus }}
                </span>
              </button>
            </div>
            <div class="flex gap-2 w-2/3" v-if="info.completedDate">
              <span class="text-sm text-[0.725rem] text-gray-500 my-auto"
                >Выполнено:
              </span>
              <button
                class="rounded-md py-0 px-2 text-sm text-[0.725rem] truncate"
              >
                {{ $dayjs(info.completedDate).format("DD.MM.YYYY HH:mm") }}
              </button>
            </div>

            <div class="flex gap-2 w-2/3">
              <span class="text-sm text-[0.725rem] text-gray-500 my-auto"
                >ID:
              </span>
              <label
                class="rounded-md py-0 px-2 text-sm text-[0.725rem] link-hover hover:text-primary truncate"
                @click="openBuyout"
                >#{{ info.buyoutuuid }}</label
              >
            </div>
            <div class="flex gap-2">
              <span class="text-sm text-[0.725rem] text-gray-500 my-auto"
                >Товар:
              </span>
              <div
                class="rounded-md py-0 px-2 text-sm text-[0.725rem] text-primary"
              >
                <a
                  :href="`https://www.ozon.ru/product/${info.article}`"
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
                >Пол:
              </span>
              <div class="rounded-md py-0 px-2 text-sm text-[0.725rem]">
                {{ info.gender }}
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
              <span class="text-sm text-[0.725rem] text-gray-500 my-auto"
                >Площадка:
              </span>
              <div class="rounded-md py-0 px-2 text-sm text-[0.725rem]">
                OZON
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex gap-2 w-2/3" v-if="!info.completedDate">
        <span class="text-sm text-[0.725rem] text-gray-500 my-auto"> </span>
        <button
          class="rounded-md py-0 px-2 text-sm text-[0.725rem] truncate h-5"
        ></button>
      </div>
      <button
        class="btn btn-sm h-[2.5rem] mt-2 text-[20px] rounded-2xl font-normal text-white btn-primary opacity-80 hover:opacity-100"
        @click="emit('infoModal', info)"
      >
        Детали
      </button>
    </div>
  </div>
</template>

<style scoped></style>
