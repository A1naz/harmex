<script lang="ts" setup>
import type { Chat } from './types';
import { ref } from 'vue';
import { v4 as uuid } from 'uuid';
import { useNotification } from '@kyvg/vue3-notification';

const { notify } = useNotification();

interface Props {
  chat: Chat;
  isFullscreen: boolean;
  isDragOver: boolean;
  isLoading?: boolean;
}

interface Emits {
  (e: 'sendMessage', chat: Chat, imageUrl?: string): void;
  (e: 'toggleFullscreen', chatId: number): void;
  (e: 'dragStart', chatId: number, event: DragEvent): void;
  (e: 'dragOver', chatId: number, event: DragEvent): void;
  (e: 'dragLeave'): void;
  (e: 'drop', chatId: number, event: DragEvent): void;
  (e: 'dragEnd'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Состояние загрузки изображения
const uploadingImage = ref(false);
const uploadedImageUrl = ref<string>('');
const isDraggingFile = ref(false);

// Форматирование времени
const formatTime = (date: Date) => {
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
};

// Отправка сообщения
const handleSendMessage = () => {
  emit('sendMessage', props.chat, uploadedImageUrl.value || undefined);
  uploadedImageUrl.value = ''; // Очищаем после отправки
};

// Общая функция для загрузки файла
const uploadFile = async (file: File) => {
  
  // Проверка на webp
  if (file.name && file.name.toLowerCase().endsWith('.webp')) {
    notify({
      title: 'Что-то пошло не так',
      text: 'Нельзя загружать вебпикчи',
      group: 'error',
      duration: 3000,
    });
    return;
  }
  
  uploadingImage.value = true;
  
  try {
    const fileName = 'reviewImages/' + uuid();
    
    // Используем composable для загрузки
    const { upload } = useS3Object();
    const result = await upload(file, {
      key: fileName,
    });
    
    if (!result) {
      notify({
        title: 'Что-то пошло не так',
        text: 'Не удалось загрузить фото',
        group: 'error',
        duration: 3000,
      });
      return;
    }
    
    // Открываем изображение для публичного доступа
    await useFetch('/api/images/openForPublic', {
      method: 'GET',
      params: {
        path: result.split('query/')[1],
      },
    });
    
    uploadedImageUrl.value = `https://ozonmpportal.hb.vkcs.cloud/${result.split('query/')[1]}`;
    
    notify({
      title: 'Успешно',
      text: 'Изображение загружено',
      group: 'success',
      duration: 2000,
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    notify({
      title: 'Ошибка',
      text: 'Не удалось загрузить изображение',
      group: 'error',
      duration: 3000,
    });
  } finally {
    uploadingImage.value = false;
  }
};

// Загрузка изображения из input
const handleImageUpload = async (event: Event) => {
  const fileList = (event.target as HTMLInputElement).files;
  if (!fileList || !fileList[0]) return;
  
  await uploadFile(fileList[0]);
  
  // Очищаем input для возможности повторной загрузки того же файла
  (event.target as HTMLInputElement).value = '';
};

// Drag and Drop обработчики
const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy';
  }
  isDraggingFile.value = true;
};

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
  isDraggingFile.value = false;
};

const handleDrop = async (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
  isDraggingFile.value = false;
  
  if (!event.dataTransfer?.files || event.dataTransfer.files.length === 0) return;
  
  const file = event.dataTransfer.files[0];
  
  // Проверяем, что это изображение
  if (!file.type.startsWith('image/')) {
    notify({
      title: 'Ошибка',
      text: 'Можно загружать только изображения',
      group: 'error',
      duration: 3000,
    });
    return;
  }
  
  await uploadFile(file);
};

// Удаление загруженного изображения
const removeUploadedImage = () => {
  uploadedImageUrl.value = '';
};

// Функция для определения, является ли текст URL
const isUrl = (text: string): boolean => {
  try {
    new URL(text.trim());
    return true;
  } catch {
    return text.trim().startsWith('http://') || text.trim().startsWith('https://');
  }
};

// Функция для определения типа контента на основе типа чата и URL
const getContentType = (text: string, isOwnMessage: boolean): 'text' | 'image' | 'video' => {
  // Только для ответов AI (не собственных сообщений)
  if (isOwnMessage || !isUrl(text)) {
    return 'text';
  }

  // Проверяем тип чата
  if (props.chat.type === 'image') {
    return 'image';
  }
  
  if (props.chat.type === 'video') {
    return 'video';
  }

  return 'text';
};
</script>

<template>
  <div
    :id="`chat-card-${chat.id}`"
    :class="[
      'chat-card bg-white border-2 rounded-lg overflow-hidden flex flex-col transition-all',
      isFullscreen ? 'chat-card-fullscreen' : '',
      isDragOver ? 'border-blue-500 scale-105' : 'border-gray-200'
    ]"
    @dragover="emit('dragOver', chat.id, $event)"
    @dragleave="emit('dragLeave')"
    @drop="emit('drop', chat.id, $event)"
  >
    <!-- Заголовок чата (draggable) -->
    <div 
      class="bg-white border-b border-gray-200 px-4 py-3 cursor-move"
      draggable="true"
      @dragstart="emit('dragStart', chat.id, $event)"
      @dragend="emit('dragEnd')"
    >
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-medium text-gray-900 flex items-center">
          <button 
            class="mr-2 -ml-2 -mb-2 cursor-grab active:cursor-grabbing pointer-events-none"
          >
            <Icon name="mingcute:dots-fill" size="24" class="text-gray-400 hover:text-gray-600" />
          </button>
   
          {{ chat.name }}
        </h3>
        <div class="flex gap-2">
          <button 
            class="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            draggable="false"
            @click.stop="emit('toggleFullscreen', chat.id)"
            @mousedown.stop
            :title="isFullscreen ? 'Выйти из полноэкранного режима' : 'Полноэкранный режим'"
          >
            <Icon 
              :name="isFullscreen ? 'mingcute:fullscreen-exit-2-fill' : 'mingcute:fullscreen-2-fill'" 
              size="18" 
              class="text-gray-400 hover:text-gray-600" 
            />
          </button>
        </div>
      </div>
    </div>

    <!-- Область сообщений -->
    <div 
      :id="`chat-messages-${chat.id}`"
      :class="[
        'flex-1 overflow-y-auto p-3 bg-gray-50 relative',
        isDraggingFile ? 'border-4 border-dashed border-blue-500 bg-blue-50' : ''
      ]"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <!-- Индикатор перетаскивания -->
      <div 
        v-if="isDraggingFile" 
        class="absolute inset-0 flex items-center justify-center bg-blue-50 bg-opacity-90 z-10 pointer-events-none"
      >
        <div class="text-center">
          <svg class="w-16 h-16 mx-auto mb-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
          </svg>
          <p class="text-blue-600 font-medium">Отпустите для загрузки изображения</p>
        </div>
      </div>
      <div 
        v-if="chat.messages.length === 0"
        class="h-full flex items-center justify-center text-gray-400"
      >
        <div class="text-center px-4">
          <svg class="w-12 h-12 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          <p class="text-xs text-gray-500">Начните новый чат или выберите существующий</p>
        </div>
      </div>

      <div
        v-for="message in chat.messages"
        :key="message.id"
        :class="[
          'mb-2 flex',
          message.isOwn ? 'justify-end' : 'justify-start'
        ]"
      >
        <div
          :class="[
            'max-w-[85%] rounded-lg text-xs',
            message.isOwn
              ? 'bg-blue-500 text-white px-3 py-1.5'
              : getContentType(message.text, message.isOwn) === 'text' 
                ? 'bg-white text-gray-800 border border-gray-200 px-3 py-1.5'
                : 'bg-white border border-gray-200 overflow-hidden'
          ]"
        >
          <!-- Текстовое сообщение -->
          <template v-if="getContentType(message.text, message.isOwn) === 'text'">
            <!-- Изображение пользователя (если есть) -->
            <div v-if="message.isOwn && message.imageUrl" class="mb-2">
              <img 
                :src="message.imageUrl" 
                alt="Uploaded image"
                class="w-full h-auto rounded max-h-48 object-contain bg-gray-50"
              />
            </div>
            <p class="break-words">{{ message.text }}</p>
            <span 
              :class="[
                'text-[10px] mt-0.5 block',
                message.isOwn ? 'text-blue-100' : 'text-gray-400'
              ]"
            >
              {{ formatTime(message.timestamp) }}
            </span>
          </template>

          <!-- Изображение -->
          <template v-else-if="getContentType(message.text, message.isOwn) === 'image'">
            <div class="space-y-2">
              <img 
                :src="message.text.trim()" 
                :alt="chat.name"
                class="w-full h-auto rounded-t-lg max-h-96 object-contain bg-gray-50"
                @error="(e) => (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23f3f4f6%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%239ca3af%22%3EОшибка загрузки%3C/text%3E%3C/svg%3E'"
              />
              <div class="px-3 pb-2">
                <a 
                  :href="message.text.trim()" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center gap-1"
                >
                  <Icon name="mingcute:external-link-line" size="14" />
                  <span>Открыть полную версию</span>
                </a>
                <span class="text-[10px] text-gray-400 block mt-1">
                  {{ formatTime(message.timestamp) }}
                </span>
              </div>
            </div>
          </template>

          <!-- Видео -->
          <template v-else-if="getContentType(message.text, message.isOwn) === 'video'">
            <div class="space-y-2">
              <video 
                :src="message.text.trim()" 
                controls
                class="w-full h-auto rounded-t-lg max-h-96 bg-gray-900"
                preload="metadata"
              >
                Ваш браузер не поддерживает воспроизведение видео.
              </video>
              <div class="px-3 pb-2">
                <a 
                  :href="message.text.trim()" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center gap-1"
                >
                  <Icon name="mingcute:external-link-line" size="14" />
                  <span>Открыть полную версию</span>
                </a>
                <span class="text-[10px] text-gray-400 block mt-1">
                  {{ formatTime(message.timestamp) }}
                </span>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Поле ввода чата -->
    <div class="p-2 bg-white border-t border-gray-200">
      <!-- Индикатор загрузки -->
      <div v-if="isLoading" class="flex items-center gap-2 text-xs text-gray-500 mb-2 px-2">
        <svg class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>{{ chat.name }} печатает...</span>
      </div>
      
      <!-- Превью загруженного изображения -->
      <div v-if="uploadedImageUrl" class="mb-2 px-2">
        <div class="relative inline-block">
          <img :src="uploadedImageUrl" alt="Uploaded" class="h-16 w-16 object-cover rounded border border-gray-300" />
          <button
            @click="removeUploadedImage"
            class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 text-xs"
            type="button"
          >
            ×
          </button>
        </div>
      </div>
      
      <form @submit.prevent="handleSendMessage" class="flex gap-1">
        <!-- Кнопка загрузки изображения -->
        <label class="p-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors cursor-pointer flex items-center justify-center relative">
          <input
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleImageUpload"
            :disabled="isLoading || uploadingImage"
          />
          <svg v-if="!uploadingImage" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </label>
        
        <input
          v-model="chat.input"
          type="text"
          placeholder="Введите ваш запрос..."
          :disabled="isLoading"
          class="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          @keydown.enter.prevent="handleSendMessage"
        />
        <button
          type="submit"
          class="p-1.5 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors relative"
          :disabled="!chat.input.trim() || isLoading"
          :class="{ 'opacity-50 cursor-not-allowed': !chat.input.trim() || isLoading }"
        >
          <svg v-if="!isLoading" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
          </svg>
          <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Адаптивные карточки чатов */
.chat-card {
  width: 100%;
  height: 450px;
  transition: all 0.3s ease;
}

@media (min-width: 640px) {
  .chat-card {
    width: 320px;
  }
}

@media (min-width: 1024px) {
  .chat-card {
    width: 350px;
    height: 500px;
  }
}

@media (min-width: 1280px) {
  .chat-card {
    width: 380px;
    height: 520px;
  }
}

/* Полноэкранный режим */
.chat-card-fullscreen {
  width: 100% !important;
  height: 900px !important;
  position: relative;
  z-index: 10;
}

@media (min-width: 1024px) {
  .chat-card-fullscreen {
    height: 1000px !important;
  }
}

/* Кастомная прокрутка для области сообщений */
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>

