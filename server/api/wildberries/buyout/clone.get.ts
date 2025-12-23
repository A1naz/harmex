import { Buyout } from '@/server/lib/models/wildberries/Buyout'
import { getWBProductInfo } from "~~/server/utils/wildberries/getProductInfo";

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
  
  const productInfo = await getWBProductInfo(buyout.article);

  return {
    image: productInfo.image,
    article: productInfo.article,
    name: productInfo.name,
    sizes: productInfo.sizes,
    price: productInfo.price,
    priceText: productInfo.priceText,
    quantity: buyout.quantity,
    sex: buyout.gender,
    searchQuery: buyout.searchQuery.split(', '),
    adress: buyout.point,
    dateRange: [buyout.dateStart, buyout.dateEnd],
    selectedSize: buyout.sizeparam,
    rules: buyout.rules,
  }
})
