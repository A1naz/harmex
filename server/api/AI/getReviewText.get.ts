import axios from "axios";
import https from "https";
const config = useRuntimeConfig();
import { Buyout as wildberriesBuyout } from "~/server/lib/models/wildberries/Buyout";
import { Buyout as ozonBuyout } from "~/server/lib/models/ozon/Buyout";
import { Buyout as yandexMarketBuyout } from "~/server/lib/models/yandexMarket/Buyout";
const NEUROTASK_KEY = config.NEUROTASK_KEY;

type ReviewProvider = "openai" | "gemini" | "deepseek";

type Review = {
  content: string;
  provider: ReviewProvider;
};

type ApiResponse = {
  reviews: Review[];
};

type ParsedItem = {
  id: number;
  name: ReviewProvider;
  text: string;
  positive: string;
  negative: string;
};

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event);
  if (!user) return sendRedirect(event, "/auth", 302);
  const url = "https://neurotask.ru/api/harmex/review-text";

  const { mp, buyoutUuid } = getQuery(event);

  let buyout: any = null;
  if (mp === "wildberries") {
    buyout = await wildberriesBuyout.findOne({ uuid: buyoutUuid });
  } else if (mp === "ozon") {
    buyout = await ozonBuyout.findOne({ uuid: buyoutUuid });
  } else if (mp === "yandexMarket") {
    buyout = await yandexMarketBuyout.findOne({ uuid: buyoutUuid });
  }

  if (!buyout) {
    throw createError({
      statusCode: 404,
      statusMessage: "Buyout not found",
    });
  }

  const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
  });

  let raw: ApiResponse;
  try {
    const response = await axios.get<ApiResponse>(url, {
      params: {
        key: NEUROTASK_KEY as string,
        productName: buyout.product.name,
      },
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": config.X_API_KEY as string,
      },
      httpsAgent,
    });
    raw = response.data;
  } catch (error) {
    console.log("Не удалось получить ответ от ИИ.", error);
    throw createError({
      message: "Не удалось получить ответ от ИИ.",
    });
  }

  // const raw: { response: ResponseData } = {
  //   response: {
  //     openai: `...`, // сюда вставь текст
  //     gemini: `...`,
  //     grok: `...`,
  //   },
  // };

  console.log(raw);
  const format: ParsedItem[] = raw.reviews.map(
    (review: Review, index: number): ParsedItem => {
      const safeFullText = review.content;

      const [textPart, ...rest] = safeFullText.split(/\n+/);
      const restJoined = rest.join("\n");

      const positiveMatch = restJoined.match(/плюсы:\s*(.+)/i);
      const negativeMatch = restJoined.match(/минусы:\s*(.+)/i);

      return {
        id: index + 1,
        name: review.provider,
        text: textPart.trim(),
        positive: positiveMatch ? positiveMatch[1].trim() : "",
        negative: negativeMatch ? negativeMatch[1].trim() : "",
      };
    }
  );

  return format;
});
