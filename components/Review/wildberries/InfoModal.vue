<script setup lang="ts">
import { rules } from "~/data/buyout/rules";
import { navigateTo } from "#app";

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

const config = useRuntimeConfig();
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
    case "reviewsUpdate":
      return "На проверке";
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
    case "addition":
      return "Дополнение";
    case "disputing":
      return "В процессе оспорения";
    case "disputed":
      return "Оспорен";
      default:
      return props.info.status;
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
const { $dayjs } = useNuxtApp();
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
            <div class="flex flex-col truncate gap-1 w-full">
              <div
                class="bg-gray-200 w-full px-8 pt-4 pb-4 rounded-md flex gap-1 flex-col"
              >
                <div class="flex gap-2 w-2/3">
                  <span class="text-sm text-[0.725rem] text-gray-500 my-auto"
                    >Создано:
                  </span>
                  <button
                    class="rounded-md py-0 px-2 text-sm text-[0.725rem] truncate"
                  >
                    {{ $dayjs(info.createdAt).format("DD.MM.YYYY HH:mm") }}
                  </button>
                </div>
                <div class="flex gap-2 w-2/3">
                  <span class="text-sm text-[0.725rem] text-gray-500 my-auto"
                    >Запланировано:
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
                          info.status === 'published' ||
                          info.status === 'completed' ||
                          info.status === 'disputing' ||
                          info.status === 'disputed',
                        'bg-[#F8C68A] text-[#D67500]':
                          info.status === 'waiting' ||
                          info.status === 'created',
                        'bg-[#F8C68A]  text-red-500':
                          info.status === 'nofunds' ||
                          info.status === 'archived',
                        'bg-[#FF685E] text-white':
                          info.status === 'working' ||
                          info.status === 'busy' ||
                          info.status === 'canceled' ||
                          info.status === 'deleted' ||
                          info.status === 'deleting' ||
                          info.status === 'reviewsUpdate' ||
                          info.status === 'addition' 
                     
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
                  <button @click="copyToClipboard(info.buyoutuuid)">
                    <Icon name="si:copy-fill" class="-mb-1.5 w-6 h-6 mr-1" />
                  </button>
                  <span class="text-sm text-gray-500 mr-2 my-auto">ID: </span>
                  <label
                    class="rounded-md py-0 px-2 text-sm cursor-pointer"
                    @click="
                      navigateTo('/wildberries/buyouts?uuid=' + info.buyoutuuid)
                    "
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
                    {{ getGender }}
                  </span>
                </div>

                <div>
                  <span class="text-sm text-gray-500 mr-2">Площадка: </span>
                  <span class="rounded-md py-0 px-2 text-sm">Wildberries</span>
                </div>
              </div>
              <div>
                <div
                  class="px-8 bg-primary bg-opacity-15 pt-2 -mt-1 pb-4 flex gap-1 flex-col"
                >
                  <div>
                    <span class="text-sm text-gray-500 mr-2 my-auto"
                      >Количество:
                    </span>
                    <span
                      class="rounded-md py-0 pb-0.5 px-2 text-sm bg-blue-300"
                      >1 ед.</span
                    >
                  </div>
                  <div>
                    <span class="text-sm text-gray-500 mr-2 my-auto"
                      >Тип услуги:
                    </span>
                    <span class="rounded-md py-0 px-2 text-sm">{{
                      info.type
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
              <div class="px-8 pb-4 bg-gray-200 -mt-1">
                <div class="flex mt-2">
                  <span class="text-sm text-gray-500 mr-2 my-auto"
                    >Рейтинг:
                  </span>
                  <div class="flex items-center text-sm">
                    <span v-for="star in 5" :key="star" class="text-yellow-600">
                      <Icon name="mdi:star" />
                    </span>
                  </div>
                </div>
                <div class="whitespace-pre-line mt-1">
                  <span class="text-sm text-gray-500 mr-2 my-auto"
                    >Текст отзыва:
                  </span>
                  <span class="text-sm">
                    {{ info.text }}
                  </span>
                </div>
                <div
                  class="whitespace-pre-line mt-1"
                  v-if="info.additionText"
                >
                  <span class="text-sm text-gray-500 mr-2 my-auto"
                    >Текст дополнения:
                  </span>
                  <span class="text-sm">
                    {{ info.additionText }}
                  </span>
                </div>
                <div class="whitespace-pre-line mt-1" v-if="info.positive">
                  <span class="text-sm text-gray-500 mr-2 my-auto"
                    >Плюсы:
                  </span>
                  <span class="text-sm">
                    {{ info.positive }}
                  </span>
                </div>
                <div class="whitespace-pre-line mt-2" v-if="info.negative">
                  <span class="text-sm text-gray-500 mr-2 my-auto"
                    >Минусы:
                  </span>
                  <span class="text-sm">
                    {{ info.negative }}
                  </span>
                </div>

                <div class="text-sm mt-1 pb-1 text-gray-500 mr-2 my-auto">
                  Фото:
                </div>
                <div
                  v-if="info.images && info.images[0] !== ''"
                  class="flex gap-2 items-center overflow-x-auto flex-nowrap basis-32 pb-4 scrollbar-thumb-primary scrollbar-track-base-200 scrollbar-thin scrollbar-rounded-[12px]"
                >
                  <div v-for="(photo, i) of info.images" :key="i">
                    <label v-if="photo">
                      <div
                        class="border border-base-300 relative text-primary hover:text-primary-focus cursor-pointer w-16 h-16 hover:bg-base-200 rounded-lg flex-none"
                        @click.stop
                      >
                        <div class="absolute inset-0">
                          <UseImage
                            :src="
                              photo.startsWith('http')
                                ? photo
                                : `${config.public.DOMAIN_API_IMAGES_URL}reviewImages/${photo}`
                            "
                          >
                            <template #default>
                              <nuxt-img
                                :src="
                                  photo.startsWith('http')
                                    ? photo
                                    : `${config.public.DOMAIN_API_IMAGES_URL}reviewImages/${photo}`
                                "
                                class="w-full h-full object-contain rounded-lg"
                                loading="lazy"
                              />
                            </template>
                            <template #loading>
                              <div
                                class="absolute inset-0 flex items-center justify-center"
                              >
                                <Icon
                                  name="mdi:loading"
                                  class="loader ease-linear h-8 w-8 animate-spin"
                                />
                              </div>
                            </template>
                            <template #error>
                              <div
                                class="absolute inset-0 flex items-center justify-center"
                              >
                                <div class="text-red-500 text-center">
                                  Ошибка загрузки
                                </div>
                              </div>
                            </template>
                          </UseImage>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div class="flex pb-4">
                  <span class="text-sm text-gray-500 mr-2 my-auto"
                    >Видео:
                  </span>
                  <div class="flex items-center text-sm">
                    <span>
                      {{ info.originalVideoName }}
                    </span>
                  </div>
                </div>
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
