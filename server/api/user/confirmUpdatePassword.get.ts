import bcrypt from 'bcrypt'
import { getServerSession } from '#auth'
import { ConfirmPhone } from '~/server/lib/models/ConfirmPhone'
import { User } from '@/server/lib/models/User'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  const { code } = getQuery(event)
  const user = await User.findOne({ uuid: session.uuid })

  if (!user) {
    if (!user) return sendRedirect(event, '/auth', 302)
  }

  const confirm = await ConfirmPhone.findOne({ phone: user.phoneNumber, code })

  if (!confirm) {
    throw createError({
      statusCode: 404,
    })
  }

  user.password = user.newPassword
  await user.save()

  return {
    status: 'ok',
  }
})
