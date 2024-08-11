import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { checkSignature } from '@/server/lib/telegram/mod'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  const runtimeConfig = useRuntimeConfig()
  const { bik, rs } = await readBody(event)
  if (!session) return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid })
  if (!user) return sendRedirect(event, '/auth', 302)

  //@ts-ignore
  const bankInfo: any = await $fetch(`https://bik-info.ru/api.html?type=json`, {
    method: 'GET',
    params: {
      bik,
    },
  })

  if (!bankInfo || !bankInfo.bik) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Не удалось получить информацию о банке, проверьте правильность БИК',
    })
  }

  user.bankInfo = { ...bankInfo, rs }
  user.rs = rs
  user.bik = bik

  await user.save()

  return {
    status: 'ok',
  }
})
