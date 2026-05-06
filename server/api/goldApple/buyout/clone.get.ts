import { findImage, findProductCard } from "@/server/lib/helpers";
import { Buyout } from "@/server/lib/models/goldApple/Buyout";
const config = useRuntimeConfig();

export default eventHandler(async (event) => {
  const session = (await getAdminEntity(event)) as any;
  if (!session) return sendRedirect(event, "/auth", 302);

  const query = getQuery(event);
  const buyout = await Buyout.findOne({ uuid: query.uuid, user: session._id });
  if (!buyout) {
    return createError({
      statusCode: 400,
      message: "Выкуп не найден",
    });
  }

  const data: any = await $fetch("http://95.163.249.133:3000", {
    method: "POST",
    body: {
      type: "flowwowProduct",
      url: buyout.url,
      token: config.PARSER_TOKEN,
    },
  }).catch((e) => {
    throw createError({
      statusCode: 404,
      message:
        "Не удалось получить информацию по товару. Пожалуйста, проверьте правильность введенного артикула.",
    });
  });

  return {
    image: data.image || "",
    article: data.article,
    url: article,
    name: data.name || "",
    parameters: data.volumes && data.volumes.length ? data.volumes : ["нет"],
    colors: data.colors && data.colors.length ? data.colors : ["нет"],
    prices: data.price && data.price.length ? data.price : ["0"],
    price: Number(data.price && data.price.length ? data.price[0] : "0"),
    priceText:
      Number(data.price && data.price.length ? data.price[0] : "0") + " ₽",
    quantity: buyout.quantity,
    sex: buyout.gender,
    searchQuery: buyout.searchQuery.split(", "),
    adress: buyout.point,
    dateRange: [buyout.dateStart, buyout.dateEnd],
    selectedSize: buyout.sizeparam,
    rules: buyout.rules,
    appartmentNumber: buyout.appartmentNumber,
    purchaseSoon: buyout.purchaseSoon,
    deliveryType: buyout.deliveryType,
  };
});
