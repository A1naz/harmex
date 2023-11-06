import validator from 'validator'
import { User } from '@/server/lib/models/User'
import MailService from '~~/server/lib/mailService.js'

export default eventHandler(async (event) => {

  const body = await readBody(event)

  const { uuid, email, username, firstName, lastName, allowedPathes } = body

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
  const user = await User.findOne({ uuid: uuid })
  if (!user) {
    throw createError({
    statusCode: 400,
    message: 'Такого пользователя не существует',
  })
}

  let emailUpdated = false
  if (email !== user.email) {
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
  user.acesses = allowedPathes

  await user.save()
  return {
    status: 'ok',
    emailUpdated: emailUpdated,
  }
})
