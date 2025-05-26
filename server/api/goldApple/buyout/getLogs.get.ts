import { Buyoutlog } from '@/server/lib/models/goldApple/Buyoutlog'
import { User } from '@/server/lib/models/User'

export default eventHandler(async (event) => {
  const user = (await getAdminEntity(event)) as any
  if (!user)
    return sendRedirect(event, '/auth', 302)

  const { uuid } = getQuery(event)

  const all = await Buyoutlog.find({ buyoutuuid: uuid }).sort({ _id: -1 })

  return all
})
