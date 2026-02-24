// server/api/multichat/[provider].post.ts (полный исправленный файл)

import { ChatHistory } from "~/server/lib/models/multiChat/ChatHistory";
import { GenerateReviews } from "~/server/lib/models/GenerateReviews";
import { AIKey } from "~/server/lib/models/AIKey";
import { aiModelsConfig } from "./AI"; // импортируем вашу конфигурацию
import axios from 'axios';
import { getAxiosProxy } from '~/server/utils/AI/proxy';
import crypto from 'crypto'; // для GigaChat
import { PutObjectCommand, PutObjectAclCommand, S3Client } from '@aws-sdk/client-s3';


type AIProvider = keyof typeof aiModelsConfig; // выводим типы из конфига

interface AIResponse {
  content: string;
  images?: string[];
  videoUrl?: string | string[];
  provider: string;
}


async function uploadToVKCloud(source: string, isBase64: boolean): Promise<string> {
  const config = useRuntimeConfig();
  const s3 = new S3Client({
    region: 'ru-central1',
    credentials: {
      accessKeyId: config.VK_ACCESS_KEY,
      secretAccessKey: config.VK_SECRET_KEY,
    },
    endpoint: 'https://hb.vkcs.cloud',
  });

  let imageBuffer: Buffer;
  let contentType = 'image/png';

  if (isBase64) {
    imageBuffer = Buffer.from(source, 'base64');
  } else {
    const resp = await axios.get(source, {
      responseType: 'arraybuffer',
      proxy: false,
      httpsAgent: getAxiosProxy(),
      timeout: 60000,
    });
    imageBuffer = Buffer.from(resp.data);
    contentType = resp.headers['content-type'] || 'image/webp';
  }

  const ext = contentType.includes('jpeg') || contentType.includes('jpg') ? 'jpg'
    : contentType.includes('png') ? 'png'
    : 'webp';

  const bucket = 'ozonmpportal';
  const fileName = `ai-review-photos/${crypto.randomUUID()}.${ext}`;

  await s3.send(new PutObjectCommand({ Bucket: bucket, Key: fileName, Body: imageBuffer, ContentType: contentType }));
  await s3.send(new PutObjectAclCommand({ Bucket: bucket, Key: fileName, ACL: 'public-read' }));

  return `https://hb.vkcs.cloud/${bucket}/${fileName}`;
}

// Функция для получения ключа API
async function getAIKey(provider: AIProvider): Promise<{apiKey: string, folderId: string}> {
  const record = await AIKey.findOne({ aiProvider: provider, isActive: true }).sort({ priority: 1 });
  console.log(provider)
  if (!record?.apiKey) throw new Error(`Нет активного ключа для провайдера: ${provider}`);
  return {
    apiKey: record.apiKey,
    folderId: record.folderId || 'folderId'
  };
}

// YandexGPT может требовать folderId (можно хранить в переменной окружения)
const YANDEX_FOLDER_ID = process.env.YANDEX_FOLDER_ID || '';

// --- OpenAI ---
async function callOpenAIChat(apiKey: string, messages: any[], systemPrompt: string, model: string): Promise<string> {
  const { data } = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: model, // используем переданную модель
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      max_tokens: 2000,
      temperature: 0.7,
    },
    {
      headers: { Authorization: `Bearer ${apiKey}` },
      proxy: false,
      httpsAgent: getAxiosProxy(),
      timeout: 60000,
    }
  );
  return data.choices?.[0]?.message?.content ?? '';
}

// --- Gemini ---
async function callGeminiChat(apiKey: string, messages: any[], systemPrompt: string, model: string): Promise<string> {
  const geminiMessages = messages.map((msg: any) => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));

  const { data } = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      contents: geminiMessages,
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
      },
    },
    {
      proxy: false,
      httpsAgent: getAxiosProxy(),
      timeout: 60000,
    }
  );
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

// --- DeepSeek ---
async function callDeepSeekChat(apiKey: string, messages: any[], systemPrompt: string, model: string): Promise<string> {
  const { data } = await axios.post(
    'https://api.deepseek.com/chat/completions',
    {
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      max_tokens: 2000,
      temperature: 0.7,
    },
    {
      headers: { Authorization: `Bearer ${apiKey}` },
      proxy: false,
      httpsAgent: getAxiosProxy(),
      timeout: 60000,
    }
  );
  return data.choices?.[0]?.message?.content ?? '';
}

// --- Anthropic ---
async function callAnthropicChat(apiKey: string, messages: any[], systemPrompt: string, model: string): Promise<string> {
  const anthropicMessages = messages.map((msg: any) => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content
  }));

  const { data } = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model: model,
      system: systemPrompt,
      messages: anthropicMessages,
      max_tokens: 2000,
      temperature: 0.7,
    },
    {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      proxy: false,
      httpsAgent: getAxiosProxy(),
      timeout: 60000,
    }
  );
  return data.content?.[0]?.text ?? '';
}

