<script lang="ts" setup>
import { ref, reactive, watch, onMounted, computed } from 'vue';
import ChatCard from '~/components/multiChat/ChatCard.vue';
import Sidebar from '~/components/multiChat/Sidebar.vue';
import type { Chat } from '~/components/multiChat/types';
import { v4 as uuid } from 'uuid';
import { useNotification } from '@kyvg/vue3-notification';

const { notify } = useNotification();

definePageMeta({ middleware: "auth", layout: "app" });

// Типы AI моделей
interface AIModelConfig {
  label: string;
  models: string[];
  defaultModel: string;
  type: 'chat' | 'video' | 'audio' | 'image';
  url: string;
}

type AIModelsConfig = Record<string, AIModelConfig>;

// Конфигурация AI моделей
const aiModelsConfig = ref<AIModelsConfig>({});

// Активный тип фильтра
const selectedType = ref<'all' | 'chat' | 'video' | 'audio' | 'image'>('chat');

// Состояние чатов
const chats = reactive<Chat[]>([]);

// Глобальное сообщение для отправки всем
const globalMessage = ref('');
const globalUploadedImageUrl = ref<string>('');
const globalUploadingImage = ref(false);
const isGlobalDraggingFile = ref(false);

// Sidebar состояние
const isSidebarOpen = ref(false);
const chatSessions = ref<any[]>([]);
const sessionsLoading = ref(false);

// Текущая сессия чата
const currentChatId = ref<string>('');

