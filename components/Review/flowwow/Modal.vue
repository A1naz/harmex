<script setup lang="ts">
import { UseImage } from "@vueuse/components";
import axios from "axios";
import CryptoJS from "crypto-js";
import { Upload } from "tus-js-client";
import { v4 as uuid } from "uuid";

const props = defineProps({
  review: {} as any,
  state: { type: Boolean, required: true },
  uuid: { type: String, required: true },
  deliveryid: { type: String, required: true },
});
const emit = defineEmits(["close", "publish"]);
const config = useRuntimeConfig();
const store = useMainStore();

const headers = useRequestHeaders(["cookie"]) as HeadersInit;
const closeButton = ref<HTMLElement>();
const { notify } = useNotification();
const { upload, remove } = useS3Object();
const creatingReview = ref(false);
const now = useNow();
const { restrictUrl } = useValidation();

const inputs: any = {
  file1: ref(),
  file2: ref(),
  file3: ref(),
  file4: ref(),
  file5: ref(),
};

const form = reactive({
  publicComment: "",
  hiddenComment: "",
  valuePerMoneyRating: 5,
  serviceRating: 5,
  deliveryRating: 5,
  conformityRating: 5,
  date: now.value,
  photos: [
    {
      url: "",
      public: "",
    },
    {
      url: "",
      public: "",
    },
    {
      url: "",
      public: "",
    },
    {
      url: "",
      public: "",
    },
    {
      url: "",
      public: "",
    },
  ],
  video: "",
});

const textValidation = computed(() => {
  return restrictUrl(form.publicComment);
});
const textValidError = computed(() => {
  return textValidation.value
    ? ""
    : "В тексте присутствуют запрещенные символы (нельзя указывать ссылки)";
});

const defaultDelIndex = props.review.delivs.findIndex(
  (rev: any) => rev.delivId == props.deliveryid
);
const selectedDeliv = ref({
  deliveryid: props.review.delivs[defaultDelIndex].delivId,
  uuid: props.review.delivs[defaultDelIndex].buyoutId,
});

const loadingIndex = ref(null) as Ref<number | null>;

async function checkVideo(file: any) {
  return new Promise((resolve) => {
    const videoElement = document.createElement("video");
    videoElement.src = URL.createObjectURL(file);

    if (file.size > 500 * 1024 * 1024) {
      // Если размер файла превышает 500 МБ
      notify({
        title: "Ошибка",
        text: "Максимальный размер видео должен быть 500 МБ",
      });
      resolve(false);
      return;
    }

    videoElement.onloadedmetadata = () => {
      if (videoElement.duration > 600) {
        form.video = "";
        isUploading.value = false;
        notify({
          title: "Ошибка",
          text: "Видео слишком длинное. Максимальная длительность: 10 минут",
          type: "error",
          duration: 3000,
        });
        resolve(false);
      } else if (
        videoElement.videoWidth < 640 ||
        videoElement.videoHeight < 360
      ) {
        form.video = "";
        isUploading.value = false;
        notify({
          title: "Ошибка",
          text: "Минимальное разрешение видео должно быть 640x360",
          type: "error",
          duration: 3000,
        });
        resolve(false);
      } else if (
        videoElement.videoWidth > 4100 ||
        videoElement.videoHeight > 4100
      ) {
        form.video = "";
        isUploading.value = false;
        notify({
          title: "Ошибка",
          text: "Максимальное разрешение видео должно быть 4100x4100",
          type: "error",
          duration: 3000,
        });
        resolve(false);
      } else {
        resolve(true);
      }
    };
  });
}

async function uploadToS3(event: Event, index: number) {
  console.log("uploadToS3");
  loadingIndex.value = index;
  const fileList = (event.target! as HTMLInputElement).files;
  const file = (event.target! as HTMLInputElement).files[0];

  const files = Array.from(fileList!);
  if (!files) return;

  if (
    files[0] &&
    files[0].name &&
    files[0].name.toLowerCase().endsWith(".webp")
  ) {
    notify({
      title: "Что-то пошло не так",
      text: "Нельзя загружать вебпикчи",
      type: "error",
      duration: 3000,
    });

    loadingIndex.value = null;
    return;
  }

  const fileName = "reviewImages/" + uuid();
  console.log(fileName);
  const result = await upload(file, {
    key: fileName,
  });

  if (!result) {
    notify({
      title: "Что-то пошло не так",
      text: "Не удалось загрузить фото",
      type: "error",
      duration: 3000,
    });
    return;
  }
  console.log(result);
  console.log(result);
  //@ts-ignore
  await useFetch("/api/images/openForPublic", {
    method: "GET",
    params: {
      path: result.split("query/")[1],
    },
  });

  form.photos[index] = {
    url: `${result.replace("/api/s3/query/reviewImages/", "")}`,
    public: `https://ozonmpportal.hb.vkcs.cloud/${result.split("query/")[1]}`,
  };

  setTimeout(() => {
    loadingIndex.value = null;
  }, 1500);
}
const uploadProgress = ref("");
const isUploading = ref(false);
const fileHash = ref<any>("");
const filetype = ref("");
const newFileId = ref("");

