import { Schema, model, Document, Model } from 'mongoose'

// Интерфейс для сообщения
export interface IChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  imageUrl?: string;
  timestamp: Date;
}

// Интерфейс для документа
export interface IChatHistory extends Document {
  userId: Schema.Types.ObjectId;
  chatId: string;
  chatTitle: string;
  provider: string;
  messages: IChatMessage[];
  systemPrompt: string;
  lastActivity: Date;
  
  // Методы экземпляра
  addMessage(role: string, content: string, imageUrl?: string | null): Promise<this>;
  clearHistory(): Promise<this>;
  getContext(limit?: number): IChatMessage[];
}

// Интерфейс для статических методов модели
export interface IChatHistoryModel extends Model<IChatHistory> {
  getOrCreate(
    userId: string,
    provider: string,
    chatId: string,
    defaultChatTitle: string
  ): Promise<IChatHistory>;
  findByUser(userId: string): Promise<IChatHistory[]>;
  findByProvider(provider: string): Promise<IChatHistory[]>;
}

const chatHistorySchema = new Schema<IChatHistory, IChatHistoryModel>(
  {
    // ID пользователя
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ID чата
    chatId: {
      type: String,
      required: true,
      index: true,
    },

    // Заголовок чата
    chatTitle: {
      type: String,
      required: true,
    },

    // Провайдер AI
    provider: {
      type: String,
      required: true,
      enum: [
        "openai",
        "gemini",
        "anthropic",
        "xai",
        "yandexgpt",
        "gigachat",
        "mistral",
        "cohere",
        "huggingface",
        "replicate",
        "deepseek",
        "veo3",
        "imagen",
        "dalle",
        "stable-diffusion",
        "firefly",
        "leonardo",
        "midjourney",
        "mubert",
        "runway",
        "pika",
        "sora",
        "soraVideo",
        "soraImage",
      ],
      index: true,
    },

    // Сообщения в чате
    messages: [
      {
        role: {
          type: String,
          enum: ["user", "assistant", "system"],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        imageUrl: {
          type: String,
          required: false,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Системный промпт
    systemPrompt: {
      type: String,
      default:
        "Ты полезный ассистент. Отвечай на вопросы пользователя кратко и по делу.",
    },

    // Последняя активность
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Индексы
chatHistorySchema.index({ userId: 1, provider: 1 });
chatHistorySchema.index(
  { userId: 1, chatId: 1, provider: 1 },
  { unique: true }
);
chatHistorySchema.index({ lastActivity: -1 });

// Метод для добавления сообщения
chatHistorySchema.methods.addMessage = function (
  role: string,
  content: string,
  imageUrl: string | null = null
) {
  this.messages.push({
    role,
    content,
    ...(imageUrl && { imageUrl }),
    timestamp: new Date(),
  });
  this.lastActivity = new Date();
  return this.save();
};

// Метод для очистки истории
chatHistorySchema.methods.clearHistory = function () {
  this.messages = [];
  this.lastActivity = new Date();
  return this.save();
};

// Метод для получения контекста (последние N сообщений)
chatHistorySchema.methods.getContext = function (limit = 10) {
  return this.messages.slice(-limit);
};

// Статический метод для поиска или создания истории чата
chatHistorySchema.statics.getOrCreate = async function (
  userId: string,
  provider: string,
  chatId: string,
  defaultChatTitle: string
) {
  const chatTitleToUse = defaultChatTitle;

  return this.findOneAndUpdate(
    { userId, provider, chatId },
    { userId, provider, chatId, chatTitle: chatTitleToUse },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

// Статический метод для поиска истории пользователя
chatHistorySchema.statics.findByUser = function (userId: string) {
  return this.find({ userId }).sort({ lastActivity: -1 });
};

// Статический метод для поиска истории по провайдеру
chatHistorySchema.statics.findByProvider = function (provider: string) {
  return this.find({ provider }).sort({ lastActivity: -1 });
};

export const ChatHistory = model<IChatHistory, IChatHistoryModel>(
  "ChatHistory",
  chatHistorySchema
);

