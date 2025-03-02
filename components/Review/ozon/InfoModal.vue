<script setup lang="ts">
import { rules } from "~/data/buyout/rules";

const props = defineProps({
  info: {
    type: Object as any,
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
  }
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
              <div class="bg-gray-200 w-full px-8 pt-4 pb-4 rounded-md">
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

                <div class="flex gap-2">
                  <span class="text-sm text-[0.725rem] text-gray-500 my-auto"
                    >Статус:
                  </span>
                  <div class="rounded-md px-2 text-sm text-[0.725rem]">
                    <span
                      :class="{
                        'bg-success bg-opacity-50 text-green-500':
                          info.status === 'working' ||
                          info.status === 'published' ||
                          info.status === 'busy',
                        'bg-[#F8C68A] text-[#D67500]':
                          info.status === 'waiting' ||
                          info.status === 'created',
                        'bg-[#F8C68A]  text-red-500': info.status === 'nofunds',
                        'bg-[#FF685E] text-[#9C0A00]':
                          info.status === 'canceled' ||
                          info.status === 'deleted' ||
                          info.status === 'deleting',
                      }"
                      class="text-black p-0.5 px-4 rounded-2xl text-center w-fit text-sm"
                      >{{ getStatus }}
                    </span>
                  </div>
                </div>

                <div class="flex gap-2" v-if="info.completedDate">
                  <span class="text-sm text-[0.725rem] text-gray-500 my-auto"
                    >Выполнено:
                  </span>
                  <div class="rounded-md py-0 px-2 text-sm text-[0.725rem]">
                    {{
                      $dayjs(info.completedDate)
                        .locale("ru")
                        .format("D.MM.YY, HH:mm")
                    }}
                  </div>
                </div>

                <div class="w-full truncate">
                  <span class="text-sm text-gray-500 mr-2 my-auto">ID: </span>
                  <label
                    class="rounded-md py-0 px-2 text-sm cursor-pointer"
                    @click="navigateTo('/buyouts?uuid=' + info.buyoutuuid)"
                  >
                    #{{ info.buyoutuuid }}
                  </label>
                </div>

                <div class="flex gap-2">
                  <span class="text-sm text-[0.725rem] text-gray-500 my-auto"
                    >Товар:
                  </span>
                  <div
                    class="rounded-md py-0 px-2 text-sm text-[0.725rem] text-primary"
                  >
                    <a
                      :href="`https://www.wildberries.ru/catalog/${info.article}/detail.aspx`"
                      target="_blank"
                      class="link link-hover"
                    >
                      {{ info.article }}
                    </a>
                  </div>
                </div>

                <div class="w-full whitespace-normal">
                  <span class="text-sm text-gray-500 mr-2 my-auto"
                    >Название:
                  </span>
                  <span class="rounded-md py-0 px-2 text-sm">
                    {{ info.product?.name }}
                  </span>
                </div>
                <div class="w-full whitespace-normal">
                  <span class="text-sm text-gray-500 mr-2 my-auto">Цена: </span>
                  <span class="rounded-md py-0 px-2 text-sm">
                    {{ currency.format(info.product?.price) }}
                  </span>
                </div>
                <div class="w-full whitespace-normal">
                  <span class="text-sm text-gray-500 mr-2 my-auto">Пол: </span>
                  <span class="rounded-md py-0 px-2 text-sm">
                    {{ info.gender }}
                  </span>
                </div>

                <div>
                  <span class="text-sm text-gray-500 mr-2">Площадка: </span>
                  <span class="rounded-md py-0 px-2 text-sm">Wildberries</span>
                </div>
              </div>
              <div>
                <div class="px-8 bg-primary bg-opacity-15 pt-2 -mt-1 pb-4">
                  <div>
                    <span class="text-sm text-gray-500 mr-2 my-auto"
                      >Количество:
                    </span>
                    <span class="rounded-md py-0 px-2 text-sm">1 ед.</span>
                  </div>
                  <div>
                    <span class="text-sm text-gray-500 mr-2 my-auto"
                      >Тип услуги:
                    </span>
                    <span class="rounded-md py-0 px-2 text-sm">{{
                      info.type
                    }}</span>
                  </div>
                  <div>
                    <span class="text-sm text-gray-500 mr-2 my-auto"
                      >Услуга:
                    </span>
                    <span class="rounded-md py-0 px-2 text-sm">{{
                      currency.format(150)
                    }}</span>
                  </div>
                  <div v-if="info.financePrice">
                    <span class="text-sm text-gray-500 mr-2 my-auto"
                      >Услуга:
                    </span>
                    <span class="rounded-md py-0 px-2 text-sm">{{
                      currency.format(info.financePrice)
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-2 justify-center px-5 pb-5 bg-gray-200">
          <div
            class="flex items-start justify-between flex-col md:flex-row gap-2 mt-2"
          >
            <div class="flex items-start flex-col">
              <span class="text-sm text-gray-500 mb-1">Поисковый запрос:</span>
              <span class="text-sm">{{ info.searchQuery }}</span>
            </div>
          </div>
          <div class="flex items-start flex-col">
            <span class="text-sm text-gray-500 mb-1">Адрес:</span>
            <a
              target="_blank"
              class="text-sm link link-hover truncate max-w-[90%] whitespace-normal"
              :href="`https://yandex.ru/maps/?mode=search&text=${info.point}`"
            >
              {{ info.point }}
            </a>
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
