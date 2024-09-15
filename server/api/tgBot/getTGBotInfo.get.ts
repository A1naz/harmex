import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { tgBotOptions } from '~/server/lib/models/tgBotOptions'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid })
  if (!user) return sendRedirect(event, '/auth', 302)

  const tgBotInfo = await tgBotOptions.findOne({ user })

  if (!tgBotInfo) {
    return {
      isEnabled: false,
      settings: [],
    }
  }

  return { isEnabled: tgBotInfo.isEnabled, settings: tgBotInfo.settings }
})
