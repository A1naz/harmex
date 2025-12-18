<script lang="ts" setup>
import { ref, computed } from 'vue';

interface ChatSession {
  chatId: string;
  title: string;
  lastActivity: Date;
  providers: string[];
}

interface Props {
  isOpen: boolean;
  currentChatId?: string;
  sessions: ChatSession[];
  loading?: boolean;
}

interface Emits {
  (e: 'close'): void;
  (e: 'newChat'): void;
  (e: 'selectChat', chatId: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Форматирование даты
const formatDate = (date: Date) => {
  return new Date(date).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Проверка, является ли чат активным
const isActiveChat = (chatId: string) => {
  return props.currentChatId === chatId;
};
</script>

<template>
  <div>
    <!-- Overlay -->
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
      @click="emit('close')"
    ></div>

    <!-- Sidebar -->
    <div
      :class="[
        'fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-800">Мои чаты</h2>
        <button
          @click="emit('close')"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- New Chat Button -->
      <div class="p-4 border-b border-gray-200">
        <button
          @click="emit('newChat')"
          class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Новый чат
        </button>
      </div>

      <!-- Chat List -->
      <div class="flex-1 overflow-y-auto">
        <!-- Loading -->
        <div v-if="loading" class="p-4 space-y-3">
          <div v-for="i in 5" :key="i" class="animate-pulse">
            <div class="h-16 bg-gray-200 rounded-lg"></div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="sessions.length === 0" class="p-8 text-center">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          <p class="text-sm text-gray-500">Нет сохраненных чатов</p>
          <p class="text-xs text-gray-400 mt-1">Начните новый чат</p>
        </div>

        <!-- Sessions List -->
        <div v-else class="p-2 space-y-1">
          <button
            v-for="session in sessions"
            :key="session.chatId"
            @click="emit('selectChat', session.chatId)"
            :class="[
              'w-full text-left p-3 rounded-lg transition-all',
              isActiveChat(session.chatId)
                ? 'bg-blue-50 border-2 border-blue-500'
                : 'hover:bg-gray-50 border-2 border-transparent'
            ]"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1 min-w-0">
                <h3 
                  :class="[
                    'text-sm font-medium truncate',
                    isActiveChat(session.chatId) ? 'text-blue-700' : 'text-gray-900'
                  ]"
                >
                  {{ session.title }}
                </h3>
                <p class="text-xs text-gray-500 mt-1">
                  {{ formatDate(session.lastActivity) }}
                </p>
                <div class="flex flex-wrap gap-1 mt-2">
                  <span
                    v-for="provider in session.providers.slice(0, 3)"
                    :key="provider"
                    class="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
                  >
                    {{ provider }}
                  </span>
                  <span
                    v-if="session.providers.length > 3"
                    class="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
                  >
                    +{{ session.providers.length - 3 }}
                  </span>
                </div>
              </div>
              
              <svg 
                v-if="isActiveChat(session.chatId)"
                class="w-5 h-5 text-blue-500 flex-shrink-0" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Кастомная прокрутка */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>