// --- xAI (Grok) ---
async function callXaiChat(apiKey: string, messages: any[], systemPrompt: string, model: string): Promise<string> {
  // Важно: модели Grok НЕ поддерживают параметр 'stop'!
  const requestBody = {
    model: model, // используем модель из конфига, например "grok-4"
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))
    ],
    max_tokens: 2000,
    temperature: 0.7,
    // Не включаем stop_sequence или stop
  };

  const { data } = await axios.post(
    'https://api.x.ai/v1/chat/completions',
    requestBody,
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      proxy: false,
      httpsAgent: getAxiosProxy(),
      timeout: 60000,
    }
  );
  return data.choices?.[0]?.message?.content ?? '';
}

// --- YandexGPT ---
async function callYandexGPTChat(apiKey: string, folderId: string, messages: any[], systemPrompt: string, model: string): Promise<string> {
  // Для YandexGPT необходим folderId (можно получить из переменной окружения или из другого источника)

  const yandexMessages = [
    { role: 'system', text: systemPrompt },
    ...messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      text: msg.content
    }))
  ];

  const requestBody = {
    modelUri: `gpt://${folderId}/${model}`, // например, yandexgpt-lite
    completionOptions: {
      stream: false,
      temperature: 0.7,
      maxTokens: 2000
    },
    messages: yandexMessages
  };

  const { data } = await axios.post(
    'https://llm.api.cloud.yandex.net/foundationModels/v1/completion',
    requestBody,
    {
      headers: {
        'Authorization': `Api-Key ${apiKey}`, // именно Api-Key
        'Content-Type': 'application/json'
      },
      proxy: false,
      httpsAgent: getAxiosProxy(),
      timeout: 60000,
    }
  );

  return data.result?.alternatives?.[0]?.message?.text ?? '';
}

// --- GigaChat ---
async function callGigachatChat(apiKey: string, messages: any[], systemPrompt: string, model: string): Promise<string> {
  // 1. Получаем токен доступа
  const authResponse = await axios.post(
    'https://ngw.devices.sberbank.ru:9443/api/v2/oauth',
    new URLSearchParams({ scope: 'GIGACHAT_API_PERS' }),
    {
      headers: {
        'Authorization': `Basic ${Buffer.from(apiKey + ':').toString('base64')}`,
        'RqUID': crypto.randomUUID(),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      proxy: false,
      httpsAgent: getAxiosProxy(),
    }
  );
  const accessToken = authResponse.data.access_token;

  // 2. Отправляем запрос
  const gigachatMessages = messages.map((msg: any) => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content
  }));

  const { data } = await axios.post(
    'https://gigachat.devices.sberbank.ru/api/v1/chat/completions',
    {
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...gigachatMessages
      ],
      temperature: 0.7,
      max_tokens: 2000,
    },
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      proxy: false,
      httpsAgent: getAxiosProxy(),
      timeout: 60000,
    }
  );
  return data.choices?.[0]?.message?.content ?? '';
}







async function callDALLE3(apiKey: string, prompt: string, n: number = 1, size: string = '1024x1024'): Promise<string> {
  const { data } = await axios.post(
    'https://api.openai.com/v1/images/generations',
    {
      model: 'dall-e-3',
      prompt,
      n,
      size,
    },
    {
      headers: { Authorization: `Bearer ${apiKey}` },
      proxy: false,
      httpsAgent: getAxiosProxy(),
      timeout: 120000,
    }
  );

  const url: string = data.data?.[0]?.url;
  if (!url) throw new Error('DALL-E 3 не вернул URL');
  return await uploadToVKCloud(url, false);
}

// gpt-image-1 (Sora Image) – из вашего модуля
async function callGPTImage1(apiKey: string, prompt: string, n: number = 1, size: string = '1024x1024'): Promise<string> {

  const { data } = await axios.post(
    'https://api.openai.com/v1/images/generations',
    {
      model: 'gpt-image-1',
      prompt,
      n,
      size,
    },
    {
      headers: { Authorization: `Bearer ${apiKey}` },
      proxy: false,
      httpsAgent: getAxiosProxy(),
      timeout: 120000,
    }
  );

  const b64: string = data.data?.[0]?.b64_json;
  if (!b64) throw new Error('gpt-image-1 не вернул base64');
  return await uploadToVKCloud(b64, true);
}

