import { AIKey } from '~/server/lib/models/AIKey'
import { aiModelsConfig } from '~/server/api/multichat/AI'
import {
  callOpenAIChat,
  callGeminiChat,
  callDeepSeekChat,
  callAnthropicChat,
  callXaiChat,
  callYandexGPTChat,
  callGigachatChat,
} from './chatProviders'
import {
  callDALLE3,
  callGPTImage1,
  callImagen4,
  callVeo3,
} from './imageProviders'

export type AIProvider = keyof typeof aiModelsConfig

async function getAIKey(provider: AIProvider): Promise<{ apiKey: string; folderId: string }> {
  const record = await AIKey.findOne({ aiProvider: provider, isActive: true }).sort({ priority: 1 })
  if (!record?.apiKey) throw new Error(`Нет активного ключа для провайдера: ${provider}`)
  return {
    apiKey: record.apiKey,
    folderId: record.folderId || '',
  }
}

export async function callAIProvider(
  provider: AIProvider,
  messages: any[],
  systemPrompt: string,
  model: string
): Promise<string> {
  const { apiKey, folderId } = await getAIKey(provider)
  const lastPrompt = messages[messages.length - 1]?.content ?? ''

  switch (provider) {
    case 'openai':
      return callOpenAIChat(apiKey, messages, systemPrompt, model)
    case 'gemini':
      return callGeminiChat(apiKey, messages, systemPrompt, model)
    case 'deepseek':
      return callDeepSeekChat(apiKey, messages, systemPrompt, model)
    case 'anthropic':
      return callAnthropicChat(apiKey, messages, systemPrompt, model)
    case 'xai':
      return callXaiChat(apiKey, messages, systemPrompt, model)
    case 'yandexgpt':
      return callYandexGPTChat(apiKey, folderId, messages, systemPrompt, model)
    case 'gigachat':
      return callGigachatChat(apiKey, messages, systemPrompt, model)
    case 'dalle':
      return callDALLE3(apiKey, lastPrompt)
    case 'imagen':
      return callImagen4(apiKey, lastPrompt)
    case 'soraImage':
      return callGPTImage1(apiKey, lastPrompt)
    case 'soraVideo':
      throw new Error('Sora Video пока не реализована')
    case 'veo3':
      return callVeo3(apiKey, lastPrompt)
    default:
      throw new Error(`Провайдер ${provider} пока не поддерживается`)
  }
}
