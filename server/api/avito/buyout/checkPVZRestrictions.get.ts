import { Buyout } from '@/server/lib/models/avito/Buyout'
import { User } from '~/server/lib/models/User'

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event)
  if (!user)
    return sendRedirect(event, '/auth', 302)

  const twentyFourHoursAgo = new Date(Date.now() - 20 * 60 * 60 * 1000) // Вычисляем время 24 часа назад

  const lastBuyouts = await Buyout.find({
    user: user._id,
    createdAt: { $gte: twentyFourHoursAgo, $lt: new Date() },
  })

  const format = lastBuyouts.map((item: any) => {
    return {
      article: item.article,
      quantity: item.quantity,
      adress: item.point,
      dateRange: [item.dateStart, item.dateEnd],
    }
  })

  return { lastBuyouts: format }
})
