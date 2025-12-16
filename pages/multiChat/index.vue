<script lang="ts" setup>
import { ref, reactive, watch, onMounted } from 'vue';
import ChatCard from '~/components/multiChat/ChatCard.vue';
import type { Chat } from '~/components/multiChat/types';

definePageMeta({ middleware: "auth", layout: "app" });

// Начальный порядок чатов
const initialChats = [
  { id: 1, name: 'DeepSeek', messages: [], input: '' },
  { id: 2, name: 'ChatGPT', messages: [], input: '' },
  { id: 3, name: 'Claude', messages: [], input: '' },
  { id: 4, name: 'Gemini', messages: [], input: '' },
];

// Состояние чатов
const chats = reactive<Chat[]>([...initialChats]);

// Глобальное сообщение для отправки всем
const globalMessage = ref('');

// Развернутый чат
const fullscreenChatId = ref<number | null>(null);

// Drag and drop
const draggedChatId = ref<number | null>(null);
const dragOverChatId = ref<number | null>(null);

// Загрузка состояния из localStorage
onMounted(() => {
  if (typeof window !== 'undefined') {
    // Загружаем порядок чатов
    const savedOrder = localStorage.getItem('multiChat:order');
    if (savedOrder) {
      try {
        const orderIds = JSON.parse(savedOrder) as number[];
        // Переупорядочиваем чаты согласно сохраненному порядку
        const orderedChats: Chat[] = [];
        orderIds.forEach(id => {
          const chat = chats.find(c => c.id === id);
          if (chat) orderedChats.push(chat);
        });
        // Добавляем чаты, которых нет в сохраненном порядке
        chats.forEach(chat => {
          if (!orderedChats.find(c => c.id === chat.id)) {
            orderedChats.push(chat);
          }
        });
        chats.splice(0, chats.length, ...orderedChats);
      } catch (e) {
        console.error('Error loading chat order:', e);
      }
    }
    
    // Загружаем состояние fullscreen
    const savedFullscreen = localStorage.getItem('multiChat:fullscreen');
    if (savedFullscreen) {
      try {
        fullscreenChatId.value = JSON.parse(savedFullscreen);
      } catch (e) {
        console.error('Error loading fullscreen state:', e);
      }
    }
  }
});

// Сохранение порядка чатов
watch(() => chats.map(c => c.id), (newOrder) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('multiChat:order', JSON.stringify(newOrder));
  }
}, { deep: true });

// Сохранение состояния fullscreen
watch(fullscreenChatId, (newValue) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('multiChat:fullscreen', JSON.stringify(newValue));
  }
});

// Отправка сообщения в конкретный чат
const sendMessageToChat = (chat: Chat) => {
  if (!chat.input.trim()) return;
  
  chat.messages.push({
    id: Date.now(),
    text: chat.input,
    timestamp: new Date(),
    isOwn: true
  });
  
  chat.input = '';
  
  // Прокрутка вниз
  nextTick(() => {
    const chatElement = document.getElementById(`chat-messages-${chat.id}`);
    if (chatElement) {
      chatElement.scrollTop = chatElement.scrollHeight;
    }
  });
};

// Отправка сообщения всем чатам
const sendToAll = () => {
  if (!globalMessage.value.trim()) return;
  
  const message = {
    id: Date.now(),
    text: globalMessage.value,
    timestamp: new Date(),
    isOwn: true
  };
  
  chats.forEach(chat => {
    chat.messages.push({ ...message });
  });
  
  globalMessage.value = '';
  
  // Прокрутка всех чатов вниз
  nextTick(() => {
    chats.forEach(chat => {
      const chatElement = document.getElementById(`chat-messages-${chat.id}`);
      if (chatElement) {
        chatElement.scrollTop = chatElement.scrollHeight;
      }
    });
  });
};

// Переключение fullscreen режима
const toggleFullscreen = (chatId: number) => {
  if (fullscreenChatId.value === chatId) {
    fullscreenChatId.value = null;
  } else {
    fullscreenChatId.value = chatId;
    
    // Перемещаем чат на первую позицию
    const chatIndex = chats.findIndex(c => c.id === chatId);
    if (chatIndex !== -1 && chatIndex !== 0) {
      const chat = chats[chatIndex];
      chats.splice(chatIndex, 1);
      chats.unshift(chat);
    }
  }
};

// Drag and Drop handlers
const handleDragStart = (chatId: number, event: DragEvent) => {
  draggedChatId.value = chatId;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/html', String(chatId));
  }
};

const handleDragOver = (chatId: number, event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
  dragOverChatId.value = chatId;
};

const handleDragLeave = () => {
  dragOverChatId.value = null;
};

const handleDrop = (targetChatId: number, event: DragEvent) => {
  event.preventDefault();
  
  if (draggedChatId.value !== null && draggedChatId.value !== targetChatId) {
    const draggedIndex = chats.findIndex(c => c.id === draggedChatId.value);
    const targetIndex = chats.findIndex(c => c.id === targetChatId);
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      // Меняем местами чаты
      const temp = chats[draggedIndex];
      chats.splice(draggedIndex, 1);
      chats.splice(targetIndex, 0, temp);
    }
  }
  
  draggedChatId.value = null;
  dragOverChatId.value = null;
};

const handleDragEnd = () => {
  draggedChatId.value = null;
  dragOverChatId.value = null;
};
</script>

<template>
  <div class="min-h-screen bg-white pb-32">
    <div class="mx-auto px-6 py-6">
      <!-- Маленькие блоки чатов -->
      <div class="flex flex-wrap gap-4 justify-center lg:justify-start">
        <ChatCard
          v-for="chat in chats"
          :key="chat.id"
          :chat="chat"
          :is-fullscreen="fullscreenChatId === chat.id"
          :is-drag-over="dragOverChatId === chat.id && draggedChatId !== chat.id"
          @send-message="sendMessageToChat"
          @toggle-fullscreen="toggleFullscreen"
          @drag-start="handleDragStart"
          @drag-over="handleDragOver"
          @drag-leave="handleDragLeave"
          @drop="handleDrop"
          @drag-end="handleDragEnd"
        />
      </div>

      <!-- Глобальное поле отправки всем -->
      <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4">
        <div class="max-w-7xl mx-auto px-6">
          <form @submit.prevent="sendToAll" class="flex gap-2">
            <input
              v-model="globalMessage"
              type="text"
              placeholder="Введите ваш запрос..."
              class="flex-1 px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              @keydown.enter.exact.prevent="sendToAll"
            />
            <button
              type="submit"
              class="px-6 py-3 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 flex-shrink-0"
              :disabled="!globalMessage.trim()"
              :class="{ 'opacity-50 cursor-not-allowed': !globalMessage.trim() }"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
              </svg>
            </button>
          </form>
          <p class="text-xs text-gray-400 mt-2">
            Нажмите Enter для отправки, Shift+Enter для новой строки
          </p>
        </div>
      </div>
    </div>
  </div>
</template>