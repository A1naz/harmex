<script setup lang="ts">
const { notify } = useNotification();

const props = defineProps({
  info: {
    type: Object as any,
    required: true,
  },
  state: {
    type: Boolean,
  },
  index: {
    type: Number,
  },
});
const emit = defineEmits(["openModal", "openStatusModal", "openPenaltyModal"]);
const theme = useColorMode();
const currency = useCurrency();
const store = useMainStore();
const router = useRouter();
const opened = ref();
const qrCode = ref(null);

onMounted(async () => {
  opened.value = props.state;
});
watch(
  () => props.state,
  (newState) => {
    opened.value = newState;
  }
);
function daysToPenalty(statusdelivery: any[]) {
  const item = statusdelivery.find((item) =>
    item.status.includes("Ожидает получения")
  );
  if (!item) return;

  const updatedAt = new Date(item.date);
  const penaltyDay = new Date(updatedAt.getTime() + 7 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const timeLeft = penaltyDay.getTime() - now.getTime();

  if (timeLeft < 0) {
    return "Получение со штрафом!";
  } else {
    const days = Math.round(timeLeft / 1000 / 60 / 60 / 24);
    return `До штрафа осталось: ${days} д.`;
  }
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
  notify({ text: "Скопировано в буфер обмена", type: "success" });
}

const { $dayjs } = useNuxtApp();
</script>

<template>
  <div class="buyout-card card bg-base-100 shadow-lg min-w-[214px]">
    <div
      class="card-body flex-shrink-0 flex flex-col justify-start gap-4 p-3 relative"
    >
      <div class="dropdown dropdown-end absolute -right-1 top-2">
        <label tabindex="0" class="btn btn-sm btn-square btn-ghost">
          <Icon name="ph:dots-three-outline-vertical-fill" size="22" />
        </label>
      </div>

      <div class="flex gap-3 w-full truncate mt-6">
        <div
          class="flex-none"
          style="
            width: 80px;
            height: 100px;
            margin-top: auto;
            margin-bottom: auto;
          "
        >
          <nuxt-img
            class="rounded-xl h-full"
            width="120"
            height="120"
            format="webp"
            loading="lazy"
            :src="info?.productimage ? info?.productimage : 'null'"
          />
        </div>
        <div class="flex flex-col w-full">
          <div class="flex flex-col gap-1.5">
            <div
              v-if="
                info.currentstatus.includes('Ожидает получения') &&
                info.statusdelivery.length > 1
              "
              class="text-s link bg-[#FF6666] w-fit dark:bg-red-500 link-hover rounded-full my-auto max-h-6 font-normal text-xs flex gap-1 text-white z-20"
              @click="emit('openPenaltyModal')"
            >
              <IconCSS name="ph:warning-circle-light" size="25" />

              <span class="mr-1 my-auto">{{
                daysToPenalty(info.statusdelivery)
              }}</span>
            </div>
            <div class="flex gap-2">
              <span class="text-sm text-[0.725rem] text-gray-500 my-auto"
                >Актуальность:
              </span>
              <div class="rounded-md py-0 px-2 text-sm text-[0.725rem]">
                {{ $dayjs(info.updatedAt).format("DD.MM.YYYY") }}
              </div>
            </div>
            <div
              class="flex gap-2 cursor-pointer"
              @click="emit('openStatusModal', info.statusdelivery)"
            >
              <span class="text-sm text-[0.725rem] text-gray-500 my-auto"
                >Статус:
              </span>
              <div
                class="rounded-md py-0 px-2 text-sm text-[0.725rem]"
                :class="{
                  'dark:text-base-content text-red bg-[#fecaca] dark:bg-red-700':
                    info.currentstatus.includes('Ожидает получения') &&
                    info.statusdelivery.length > 1,
                }"
              >
                {{ info.currentstatus }}
              </div>
            </div>
            <div class="flex gap-2" v-if="info.currentstatus === 'Получен'">
              <span class="text-sm text-[0.725rem] text-gray-500 my-auto"
                >Получено:
              </span>
              <div class="rounded-md py-0 px-2 text-sm text-[0.725rem]">
                {{ $dayjs(info.updatedAt).format("DD.MM.YYYY") }}
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
                >ID доставки:
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
                {{ info.productname }}
              </div>
            </div>
            <div class="flex gap-2">
              <span class="text-sm text-[0.725rem] text-gray-500 my-auto"
                >Цена:
              </span>
              <div class="rounded-md py-0 px-2 text-sm text-[0.725rem]">
                {{ currency.format(info.pricebuy) }}
              </div>
            </div>
            <div class="flex gap-2">
              <span class="text-sm text-[0.725rem] text-gray-500 my-auto"
                >Адрес:
              </span>
              <div
                class="rounded-md py-0 px-2 text-sm text-[0.725rem] link-hover"
              >
                <a
                  target="_blank"
                  :href="`https://yandex.ru/maps/?mode=search&text=${info.point}`"
                >
                  {{ info.point }}
                </a>
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
            <div class="flex gap-2 h-5" v-if="info.currentstatus !== 'Получен'">
              <span class="text-sm text-[0.725rem] text-gray-500 my-auto">
              </span>
              <div class="rounded-md py-0 px-2 text-sm text-[0.725rem]"></div>
            </div>
          </div>
        </div>
      </div>
      <button
        class="btn btn-sm h-[2.5rem] text-[20px] mt-2 rounded-2xl font-normal text-white btn-primary"
        @click="$emit('openModal', index)"
      >
        Детали
      </button>
    </div>
  </div>
</template>

<style scoped></style>
