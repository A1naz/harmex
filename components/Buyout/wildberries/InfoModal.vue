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

          <div class="flex gap-3 mt-2 items-center">
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

              <div class="flex gap-2">
                <span class="text-sm text-[0.725rem] text-gray-500 my-auto"
                  >Статус:
                </span>
                <div class="rounded-md py-0 px-2 text-sm text-[0.725rem]">
                  {{ getStatus }}
                </div>
              </div>

              <div class="flex gap-2" v-if="info.executionTime">
                <span class="text-sm text-[0.725rem] text-gray-500 my-auto"
                  >Выполнено:
                </span>
                <div class="rounded-md py-0 px-2 text-sm text-[0.725rem]">
                  {{
                    $dayjs(info.executionTime)
                      .locale("ru")
                      .format("D.MM.YY, HH:mm")
                  }}
                </div>
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
              <div>
                <span class="text-sm text-gray-500 mr-2">Размер: </span>
                <span class="rounded-md py-0 px-2 text-sm">{{
                  info.sizeparam === "none" ? "Не указан" : info.sizeparam
                }}</span>
              </div>
              <div>
                <span class="text-sm text-gray-500 mr-2">Пол: </span>
                <span class="rounded-md py-0 px-2 text-sm">{{
                  getGender || "Нет"
                }}</span>
              </div>
              <div class="mt-5">
                <span class="text-sm text-gray-500 mr-2">Площадка: </span>
                <span class="rounded-md py-0 px-2 text-sm">Wildberries</span>
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
                <span class="rounded-md py-0 px-2 text-sm"
                  >{{ info.quantity }} ед.</span
                >
              </div>
              <div>
                <span class="text-sm text-gray-500 mr-2 my-auto">Цена: </span>
                <span class="rounded-md py-0 px-2 text-sm">{{
                  currency.format(info.quantity * info.product?.price)
                }}</span>
              </div>
              <div>
                <span class="text-sm text-gray-500 mr-2 my-auto"
                  >Тип услуги:
                </span>
                <span class="rounded-md py-0 px-2 text-sm">Выкуп</span>
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
          class="flex flex-col gap-2 -mt-10 justify-center p-5 bg-[#f2f4ff] dark:bg-primary dark:bg-opacity-10"
        >
          <div class="flex justify-between" />

          <div
            class="flex items-start justify-between flex-col md:flex-row gap-2 mt-5"
          >
            <div class="flex items-start flex-col">
              <span class="text-md font-bold mb-1">Поисковый запрос:</span>
              <span class="text-sm text-gray-500">{{ info.searchQuery }}</span>
            </div>
          </div>
          <div class="flex items-start flex-col">
            <span class="text-md font-bold mb-1">Адрес:</span>
            <a
              target="_blank"
              class="text-sm link link-hover truncate text-gray-500 max-w-[90%] whitespace-normal"
              :href="`https://yandex.ru/maps/?mode=search&text=${info.point}`"
            >
              {{ info.point }}
            </a>
          </div>
          <div class="flex items-start flex-col">
            <span class="text-md font-bold mb-1">Правила:</span>
            <div class="text-sm">
              <template v-if="!info.rules.length">
                <span class="text-gray-500">Не выбраны</span>
              </template>
              <template v-else>
                <ul class="list-disc list-inside text-gray-500">
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
