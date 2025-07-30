const config = useRuntimeConfig();
import { Buyout as wildberriesBuyout } from "~/server/lib/models/wildberries/Buyout";
import { Buyout as ozonBuyout } from "~/server/lib/models/ozon/Buyout";
import { Buyout as yandexMarketBuyout } from "~/server/lib/models/yandexMarket/Buyout";

type ResponseData = {
  openai: string;
  gemini: string;
  grok: string;
};

type ParsedItem = {
  id: number;
  name: keyof ResponseData;
  text: string;
  positive: string;
  negative: string;
};

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event);
  if (!user) return sendRedirect(event, "/auth", 302);
  const url = "http://212.233.96.77:3000/fetchResponses";

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

  // @ts-ignore
  const raw: { response: ResponseData } = await $fetch(url, {
    method: "POST",
    body: {
      name: buyout.product.name,
      user: user._id.toString(),
    },
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": config.X_API_KEY,
    },
  }).catch((error) => {
    console.log(error);
    throw createError({
      message: "Не удалось получить ответ от ИИ.",
    });
  });

  // const raw: { response: ResponseData } = {
  //   response: {
  //     openai: `...`, // сюда вставь текст
  //     gemini: `...`,
  //     grok: `...`,
  //   },
  // };

  console.log(raw);
  const format: ParsedItem[] = Object.entries(raw.response).map(
    ([name, fullText], index) => {
      const safeFullText = fullText as string;

      const [textPart, ...rest] = safeFullText.split(/\n+/);
      const restJoined = rest.join("\n");

      const positiveMatch = restJoined.match(/плюсы:\s*(.+)/i);
      const negativeMatch = restJoined.match(/минусы:\s*(.+)/i);

      return {
        id: index + 1,
        name: name as keyof ResponseData,
        text: textPart.trim(),
        positive: positiveMatch ? positiveMatch[1].trim() : "",
        negative: negativeMatch ? negativeMatch[1].trim() : "",
      };
    }
  );

  return format;
});
