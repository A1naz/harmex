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
        <div class="p-5">
          <a
            class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            @click="$emit('close')"
            >✕</a
          >
          <!-- <div class="flex gap-2 mb-1">
            <span class="text-sm text-gray-500">Создан:
              {{
                $dayjs(info.createdAt).locale('ru').format('D MMMM YYYY HH:mm')
              }}</span>
            <div
              :class="{
                'opacity-0':
                  info.status !== 'active'
                  && info.status !== 'paused'
                  && info.status !== 'work'
                  && info.status !== 'busy'
                  && info.status !== 'archived',
              }" class="text-xs rounded-2xl px-2 bg-base-200 py-1 -mt-1"
            >
              Выкуплено {{ info.completed }} шт.
            </div>
          </div> -->
          <!-- <div class="flex gap-3">
            <div class="text-xl font-bold mb-2">
              Информация о выкупе № {{ info.place }}
            </div>
            <span
              class="rounded-2xl py-0 px-2 text-md mb-2 max-h-7 text-[9-px] whitespace-nowrap" :class="{
                'bg-[#b5ffbc] dark:bg-green-600':
                  info.status === 'active'
                  || info.status === 'work'
                  || info.status === 'busy',
                'text-base-content bg-[#b5ffbc] dark:bg-green-600 ':
                  (info.status === 'active'
                    || info.status === 'work'
                    || info.status === 'busy')
                  && theme.value === 'dark',
                'dark:text-base-content text-[#ac5858] bg-[#fecaca] dark:bg-red-700':
                  info.status === 'completed' || info.status === 'nofunds',
                'text-base-content bg-yellow-300':
                  info.status === 'archived' || info.status === 'paused',
              }"
            >{{ getStatus }}</span>
          </div> -->

          <!-- <div class="text-xl font-bold flex justify-center mb-3">
            Инфографика
          </div> -->

          <div class="flex gap-3 mt-2 items-center">
            <div class="flex-none" style="width: 100px; height: 100px">
              <nuxt-img
                class="rounded-xl h-full"
                width="100"
                height="100"
                :src="info?.product?.image || '/logo/logocolor.svg'"
                loading="lazy"
              />
            </div>
            <div class="flex flex-col truncate gap-1">
              <div>
                <span class="text-sm text-gray-500 mr-2 my-auto"
                  >Создано:
                </span>
                <span class="rounded-md py-0 px-2 text-sm">
                  {{
                    $dayjs(info.createdAt).locale("ru").format("D.MM.YY, HH:mm")
                  }}</span
                >
              </div>

              <div>
                <span class="text-sm text-gray-500 mr-2 my-auto"
                  >Артикул:
                </span>
                <span class="rounded-md py-0 px-2 text-sm">
                  {{ info.article }}
                </span>
              </div>

              <div class="w-full whitespace-normal">
                <span class="text-sm text-gray-500 mr-2 my-auto"
                  >Наименование:
                </span>
                <span class="rounded-md py-0 px-2 text-sm">
                  {{ info.product?.name }}
                </span>
              </div>

              <div class="w-full truncate">
                <span class="text-sm text-gray-500 mr-2 my-auto"
                  >ID заказа:
                </span>
                <label
                  class="rounded-md py-0 px-2 text-sm cursor-pointer"
                  @click="copyToClipboard(info.uuid)"
                >
                  #{{ info.uuid }}
                </label>
              </div>

              <!-- <div>
                <span class="text-sm text-gray-500 mr-2 my-auto">Цена: </span>
                <a
                  :href="`https://www.wildberries.ru/catalog/${info.article}/detail.aspx`" target="_blank"
                  class="text-sm text-primary link link-hover"
                >{{ info.product?.priceText
                }}</a>
              </div> -->
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
                  info.sizeparam === "none" ? "Не указан" : info.sizeparam
                }}</span>
              </div>
              <div>
                <span class="text-sm text-gray-500 mr-2">Пол: </span>
                <span class="rounded-md py-0 px-2 text-sm">{{
                  getGender || "Нет"
                }}</span>
              </div>
              <div>
                <span class="text-sm text-gray-500 mr-2">Промокод: </span>
                <span class="rounded-md py-0 px-2 text-sm">{{
                  info.promocode
                }}</span>
              </div>
              <div>
                <span class="text-sm text-gray-500 mr-2">Дата выкупов: </span>
                <span
                  class="rounded-md py-0 pr-2 text-sm flex gap-1 justify-start flex-wrap"
                >
                  <div class="text-sm">
                    {{
                      `${$dayjs(info.dateStart)
                        .locale("ru")
                        .format("D.MM.YY HH:mm")} -`
                    }}
                  </div>
                  <div class="text-sm">
                    {{
                      `${$dayjs(info.dateEnd)
                        .locale("ru")
                        .format("D.MM.YY HH:mm")}`
                    }}
                  </div>
                </span>
              </div>
              <!-- <div class="flex gap-2">
                <span class="text-sm text-gray-500 my-auto">Категория: </span>
                <div class="bg-base-300 rounded-md py-0 px-2 text-sm">
                  Wildberries
                </div>
              </div> -->
            </div>
          </div>
        </div>

        <!--
        <div class="divider" /> -->

        <div
          class="flex flex-col gap-2 mt-2 justify-center p-5 bg-[#f2f4ff] dark:bg-primary dark:bg-opacity-10"
        >
          <div class="flex justify-between" />

          <div
            class="flex items-start justify-between flex-col md:flex-row gap-2"
          >
            <div class="flex items-start flex-col">
              <span class="text-md font-bold mb-1">Поисковый запрос:</span>
              <span class="text-sm">{{ info.searchQuery }}</span>
            </div>
          </div>
          <div class="flex items-start flex-col">
            <span class="text-md font-bold mb-1">Адрес:</span>
            <a
              target="_blank"
              class="text-sm link link-hover truncate max-w-[90%] whitespace-normal"
              :href="`https://yandex.ru/maps/?mode=search&text=${info.point}`"
            >
              {{ info.point }}
            </a>
          </div>
          <div class="flex items-start flex-col">
            <span class="text-md font-bold mb-1">Правила:</span>
            <div class="text-sm">
              <template v-if="!info.rules.length">
                <span>Не выбраны</span>
              </template>
              <template v-else>
                <ul class="list-disc list-inside">
                  <li v-for="rule in info.rules" :key="rule.id">
                    {{ rules.find((r) => r.id === rule).description }}
                  </li>
                </ul>
              </template>
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
