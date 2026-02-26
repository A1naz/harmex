import { Buyout as wildberriesBuyout } from '~/server/lib/models/wildberries/Buyout'
import { Buyout as ozonBuyout } from '~/server/lib/models/ozon/Buyout'
import { Buyout as yandexMarketBuyout } from '~/server/lib/models/yandexMarket/Buyout'
import { Buyout as avitoBuyout } from '~/server/lib/models/avito/Buyout'
import { Buyout as goldAppleBuyout } from '~/server/lib/models/goldApple/Buyout'
import { Buyout as flowwowBuyout } from '~/server/lib/models/flowwow/Buyout'
import { Buyout as ozonHotelsBuyout } from '~/server/lib/models/ozonHotels/Buyout'
import { Buyout as sutochnoBuyout } from '~/server/lib/models/sutochno/Buyout'
import { GenerateReviews } from '~/server/lib/models/GenerateReviews'
import { generatePhotosDirect } from '~/server/utils/AI/directPhoto'

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event)
  if (!user || !user._id) return sendRedirect(event, '/auth', 302)

  const { mp, buyoutUuid } = getQuery(event)

  let buyout: any = null
  switch (mp) {
    case 'wildberries': buyout = await wildberriesBuyout.findOne({ uuid: buyoutUuid }).lean(); break
    case 'ozon': buyout = await ozonBuyout.findOne({ uuid: buyoutUuid }).lean(); break
    case 'ym': buyout = await yandexMarketBuyout.findOne({ uuid: buyoutUuid }).lean(); break
    case 'avito': buyout = await avitoBuyout.findOne({ uuid: buyoutUuid }).lean(); break
    case 'goldApple': buyout = await goldAppleBuyout.findOne({ uuid: buyoutUuid }).lean(); break
    case 'flowwow': buyout = await flowwowBuyout.findOne({ uuid: buyoutUuid }).lean(); break
    case 'ozonHotels': buyout = await ozonHotelsBuyout.findOne({ uuid: buyoutUuid }).lean(); break
    case 'sutochno': buyout = await sutochnoBuyout.findOne({ uuid: buyoutUuid }).lean(); break
    default:
      throw createError({ statusCode: 400, statusMessage: 'Marketplace not supported' })
  }

  if (!buyout?.product?.name) {
    throw createError({ statusCode: 404, statusMessage: 'Buyout or product not found' })
  }

  const response = await generatePhotosDirect(buyout.product.name)

  const hasSuccess = Object.values(response).some((v) => v && !v.startsWith('Ошибка'))

  if (hasSuccess) {
    await GenerateReviews.create({
      user: user._id,
      summ: 30,
      status: 'created',
      taskId: `Генерация фото для отзыва ${buyout.uuid}`,
      createdDate: new Date(),
      type: 'generatePhoto',
      mp: mp as string,
      article: buyout.article,
    })
  }

  return response
})