// Генерация названия чата
const generateChatTitle = () => {
  return `Чат ${new Date().toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};

// Фильтрованные чаты по типу
const filteredChats = computed<Chat[]>(() => {
  if (selectedType.value === 'all') {
    return [...chats];
  }
  
  return chats.filter(chat => {
    const provider = chat.provider || '';
    const config = aiModelsConfig.value[provider];
    return config?.type === selectedType.value;
  });
});

// Placeholder для глобального поля ввода
const globalInputPlaceholder = computed(() => {
  if (filteredChats.value.length === 0) {
    return 'Нет доступных чатов в этой категории...';
  }
  
  const categoryName = 
    selectedType.value === 'chat' ? 'Текст' :
    selectedType.value === 'video' ? 'Видео' :
    selectedType.value === 'audio' ? 'Аудио' :
    'Изображения';
  
  return `Отправить всем в категории "${categoryName}"...`;
});

// Подсчет количества чатов по типам
const chatCounts = computed(() => {
  const counts = {
    all: chats.length,
    chat: 0,
    video: 0,
    audio: 0,
    image: 0,
  };
  
  chats.forEach(chat => {
    const provider = chat.provider || '';
    const config = aiModelsConfig.value[provider];
    if (config) {
      counts[config.type]++;
    }
  });
  
  return counts;
});

// Развернутый чат
const fullscreenChatId = ref<number | null>(null);

// Drag and drop
const draggedChatId = ref<number | null>(null);
const dragOverChatId = ref<number | null>(null);

// Загрузка списка сессий
const loadSessions = async () => {
  sessionsLoading.value = true;
  try {
    const res = await fetch('/api/multichat/sessions/list');
    const data = await res.json();
    if (data.success) {
      chatSessions.value = data.sessions;
    }
  } catch (error) {
    console.error('Error loading sessions:', error);
  } finally {
    sessionsLoading.value = false;
  }
};

// Загрузка истории чата
const loadChatHistory = async (chatId: string) => {
  try {
    const res = await fetch(`/api/multichat/sessions/${chatId}`);
    const data = await res.json();
    
    if (data.success) {
      // Загружаем сообщения в соответствующие чаты
      Object.entries(data.messagesByProvider).forEach(([provider, messages]: [string, any]) => {
        const chat = chats.find(c => c.provider === provider);
        if (chat && Array.isArray(messages)) {
          chat.messages = messages.map((msg: any) => ({
            id: Date.now() + Math.random(),
            text: msg.content,
            timestamp: new Date(msg.timestamp),
            isOwn: msg.role === 'user',
          }));
        }
      });
      
      // Прокрутка всех чатов вниз
      nextTick(() => {
        chats.forEach(chat => {
          const chatElement = document.getElementById(`chat-messages-${chat.id}`);
          if (chatElement) {
            chatElement.scrollTop = chatElement.scrollHeight;
          }
        });
      });
    }
  } catch (error) {
    console.error('Error loading chat history:', error);
  }
};

// Создание нового чата
const createNewChat = () => {
  currentChatId.value = uuid();
  
  // Очищаем все сообщения
  chats.forEach(chat => {
    chat.messages = [];
    chat.input = '';
  });
  
  // Сохраняем в localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('multiChat:currentChatId', currentChatId.value);
  }
  
  isSidebarOpen.value = false;
};

// Выбор существующего чата
const selectChat = async (chatId: string) => {
  currentChatId.value = chatId;
  
  // Очищаем текущие сообщения
  chats.forEach(chat => {
    chat.messages = [];
  });
  
  // Загружаем историю
  await loadChatHistory(chatId);
  
  // Сохраняем в localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('multiChat:currentChatId', currentChatId.value);
  }
  
  isSidebarOpen.value = false;
};

// Загрузка состояния из localStorage
onMounted(async () => {
  // Загружаем конфигурацию моделей
  try {
    const res = await fetch('/api/multichat/models');
    const response = await res.json();
    
    if (response?.success) {
      aiModelsConfig.value = response.models;
      
      // Создаем чаты на основе загруженных моделей
      let chatId = 1;
      Object.entries(aiModelsConfig.value).forEach(([provider, config]) => {
        chats.push({
          id: chatId++,
          name: config.label,
          provider: provider,
          type: config.type,
          messages: [],
          input: '',
        });
      });
    }
  } catch (error) {
    console.error('Error loading AI models:', error);
  }
  
  // Загружаем список сессий
  await loadSessions();
  
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
    
    // Загружаем выбранный тип
    const savedType = localStorage.getItem('multiChat:selectedType');
    if (savedType) {
      try {
        selectedType.value = JSON.parse(savedType);
      } catch (e) {
        console.error('Error loading selected type:', e);
      }
    }
    
    // Загружаем или создаем текущий chatId
    const savedChatId = localStorage.getItem('multiChat:currentChatId');
    if (savedChatId) {
      currentChatId.value = savedChatId;
      // Загружаем историю
      await loadChatHistory(savedChatId);
    } else {
      // Создаем новый чат
      currentChatId.value = uuid();
      localStorage.setItem('multiChat:currentChatId', currentChatId.value);
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

// Сохранение выбранного типа
watch(selectedType, (newValue) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('multiChat:selectedType', JSON.stringify(newValue));
  }
});

// Состояния загрузки для каждого чата
const loadingChats = ref<Record<number, boolean>>({});

// Отправка сообщения в конкретный чат
const sendMessageToChat = async (chat: Chat, imageUrl?: string) => {
  if (!chat.input.trim() || loadingChats.value[chat.id]) return;
  
  const userMessage = chat.input;
  const provider = chat.provider || 'openai';
  
  // Добавляем сообщение пользователя
  chat.messages.push({
    id: Date.now(),
    text: userMessage,
    timestamp: new Date(),
    isOwn: true,
    imageUrl: imageUrl, // Добавляем imageUrl если есть
  });
  
  chat.input = '';
  loadingChats.value[chat.id] = true;
  
  // Прокрутка вниз
  nextTick(() => {
    const chatElement = document.getElementById(`chat-messages-${chat.id}`);
    if (chatElement) {
      chatElement.scrollTop = chatElement.scrollHeight;
    }
  });
  
  try {
    // Отправляем запрос к API
    const response = await fetch(`/api/multichat/${provider}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userMessage,
        chatId: currentChatId.value || uuid(),
        systemPrompt: 'Ты полезный ассистент. Отвечай на вопросы пользователя кратко и по делу.',
        imageUrl: imageUrl || undefined, // Передаем imageUrl в запросе
      }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Добавляем ответ AI
      chat.messages.push({
        id: Date.now(),
        text: data.content,
        timestamp: new Date(),
        isOwn: false
      });
      
      // Обновляем список сессий
      await loadSessions();
    } else {
      // Показываем ошибку
      chat.messages.push({
        id: Date.now(),
        text: `Ошибка: ${data.error || 'Не удалось получить ответ'}`,
        timestamp: new Date(),
        isOwn: false
      });
    }
  } catch (error: any) {
    console.error('Error sending message:', error);
    chat.messages.push({
      id: Date.now(),
      text: `Ошибка связи с сервером: ${error.message}`,
      timestamp: new Date(),
      isOwn: false
    });
  } finally {
    loadingChats.value[chat.id] = false;
    
    // Прокрутка к новому сообщению
    nextTick(() => {
      const chatElement = document.getElementById(`chat-messages-${chat.id}`);
      if (chatElement) {
        chatElement.scrollTop = chatElement.scrollHeight;
      }
    });
  }
};