async function clearForm() {
  form.date = new Date();
  form.publicComment = "";
  form.valuePerMoneyRating = 5;
  form.serviceRating = 5;
  form.conformityRating = 5;
  form.deliveryRating = 5;

  loadingIndex.value = null;
  isUploading.value = false;
  uploadProgress.value = "";
  fileHash.value = "";
  filetype.value = "";
  newFileId.value = "";
  form.video = "";
  filetype.value = "";

  form.photos = [
    {
      url: "",
      public: "",
    },
    {
      url: "",
      public: "",
    },
    {
      url: "",
      public: "",
    },
    {
      url: "",
      public: "",
    },
    {
      url: "",
      public: "",
    },
  ];
}

async function publishReview() {
  creatingReview.value = true;

  // @ts-ignore
  const { data, error } = await useFetch("/api/flowwow/review/publish", {
    method: "POST",
    body: {
      ...form,
      videoKey: `reviewVideos/${newFileId.value}.${filetype.value.replace(
        "video/",
        ""
      )}`,
      deliveryid: selectedDeliv.value.deliveryid,
      buyoutuuid: selectedDeliv.value.uuid,
    },
    headers,
  });
  if (error.value) {
    notify({
      title: "Что-то пошло не так",
      text: error.value?.data?.message,
      type: "error",
      duration: 3000,
    });
    creatingReview.value = false;
    return;
  }
  notify({
    title: "Успешно",
    text: "Отзыв успешно опубликован",
    type: "success",
    duration: 3000,
  });
  creatingReview.value = false;
  emit("close");
  emit("publish");
}

async function removePhoto(index: number) {
  const fileInput = inputs[`file${(index + 1) as 1 | 2 | 3 | 4 | 5}`];
  fileInput.value = null;
  loadingIndex.value = index;
  const url = form.photos[index].url;

  form.photos[index] = {
    url: "",
    public: "",
  };
  const { data, error } = await remove({
    url,
  });
  if (error.value) {
    notify({
      title: "Что-то пошло не так",
      text: "Не удалось удалить фото",
      type: "error",
      duration: 3000,
    });
    return;
  }
  if (data.value) {
    form.photos[index] = {
      url: "",
      public: "",
    };
  }
  loadingIndex.value = null;
}

watch(
  () => props.uuid,
  (uuid) => {
    clearForm();
  }
);

onMounted(() => {
  clearForm();
});
function ratingAlert() {
  notify({
    title: "Что-то пошло не так",
    text: "В настоящее время нет возможности публикации отзыва с рейтингом менее 4 звезд",
    type: "error",
    duration: 3000,
  });
}

async function calculateHash(file: any) {
  return new Promise((resolve, reject) => {
    const chunkSize = 5 * 1024 * 1024;
    const chunks = Math.ceil(file.size / chunkSize);
    let currentChunk = 0;
    const hash = CryptoJS.algo.SHA256.create();

    const fileReader = new FileReader();

    fileReader.onload = function (e: any) {
      // @ts-ignore
      const wordArray = CryptoJS.lib.WordArray.create(e.target.result);
      hash.update(wordArray);
      currentChunk++;

      if (currentChunk < chunks) {
        loadNextChunk();
      } else {
        const hashValue = hash.finalize().toString(CryptoJS.enc.Hex);
        resolve(hashValue);
      }
    };

    fileReader.onerror = function (e) {
      reject(e);
    };

    function loadNextChunk() {
      const start = currentChunk * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);
      fileReader.readAsArrayBuffer(chunk);
    }

    loadNextChunk();
  });
}

