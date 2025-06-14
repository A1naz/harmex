<script setup lang="ts">
import axios from "axios";
import CryptoJS from "crypto-js";
import { Upload } from "tus-js-client";

const props = defineProps({
  review: {} as any,
  state: { type: Boolean, required: true },
  uuid: { type: String, required: true },
  deliveryid: { type: String, required: true },
});
const emit = defineEmits(["close", "publish"]);

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
  positive: "",
  negative: "",
  text: "",
  rating: 5,
  date: now.value,
});

const textValidation = computed(() => {
  return restrictUrl(form.text);
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

const uploadProgress = ref("");
const isUploading = ref(false);
const fileHash = ref<any>("");
const filetype = ref("");
const newFileId = ref("");

async function clearForm() {
  form.date = new Date();
  form.text = "";
  form.positive = "";
  form.negative = "";
  loadingIndex.value = null;
  isUploading.value = false;
  uploadProgress.value = "";
  fileHash.value = "";
  filetype.value = "";
  newFileId.value = "";
  filetype.value = "";
}

async function publishReview() {
  creatingReview.value = true;

  // @ts-ignore
  const { data, error } = await useFetch("/api/goldApple/review/publish", {
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
      group: "error",
      duration: 3000,
    });
    creatingReview.value = false;
    return;
  }
  notify({
    title: "Успешно",
    text: "Отзыв успешно опубликован",
    group: "success",
    duration: 3000,
  });
  creatingReview.value = false;
  emit("close");
  emit("publish");
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
    group: "error",
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

  const hash = await calculateHash(file);

  isUploading.value = true;
  fileHash.value = hash;
  filetype.value = file.type;

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
              rev.sex == "Нет" ? "" : " - получатель: " + rev.sex
            } - размер: ${rev.sizeparam} - цена: ${rev.pricebuy}р.`
          }}
        </option>
      </select>

      <div class="flex flex-col gap-4">
        <div class="w-full">
          <div class="pb-2 font-medium">Достоинства</div>
          <textarea
            v-model="form.positive"
            class="textarea w-full textarea-md bg-base-200"
            placeholder="Например, хороший телефон"
          />

          <div class="text-error">
            {{ textValidError }}
          </div>

          <div class="pb-2 font-medium">Недостатки</div>
          <textarea
            v-model="form.negative"
            class="textarea w-full textarea-md bg-base-200"
            placeholder="Например, хороший телефон"
          />

          <div class="text-error">
            {{ textValidError }}
          </div>

          <div class="pb-2 font-medium">Другие особенности продукта</div>
          <textarea
            v-model="form.text"
            class="textarea w-full textarea-md bg-base-200"
            placeholder="Например, хороший телефон"
          />

          <div class="text-error">
            {{ textValidError }}
          </div>
        </div>
        <div class="font-medium w-full justify-start gap-2 flex flex-row">
          <div>Оценка продукта</div>
          <div class="flex items-center text-sm">
            <span v-for="star in 5" :key="star" class="text-yellow-600">
              <Icon name="mdi:star" />
            </span>
          </div>
        </div>

        <div>
          <div class="pb-2 font-medium">Запланировать отзыв</div>
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
