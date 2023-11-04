import validator from 'validator'
import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import MailService from '~~/server/lib/mailService.js'

export default eventHandler(async (event) => {
    
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)

  const body = await readBody(event)

  const { email, username, firstName, lastName } = body

  if (!validator.isEmail(email)) {
    throw createError({
      statusCode: 400,
      message: 'Введите корректный email',
    })
  }

  if (!username || !/^[a-zA-Z0-9_-]{4,14}$/.test(username)) {
    throw createError({
      statusCode: 400,
      message: 'Имя пользователя должно быть длиной от 4 до 14 символов',
    })
  }
  const user = await User.findOne({ uuid: session.uuid })
  if (!user) return sendRedirect(event, '/auth', 302)

  const foundByUsername = await User.findOne({ username: body.username })
  if (foundByUsername && foundByUsername.uuid !== user.uuid) {
    throw createError({
      statusCode: 400,
      message: 'Это имя имя пользователя уже занято',
    })
  }

  const foundByEmail = await User.findOne({ email: body.email })
  if (foundByEmail && foundByEmail.uuid !== user.uuid) {
    throw createError({
      statusCode: 400,
      message: 'Email уже занят',
    })
  }
  let emailUpdated = false
  if (email !== user.email) {

    if (!user.password) {
      throw createError({
        statusCode: 400,
        message: 'Сначала установите пароль',
      })
    }

    user.newEmail = email
    const url = useRuntimeConfig().PUBLIC_SITE_URL
    await MailService.sendNewEmailActivationMail(
      email,
      `${url}/api/auth/activate?uuid=${user.uuid}`
    )
    emailUpdated = true
  }
  user.username = username
  user.firstName = firstName
  user.lastName = lastName
  await user.save()
  return {
    status: 'ok',
    emailUpdated: emailUpdated,
  }
})
