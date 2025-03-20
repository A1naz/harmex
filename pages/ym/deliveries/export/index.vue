<script setup lang="ts">
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";

definePageMeta({
  auth: true,
  title: "Экспорт",
});

const pdfSection = ref<HTMLElement>();
const { $dayjs } = useNuxtApp();
const progress = ref(0);
const max = ref(100);
const route = useRoute();
const currency = useCurrency();
const font = ref();
const deliveries = ref([]) as any;

const modalInfo = reactive({
  src: "",
  code: 0,
});
async function exportToFile() {
  progress.value = 0;

  const pages = Array.from(
    pdfSection.value!.querySelectorAll('div[aria-label^="pdf-page-"]')
  );
  const totalPages = pages.length;
  max.value = totalPages;

  const pdf = new jsPDF({ unit: "px", format: "a4", orientation: "landscape" });

  // Массив для хранения изображений и данных
  const imagesData = await Promise.all(
    pages.map((page, index) => {
      return html2canvas(page, { scale: 0.8, useCORS: true }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        return { imgData, pdfWidth, pdfHeight, index };
      });
    })
  );
  imagesData.sort((a, b) => a.index - b.index);
  imagesData.forEach((data, index) => {
    if (index > 0) {
      pdf.addPage();
    }
    pdf.addImage(data.imgData, "PNG", 0, 0, data.pdfWidth, data.pdfHeight);
    progress.value = Math.round(((index + 1) / totalPages) * 100);
  });
  pdf.save("Готовы к выдаче Yandex Market.pdf");
}

const modal = ref(false);
const { data, error } = await useFetch(`/api/yandexMarket/delivery/getReady`, {
  method: "GET",
  params: {
    dateRange: route.query?.dateRange
      ? route.query.dateRange.split(",").map((date) => new Date(date))
      : null,
  },
  headers: useRequestHeaders(["cookie"]) as HeadersInit,
});

onMounted(async () => {
  deliveries.value = data.value;
  const response = (await $fetch("/Roboto-Regular.ttf", {
    responseType: "arrayBuffer",
  })) as ArrayBuffer;
  font.value = response;
  setTimeout(() => {
    deliveries.value = data.value;
  }, 1000);
});
</script>

<template>
  <div class="overflow-auto">
    <progress
      class="progress progress-primary w-full fixed"
      :value="progress"
      :max="max"
    />
    <div class="flex">
      <button class="btn m-2 mt-4" @click="exportToFile">Скачать PDF</button>
    </div>
    <div v-if="deliveries" ref="pdfSection" class="h-[90vh]">
      <h1 class="text-3xl font-bold text-center p-4 bg-purple-700 text-white">
        Готовы к выдаче
      </h1>
      <div
        v-for="(point, index) of Object.keys(deliveries)"
        :key="index"
        :aria-label="`pdf-page-${index + 1}`"
        class="point relative"
      >
        <h1 class="text-center text-2xl font-bold absolute top-1 w-full">
          {{ point }}
        </h1>
        <div
          class="deliveryCards grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 px-2"
        >
          <div
            v-for="(delivery, index) of deliveries[point]"
            :key="index"
            class="card h-[703px] rounded-none shadow-xl border border-primary mt-[65px] mb-[25px] mx-2"
          >
            <figure>
              <nuxt-img
                class="p-4 object-contain h-72"
                :src="delivery.receiptcodeqr"
                :alt="delivery.receiptcode"
              />
            </figure>
            <div class="card-body p-0">
              <h2 class="card-title text-center">
                {{ delivery.productname }}
              </h2>
              <div
                class="info grid grid-cols-2 gap-2 mt-4 justify-center text-center"
              >
                <div>
                  {{ currency.format(delivery.pricebuy) }}
                </div>
                <div>
                  {{ $dayjs(delivery.updatedAt).format("D.MM.YYYY") }}
                </div>
                <div>Артикул</div>
                <div>{{ delivery.article }}</div>
                <div>Размер</div>
                <div>{{ delivery.size }}</div>
                <div>Получатель</div>
                <div>{{ delivery.recipient }}</div>
                <div>Телефон</div>
                <div>{{ delivery.recipientphone }}</div>
                <div class="font-bold">Код получения</div>
                <div class="font-bold text-lg">
                  {{ delivery.receiptcode }}
                </div>
              </div>
              <div class="text-center my-4 text-sm">
                <div>ID выкупа</div>
                <a class="link" :href="`/buyouts?uuid=${delivery.uuid}`"
                  >#{{ delivery.uuid }}</a
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="hero">
      <div
        class="hero-content text-center flex justify-center items-center h-80"
      >
        <div class="max-w-md">
          <h1 class="text-3xl font-bold">Здесь ничего нет</h1>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease-in-out;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
</style>
