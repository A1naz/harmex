import { User } from '@/server/lib/models/User'
import { TaskLog } from '@/server/lib/models/yandexMarket/TaskLog'

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const { uuid } = getQuery(event)

  const all = await TaskLog.find({
    $or: [{ uuid: uuid }, { buyoutuuid: uuid }],
  }).sort({ _id: -1 })


  return all
})
