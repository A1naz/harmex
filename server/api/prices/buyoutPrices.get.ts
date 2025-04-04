import { DefaultPrices } from "@/server/lib/models/defaultPrices";


export default defineEventHandler(async (event) => {
  const user = await getAdminEntity(event);
  if (!user) {
    return createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const defaultPrices: any = await DefaultPrices.findOne({})
    .select("values")
    .lean();
  if (!defaultPrices) {
    return {
      minPrice: 0,
      value: 0,
      type: "price",
    };
  }



  const { mp = "wildberries" } = getQuery(event);

  if (user.MPTariffs) {
    const isTariffExist: any = user.MPTariffs.find((item: any) => item.mp === mp);
    if (isTariffExist) {
      const prices = isTariffExist.prices ? isTariffExist.prices : [];
      console.log({
        minPrice: prices.buyouts.minPrice,
        value: prices.buyouts.value,
        type: prices.buyouts.type,
      })
      return {
        minPrice: prices.buyouts.minPrice,
        value: prices.buyouts.value,
        type: prices.buyouts.type,
      };
    }
  }

  const prices = defaultPrices.values.find((item: any) => item.mp === mp);
  console.log("prices", {
    minPrice: prices.prices.buyouts.minPrice,
    value: prices.prices.buyouts.value,
    type: prices.prices.buyouts.type,
  });
  return {
    minPrice: prices.prices.buyouts.minPrice,
    value: prices.prices.buyouts.value,
    type: prices.prices.buyouts.type,
  };
});
