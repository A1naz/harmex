import { Buyout as wildberriesBuyout } from '~/server/lib/models/wildberries/Buyout'
import { Review as wildberriesReview } from '~/server/lib/models/wildberries/Review'
import { Delivery as wildberriesDelivery } from '~/server/lib/models/wildberries/Delivery'
import { Review as ozonReview } from '~/server/lib/models/ozon/Review'
import { Delivery as ozonDelivery } from '~/server/lib/models/ozon/Delivery'
import { Buyout as ozonBuyout } from '~/server/lib/models/ozon/Buyout'
import { Buyout as yandexMarketBuyout } from '~/server/lib/models/yandexMarket/Buyout'
import { generateReviewAdditionDirect } from '~/server/utils/AI/directReview'

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const { mp = 'wildberries', buyoutUuid }: { mp: string; buyoutUuid: string } = getQuery(event)

  let buyout: any = null
  let delivery: any = null
  let review: any = null

  if (mp === 'wildberries') {
    buyout = await wildberriesBuyout.findOne({ uuid: buyoutUuid })
    delivery = await wildberriesDelivery.findOne({ uuidbuyout: buyoutUuid })
    review = await wildberriesReview.findOne({ delivery: delivery?._id })
  } else if (mp === 'ozon') {
    buyout = await ozonBuyout.findOne({ uuid: buyoutUuid })
    delivery = await ozonDelivery.findOne({ uuidbuyout: buyoutUuid })
    review = await ozonReview.findOne({ delivery: delivery?._id })
  } else if (mp === 'ym') {
    buyout = await yandexMarketBuyout.findOne({ uuid: buyoutUuid })
  }

  if (!buyout) {
    throw createError({ statusCode: 404, statusMessage: 'Buyout not found' })
  }
  if (!review) {
    throw createError({ statusCode: 404, statusMessage: 'Review not found' })
  }

  const format = await generateReviewAdditionDirect(buyout.product.name, review.text ?? '')

  if (!format.length) {
    throw createError({ message: 'Не удалось получить ответ ни от одного ИИ.' })
  }

  return format
})