// Глобальная загрузка
const globalLoading = ref(false);

// Общая функция для загрузки файла для глобального инпута
const uploadGlobalFile = async (file: File) => {
  
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
  
  globalUploadingImage.value = true;
  
  try {
    const fileName = 'reviewImages/' + uuid();
    
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
    
    await useFetch('/api/images/openForPublic', {
      method: 'GET',
      params: {
        path: result.split('query/')[1],
      },
    });
    
    globalUploadedImageUrl.value = `https://ozonmpportal.hb.vkcs.cloud/${result.split('query/')[1]}`;
    
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
    globalUploadingImage.value = false;
  }
};

// Загрузка изображения из input для глобального инпута
const handleGlobalImageUpload = async (event: Event) => {
  const fileList = (event.target as HTMLInputElement).files;
  if (!fileList || !fileList[0]) return;
  
  await uploadGlobalFile(fileList[0]);
  
  // Очищаем input
  (event.target as HTMLInputElement).value = '';
};

// Drag and Drop обработчики для глобального инпута
const handleGlobalDragOver = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy';
  }
  isGlobalDraggingFile.value = true;
};

const handleGlobalDragLeave = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
  
  // Проверяем, что мы действительно покинули область
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  if (
    event.clientX <= rect.left ||
    event.clientX >= rect.right ||
    event.clientY <= rect.top ||
    event.clientY >= rect.bottom
  ) {
    isGlobalDraggingFile.value = false;
  }
};

const handleGlobalDrop = async (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
  isGlobalDraggingFile.value = false;
  
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
  
  await uploadGlobalFile(file);
};

// Удаление загруженного изображения для глобального инпута
const removeGlobalUploadedImage = () => {
  globalUploadedImageUrl.value = '';
};

