import { ChatHistory } from "~/server/lib/models/multiChat/ChatHistory";
import { aiModelsConfig } from "./AI";
import { GenerateReviews } from "~/server/lib/models/GenerateReviews";

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

    if (!chatId) {
      throw createError({
        statusCode: 400,
        message: "chatId обязателен",
      });
    }

    // Получаем пользователя
    const user = await getAdminEntity(event);
    if (!user || !user._id) return sendRedirect(event, "/auth", 302);

    const userId = user._id.toString(); // Преобразуем в строку для getOrCreate

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
    let generationType: string | undefined;

    try {
      // Получаем конфигурацию провайдера
      const config = useRuntimeConfig();

      // Определяем URL сервиса провайдера
      const providerUrls: Record<string, string> = {
        openai: 'http://89.208.222.84:3004',
        gemini:'http://89.208.222.84:3004',
        anthropic:'http://89.208.222.84:3004',
        xai:'http://89.208.222.84:3004',
        yandexgpt:'http://89.208.222.84:3004',
        gigachat:'http://89.208.222.84:3004',
        deepseek:'http://89.208.222.84:3004',
        veo3:'http://89.208.222.84:3004',
        imagen:'http://89.208.222.84:3004',
        dalle:'http://89.208.222.84:3004',
        soraImage:'http://89.208.222.84:3004',
        soraVideo:'http://89.208.222.84:3004',
      };

      const providerUrl = providerUrls[provider] || "";

      if (!providerUrl) {
        aiResponse = `Провайдер ${provider} не настроен. Отсутствует переменная окружения ${provider.toUpperCase()}_SERVICE_URL`;
        success = false;
      } else {
        // Получаем дефолтную модель из конфига
        const providerConfig =
          aiModelsConfig[provider as keyof typeof aiModelsConfig];
        const selectedModel = providerConfig?.defaultModel || provider;

        // Определяем тип генерации
        generationType = providerConfig?.type;
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
          userId: "68e61fc8e93a63122d0547aa",
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
        const response = await fetch(
          `${providerUrl}/api/ai/${actualProvider}`,
          {
            method: "POST",
            body: JSON.stringify(requestBody),
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        console.log(response)
        const aiResponseData = await response.json();

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
      aiResponse = `Ошибка связи с провайдером ${provider}: ${
        aiError.message || aiError
      }`;
      success = false;
    }

    // Добавляем ответ AI в историю
    await chatHistory.addMessage("assistant", aiResponse);

    // Создаем запись GenerateReviews при успешном ответе
    if (success) {
      let recordType: string;
      
      if (generationType === "image") {
        recordType = "generatePhoto";
      } else if (generationType === "video") {
        recordType = "generateVideo";
      } else {
        recordType = "generateText";
      }

      await GenerateReviews.create({
        user: user._id,
        summ: 0,
        status: "created",
        taskId: `${recordType}_${chatId}_${new Date().getTime()}`,
        createdDate: new Date(),
        type: recordType,
        mp: 'wildberries',
        article: 0, // Сохраняем начало сообщения как артикул
      });
    }

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