async function renameFile() {
  axios
    .post("https://videos.videos.harmex.ru/api/renameFile", {
      fileName: newFileId.value,
      type: filetype.value.replace("video/", ""),
    })
    .then((response) => {
      if (response.data.status === "success") {
        notify({
          title: "Успешно",
          text: "Файл загружен",
        });
      } else {
        notify({
          title: "Что-то пошло не так",
          text: "Не удалось загрузить файл",
        });
      }
      isUploading.value = false;
    });
}
async function handleFileChange(e: any) {
  if (isUploading.value) {
    notify({
      title: "Что-то пошло не так",
      text: "Дождитесь окончания загрузки",
    });
    return;
  }

  const file = e.target.files[0];

  if (!file || !file.type.includes("video")) {
    form.video = "";
    return;
  }

  const isVideoEnabled = await checkVideo(file);
  if (!isVideoEnabled) {
    form.video = "";
    return;
  }

  const hash = await calculateHash(file);

  isUploading.value = true;
  fileHash.value = hash;
  filetype.value = file.type;
  form.video = file.name;

  const upload: any = new Upload(file, {
    endpoint: "https://videos.videos.harmex.ru/uploads",
    // urlStorage: urlStorage.data,
    retryDelays: [0, 1000, 3000, 5000],
    metadata: {
      filename: file.name,
      filetype: file.type,
      filehash: hash,
    },
    chunkSize: 5 * 1024 * 1024,
    onProgress: (bytesUploaded, bytesTotal) => {
      const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(0);
      uploadProgress.value = percentage;
      isUploading.value = true;
    },
    onError: (error) => {
      isUploading.value = false;
    },
    onSuccess: async () => {
      newFileId.value = upload.url.split("/")[upload.url.split("/").length - 1];

      setTimeout(async () => {
        await renameFile();
      }, 1000);
    },
  });

  // await axios.post('http://localhost/api/getUrlStorage', {fileHash: hash}).then((previousUploads) => {
  //     if (previousUploads.data.length > 0) {
  //       upload.resumeFromPreviousUpload(previousUploads.data[0])
  //     }

  //   })
  upload.start();
}

async function check(hash: any) {
  await renameFile();
}

function convertToMoscowTime(dateString: any): Date {
  const date = new Date(dateString);

  const utcOffset = date.getTimezoneOffset() / 60;

  date.setHours(date.getHours() + utcOffset);

  const moscowOffset = 3;

  date.setHours(date.getHours() + moscowOffset);

  return date;
}

const isMouseDownOnOverlay = ref(false);

const handleMouseDown = (event: any) => {
  // Проверяем, был ли клик на пустой области (не внутри модалки)
  if (event.target.classList.contains("modal")) {
    isMouseDownOnOverlay.value = true;
  } else {
    isMouseDownOnOverlay.value = false;
  }
};

const handleMouseUp = (event: any) => {
  // Если мousedown был на overlay и mouseup также на overlay, закрываем модалку
  if (isMouseDownOnOverlay.value && event.target.classList.contains("modal")) {
    isMouseDownOnOverlay.value = false; // Сбрасываем флаг
    emit("close"); // Отправляем событие закрытия
  }
};
</script>

