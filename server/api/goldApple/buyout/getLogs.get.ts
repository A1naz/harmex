import { Buyoutlog } from '@/server/lib/models/goldApple/Buyoutlog'
import { User } from '@/server/lib/models/User'
import { Buyout } from '@/server/lib/models/goldApple/Buyout'

export default eventHandler(async (event) => {
  const user = (await getAdminEntity(event)) as any
  if (!user)
    return sendRedirect(event, '/auth', 302)

  const { uuid } = getQuery(event)

  const buyout = await Buyout.findOne({ uuid, user: user._id })
  if (!buyout)
    throw createError({ statusCode: 404, message: 'Выкуп не найден' })

  const all = await Buyoutlog.find({ buyout: buyout._id, buyoutuuid: uuid }).sort({ _id: -1 })

  return all
})
