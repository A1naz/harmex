import { findImage, findProductCard } from "@/server/lib/helpers";
import { Buyout } from "@/server/lib/models/yandexMarket/Buyout";

const config = useRuntimeConfig();

export default eventHandler(async (event) => {
  const session = (await getAdminEntity(event)) as any;
  if (!session) return sendRedirect(event, "/auth", 302);

  const query = getQuery(event);

  const buyout = await Buyout.findOne({ uuid: query.uuid });
  if (!buyout) {
    return createError({
      statusCode: 400,
      message: "Выкуп не найден",
    });
  }

  const url = buyout?.url;
  //@ts-ignore
  const data: any = await $fetch("http://95.163.249.133:3000", {
    method: "POST",
    body: {
      type: "yandexProduct",
      url: url,
      token: config.PARSER_TOKEN,
    },
  }).catch((e) => {
    console.log(e);

    throw createError({
      statusCode: 404,
      message:
        "Не удалось получить информацию по товару. Пожалуйста, проверьте правильность введенного артикула.",
    });
  });

  if (!data) {
    return createError({
      statusCode: 400,
      message: "Товар не найден",
    });
  }
  return {
    url: data.url || "",
    image: data.image || "",
    article: data.article || "",
    name: data.name || "",
    sizes: data.sizes && data.sizes.length ? data.sizes : ["0"],
    price: data.price || 0,
    priceText: data.price ? `${data.price} ₽` : "",
    quantity: buyout.quantity,
    sex: buyout.gender,
    searchQuery: buyout.searchQuery.split(", "),
    adress: buyout.point,
    dateRange: [buyout.dateStart, buyout.dateEnd],
    selectedSize: buyout.sizeparam,
    rules: buyout.rules,
    digitalProduct: buyout.digitalProduct ? buyout.digitalProduct : false,
  };
});