<template>
  <input id="review-modal" type="checkbox" class="modal-toggle" />
  <div
    ref="closeButton"
    :class="{
      'modal-open': state,
    }"
    class="modal overflow-x-hidden cursor-pointer"
    @mousedown="handleMouseDown"
    @mouseup="handleMouseUp"
  >
    <div class="modal-box z-50 max-w-xl sm:w-xs w-xl cursor-auto" @click.stop>
      <label
        for="review-modal"
        class="btn btn-sm btn-circle absolute right-2 top-2 btn-ghost"
        @click="$emit('close')"
        >✕</label
      >
      <div class="flex flex-row justify-center -mt-4">
        <p class="text-xs text-gray-500 justify-self-center">
          - {{ review.article }} -
        </p>
      </div>

      <h3 class="text-xl font-bold mb-4">Оставить отзыв</h3>

      <div class="pb-2 font-medium">Доставка:</div>
      <select
        v-model="selectedDeliv"
        class="select w-full mb-4 bg-base-200 text-gray-500"
      >
        <option
          v-for="(rev, index) in review.delivs"
          :default="index == rev[defaultDelIndex]"
          :value="{ deliveryid: rev.delivId, uuid: rev.buyoutId }"
          class="m-6"
        >
          {{
            `${defaultDateShort(rev.updatedAt)} ${
              rev.sex == "Нет" ? "" : " - пол: " + rev.sex
            } - размер: ${rev.sizeparam} - цена: ${rev.pricebuy}р.`
          }}
        </option>
      </select>

      <div class="flex flex-col gap-4">
        <div class="w-full">
          <div class="pb-2 font-medium">Скрытый комментарий</div>

          <textarea
            v-model="form.hiddenComment"
            class="textarea w-full textarea-md bg-base-200"
            placeholder="Например, хороший телефон"
          />

          <div class="text-error">
            {{ textValidError }}
          </div>
        </div>
        <div class="w-full">
          <div class="pb-2 font-medium">Публичный отзыв</div>

          <textarea
            v-model="form.publicComment"
            class="textarea w-full textarea-md bg-base-200"
            placeholder="Например, хороший телефон"
          />

          <div class="text-error">
            {{ textValidError }}
          </div>
        </div>

        <div class="font-medium w-full justify-start gap-2 flex flex-row">
          <div>Соответствие</div>

          <div class="flex items-center text-sm">
            <span v-for="star in 5" :key="star" class="text-yellow-600">
              <Icon name="mdi:star" />
            </span>
          </div>
        </div>
        <div class="font-medium w-full justify-start gap-2 flex flex-row">
          <div>Цена/качество</div>

          <div class="flex items-center text-sm">
            <span v-for="star in 5" :key="star" class="text-yellow-600">
              <Icon name="mdi:star" />
            </span>
          </div>
        </div>
        <div class="font-medium w-full justify-start gap-2 flex flex-row">
          <div>Сервис</div>

          <div class="flex items-center text-sm">
            <span v-for="star in 5" :key="star" class="text-yellow-600">
              <Icon name="mdi:star" />
            </span>
          </div>
        </div>
        <div class="font-medium w-full justify-start gap-2 flex flex-row">
          <div>Доставка</div>

          <div class="flex items-center text-sm">
            <span v-for="star in 5" :key="star" class="text-yellow-600">
              <Icon name="mdi:star" />
            </span>
          </div>
        </div>

        <div>
          <div class="pb-2 font-medium">Запланировать отзыв </div>
          <div class="relative w-full p-6 bg-base-200 rounded-lg">
            <div class="absolute left-3 top-3 text-gray-500">
              {{
                form.date <= now
                  ? "Опубликовать сейчас"
                  : $dayjs(form.date).format("DD.MM.YYYY HH:mm")
              }}
            </div>
            <div class="absolute right-3 top-2 w-30" style="z-index: 9999999">
              <DatePicker v-model="form.date" />
            </div>
          </div>
        </div>
        <!-- <div>
          <div class="font-medium">Фото</div>
          <p class="mb-2 text-sm font-light text-gray-500">
            Разрешены фото в формате PNG, JPG.
          </p>
          <ClientOnly>
            <div
              class="flex gap-2 items-center overflow-x-scroll flex-nowrap basis-32 pb-4 scrollbar-thumb-primary scrollbar-track-base-200 scrollbar-thin scrollbar-rounded-[12px]"
            >
              <div v-for="(photo, index) of form.photos" :key="index">
                <div
                  class="border border-base-300 relative text-primary hover:text-primary-focus cursor-pointer w-32 h-32 hover:bg-base-200 rounded-lg flex-none"
                >
                  <div
                    v-if="photo.url"
                    class="absolute right-0 top-0 z-50"
                    @click="removePhoto(index)"
                  >
                    <label for="photo" class="btn btn-sm btn-circle btn-ghost"
                      >✕</label
                    >
                  </div>

                  <label
                    v-show="!photo.public"
                    class="file-select w-full h-full flex justify-center items-center hover:cursor-pointer"
                  >
                    <div
                      v-show="loadingIndex === index"
                      class="absolute inset-0 flex items-center justify-center"
                    >
                      <Icon name="mdi:loading" class="h-8 w-8 animate-spin" />
                    </div>
                    <input
                      :ref="(el: any) => (inputs[`file${(index + 1)}`] = el)"
                      type="file"
                      accept="image/png, image/gif, image/jpeg"
                      class="hidden"
                      @change="(e: Event) => uploadToS3(e, index)"
                    />
                    <IconCSS
                      v-show="loadingIndex !== index"
                      name="material-symbols:add-photo-alternate-outline"
                      class="text-base-content bg-primary"
                      size="30"
                    />
                  </label>

                  <div v-show="photo.public" class="absolute inset-0">
                    <UseImage :src="photo.public">
                      <template #default>
                        <nuxt-img
                          :src="photo.public"
                          fit="contain"
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
                            class="h-8 w-8 animate-spin"
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
              </div>
            </div>
          </ClientOnly>
        </div> -->
        <!-- <div class="flex flex-col">
          <label class="">
            <div
              class="flex justify-between h-16 cursor-pointer"
              v-if="store.client.username == 'test'"
            >
              <div class="max-w-[240px]">
                <span class="font-medium">Добавить видео (+25 рублей)</span>
                <input
                  :disabled="isUploading || form.video !== ''"
                  type="file"
                  class="w-[200px] sm:w-[400px] cursor-pointer"
                  accept="video/*"
                  @change="handleFileChange($event)"
                  :class="{ hidden: !form.video }"
                />
              </div>
              <div>
                <input
                  v-if="!isUploading"
                  type="checkbox"
                  class="checkbox checkbox-primary border-base-content"
                  style="pointer-events: none"
                  :checked="form.video !== ''"
                />

                <div
                  v-else
                  class="radial-progress text-primary"
                  :style="{
                    '--value': uploadProgress,
                  }"
                  role="progressbar"
                >
                  {{ uploadProgress }}%
                </div>
              </div>
            </div>
          </label>
        </div> -->
      </div>

      <div class="mt-2">
        <div class="font-medium">Фото</div>
        <p class="mb-2 text-sm font-light text-gray-500">
          Разрешены фото в формате PNG, JPG.
        </p>
        <ClientOnly>
          <div
            class="flex gap-2 items-center overflow-x-scroll flex-nowrap basis-32 pb-4 scrollbar-thumb-primary scrollbar-track-base-200 scrollbar-thin scrollbar-rounded-[12px]"
          >
            <div v-for="(photo, index) of form.photos" :key="index">
              <div
                class="border border-base-300 relative text-primary hover:text-primary-focus cursor-pointer w-32 h-32 hover:bg-base-200 rounded-lg flex-none"
              >
                <div
                  v-if="photo.url"
                  class="absolute right-0 top-0 z-50"
                  @click="removePhoto(index)"
                >
                  <label for="photo" class="btn btn-sm btn-circle btn-ghost"
                    >✕</label
                  >
                </div>

                <label
                  v-show="!photo.public"
                  class="file-select w-full h-full flex justify-center items-center hover:cursor-pointer"
                >
                  <div
                    v-show="loadingIndex === index"
                    class="absolute inset-0 flex items-center justify-center"
                  >
                    <Icon name="mdi:loading" class="h-8 w-8 animate-spin" />
                  </div>
                  <input
                    :ref="(el: any) => (inputs[`file${(index + 1)}`] = el)"
                    type="file"
                    accept="image/png, image/gif, image/jpeg"
                    class="hidden"
                    @change="(e: Event) => uploadToS3(e, index)"
                  />
                  <IconCSS
                    v-show="loadingIndex !== index"
                    name="material-symbols:add-photo-alternate-outline"
                    class="text-base-content bg-primary"
                    size="30"
                  />
                </label>

                <div v-show="photo.public" class="absolute inset-0">
                  <UseImage :src="photo.public">
                    <template #default>
                      <nuxt-img
                        :src="photo.public"
                        fit="contain"
                        class="w-full h-full object-contain rounded-lg"
                        loading="lazy"
                      />
                    </template>
                    <template #loading>
                      <div
                        class="absolute inset-0 flex items-center justify-center"
                      >
                        <Icon name="mdi:loading" class="h-8 w-8 animate-spin" />
                      </div>
                    </template>
                  </UseImage>
                </div>
              </div>
            </div>
          </div>
        </ClientOnly>
      </div>
      <div class="modal-action justify-between">
        <div>
          <button
            :disabled="isUploading"
            class="btn btn-sm btn-ghost btn-outline border-none text-error"
            @click="clearForm"
          >
            Сбросить
          </button>
        </div>
        <div class="flex gap-2">
          <label
            for="review-modal"
            class="btn btn-sm btn-ghost"
            @click="$emit('close')"
            >Отмена</label
          >
          <button
            for="review-modal"
            class="btn btn-primary btn-sm border-none text-white"
            :disabled="!textValidation || isUploading || creatingReview"
            @click="publishReview"
          >
            Отправить
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
input[type="file"]::file-selector-button {
  display: none;
}

input[type="file"]::-webkit-file-upload-button {
  display: block;
  width: 0;
  height: 0;
  margin-left: -100%;
}

input[type="file"]::-ms-browse {
  display: none;
}
</style>
