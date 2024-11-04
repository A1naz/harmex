import { User } from '@/server/lib/models/User'
import MailService from '~~/server/lib/mailService.js'
import user from '~~/server/utils/auth'
import validator from 'validator'

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
  const { email } = body

  if (!validator.isEmail(email)) {
    throw createError({
      statusCode: 400,
      message: 'Введите корректный email',
    })
  }

  const foundedUser = await User.findOne({ uuid: currentUser.uuid })
  if (!foundedUser) {
    return sendRedirect(event, '/auth', 302)
  }

  const foundByEmail = await User.findOne({ email: body.email })
  if (foundByEmail) {
    throw createError({
      statusCode: 400,
      message: 'Email уже занят',
    })
  }

  let emailUpdated = false
  if (email !== foundedUser.email) {
    foundedUser.newEmail = email
    const url = useRuntimeConfig().PUBLIC_SITE_URL
    await MailService.sendNewEmailActivationMail(
      email,
      `${url}/api/auth/activate?uuid=${foundedUser.uuid}`,
    )
    emailUpdated = true
  }

  await foundedUser.save()
  return {
    status: 'ok',
    emailUpdated,
  }
})
