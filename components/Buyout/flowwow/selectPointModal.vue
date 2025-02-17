<script lang="ts" setup>
import { YandexMap, YandexMarker } from "vue-yandex-maps";

const props = defineProps({
  pickpoints: {
    type: Array,
    required: true,
  },
  state: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["callback", "close"]);

const { height } = useWindowSize();
const config = useRuntimeConfig();

const settings = {
  apiKey: config.public.YANDEX_MAPS_API_KEY || "", // Индивидуальный ключ API
  lang: "ru_RU", // Используемый язык
  coordorder: "latlong", // Порядок задания географических координат
  debug: false, // Режим отладки
  version: "2.1", // Версия Я.Карт
};

const map = ref(null); // ссылка на карту

const marker = ref();
const name = ref("Custom");
const loading = ref(false);
const addressText = ref("Москва, улица Петровка, 5");
const coordinates = ref([55.761438764655615, 37.617691166568456]);
const error = ref("");
const store = useFlowwowBuyoutStore();

function closeModal() {
  emit("close");
}

function onClick(e: any) {
  const objectId = e.get();
  coordinates.value = e.get("coords");
  getAddressText(e.get("coords")[0], e.get("coords")[1], "1");
}

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

function handleAddress(address: string, lt: number, lg: number) {
  emit("callback", address, lt, lg);
}
</script>

<template>
  <div
    id="selectPointModal"
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
          :detailed-controls="{
            searchControl: {
              noPlacemark: true,
            },
          }"
          @click="onClick"
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
              <BuyoutFlowwowCustomBalloon
                v-model="addressText"
                :coordinates="coordinates"
                @callback="handleAddress"
              />
            </template>
          </YandexMarker>
        </YandexMap>
      </div>
      <div class="w-full flex flex-col gap-2 my-3">
        <label
          ><input
            v-model="store.createProducts[store.selectedItem].appartmentNumber"
            type="text"
            placeholder="Введите № квартиры"
            class="input bg-base-200 w-full rounded-xl"
          />
        </label>
      </div>
      <button
        :disabled="addressText == 'Загрузка...'"
        class="btn btn-primary my-2 w-full"
        @click="handleAddress(addressText, coordinates[0], coordinates[1])"
      >
        Выбрать Адрес
      </button>
    </div>
    <div class="modal-backdrop cursor-pointer" @click="closeModal" />
  </div>
</template>

<style>
.yandex-container {
  height: 75vh;
  width: 100%;
  border-radius: 20px; /* Установите желаемый радиус скругления углов */
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
