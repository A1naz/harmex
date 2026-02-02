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

function openBuyout() {
  router.push(`/wildberries/buyouts?uuid=${props.info.uuid}`);
}
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
  const item = statusdelivery.find(
    (item) =>
      item.status === "Готов к выдаче" ||
      item.status === "Готов к получению" ||
      item.status.includes("Ждёт в")
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
  notify({ text: "Скопировано в буфер обмена",group: "success" });
}

const { $dayjs } = useNuxtApp();
</script>

<template>
  <div class="buyout-card card bg-base-100 shadow-lg min-w-[214px] h-[340px]">
    <div
      class="card-body flex-shrink-0 flex flex-col justify-start gap-4 p-3 relative"
    >
      <div class="dropdown dropdown-end absolute -right-1 top-2">
        <label tabindex="0" class="btn btn-sm btn-square btn-ghost">
          <Icon name="ph:dots-three-outline-vertical-fill" size="22" />
        </label>
        <ul
          tabindex="0"
          class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-10"
        >
          <li>
            <a @click="emit('openStatusModal', info.statusdelivery)">
              <Icon name="fluent:history-24-filled" />История доставки
            </a>
          </li>
          <li>
            <a @click="$emit('openModal', index)">
              <Icon name="fluent:info-24-filled" />Детали
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
            :src="info?.productimage ? info?.productimage : 'null'"
          />
        </div>
        <div class="flex flex-col w-full">
          <div class="flex flex-col gap-1.5">
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
                  'bg-orange-200':
                    info.currentstatus.includes('готов к выд') &&
                    info.statusdelivery.length > 1,
                  'bg-green-200':
                    info.currentstatus.includes('выполнен'),
                  'bg-red-200':
                    info.currentstatus.includes('Возврат') &&
                    info.statusdelivery.length > 1,
                }"
              >
                {{ info.currentstatus }}
              </div>
            </div>
            <div
              v-if="
                (info.currentstatus === 'Готов к выдаче' ||
                  info.currentstatus === 'Готов к получению' ||
                  info.currentstatus.includes('Ждёт в')) &&
                info.statusdelivery.length > 1
              "
              class="text-s link bg-[#FF6666] w-fit dark:bg-red-500 link-hover rounded-full my-auto max-h-6 font-normal text-xs flex gap-1 text-white"
              @click="emit('openPenaltyModal')"
            >
              <Icon name="ph:warning-circle-light" size="25" />

              <span class="mr-1 my-auto">{{
                daysToPenalty(info.statusdelivery)
              }}</span>
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
              <button @click="copyToClipboard(info.uuid)">
                <Icon name="si:copy-fill" class="-mb-1.5 w-6 h-6 mr-1" />
              </button>
              <span class="text-sm text-[0.725rem] text-gray-500 my-auto"
                >ID:
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
                Золотое яблоко
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <button
      class="btn btn-sm h-[2.5rem] mb-3 text-[20px] mx-4 mt-2 rounded-2xl font-normal text-white btn-primary"
      @click="$emit('openModal', index)"
    >
      Детали
    </button>
  </div>
</template>

<style scoped></style>
