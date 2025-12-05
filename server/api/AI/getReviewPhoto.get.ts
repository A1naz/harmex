import axios from "axios";
import { readBody } from "h3";

const HARMEX_KEY = "9efb2c5d-a7a3-48db-9a43-75d398e09b40";
const PROVIDER_BASE_URL = "http://89.208.222.84:3004";
const SYSTEM_PROMPT = `Сделай объект на фото в жизни, как будто на столе лежит для отзыва для маркетплейса, как-будто сфоткали на телефон`;

export default eventHandler(async (event) => {


  if (!PROVIDER_BASE_URL) {
    throw createError({
      statusCode: 500,
      statusMessage: "AI provider base URL is not configured",
    });
  }

  try {
    const response = await axios.post(
      `${PROVIDER_BASE_URL}/api/ai/dalle`,
      {
        key: HARMEX_KEY,
        message: SYSTEM_PROMPT,
        systemPrompt: SYSTEM_PROMPT,
        provider: "dalle",
        model: "dall-e-3",
        context: [],
        userId: "68e61fc8e93a63122d0547aa",
        generationType: "image",
        numberOfImages: 1,
        imageUrl: "https://basket-02.wbcontent.net/vol167/part16781/16781598/images/big/1.webp",
      },
      {
        timeout: 60000,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("dalle response", response.data);

    return {
      success: true,
      provider: "dalle",
      data: response.data,
    };
  } catch (error) {
    console.error("dalle error", error);
    throw createError({
      statusCode: 502,
      statusMessage: "Failed to generate photo",
    });
  }
});