// Imagen 4 (из вашего модуля)
async function callImagen4(apiKey: string, prompt: string): Promise<string> {

  const { data } = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`,
    {
      instances: [{ prompt }],
      parameters: { sampleCount: 1 },
    },
    {
      proxy: false,
      httpsAgent: getAxiosProxy(),
      timeout: 120000,
    }
  );

  const b64: string = data.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) throw new Error('Imagen 4 не вернул base64');
  return await uploadToVKCloud(b64, true);
}

// Заглушка для Veo3 (видео)
async function callVeo3(apiKey: string, prompt: string): Promise<string> {
  // TODO: реализовать вызов Veo API, когда появится доступ
  throw new Error('Veo3 пока не реализован');
}





// Основная функция диспетчеризации
async function callAIProvider(
  provider: AIProvider,
  messages: any[],
  systemPrompt: string,
  model: string // передаём модель из конфига
): Promise<string> {
  const apiKey = await getAIKey(provider);

  
  switch (provider) {
    case 'openai':
      return await callOpenAIChat(apiKey.apiKey, messages, systemPrompt, model);
    case 'gemini':
      return await callGeminiChat(apiKey.apiKey, messages, systemPrompt, model);
    case 'deepseek':
      return await callDeepSeekChat(apiKey.apiKey, messages, systemPrompt, model);
    case 'anthropic':
      return await callAnthropicChat(apiKey.apiKey, messages, systemPrompt, model);
    case 'xai':
      return await callXaiChat(apiKey.apiKey, messages, systemPrompt, model);
    case 'yandexgpt':
      return await callYandexGPTChat(apiKey.apiKey, apiKey.folderId, messages, systemPrompt, model);
    case 'gigachat':
      return await callGigachatChat(apiKey.apiKey, messages, systemPrompt, model)

      case 'dalle':
        return await callDALLE3(apiKey.apiKey, messages[messages.length -1].content);
      case 'imagen':
        return await callImagen4(apiKey.apiKey, messages[messages.length -1].content);
      case 'soraImage':
        return await callGPTImage1(apiKey.apiKey, messages[messages.length -1].content);
      case 'soraVideo':
        // Пока нет реализации видео для Sora, можно использовать заглушку
        throw new Error('Sora Video пока не реализована');
      case 'veo3':
        return await callVeo3(apiKey.apiKey, messages[messages.length -1].content);
  

    default:
      throw new Error(`Провайдер ${provider} пока не поддерживается для чата`);
  }
}

export default defineEventHandler(async (event) => {
  try {
    const provider = getRouterParam(event, "provider") as AIProvider;
    if (!provider) throw createError({ statusCode: 400, message: "Provider is required" });

    const body = await readBody(event);
    const { message, systemPrompt, chatId, imageUrl } = body;
    if (!message) throw createError({ statusCode: 400, message: "message обязателен" });
    if (!chatId) throw createError({ statusCode: 400, message: "chatId обязателен" });

    const user = await getAdminEntity(event);
    if (!user || !user._id) return sendRedirect(event, "/auth", 302);

    const userId = user._id.toString();
    const defaultChatTitle = `Чат ${new Date().toLocaleDateString("ru-RU")}`;
    const chatHistory = await ChatHistory.getOrCreate(userId, provider, chatId, defaultChatTitle);

    const contentToSave = imageUrl ? `${message} <IMAGE_URL:${imageUrl}>` : message;
    await chatHistory.addMessage("user", contentToSave, imageUrl);

    const contextLimit = 10;
    const chatContext = chatHistory.getContext(contextLimit);

    let aiResponse = "";
    let success = true;
    let generationType: string | undefined;

    const providerConfig = aiModelsConfig[provider];
    if (!providerConfig) throw createError({ statusCode: 400, message: `Провайдер ${provider} не найден в конфигурации` });

    // Определяем модель (если в запросе не передана, берём дефолтную)
    const selectedModel = body.model || providerConfig.defaultModel;
    generationType = providerConfig.type;

    try {
      const messages = chatContext.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }));

      const finalSystemPrompt = typeof systemPrompt === "object"
        ? systemPrompt.prompt
        : systemPrompt || "Ты полезный ассистент. Отвечай на вопросы пользователя кратко и по делу.";

      // Вызываем нужного провайдера
      aiResponse = await callAIProvider(provider, messages, finalSystemPrompt, selectedModel);

    } catch (aiError: any) {
      console.error(`[${provider}] Error:`, aiError);
      aiResponse = `Ошибка провайдера ${provider}: ${aiError.message}`;
      success = false;
    }

    await chatHistory.addMessage("assistant", aiResponse);

    if (success) {
      let recordType: string;
      if (generationType === "image") recordType = "generatePhoto";
      else if (generationType === "video") recordType = "generateVideo";
      else recordType = "generateText";

      await GenerateReviews.create({
        user: user._id,
        summ: 0,
        status: "created",
        taskId: `${recordType}_${chatId}_${new Date().getTime()}`,
        createdDate: new Date(),
        type: recordType,
        mp: 'wildberries',
        article: 0,
      });
    }

    return {
      success,
      status: success ? "success" : "error",
      content: aiResponse,
      error: success ? null : aiResponse,
      provider,
      chatId,
      context: chatContext,
      contextInfo: {
        totalMessages: chatHistory.messages.length,
        contextUsed: chatContext.length,
        contextLimit,
      },
    };
  } catch (error: any) {
    console.error("Handler error:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Ошибка обработки запроса",
    });
  }
});