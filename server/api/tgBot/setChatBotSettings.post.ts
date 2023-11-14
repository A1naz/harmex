import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { tgBotOptions } from '~/server/lib/models/tgBotOptions'

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const { settings } = await readBody(event)

  const tgBotInfo = await tgBotOptions.findOne({ user })
  if (tgBotInfo) {
    tgBotInfo.settings = settings
    await tgBotInfo.save()
  }

  return { status: 'ok' }
})
