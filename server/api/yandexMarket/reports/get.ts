import { User } from '@/server/lib/models/User'
import { Report } from '~~/server/lib/models/yandexMarket/Report'
import { Buyout } from '~/server/lib/models/yandexMarket/Buyout'

interface buyoutInfo {
  place: number
  uuid: string
  image: string
  article: number
  name: string
}
interface historyItem {
  date: Date
  card: String
  screenshots: string[]
  buyout: buyoutInfo

}

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

  const { limit, skip, status } = getQuery(event)

  let history
  const format: historyItem[] = []

  if (status && status !== 'all') {
    switch (status) {
      case 'today':
        history = await Report.find({
          user,
          date: {
            $gte: new Date(Date.now() - 1000 * 60 * 60 * 24),
          },
        }).skip(skip as number).limit(limit as number)
        break
      case '3days':
        history = await Report.find({
          user,
          date: {
            $gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
          },
        }).skip(skip as number).limit(limit as number)
        break
      case '7days':
        history = await Report.find({
          user,
          date: {
            $gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
          },
        }).skip(skip as number).limit(limit as number)
        break
      default:
        history = await Report.find({ user })
    }
  }
  else { history = await Report.find({ user }).sort({ _id: -1 }).skip(skip as number).limit(limit as number) }
  for await (const item of history) {
    const buyout = await Buyout.findOne({ _id: item.buyout })
    if (!buyout)
      continue
    format.push({
      date: item.date,
      card: item.card,
      screenshots: item.screenshots,
      buyout: {
        article: buyout.article,
        name: buyout.product.name,
        place: buyout.place,
        uuid: buyout.uuid,
        image: buyout.product.image,
      },
    })
  }
  
  return format
})

