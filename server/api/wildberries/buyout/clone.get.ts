import { findImage, findProductCard } from '@/server/lib/helpers'
import { Buyout } from '@/server/lib/models/wildberries/Buyout'

export default eventHandler(async (event) => {
  const session = await getAdminEntity(event)
  if (!session)
    return sendRedirect(event, '/auth', 302)

  const query = getQuery(event)
  const buyout = await Buyout.findOne({ uuid: query.uuid })
  if (!buyout) {
    return createError({
      statusCode: 400,
      message: 'Выкуп не найден',
    })
  }
  const article = buyout?.article
  // const url = findProductCard(params.article)
    const url = `https://card.wb.ru/cards/v2/detail?appType=1&curr=rub&dest=-1257786&spp=30&hide_dtype=13&ab_testing=false&lang=ru&nm=${article}`;
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
    const image = findImage(article);

  return {
    image,
    article: (buyout.article as number),
    name: `${productInfo.brand} / ${productInfo.name}` || '',
    sizes: (sizes as number[] | string[]) || [],
    price: (price as number) || 0,
    priceText: (priceText as string) || '',
    quantity: buyout.quantity,
    sex: buyout.gender,
    searchQuery: buyout.searchQuery.split(', '),
    adress: buyout.point,
    dateRange: [buyout.dateStart, buyout.dateEnd],
    selectedSize: buyout.sizeparam,
    rules: buyout.rules,
  }
})
