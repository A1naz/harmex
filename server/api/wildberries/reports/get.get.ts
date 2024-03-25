import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { Report } from '~~/server/lib/models/wildberries/Report'
import { Buyout } from '~~/server/lib/models/wildberries/Buyout'

interface buyoutInfo {
  place: number
  uuid: string
  image: string
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
  const buyoutsId = history.map(item => item.buyout);
  const buyouts = await Buyout.find({ _id: { $in: buyoutsId } })

  for await (const item of history) {
    const buyout = buyouts.find(buyout => buyout._id.valueOf() === item.buyout.valueOf());
    format.push({
      date: item.date,
      card: item.card,
      screenshots: item.screenshots,
      buyout: {
        place: buyout?.place,
        uuid: buyout?.uuid,
        image: buyout?.product.image,
      },
    })
  }
  
  return format
})
