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
    await tgBotOptions.create({
      user,
      isEnabled: true,
      settings: [],
    })
    return {
      status: 'ok',
      message: 'Телеграм бот включен',
    }
  }

  tgBotInfo.isEnabled = !tgBotInfo.isEnabled
  await tgBotInfo.save()

  return {
    status: 'ok',
    message: tgBotInfo.isEnabled
      ? 'Телеграм бот включен'
      : 'Телеграм бот выключен',
  }
})
