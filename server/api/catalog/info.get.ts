import { Service } from "~/server/lib/models/Service";
import { DefaultPrices } from "~/server/lib/models/defaultPrices";

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event);

  const { slug } = getQuery(event);
  if (!slug)
    throw createError({ statusCode: 400, statusMessage: "Missing slug" });

  const service = await Service.findOne({ slug }).select("-_id -__v");

  if (!service)
    throw createError({ statusCode: 404, statusMessage: "Service not found" });
  try {
    if (user && user.MPTariffs) {
      const isTariffExist: any = user.MPTariffs.find(
        (item: any) => item.mp === service.slug
      );

      if (isTariffExist) {

        const prices = isTariffExist.prices ? isTariffExist.prices : [];
        service.items.forEach((item: any) => {
          // Убираем query параметры из slug (например, "reviews?pvz=true" -> "reviews")
          const cleanSlug = item.slug ? item.slug.split('?')[0] : null;
          const cleanPath = item.path ? item.path.split('?')[0] : null;
          
          const searchPhrase = cleanSlug
            ? cleanSlug == "reviews"
              ? "review"
              : cleanSlug
            : cleanPath === "/reviews" ? "review" : cleanPath ? cleanPath.replace("/", "") : "";

          const isItemPrice =
            prices[searchPhrase];

          if (isItemPrice) {
            item.priceText =
              isItemPrice.type && isItemPrice.type === "percent"
                ? `${isItemPrice.value} %`
                : `${isItemPrice.value} ₽`;
          }
        });
      } else if (!isTariffExist) {
        const prices: any = await DefaultPrices.findOne({});

        if (!prices) {
          return {
            status: "ok",
            service,
          };
        
        }
    

        const mpPrices = prices.values.find(
          (item: any) => item.mp === service.slug
        );
        if (!mpPrices) {
          return {
            status: "ok",
            service,
          };
        }

        service.items.forEach((item: any) => {
          const cleanSlug = item.slug ? item.slug.split('?')[0] : null;
          const cleanPath = item.path ? item.path.split('?')[0] : null;

          const searchPhrase = cleanSlug
            ? cleanSlug === "reviews"
              ? "review"
              : cleanSlug
            : cleanPath === "/reviews" ? "review" : cleanPath ? cleanPath.replace("/", "") : "";

          const isItemPrice = mpPrices.prices[searchPhrase];
          if (isItemPrice) {
            item.priceText =
              isItemPrice.type && isItemPrice.type === "percent"
                ? `${isItemPrice.value} %`
                : `${isItemPrice.value} ₽`;
          }
        });
      }
    }
  } catch (error) {
    console.log(error);
  }

  return {
    status: "ok",
    service,
  };
});
