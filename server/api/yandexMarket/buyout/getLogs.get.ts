import { User } from '@/server/lib/models/User'
import { Buyoutlog } from '@/server/lib/models/yandexMarket/Buyoutlog'
import { Buyout } from '@/server/lib/models/yandexMarket/Buyout'

export default eventHandler(async (event) => {
  const session = (await getAdminEntity(event)) as any
  if (!session)
    return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)

  const { uuid } = getQuery(event)

  const buyout = await Buyout.findOne({ uuid, user: user._id })
  if (!buyout)
    throw createError({ statusCode: 404, message: 'Выкуп не найден' })

  const all = await Buyoutlog.find({ buyout: buyout._id, buyoutuuid: uuid }).sort({ _id: -1 })

  return all
})