// Отправка сообщения всем чатам в выбранной категории
const sendToAll = async () => {
  if (!globalMessage.value.trim() || globalLoading.value) return;
  
  // Используем только чаты из выбранной категории
  const chatsToSend = filteredChats.value;
  
  if (chatsToSend.length === 0) {
    console.warn('Нет доступных чатов в выбранной категории');
    return;
  }
  
  const userMessage = globalMessage.value;
  const imageUrl = globalUploadedImageUrl.value;
  globalMessage.value = '';
  globalUploadedImageUrl.value = ''; // Очищаем после отправки
  globalLoading.value = true;
  
  // Устанавливаем состояние загрузки для каждого чата
  chatsToSend.forEach(chat => {
    loadingChats.value[chat.id] = true;
  });
  
  // Добавляем сообщение пользователя только в чаты выбранной категории
  const message = {
    id: Date.now(),
    text: userMessage,
    timestamp: new Date(),
    isOwn: true,
    imageUrl: imageUrl || undefined, // Добавляем imageUrl если есть
  };
  
  chatsToSend.forEach(chat => {
    chat.messages.push({ ...message });
  });
  
  // Прокрутка чатов выбранной категории вниз
  nextTick(() => {
    chatsToSend.forEach(chat => {
      const chatElement = document.getElementById(`chat-messages-${chat.id}`);
      if (chatElement) {
        chatElement.scrollTop = chatElement.scrollHeight;
      }
    });
  });
  
  // Отправляем запросы только к провайдерам выбранной категории параллельно
  const promises = chatsToSend.map(async (chat) => {
    const provider = chat.provider || 'openai';
    
    try {
      const response = await fetch(`/api/multichat/${provider}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          chatId: currentChatId.value || uuid(),
          systemPrompt: 'Ты полезный ассистент. Отвечай на вопросы пользователя кратко и по делу.',
          imageUrl: imageUrl || undefined, // Передаем imageUrl в запросе
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        chat.messages.push({
          id: Date.now() + chat.id,
          text: data.content,
          timestamp: new Date(),
          isOwn: false
        });
      } else {
        chat.messages.push({
          id: Date.now() + chat.id,
          text: `Ошибка: ${data.error || 'Не удалось получить ответ'}`,
          timestamp: new Date(),
          isOwn: false
        });
      }
    } catch (error: any) {
      console.error(`Error sending to ${provider}:`, error);
      chat.messages.push({
        id: Date.now() + chat.id,
        text: `Ошибка связи с ${chat.name}`,
        timestamp: new Date(),
        isOwn: false
      });
    } finally {
      // Снимаем состояние загрузки для каждого чата
      loadingChats.value[chat.id] = false;
    }
    
    // Прокрутка после получения ответа
    nextTick(() => {
      const chatElement = document.getElementById(`chat-messages-${chat.id}`);
      if (chatElement) {
        chatElement.scrollTop = chatElement.scrollHeight;
      }
    });
  });
  
  await Promise.all(promises);
  globalLoading.value = false;
  
  // Обновляем список сессий
  await loadSessions();
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
  <div class="min-h-screen pb-32">
    <!-- Sidebar -->
    <Sidebar
      :is-open="isSidebarOpen"
      :current-chat-id="currentChatId"
      :sessions="chatSessions"
      :loading="sessionsLoading"
      @close="isSidebarOpen = false"
      @new-chat="createNewChat"
      @select-chat="selectChat"
    />

    <div class="mx-auto px-6 py-6">
      <!-- Header с бургер-меню -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <button
            @click="isSidebarOpen = true"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <div>
            <h1 class="text-xl font-semibold text-gray-800">Мульти-чат AI</h1>
            <p class="text-sm text-gray-500">
              {{ chatSessions.find(s => s.chatId === currentChatId)?.title || generateChatTitle() }}
            </p>
          </div>
        </div>
      </div>

      <!-- Вкладки фильтрации -->
      <div class="mb-6 border-b border-gray-200">
        <nav class="flex space-x-8" aria-label="Tabs">
          <button
            @click="selectedType = 'chat'"
            :class="[
              'flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors',
              selectedType === 'chat'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            Текст
            <span v-if="chatCounts.chat > 0" class="ml-2 py-0.5 px-2 rounded-full text-xs bg-gray-100 text-gray-600">
              {{ chatCounts.chat }}
            </span>
          </button>

          <button
            @click="selectedType = 'video'"
            :class="[
              'flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors',
              selectedType === 'video'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
            Видео
            <span v-if="chatCounts.video > 0" class="ml-2 py-0.5 px-2 rounded-full text-xs bg-gray-100 text-gray-600">
              {{ chatCounts.video }}
            </span>
          </button>

          <button
            @click="selectedType = 'audio'"
            :class="[
              'flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors',
              selectedType === 'audio'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
            </svg>
            Аудио
            <span v-if="chatCounts.audio > 0" class="ml-2 py-0.5 px-2 rounded-full text-xs bg-gray-100 text-gray-600">
              {{ chatCounts.audio }}
            </span>
          </button>

          <button
            @click="selectedType = 'image'"
            :class="[
              'flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors',
              selectedType === 'image'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            Изображения
            <span v-if="chatCounts.image > 0" class="ml-2 py-0.5 px-2 rounded-full text-xs bg-gray-100 text-gray-600">
              {{ chatCounts.image }}
            </span>
          </button>
        </nav>
      </div>

      <!-- Маленькие блоки чатов -->
      <div v-if="filteredChats.length > 0" class="flex flex-wrap gap-4 justify-center lg:justify-start">
        <ChatCard
          v-for="chat in filteredChats"
          :key="chat.id"
          :chat="chat"
          :is-fullscreen="fullscreenChatId === chat.id"
          :is-drag-over="dragOverChatId === chat.id && draggedChatId !== chat.id"
          :is-loading="loadingChats[chat.id] || false"
          @send-message="sendMessageToChat"
          @toggle-fullscreen="toggleFullscreen"
          @drag-start="handleDragStart"
          @drag-over="handleDragOver"
          @drag-leave="handleDragLeave"
          @drop="handleDrop"
          @drag-end="handleDragEnd"
        />
      </div>

      <!-- Сообщение если нет чатов -->
      <div v-else class="text-center py-12">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Нет доступных чатов</h3>
        <p class="text-sm text-gray-500">
          В категории "{{ selectedType === 'chat' ? 'Текст' : selectedType === 'video' ? 'Видео' : selectedType === 'audio' ? 'Аудио' : 'Изображения' }}" пока нет AI моделей
        </p>
      </div>

      <!-- Глобальное поле отправки всем -->
      <div 
        class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4"
        :class="{ 'border-4 border-dashed border-blue-500 bg-blue-50': isGlobalDraggingFile }"
        @dragover="handleGlobalDragOver"
        @dragleave="handleGlobalDragLeave"
        @drop="handleGlobalDrop"
      >
        <!-- Индикатор перетаскивания для глобального инпута -->
        <div 
          v-if="isGlobalDraggingFile" 
          class="absolute inset-0 flex items-center justify-center bg-blue-50 bg-opacity-95 z-50 pointer-events-none"
        >
          <div class="text-center">
            <svg class="w-20 h-20 mx-auto mb-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
            </svg>
            <p class="text-blue-600 font-semibold text-lg">Отпустите для загрузки изображения</p>
            <p class="text-blue-500 text-sm mt-1">Изображение будет отправлено всем провайдерам в категории</p>
          </div>
        </div>
        
        <div class="max-w-7xl mx-auto px-6">
          <!-- Превью загруженного изображения -->
          <div v-if="globalUploadedImageUrl" class="mb-3">
            <div class="relative inline-block">
              <img :src="globalUploadedImageUrl" alt="Uploaded" class="h-20 w-20 object-cover rounded border border-gray-300" />
              <button
                @click="removeGlobalUploadedImage"
                class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 text-sm font-bold"
                type="button"
              >
                ×
              </button>
            </div>
          </div>
          
          <form @submit.prevent="sendToAll" class="flex gap-2">
            <!-- Кнопка загрузки изображения -->
            <label class="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer flex items-center justify-center">
              <input
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleGlobalImageUpload"
                :disabled="globalLoading || globalUploadingImage || filteredChats.length === 0"
              />
              <svg v-if="!globalUploadingImage" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </label>
            
            <input
              v-model="globalMessage"
              type="text"
              :placeholder="globalInputPlaceholder"
              class="flex-1 px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              :disabled="filteredChats.length === 0"
              @keydown.enter.exact.prevent="sendToAll"
            />
            <button
              type="submit"
              class="px-6 py-3 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 flex-shrink-0"
              :disabled="!globalMessage.trim() || globalLoading || filteredChats.length === 0"
              :class="{ 'opacity-50 cursor-not-allowed': !globalMessage.trim() || globalLoading || filteredChats.length === 0 }"
            >
              <svg v-if="!globalLoading" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
              </svg>
              <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span v-if="globalLoading">Отправка...</span>
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