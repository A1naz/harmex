import axios from "axios";
import https from "https";
const config = useRuntimeConfig();
import { Buyout as wildberriesBuyout } from "~/server/lib/models/wildberries/Buyout";
import { Buyout as ozonBuyout } from "~/server/lib/models/ozon/Buyout";
import { Buyout as yandexMarketBuyout } from "~/server/lib/models/yandexMarket/Buyout";
import { GenerateReviews } from "~/server/lib/models/GenerateReviews";
const NEUROTASK_KEY = config.NEUROTASK_KEY;

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

  // let buyout: any = null;
  // if (mp === "wildberries") {
  //   buyout = await wildberriesBuyout.findOne({ uuid: buyoutUuid });
  // } else if (mp === "ozon") {
  //   buyout = await ozonBuyout.findOne({ uuid: buyoutUuid });
  // } else if (mp === "ym") {
  //   buyout = await yandexMarketBuyout.findOne({ uuid: buyoutUuid });
  // }

  // if (!buyout) {
  //   throw createError({
  //     statusCode: 404,
  //     statusMessage: "Buyout not found",
  //   });
  // }
  
const format = "https://sccr.storage.yandexcloud.net/neurotask/dalle/1764078312954-dalle-image.png"
  return format;
});
