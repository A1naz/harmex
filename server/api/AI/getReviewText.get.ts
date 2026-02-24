import { Buyout as wildberriesBuyout } from '~/server/lib/models/wildberries/Buyout'
import { Buyout as ozonBuyout } from '~/server/lib/models/ozon/Buyout'
import { Buyout as yandexMarketBuyout } from '~/server/lib/models/yandexMarket/Buyout'
import { GenerateReviews } from '~/server/lib/models/GenerateReviews'
import { generateReviewsDirect } from '~/server/utils/AI/directReview'

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const { mp, buyoutUuid } = getQuery(event)

  let buyout: any = null
  if (mp === 'wildberries') {
    buyout = await wildberriesBuyout.findOne({ uuid: buyoutUuid })
  } else if (mp === 'ozon') {
    buyout = await ozonBuyout.findOne({ uuid: buyoutUuid })
  } else if (mp === 'ym') {
    buyout = await yandexMarketBuyout.findOne({ uuid: buyoutUuid })
  }

  if (!buyout) {
    throw createError({ statusCode: 404, statusMessage: 'Buyout not found' })
  }

  const format = await generateReviewsDirect(buyout.product.name)

  if (!format.length) {
    throw createError({ message: 'Не удалось получить ответ ни от одного ИИ.' })
  }

  await GenerateReviews.create({
    user: buyout.user,
    summ: 30,
    status: 'created',
    taskId: 'Генерация отзыва ' + buyout.uuid,
    createdDate: new Date(),
    type: 'generateReviews',
    mp,
    article: buyout.article,
  })

  return format
})
