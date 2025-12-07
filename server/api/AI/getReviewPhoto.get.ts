import axios from "axios";
import { readBody } from "h3";

const HARMEX_KEY = "9efb2c5d-a7a3-48db-9a43-75d398e09b40";
const PROVIDER_BASE_URL = "http://89.208.222.84:3004";
const SYSTEM_PROMPT = `Сделай объект на фото в жизни, как будто на столе лежит для отзыва для маркетплейса, как-будто сфоткали на телефон`;

const PROVIDERS = [
  {
    name: "dalle",
    model: "dall-e-3",
  },
  {
    name: "imagen",
    model: "imagen-4.0-generate-001",
  },
  {
    name: "sora",
    model: "sora image",
  },
];

export default eventHandler(async (event) => {
  if (!PROVIDER_BASE_URL) {
    throw createError({
      statusCode: 500,
      statusMessage: "AI provider base URL is not configured",
    });
  }

  const imageUrl = "https://basket-03.wbbasket.ru/vol351/part35100/35100982/images/big/1.webp";

  // Создаем запросы ко всем провайдерам
  const requests = PROVIDERS.map(async (provider) => {
    try {
      const requestBody = {
        key: HARMEX_KEY,
        message: SYSTEM_PROMPT,
        systemPrompt: SYSTEM_PROMPT,
        provider: provider.name,
        model: provider.model,
        context: [],
        userId: "68e61fc8e93a63122d0547aa",
        generationType: "image",
        numberOfImages: 1,
        imageUrl,
      };

      console.log(`Sending request to ${provider.name}:`, requestBody);

      const response = await axios.post(
        `${PROVIDER_BASE_URL}/api/ai/${provider.name}`,
        requestBody,
        {
          timeout: 120000,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`${provider.name} response:`, response.data);

      return {
        provider: provider.name,
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error(`${provider.name} error details:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      return {
        provider: provider.name,
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  });

  // Ждем все запросы (даже если некоторые упадут)
  const results = await Promise.allSettled(requests);

  // Формируем ответ в нужном формате { imagen: 'url', sora: 'Ошибка', dalle: 'url' }
  const response: Record<string, string> = {};

  for (const result of results) {
    if (result.status === "fulfilled") {
      const providerResult = result.value;
      if (providerResult.success && "data" in providerResult) {
        // Извлекаем URL из ответа
        const photoUrl =
          providerResult.data?.url ||
          providerResult.data?.imageUrl ||
          providerResult.data;
        response[providerResult.provider] =
          typeof photoUrl === "string"
            ? photoUrl
            : JSON.stringify(providerResult.data);
      } else if ("error" in providerResult) {
        response[providerResult.provider] = `Ошибка: ${providerResult.error}`;
      }
    } else {
      // Если Promise был rejected
      console.error("Promise rejected:", result.reason);
    }
  }

  console.log("Final response:", response);

  return response;
});
