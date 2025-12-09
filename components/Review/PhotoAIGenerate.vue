<script setup lang="ts">
const props = defineProps({
  state: { type: Boolean, required: true },
  buyoutUuid: { type: String, required: true },
  mp: {type: String, default: 'wildberries'}
});
const emit = defineEmits(["close", "accept", "update:state"]);
const { notify } = useNotification();
const loading = ref(false);

interface Variant {
  id: string;
  name: string;
  photoUrl: string;
}

const variants = ref<Variant[]>([]);

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  notify({
    title: "Текст скопирован в буфер обмена",
    group: "success",
  });
};

interface AIProvidersResponse {
  dalle?: string;
  imagen?: string;
  sora?: string;
}

// Маппинг названий провайдеров для отображения
const providerNames: Record<string, string> = {
  dalle: 'DALL-E 3',
  imagen: 'Google Imagen',
  sora: 'OpenAI Sora'
};

const onModalOpen = async () => {
  loading.value = true;
  variants.value = []; // Очищаем предыдущие варианты
  
  try {
    const { data, error } = await useFetch<AIProvidersResponse>(
      "/api/AI/getReviewPhoto",
      {
        params: {
          buyoutUuid: props.buyoutUuid,
          mp: props.mp
        },
      }
    );

    if (error.value) {
      notify({
        title: "Ошибка при генерации изображений",
        text: error.value.message,
        group: "error",
      });
      loading.value = false;
      return;
    }

    if (data.value) {
      // Обрабатываем ответ от каждого провайдера
      const successfulVariants: Variant[] = [];
      
      for (const [provider, result] of Object.entries(data.value)) {
        // Проверяем что результат это URL (не ошибка)
        if (result && typeof result === 'string' && !result.startsWith('Ошибка:')) {
          successfulVariants.push({
            id: provider,
            name: providerNames[provider] || provider,
            photoUrl: result
          });
        } else if (result && result.startsWith('Ошибка:')) {
          console.warn(`${provider} error:`, result);
        }
      }

      if (successfulVariants.length === 0) {
        notify({
          title: "Не удалось сгенерировать изображения",
          text: "Все провайдеры вернули ошибку",
          group: "error",
        });
      } else {
        variants.value = successfulVariants;
        notify({
          title: `Сгенерировано ${successfulVariants.length} вариант(ов)`,
          group: "success",
        });
      }
    }
  } catch (err: any) {
    notify({
      title: "Ошибка",
      text: err.message || "Неизвестная ошибка",
      group: "error",
    });
  }
  
  loading.value = false;
};

// Следим за изменением props.state
watch(
  () => props.state,
  (newVal) => {
    if (newVal) {
      onModalOpen();
    }
  }
);
</script>

<template>
  <input id="review-modal" type="checkbox" class="modal-toggle" />
  <div
    ref="closeButton"
    :class="{
      'modal-open': state,
    }"
    class="modal overflow-x-hidden cursor-pointer"
    @click="emit('update:state', false)"
  >
    <div class="modal-box z-50 max-w-4xl sm:w-xs w-full cursor-auto" @click.stop>
      <h3 class="font-bold text-lg mb-4">Генерация фото для отзыва</h3>
      
      <!-- Если нет вариантов и не загружается -->
      <div v-if="!loading && variants.length === 0" class="text-center py-8">
        <p class="text-gray-500">Нет доступных изображений</p>
      </div>

      <!-- Варианты изображений -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          v-for="variant in variants" 
          :key="variant.id"
          class="flex flex-col border rounded-lg p-4 hover:shadow-lg transition-shadow"
        >
          <div class="font-semibold text-sm mb-2 text-center">
            {{ variant.name }}
          </div>

          <div class="relative w-full aspect-square mb-3 bg-gray-100 rounded overflow-hidden">
            <NuxtImg 
              :src="variant.photoUrl" 
              class="w-full h-full object-contain" 
              loading="lazy"
            />
          </div>

          <div class="flex gap-2 justify-center">
            <button
              @click="[emit('accept', variant.photoUrl), emit('update:state', false)]"
              class="btn btn-primary btn-sm flex-1"
            >
              Применить
            </button>
            <button
              @click="copyToClipboard(variant.photoUrl)"
              class="btn btn-sm"
              title="Скопировать ссылку"
            >
              <Icon
                name="material-symbols:content-copy-outline-rounded"
                size="18"
              />
            </button>
          </div>
        </div>
      </div>

      <!-- Кнопка закрытия -->
      <div class="modal-action">
        <button 
          @click="emit('update:state', false)" 
          class="btn btn-sm"
        >
          Закрыть
        </button>
      </div>
    </div>

    <!-- Loader -->
    <div
      @click.stop
      v-if="loading"
      style="background-color: rgb(37, 37, 42); opacity: 80%; z-index: 9999"
      class="fixed z-[50] top-0 left-0 right-0 bottom-0 w-full h-screen overflow-hidden flex flex-col items-center justify-center"
    >
      <span class="text-white text-2xl text-center mb-4">Генерация изображений(в среднем около 4 минут)...</span>
      <div class="ease-linear rounded-full mb-4">
        <Icon name="mdi:loading" class="h-20 w-20 animate-spin text-white" />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
