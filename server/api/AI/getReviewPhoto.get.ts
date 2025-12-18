import axios from "axios";
import { readBody } from "h3";
import { Buyout as wildberriesBuyout } from "~/server/lib/models/wildberries/Buyout";
import { Buyout as ozonBuyout } from "~/server/lib/models/ozon/Buyout";
import { Buyout as yandexMarketBuyout } from "~/server/lib/models/yandexMarket/Buyout";
import { Buyout as avitoBuyout } from "~/server/lib/models/avito/Buyout";
import { Buyout as goldAppleBuyout } from "~/server/lib/models/goldApple/Buyout";
import { Buyout as flowwowBuyout } from "~/server/lib/models/flowwow/Buyout";
import { Buyout as ozonHotelsBuyout } from "~/server/lib/models/ozonHotels/Buyout";
import { Buyout as sutochnoBuyout } from "~/server/lib/models/sutochno/Buyout";
import {
  PutObjectCommand,
  PutObjectAclCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import crypto from "crypto";
const HARMEX_KEY = "9efb2c5d-a7a3-48db-9a43-75d398e09b40";
const PROVIDER_BASE_URL = "http://89.208.222.84:3004";
const SYSTEM_PROMPT = `Сгенерируй фотографию товара для отзыва на Wildberries. Фото должно выглядеть максимально естественно, словно сделано на обычный телефон, без признаков AI-генерации. Покажи товар в повседневной обстановке, возможно, на столе или в руках, при естественном освещении. Избегай водяных знаков и излишних надписей. Цель – фото, которое органично впишется в раздел отзывов`;
import { GenerateReviews } from "~/server/lib/models/GenerateReviews";

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

// Функция для загрузки изображения в VK Cloud и получения публичной ссылки
async function uploadImageToVKCloud(imageUrl: string): Promise<string> {
  const config = useRuntimeConfig();

  const s3 = new S3Client({
    region: "ru-central1",
    credentials: {
      accessKeyId: config.VK_ACCESS_KEY,
      secretAccessKey: config.VK_SECRET_KEY,
    },
    endpoint: "https://hb.vkcs.cloud",
  });

  const bucket = "ozonmpportal";

  try {
    // Скачиваем изображение
    const imageResponse = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });

    const imageBuffer = Buffer.from(imageResponse.data);

    // Определяем расширение файла
    const contentType = imageResponse.headers["content-type"] || "image/webp";
    let extension = "webp";
    if (contentType.includes("jpeg") || contentType.includes("jpg")) {
      extension = "jpg";
    } else if (contentType.includes("png")) {
      extension = "png";
    }

    // Генерируем уникальное имя файла
    const fileName = `ai-review-photos/${crypto.randomUUID()}.${extension}`;

    // Загружаем файл в S3
    const putObjectCommand = new PutObjectCommand({
      Bucket: bucket,
      Key: fileName,
      Body: imageBuffer,
      ContentType: contentType,
    });

    await s3.send(putObjectCommand);

    // Делаем файл публичным
    const putAclCommand = new PutObjectAclCommand({
      Bucket: bucket,
      Key: fileName,
      ACL: "public-read",
    });

    await s3.send(putAclCommand);

    // Возвращаем публичный URL
    const publicUrl = `https://hb.vkcs.cloud/${bucket}/${fileName}`;

    console.log(`Image uploaded to VK Cloud: ${publicUrl}`);

    return publicUrl;
  } catch (error: any) {
    console.error("Error uploading image to VK Cloud:", error);
    throw new Error(`Failed to upload image to VK Cloud: ${error.message}`);
  }
}

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event);
  if (!user || !user._id) return sendRedirect(event, "/auth", 302);

  if (!PROVIDER_BASE_URL) {
    throw createError({
      statusCode: 500,
      statusMessage: "AI provider base URL is not configured",
    });
  }

  const { mp, buyoutUuid } = getQuery(event);

  let imageUrl = "";
  let imageUrlVKCloud = "";
  let buyout = null;

  // Определяем модель в зависимости от маркетплейса
  switch (mp) {
    case "wildberries":
      buyout = await wildberriesBuyout.findOne({ uuid: buyoutUuid }).lean();
      break;
    case "ozon":
      buyout = await ozonBuyout.findOne({ uuid: buyoutUuid }).lean();
      break;
    case "yandexMarket":
      buyout = await yandexMarketBuyout.findOne({ uuid: buyoutUuid }).lean();
      break;
    case "avito":
      buyout = await avitoBuyout.findOne({ uuid: buyoutUuid }).lean();
      break;
    case "goldApple":
      buyout = await goldAppleBuyout.findOne({ uuid: buyoutUuid }).lean();
      break;
    case "flowwow":
      buyout = await flowwowBuyout.findOne({ uuid: buyoutUuid }).lean();
      break;
    case "ozonHotels":
      buyout = await ozonHotelsBuyout.findOne({ uuid: buyoutUuid }).lean();
      break;
    case "sutochno":
      buyout = await sutochnoBuyout.findOne({ uuid: buyoutUuid }).lean();
      break;
    default:
      throw createError({
        statusCode: 400,
        statusMessage: "Marketplace not supported",
      });
  }

  if (buyout && buyout.product && buyout.product.image) {
    imageUrl = buyout.product.image;
    // Загружаем изображение в VK Cloud и получаем публичную ссылку
    imageUrlVKCloud = await uploadImageToVKCloud(imageUrl);
  } else {
    throw createError({
      statusCode: 404,
      statusMessage: "Buyout or product image not found",
    });
  }

  if (!imageUrlVKCloud) {
    throw createError({
      statusCode: 404,
      statusMessage: "Product image not found",
    });
  }

  console.log("Original image URL:", imageUrl);
  console.log("VK Cloud image URL:", imageUrlVKCloud);
  console.log(buyoutUuid);

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
        imageUrl: imageUrlVKCloud, // Используем ссылку из VK Cloud
      };

      console.log(`Sending request to ${provider.name}:`, requestBody);
      console.log(requestBody);
      const response = await axios.post(
        `${PROVIDER_BASE_URL}/api/ai/${provider.name}`,
        requestBody,
        {
          timeout: 600000,
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
        let photoUrl =
          providerResult.data?.url ||
          providerResult.data?.imageUrl ||
          providerResult.data;

        // Проверяем на videoUrl (для sora и подобных)
        if (providerResult.data?.videoUrl) {
          // Если videoUrl - массив, берем первый элемент
          photoUrl = Array.isArray(providerResult.data.videoUrl)
            ? providerResult.data.videoUrl[0]
            : providerResult.data.videoUrl;
        }

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

  let hasSuccessfulResponse = false;
  for (const result of results) {
    if (result.status === "fulfilled" && result.value.success && result.value.data) {
      const photoUrl = result.value.data?.url || result.value.data?.imageUrl || result.value.data;
      if (typeof photoUrl === "string" && photoUrl) {
        hasSuccessfulResponse = true;
        break;
      }
    }
  }

  if (hasSuccessfulResponse) {
    await GenerateReviews.create({
      user: user._id,
      summ: 30,
      status: "created",
      taskId: `Генерация фото для отзыва ` + buyout.uuid,
      createdDate: new Date(),
      type: "generatePhoto",
      mp: "wildberries",
      article: buyout.article,
    });
  }

  return response;
});
