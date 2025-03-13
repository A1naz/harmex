import { User } from '@/server/lib/models/User'
import { Buyoutlog } from '@/server/lib/models/avito/Buyoutlog'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

  const { uuid } = getQuery(event)

  const all = await Buyoutlog.find({ buyoutuuid: uuid }).sort({ _id: -1 })

  return all
})
