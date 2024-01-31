import bcrypt from 'bcrypt'
import { v4 as uuid } from 'uuid'
import validator from 'validator'
import { getServerSession } from '#auth'
import { User } from '~~/server/lib/models/User'
import { UserRoles } from '@/data/enums'

import MailService from '~~/server/lib/mailService.js'

export default eventHandler(async (event) => {

  const session = (await getServerSession(event)) as any
  const { email, username, firstName, lastName, allowedPathes, password, tariff, post } = await readBody(event)

  if (!email || !password){
    throw createError({
        statusCode: 400,
        message: 'Пропущен email или password',
    })
}

  if (!validator.isEmail(email)){
    throw createError({
        statusCode: 400,
        message: 'Некорректный email.',
    })
}

  if (password.length < 6 || password.length > 36){
    throw createError({
        statusCode: 400,
        message: 'Пароль должен быть от 6 до 36 символов.',
    })
}

  const candidate = await User.findOne({ email })
  if (candidate){
    throw createError({
        statusCode: 400,
        message: 'Пользователь с таким email уже существует.',
    })
}

const findUsername = await User.findOne({ username })
if (findUsername){
  throw createError({
      statusCode: 400,
      message: 'Пользователь с таким username уже существует.',
  })
}

  const hash = bcrypt.hashSync(password, 7)

  const user = new User({
    email,
    firstName,
    lastName,
    username,
    acesses: allowedPathes,
    uuidCompany: session.uuid,
    password: hash,
    roles: [UserRoles.staff],
    uuid: uuid(),
    tariff: tariff,
    post
  })

  await user.save()
  const url = useRuntimeConfig().PUBLIC_SITE_URL
  const link = `${url}/api/auth/activate?uuid=${user.uuid}`
  try {
    await MailService.sendActivationMail(user.email, link)
  } catch (error) {
    return { status: 'error', error: 'Ошибка отправки письма.' }
  }

  // await userLog(event,
  //   {
  //       documentType: DocuemntEnum.User,
  //       documentId: user.uuid,
  //       comment: `Создание пользователя ${email}`
  //   })

  return { status: 'ok', error: null }
})
