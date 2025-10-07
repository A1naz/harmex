import { User } from '@/server/lib/models/User'
import { TaskLog } from '@/server/lib/models/goldApple/TaskLog'

export default eventHandler(async (event) => {
  const session = (await getUserSession(event)) as any
  if (!session)
    return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.user.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)

  const { uuid } = getQuery(event)

  if (!uuid)
    return []

  const all = await TaskLog.find({
    $or: [{ uuid }, { buyoutuuid: uuid }],
  }).sort({ _id: -1 })

  return all
})
