import { Schema, model, Document } from "mongoose";
import { MultiChatConnection } from "~/server/connections/multiChat";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  timestamp: Date;
}

interface IChatHistorySchema extends Document {
  userId: string;
  provider: string;
  chatId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema({
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  imageUrl: { type: String, required: false },
  timestamp: { type: Date, default: Date.now },
});

const ChatHistorySchema = new Schema<IChatHistorySchema>(
  {
    userId: { type: String, required: true, index: true },
    provider: { type: String, required: true, index: true },
    chatId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    messages: { type: [ChatMessageSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

// Составной индекс для быстрого поиска
ChatHistorySchema.index({ userId: 1, provider: 1, chatId: 1 }, { unique: true });

const ChatHistoryModel = MultiChatConnection.model<IChatHistorySchema>(
  "MultiChatHistory",
  ChatHistorySchema
);

export class ChatHistory {
  _id: string;
  userId: string;
  provider: string;
  chatId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;

  constructor(doc: IChatHistorySchema) {
    this._id = doc._id.toString();
    this.userId = doc.userId;
    this.provider = doc.provider;
    this.chatId = doc.chatId;
    this.title = doc.title;
    this.messages = doc.messages || [];
    this.createdAt = doc.createdAt;
    this.updatedAt = doc.updatedAt;
  }

  /**
   * Получить или создать историю чата
   */
  static async getOrCreate(
    userId: string,
    provider: string,
    chatId: string,
    title: string
  ): Promise<ChatHistory> {
    try {
      // Пытаемся найти существующий чат
      let chat = await ChatHistoryModel.findOne({
        userId,
        provider,
        chatId,
      });

      // Если не найден, создаем новый
      if (!chat) {
        chat = await ChatHistoryModel.create({
          userId,
          provider,
          chatId,
          title,
          messages: [],
        });
      }

      return new ChatHistory(chat);
    } catch (error) {
      console.error("Error in getOrCreate:", error);
      throw error;
    }
  }

  /**
   * Добавить сообщение в историю
   */
  async addMessage(
    role: "user" | "assistant",
    content: string,
    imageUrl?: string
  ): Promise<void> {
    const newMessage: ChatMessage = {
      role,
      content,
      imageUrl,
      timestamp: new Date(),
    };

    this.messages.push(newMessage);

    await ChatHistoryModel.updateOne(
      { _id: this._id },
      {
        $push: { messages: newMessage },
        $set: { updatedAt: new Date() },
      }
    );
  }

  /**
   * Получить контекст для AI (последние N сообщений)
   */
  getContext(limit: number = 10): ChatMessage[] {
    return this.messages.slice(-limit);
  }

  /**
   * Получить все чаты пользователя
   */
  static async getUserChats(userId: string): Promise<ChatHistory[]> {
    const chats = await ChatHistoryModel.find({ userId }).sort({
      updatedAt: -1,
    });

    return chats.map((chat) => new ChatHistory(chat));
  }

  /**
   * Получить чаты пользователя по провайдеру
   */
  static async getUserChatsByProvider(
    userId: string,
    provider: string
  ): Promise<ChatHistory[]> {
    const chats = await ChatHistoryModel.find({ userId, provider }).sort({
      updatedAt: -1,
    });

    return chats.map((chat) => new ChatHistory(chat));
  }

  /**
   * Удалить чат
   */
  static async delete(chatId: string, userId: string): Promise<void> {
    await ChatHistoryModel.deleteMany({
      chatId,
      userId,
    });
  }

  /**
   * Очистить историю сообщений чата
   */
  async clearMessages(): Promise<void> {
    this.messages = [];
    await ChatHistoryModel.updateOne(
      { _id: this._id },
      {
        $set: { messages: [], updatedAt: new Date() },
      }
    );
  }
}

