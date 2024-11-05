import { User } from '@/server/lib/models/User'
import { Buyoutlog } from '@/server/lib/models/wildberries/Buyoutlog'

export default eventHandler(async (event) => {
  const session = (await getAdminEntity(event)) as any
  if (!session)
    return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)

  const { uuid } = getQuery(event)

  const all = await Buyoutlog.find({ buyoutuuid: uuid }).sort({ _id: -1 })

  return all
})
