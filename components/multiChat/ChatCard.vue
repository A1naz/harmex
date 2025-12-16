<script lang="ts" setup>
import type { Chat } from './types';

interface Props {
  chat: Chat;
  isFullscreen: boolean;
  isDragOver: boolean;
}

interface Emits {
  (e: 'sendMessage', chat: Chat): void;
  (e: 'toggleFullscreen', chatId: number): void;
  (e: 'dragStart', chatId: number, event: DragEvent): void;
  (e: 'dragOver', chatId: number, event: DragEvent): void;
  (e: 'dragLeave'): void;
  (e: 'drop', chatId: number, event: DragEvent): void;
  (e: 'dragEnd'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Форматирование времени
const formatTime = (date: Date) => {
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
};

// Отправка сообщения
const handleSendMessage = () => {
  emit('sendMessage', props.chat);
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
    draggable="true"
    @dragstart="emit('dragStart', chat.id, $event)"
    @dragover="emit('dragOver', chat.id, $event)"
    @dragleave="emit('dragLeave')"
    @drop="emit('drop', chat.id, $event)"
    @dragend="emit('dragEnd')"
  >
    <!-- Заголовок чата -->
    <div class="bg-white border-b border-gray-200 px-4 py-3">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-medium text-gray-900 flex items-center">
          <button 
            class="mr-2 -ml-2 -mb-2 cursor-grab active:cursor-grabbing"
            @mousedown.stop
          >
            <Icon name="mingcute:dots-fill" size="24" class="text-gray-400 hover:text-gray-600" />
          </button>
   
          {{ chat.name }}
        </h3>
        <div class="flex gap-2">
          <button 
            class="text-gray-400 hover:text-gray-600 transition-colors"
            @click="emit('toggleFullscreen', chat.id)"
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
      class="flex-1 overflow-y-auto p-3 bg-gray-50"
    >
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
            'max-w-[85%] px-3 py-1.5 rounded-lg text-xs',
            message.isOwn
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-800 border border-gray-200'
          ]"
        >
          <p class="break-words">{{ message.text }}</p>
          <span 
            :class="[
              'text-[10px] mt-0.5 block',
              message.isOwn ? 'text-blue-100' : 'text-gray-400'
            ]"
          >
            {{ formatTime(message.timestamp) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Поле ввода чата -->
    <div class="p-2 bg-white border-t border-gray-200">
      <form @submit.prevent="handleSendMessage" class="flex gap-1">
        <input
          v-model="chat.input"
          type="text"
          placeholder="Введите ваш запрос..."
          class="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          @keydown.enter.prevent="handleSendMessage"
        />
        <button
          type="submit"
          class="p-1.5 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
          :disabled="!chat.input.trim()"
          :class="{ 'opacity-50 cursor-not-allowed': !chat.input.trim() }"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
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
  cursor: move;
}

.chat-card:active {
  cursor: grabbing;
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

