<script lang="ts" setup>
import { YandexMap, YandexMarker } from "vue-yandex-maps";

const config = useRuntimeConfig();

const settings = {
  apiKey: config.public.YANDEX_MAPS_API_KEY || "", // Индивидуальный ключ API
  lang: "ru_RU", // Используемый язык
  coordorder: "latlong", // Порядок задания географических координат
  debug: false, // Режим отладки
  version: "2.1", // Версия Я.Карт
};

const props = defineProps({
  pickpoints: {
    type: Array,
    required: true,
  },
  state: {
    type: Boolean,
    required: true,
  },
  addressInfo: {
    type: Object,
    required: true,
  },
});

const map = ref(null); // ссылка на карту

const marker = ref();
const name = ref("Custom");
const loading = ref(false);
const addressText = ref("Москва, улица Петровка, 5");
const coordinates = ref([55.74435065000997, 37.621310551334145]);
const emit = defineEmits(["callback", "close", "openPickpointModal"]);
const error = ref("");
const isDisabled = computed(() => {
  return !props.addressInfo.apartment;
});

function closeModal() {
  emit("close");
}

const onClick = (e: any) => {
  const objectId = e.get();
  coordinates.value = e.get("coords");
  getAddressText(e.get("coords")[0], e.get("coords")[1], "1");
};

onKeyStroke("Escape", (e) => {
  e.preventDefault();
  emit("close");
});

async function getAddressText(lt: number, lg: number, id: string) {
  addressText.value = "Загрузка...";

  // @ts-ignore
  const { data, error }: any = await useFetch(`/api/ozon/buyout/addressText`, {
    method: "GET",
    params: {
      lt,
      lg,
    },
  });
  if (data.value) {
    addressText.value = data.value;
  }
}

const handleAddress = (address: string, lt: number, lg: number) => {
  emit("callback", address, lt, lg);
};

function openPickpointModal() {
  emit("openPickpointModal");
}
</script>

<template>
  <div
    id="selectPointModalFBS"
    class="modal"
    :class="{
      'modal-open': props.state,
    }"
  >
    <div v-if="state" class="modal-box w-11/12 max-w-4xl">
      <div class="">
        <a
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          @click="closeModal"
          >✕</a
        >
        <div class="join">
          <input
            class="join-item btn"
            type="radio"
            name="options"
            aria-label="Пункт выдачи"
            @click="openPickpointModal"
          />
          <input
            class="join-item btn"
            type="radio"
            name="options"
            aria-label="Курьер"
            checked="checked"
          />
        </div>
        <div class="title mb-2">Выберите адрес</div>

        <div class="flex justify-center">
          <!-- <div class="ml-2">Адрес: {{ addressText }}</div> -->
        </div>
        <div
          v-if="loading"
          class="loading flex justify-center items-center h-full"
        >
          <Icon class="animate-spin" size="60" name="mdi:loading" />
        </div>
        <div
          v-if="error"
          class="text-lg text-center text-error flex items-center justify-center h-full"
        >
          {{ error }}
        </div>
        <YandexMap
          ref="map"
          :settings="settings"
          :coordinates="coordinates"
          :controls="['searchControl', 'fullscreenControl']"
          @click="onClick"
          :detailed-controls="{
            searchControl: {
              noPlacemark: true,
            },
          }"
        >
          <YandexMarker
            ref="marker"
            :options="{
              iconImageSize: [50, 50],
              iconOffset: [0, 0],
              iconShadow: true,
            }"
            :coordinates="coordinates"
            :marker-id="1"
          >
            <template #component>
              <BuyoutYandexMarketCustomBalloon
                style="height: 30px"
                v-model="addressText"
                @callback="handleAddress"
                :coordinates="coordinates"
              />
            </template>
          </YandexMarker>
        </YandexMap>
      </div>
      <div>
        <p class="mt-2 ml-1">Уточните адрес доставки</p>
        <input
          class="input input-bordered w-full mt-2"
          placeholder="Адрес"
          readonly
          v-model="addressText"
        />
        <div class="flex justify-between gap-2 mt-2">
          <input
            class="input input-bordered w-1/2"
            placeholder="Квартира"
            v-model="addressInfo.apartment"
          />
          <input
            class="input input-bordered w-1/2"
            placeholder="Подъезд"
            v-model="addressInfo.entrance"
          />
        </div>
        <div class="flex justify-between gap-2 mt-2">
          <input
            class="input input-bordered w-1/2"
            placeholder="Этаж"
            v-model="addressInfo.floor"
          />
          <input
            class="input input-bordered w-1/2"
            placeholder="Домофон"
            v-model="addressInfo.intercom"
          />
        </div>
        <input
          class="input input-bordered w-full mt-2"
          placeholder="Комментарий курьеру"
          v-model="addressInfo.comment"
        />
        <!-- <p class="mt-1 ml-1">Данные получателя</p>
        <div class="flex justify-between gap-2 mt-2 mb-1">
          <input class="input input-bordered w-1/2" placeholder="Имя и Фамилия" v-model="addressInfo.nameLastName" />
          <input class="input input-bordered w-1/2" v-maska data-maska="+7 (###) ###-##-##" placeholder="Телефон"
            v-model="addressInfo.phone" />

        </div> -->
        <button
          :disabled="addressText == 'Загрузка...' || isDisabled"
          class="btn btn-primary my-2 w-full"
          @click="handleAddress(addressText, coordinates[0], coordinates[1])"
        >
          Выбрать Адрес
        </button>
      </div>
    </div>
    <div class="modal-backdrop cursor-pointer" @click="closeModal"></div>
  </div>
</template>

<style scoped>
.yandex-container {
  height: 55vh;
  width: 100%;
  border-radius: 20px;
  /* Установите желаемый радиус скругления углов */
  overflow: hidden;
}

.yandex-balloon {
  height: 160px;
  width: 300px;
}

::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}

::-webkit-scrollbar-track {
  background-color: #f1f1f1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background-color: #888;
  border-radius: 0px;
  border-radius: 4px;
}
</style>
