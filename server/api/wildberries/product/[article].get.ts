import fs from "node:fs";
import { findImage, findProductCard } from "~~/server/lib/helpers";

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event);
  if (!user) return sendRedirect(event, "/auth", 302);

  const params = event.context.params as any;
  // const url = findProductCard(params.article)
  const url = `https://card.wb.ru/cards/v2/detail?appType=1&curr=rub&dest=-1257786&spp=30&hide_dtype=13&ab_testing=false&lang=ru&nm=${params.article}`;
  //ts-ignore
  const data: any = await $fetch(url, { method: "GET" }).catch((e) => {
    if (e.status === 404) {
      throw createError({
        message: "Не найдена информация по данному артикулу.",
      });
    }
  });

  const productInfo = data.data.products[0];

  let sizes = [];

  if (productInfo.sizes) {
    sizes = productInfo.sizes
      .filter((item: any) => item.stocks.length)
      .map((item: any) => item.origName);
  } else {
    sizes = data?.sizes_table?.values.map((size: any) => size.tech_size);
  }

  if (!sizes || sizes.length === 0) {
    throw createError({
      statusCode: 400,
      message:
        "Не удалось получить информацию по товару. Пожалуйста, проверьте правильность введенного артикула.",
    });
  }

  fs.writeFileSync("sizes.json", JSON.stringify(sizes));
  let instock = false;
  productInfo.sizes.forEach((size: any) => {
    if (size.stocks.length > 0) instock = true;
  });
  if (!instock) {
    throw createError({
      statusCode: 400,
      message: "Товара нет в наличии",
    });
  }

  let price = 0
  for (let i = 0; i < productInfo.sizes.length; i++) {
    if (productInfo.sizes[i].stocks.length > 0) {
      price = productInfo.sizes[i].price.product / 100;
    }
  }
  
  console.log(price);

  if (!price) {
    throw createError({
      statusCode: 400,
      message: "Не удалось получить информацию о цене товара.",
    });
  }

  const currency = new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  const priceText = currency.format(price);
  const image = findImage(params.article);

  return {
    product: {
      image,
      article: (productInfo.id as number) || (params.article as number),
      name: `${productInfo.brand} / ${productInfo.name}` || "",
      sizes: (sizes as number[]) || [],
      price: (price as number) || 0,
      priceText: (priceText as string) || "",
    },
  };
});
