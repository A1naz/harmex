import { User } from '@/server/lib/models/User'
import auth from '~~/server/utils/auth'
import bcrypt from 'bcrypt'

export default eventHandler(async (event) => {
  const isAuth = await getUserSession(event)

  if (!isAuth) {
    return sendRedirect(event, '/auth', 302)
  }

  const currentUser = isAuth.user

  if (!currentUser) {
    return sendRedirect(event, '/auth', 302)
  }

  const body = await readBody(event)
  const { oldPassword, newPassword } = body

  if (!oldPassword || !newPassword) {
    throw createError({
      statusCode: 400,
      message: 'Введите старый и новый пароль',
    })
  }

  if (oldPassword === newPassword) {
    throw createError({
      statusCode: 400,
      message: 'Новый пароль не должен совпадать со старым',
    })
  }

  const foundedUser = await User.findOne({ uuid: currentUser.uuid })
  if (!foundedUser) {
    return sendRedirect(event, '/auth', 302)
  }

  const verify = await bcrypt.compare(oldPassword, foundedUser.password)

  if (!verify) {

    throw createError({
      statusCode: 400,
      message: 'Старый пароль не совпадает',
    })
  }

  await auth.changePassword(event, {
    phoneNumber: foundedUser.phoneNumber,
    newPassword,
  })

  return {
    status: 'ok',
    message: 'Пароль успешно изменен',
  }
})
