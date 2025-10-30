<script setup lang="ts">
import { rules } from "~/data/buyout/rules";

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
});
const emit = defineEmits(["close"]);
const theme = useColorMode();
const currency = useCurrency();
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
  }
  return "Неизвестно";
});

const getGender = computed(() => {
  switch (props.info.gender) {
    case "male":
      return "Мужской";
    case "female":
      return "Женский";
    case "none":
      return "Нет";
  }
  return "Нет";
});

const { notify } = useNotification();

async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text);
  notify({
    title: "Успешно",
    text: "Скопировано в буфер обмена",
  });
}

onKeyStroke("Escape", (e) => {
  e.preventDefault();
  emit("close");
});
</script>

<template class="overflow-hidden">
  <div
    id="buyoutInfoModal"
    :class="{ 'modal-open': state }"
    class="modal cursor-pointer"
    @click="$emit('close')"
  >
    <div v-if="state" class="modal-box max-w-md max-h-[90%] p-0">
      <div class="cursor-auto" @click.stop>
        <div class="rounded-md">
          <a
            class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            @click="$emit('close')"
            >✕</a
          >

          <div class="flex items-center">
            <div class="flex flex-col truncate gap-1">
              <div class="bg-white w-full px-8 pt-4 pb-4 rounded-md">
                <div>
                  <span class="text-sm text-gray-500 mr-2 my-auto"
                    >Актуальность:
                  </span>
                  <span class="rounded-md py-0 px-2 text-sm">
                    {{ $dayjs(info.updatedAt).format("DD.MM.YYYY") }}</span
                  >
                </div>

                <div class="flex gap-2">
                  <span class="text-sm text-[0.725rem] text-gray-500 my-auto"
                    >Статус:
                  </span>
                  <div
                    class="rounded-md py-0 px-2 text-sm text-[0.725rem]"
                    :class="{
                      'dark:text-base-content text-red bg-[#fecaca] dark:bg-red-700':
                        info.currentstatus.includes('Ожидает получения') ||
                        (info.currentstatus.includes('Можно забирать') &&
                          info.statusdelivery.length > 1),
                    }"
                  >
                    {{ info.currentstatus }}
                  </div>
                </div>
                <div class="flex gap-2">
                  <span class="text-sm text-[0.725rem] text-gray-500 my-auto"
                    >Получено:
                  </span>
                  <div
                    class="rounded-md py-0 px-2 text-sm text-[0.725rem]"
                    v-if="info.currentstatus === 'Получен'"
                  >
                    {{ $dayjs(info.updatedAt).format("DD.MM.YYYY") }}
                  </div>
                </div>

                <div class="w-full truncate">
                  <span class="text-sm text-gray-500 mr-2 my-auto"
                    >ID доставки:
                  </span>
                  <label
                    class="rounded-md py-0 px-2 text-sm cursor-pointer"
                    @click="copyToClipboard(info.uuid)"
                  >
                    #{{ info.uuid }}
                  </label>
                </div>

                <div class="w-full truncate">
                  <span class="text-sm text-gray-500 mr-2 my-auto"
                    >Товар:
                  </span>
                  <label
                    class="rounded-md py-0 px-2 text-sm cursor-pointer text-primary"
                  >
                    <a
                      :href="`https://www.ozon.ru/product/${info.article}`"
                      target="_blank"
                      class="link link-hover"
                    >
                      {{ info.article }}
                    </a>
                  </label>
                </div>
                <div class="w-full truncate">
                  <span class="text-sm text-gray-500 mr-2 my-auto"
                    >Название:
                  </span>
                  <label class="rounded-md py-0 px-2 text-sm cursor-pointer">
                    {{ info.productname }}
                  </label>
                </div>
                <div class="w-full truncate">
                  <span class="text-sm text-gray-500 mr-2 my-auto">Цена: </span>
                  <label class="rounded-md py-0 px-2 text-sm cursor-pointer">
                    {{ currency.format(info.pricebuy) }}
                  </label>
                </div>
                <div class="w-full truncate">
                  <span class="text-sm text-gray-500 mr-2 my-auto">Пол: </span>
                  <label class="rounded-md py-0 px-2 text-sm cursor-pointer">
                    {{ getGender }}
                  </label>
                </div>
                <div class="w-full truncate">
                  <span class="text-sm text-gray-500 mr-2 my-auto"
                    >Размер:
                  </span>
                  <label class="rounded-md py-0 px-2 text-sm cursor-pointer">
                    {{ info.size }}
                  </label>
                </div>
                <div class="w-full truncate">
                  <span class="text-sm text-gray-500 mr-2 my-auto"
                    >Площадка:
                  </span>
                  <label class="rounded-md py-0 px-2 text-sm cursor-pointer">
                    Ozon
                  </label>
                </div>
              </div>
              <div
                class="flex flex-col gap-1 justify-center pl-8 pb-5 bg-primary bg-opacity-10 -mt-1"
              >
                <div class="w-full truncate mt-2">
                  <span class="text-sm text-gray-500 mr-2 my-auto"
                    >Получатель:
                  </span>
                  <label class="rounded-md py-0 px-2 text-sm cursor-pointer">
                    {{ info.recipient }}
                  </label>
                </div>
                <div class="w-full truncate">
                  <span class="text-sm text-gray-500 mr-2 my-auto"
                    >Код получения:
                  </span>
                  <label class="rounded-md py-0 px-2 text-sm cursor-pointer">
                    {{ info.receiptcode }}
                  </label>
                </div>
                <div class="w-full truncate flex flex-wrap">
                  <span class="text-sm text-gray-500 mr-2 my-auto"
                    >Телефон получателя:
                  </span>
                  <label class="rounded-md py-0 px-2 text-sm cursor-pointer">
                    {{ info.recipientphone }}
                  </label>
                </div>
                <div class="w-full truncate">
                  <span class="text-sm text-gray-500 mr-2 my-auto"
                    >Адрес:
                  </span>
                  <label
                    class="rounded-md py-0 px-2 text-sm cursor-pointer link-hover  whitespace-normal"
                  >
                    <a
                      target="_blank"
                      :href="`https://yandex.ru/maps/?mode=search&text=${info.point}`"
                    >
                      {{ info.point }}
                    </a>
                  </label>
                </div>
              </div>
              <div
                class="w-full flex flex-col -pl-4 pb-5 -mt-1 pt-4 justify-center items-center border-[18px] rounded-xl border-white bg-white"
              >
                <NuxtImg
                  class="bg-white w-4/5 mb-40 sm:mb-0"
                  :alt="'Нет кода'"
                  :src="info.receiptcodeqr ? info.receiptcodeqr : 'null'"
                  @click.stop
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#buyoutInfoModal {
  overflow: hidden;
}
</style>
