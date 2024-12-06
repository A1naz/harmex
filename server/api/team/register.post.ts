import bcrypt from 'bcrypt'
import { v4 as uuid } from 'uuid'
import validator from 'validator'
import { User } from '~~/server/lib/models/User'
import { UserRoles } from '@/data/enums'
import { DocuemntEnum } from '~/data/enums'

import MailService from '~~/server/lib/mailService.js'

export default eventHandler(async (event) => {
  const session = (await getAdminEntity(event)) as any

  const user = await User.findOne({ uuid: session.uuid })
  if (!user) return sendRedirect(event, '/auth', 302)

  const {
    phoneNumber,
    username,
    firstName,
    lastName,
    allowedPathes,
    password,
    tariff,
    post,
  } = await readBody(event)

  console.log(
    'phoneNumber',
    phoneNumber,
    'password',
    password,
  )

  if (!phoneNumber || !password) {
    throw createError({
      statusCode: 400,
      message: 'Пропущен номер телефона или пароль',
    })
  }

  console.log('allowedPathes', allowedPathes)

  if(allowedPathes == '') {
    throw createError({
      statusCode: 400,
      message: 'Выдайте разрешения для регистрации сотрудника',
    })
  }

  console.log('post', post)

  if(post == '') {
    throw createError({
      statusCode: 400,
      message: 'Выберите должность для регистрации сотрудника',
    })
  }
  // if (!validator.isphoneNumber(phoneNumber)){
  //   throw createError({
  //       statusCode: 400,
  //       message: 'Некорректный phoneNumber.',
  //   })
  // }

  if (password.length < 6 || password.length > 36) {
    throw createError({
      statusCode: 400,
      message: 'Пароль должен быть от 6 до 36 символов.',
    })
  }
  
  if (phoneNumber.replace(/[\(\)\-\s]/g, '').length < 12) {
    throw createError({
      statusCode: 400,
      message: 'Введите корректный номер телефона',
    })
  }

  const checkNumber = await User.findOne({
    phoneNumber: phoneNumber.replace(/[\(\)\-\s]/g, ''),
  })

  if (checkNumber) {
    throw createError({
      statusCode: 400,
      message: 'Пользователь с таким номером телефона уже существует.',
    })
  }

  const findUsername = await User.findOne({ username })
  if (findUsername) {
    throw createError({
      statusCode: 400,
      message: 'Пользователь с таким логином уже существует.',
    })
  }

  const hash = bcrypt.hashSync(password, 7)

  const userNew = new User({
    firstName,
    lastName,
    username,
    orgInn: uuid(),
    acesses: allowedPathes,
    uuidCompany: session.uuid,
    password: hash,
    roles: [UserRoles.staff],
    uuid: uuid(),
    // tariff: tariff,
    MPTariffs: user.MPTariffs,
    phoneNumber: phoneNumber.replace(/[\(\)\-\s]/g, ''),
    phoneNumberConfirmed: true,
    post,
  })

  await userNew.save()
  const url = useRuntimeConfig().PUBLIC_SITE_URL
  const link = `${url}/api/auth/activate?uuid=${userNew.uuid}`
  // try {
  //   await MailService.sendActivationMail(user.phoneNumber, link)
  // } catch (error) {
  //   return { status: 'error', error: 'Ошибка отправки письма.' }
  // }

  await userLog(event,
    {
        documentType: DocuemntEnum.User,
        documentId: user.uuid,
        comment: `Создание пользователя ${username}`
    })

  return { status: 'ok', error: null }
})
