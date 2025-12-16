import { ChatHistory } from "~/server/lib/models/multiChat/ChatHistory";
import { AISettings } from "~/server/lib/models/multiChat/AISettings";
import { aiModelsConfig } from "./AI";

export default defineEventHandler(async (event) => {
  try {
    // Получаем provider из параметров URL
    let provider = getRouterParam(event, "provider");

    if (!provider) {
      throw createError({
        statusCode: 400,
        message: "Provider parameter is required",
      });
    }

    // Получаем данные из тела запроса
    const body = await readBody(event);
    const { message, systemPrompt, chatId, imageUrl } = body;

    // Валидация обязательных полей
    if (!message) {
      throw createError({
        statusCode: 400,
        message: "message обязателен",
      });
    }

    // Получаем userId из заголовков или сессии
    const userId = getHeader(event, "x-user-id") || event.context.user?.id;

    if (!userId) {
      throw createError({
        statusCode: 400,
        message: "x-user-id заголовок обязателен",
      });
    }

    if (!chatId) {
      throw createError({
        statusCode: 400,
        message: "chatId обязателен",
      });
    }

    console.log("🔍 provider", provider);
    console.log("🔍 chatId", chatId);

    // Создаем или получаем историю чата
    const defaultChatTitle = `Чат ${new Date().toLocaleDateString("ru-RU")}`;
    const chatHistory = await ChatHistory.getOrCreate(
      userId,
      provider,
      chatId,
      defaultChatTitle
    );

    // Добавляем сообщение пользователя в историю
    const contentToSave = imageUrl
      ? `${message} <IMAGE_URL:${imageUrl}>`
      : message;
    
    console.log("🔍 contentToSave", contentToSave);
    console.log("🔍 imageUrl", imageUrl);
    
    await chatHistory.addMessage("user", contentToSave, imageUrl);

    // Получаем контекст из истории чата
    const contextLimit = 10;
    const chatContext = chatHistory.getContext(contextLimit);

    // Переменные для ответа AI
    let aiResponse = "";
    let success = true;

    try {
      // Получаем конфигурацию провайдера
      const config = useRuntimeConfig();

      // Определяем URL сервиса провайдера
      const providerUrls: Record<string, string | undefined> = {
        openai: config.public.OPENAI_SERVICE_URL || config.OPENAI_SERVICE_URL,
        gemini: config.public.GEMINI_SERVICE_URL || config.GEMINI_SERVICE_URL,
        anthropic: config.public.ANTHROPIC_SERVICE_URL || config.ANTHROPIC_SERVICE_URL,
        xai: config.public.XAI_SERVICE_URL || config.XAI_SERVICE_URL,
        yandexgpt: config.public.YANDEXGPT_SERVICE_URL || config.YANDEXGPT_SERVICE_URL,
        gigachat: config.public.GIGACHAT_SERVICE_URL || config.GIGACHAT_SERVICE_URL,
        deepseek: config.public.DEEPSEEK_SERVICE_URL || config.DEEPSEEK_SERVICE_URL,
        veo3: config.public.GEMINI_SERVICE_URL || config.GEMINI_SERVICE_URL,
        imagen: config.public.GEMINI_SERVICE_URL || config.GEMINI_SERVICE_URL,
        dalle: config.public.OPENAI_SERVICE_URL || config.OPENAI_SERVICE_URL,
        soraImage: config.public.OPENAI_SERVICE_URL || config.OPENAI_SERVICE_URL,
        soraVideo: config.public.OPENAI_SERVICE_URL || config.OPENAI_SERVICE_URL,
      };

      const providerUrl = providerUrls[provider];

      if (!providerUrl) {
        aiResponse = `Провайдер ${provider} не настроен. Отсутствует переменная окружения ${provider.toUpperCase()}_SERVICE_URL`;
        success = false;
      } else {
        // Получаем настройки AI для пользователя
        const aiSettings = await AISettings.findByUserId(userId);

        // Получаем модель из настроек или используем дефолтную
        const providerConfig = aiModelsConfig[provider as keyof typeof aiModelsConfig];
        let selectedModel = aiSettings?.getModelForProvider(provider) || providerConfig?.defaultModel || provider;

        // Определяем тип генерации
        let generationType: string | undefined = providerConfig?.type;
        let actualProvider = provider;

        // Обработка sora вариантов
        if (provider === "soraVideo") {
          actualProvider = "sora";
          generationType = "video";
        }
        if (provider === "soraImage") {
          actualProvider = "sora";
          generationType = "image";
        }

        console.log("🔍 generationType", generationType);
        console.log("🔍 actualProvider", actualProvider);
        console.log("🔍 selectedModel", selectedModel);

        // Формируем тело запроса к AI провайдеру
        const requestBody: Record<string, any> = {
          message: message,
          systemPrompt:
            typeof systemPrompt === "object"
              ? systemPrompt.prompt
              : systemPrompt ||
                "Ты полезный ассистент. Отвечай на вопросы пользователя кратко и по делу.",
          provider: actualProvider,
          model: selectedModel,
          context: chatContext,
          userId: userId,
          numberOfImages: 1,
        };

        // Добавляем generationType если есть
        if (generationType) {
          requestBody.generationType = generationType;
        }

        // Добавляем imageUrl для определенных провайдеров
        if (
          imageUrl &&
          (actualProvider === "veo3" ||
            actualProvider === "imagen" ||
            actualProvider === "sora" ||
            actualProvider === "dalle")
        ) {
          requestBody.imageUrl = imageUrl;
        }

        // Отправляем запрос к AI провайдеру
        const aiResponseData = await $fetch<any>(
          `${providerUrl}/api/ai/${actualProvider}`,
          {
            method: "POST",
            body: requestBody,
            timeout: 200000,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (aiResponseData?.success) {
          console.log("🔍 aiResponseData", aiResponseData);
          let contentToSend;

          // Обработка различных типов ответов
          if (
            aiResponseData.provider === "imagen" ||
            (aiResponseData.provider === "dalle" &&
              Array.isArray(aiResponseData.images) &&
              aiResponseData.images.length > 0)
          ) {
            contentToSend = aiResponseData.images.join("\n");
          } else if (
            aiResponseData.provider === "veo3" &&
            aiResponseData.videoUrl
          ) {
            contentToSend = Array.isArray(aiResponseData.videoUrl)
              ? aiResponseData.videoUrl.join("\n")
              : aiResponseData.videoUrl;
          } else if (
            aiResponseData.provider === "sora" &&
            aiResponseData.videoUrl &&
            Array.isArray(aiResponseData.videoUrl) &&
            aiResponseData.videoUrl.length > 0
          ) {
            contentToSend = aiResponseData.videoUrl.join("\n");
          } else {
            contentToSend =
              aiResponseData.content ||
              aiResponseData.response ||
              aiResponseData?.message ||
              "Неизвестная ошибка";
          }

          aiResponse = contentToSend;
        } else {
          aiResponse = `Ошибка от провайдера ${provider}: ${
            aiResponseData?.message || "Неизвестная ошибка"
          }`;
          success = false;
        }
      }
    } catch (aiError: any) {
      console.error("🔍 aiError", aiError);
      aiResponse = `Ошибка связи с провайдером ${provider}: ${aiError.message || aiError}`;
      success = false;
    }

    // Добавляем ответ AI в историю
    await chatHistory.addMessage("assistant", aiResponse);

    // Возвращаем ответ
    return {
      success: success,
      status: success ? "success" : "error",
      content: aiResponse,
      error: success ? null : aiResponse,
      provider: provider,
      chatId: chatId,
      context: chatContext,
      contextInfo: {
        totalMessages: chatHistory.messages.length,
        contextUsed: chatContext.length,
        contextLimit: contextLimit,
      },
    };
  } catch (error: any) {
    console.error("🔍 error", error);
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Ошибка отправки сообщения провайдеру",
    });
  }
});

