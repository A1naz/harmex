import { Schema, Document } from "mongoose";
import { MultiChatConnection } from "~/server/connections/multiChat";
import { aiModelsConfig } from "~/server/api/multichat/AI";

interface IAISettingsSchema extends Document {
  userId: string;
  selectedModels: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

const AISettingsSchema = new Schema<IAISettingsSchema>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    selectedModels: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
  }
);

const AISettingsModel = MultiChatConnection.model<IAISettingsSchema>(
  "MultiChatAISettings",
  AISettingsSchema
);

export class AISettings {
  _id: string;
  userId: string;
  selectedModels: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;

  constructor(doc: IAISettingsSchema) {
    this._id = doc._id.toString();
    this.userId = doc.userId;
    this.selectedModels = doc.selectedModels || {};
    this.createdAt = doc.createdAt;
    this.updatedAt = doc.updatedAt;
  }

  /**
   * Найти настройки по userId
   */
  static async findByUserId(userId: string): Promise<AISettings | null> {
    try {
      let settings = await AISettingsModel.findOne({ userId });

      if (!settings) {
        // Создаем настройки по умолчанию
        return await this.createDefault(userId);
      }

      return new AISettings(settings);
    } catch (error) {
      console.error("Error in findByUserId:", error);
      return null;
    }
  }

  /**
   * Создать настройки по умолчанию
   */
  static async createDefault(userId: string): Promise<AISettings> {
    const defaultModels: Record<string, string> = {};

    // Заполняем дефолтными моделями из конфига
    Object.entries(aiModelsConfig).forEach(([provider, config]) => {
      defaultModels[provider] = config.defaultModel;
    });

    const settings = await AISettingsModel.create({
      userId,
      selectedModels: defaultModels,
    });

    return new AISettings(settings);
  }

  /**
   * Обновить модель для провайдера
   */
  async updateModel(provider: string, model: string): Promise<void> {
    this.selectedModels[provider] = model;

    await AISettingsModel.updateOne(
      { _id: this._id },
      {
        $set: {
          [`selectedModels.${provider}`]: model,
          updatedAt: new Date(),
        },
      }
    );
  }

  /**
   * Обновить несколько моделей
   */
  async updateModels(models: Record<string, string>): Promise<void> {
    this.selectedModels = { ...this.selectedModels, ...models };

    await AISettingsModel.updateOne(
      { _id: this._id },
      {
        $set: {
          selectedModels: this.selectedModels,
          updatedAt: new Date(),
        },
      }
    );
  }

  /**
   * Получить модель для провайдера
   */
  getModelForProvider(provider: string): string {
    return (
      this.selectedModels[provider] ||
      aiModelsConfig[provider as keyof typeof aiModelsConfig]?.defaultModel ||
      provider
    );
  }

  /**
   * Сбросить настройки к дефолтным
   */
  async resetToDefaults(): Promise<void> {
    const defaultModels: Record<string, string> = {};

    Object.entries(aiModelsConfig).forEach(([provider, config]) => {
      defaultModels[provider] = config.defaultModel;
    });

    this.selectedModels = defaultModels;

    await AISettingsModel.updateOne(
      { _id: this._id },
      {
        $set: {
          selectedModels: defaultModels,
          updatedAt: new Date(),
        },
      }
    );
  }
}

