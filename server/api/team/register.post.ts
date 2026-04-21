import bcrypt from 'bcryptjs'
import { v4 as uuid } from 'uuid'
import validator from 'validator'

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10) return '+7' + digits
  if (digits.length === 11 && digits[0] === '8') return '+7' + digits.slice(1)
  if (digits.length === 11 && digits[0] === '7') return '+' + digits
  return '+' + digits
}
import { User } from '~~/server/lib/models/User'
import { UserRoles } from '@/data/enums'
import { DocuemntEnum } from '~/data/enums'

import MailService from '~~/server/lib/mailService.js'

export default eventHandler(async (event) => {
  const session = (await getAdminEntity(event)) as any

  const user = await User.findOne({ uuid: session.uuid })
  if (!user) return sendRedirect(event, '/auth', 302)

  const {
    contact,
    username,
    firstName,
    lastName,
    allowedPathes,
    password,
    tariff,
    post,
  } = await readBody(event)

  if (!contact || !password) {
    throw createError({
      statusCode: 400,
      message: 'Пропущен номер телефона / email или пароль',
    })
  }

  if (allowedPathes == '') {
    throw createError({
      statusCode: 400,
      message: 'Выдайте разрешения для регистрации сотрудника',
    })
  }

  if (post == '') {
    throw createError({
      statusCode: 400,
      message: 'Выберите должность для регистрации сотрудника',
    })
  }

  if (password.length < 6 || password.length > 36) {
    throw createError({
      statusCode: 400,
      message: 'Пароль должен быть от 6 до 36 символов.',
    })
  }

  const isEmail = contact.includes('@')
  let savePhoneNumber: string
  let saveEmail: string

  if (isEmail) {
    if (!validator.isEmail(contact)) {
      throw createError({ statusCode: 400, message: 'Некорректный email' })
    }
    const checkEmail = await User.findOne({ email: contact })
    if (checkEmail) {
      throw createError({ statusCode: 400, message: 'Пользователь с таким email уже существует.' })
    }
    saveEmail = contact
    savePhoneNumber = `nophone_${uuid()}`
  } else {
    const normalized = normalizePhone(contact)
    if (normalized.replace(/\D/g, '').length < 11) {
      throw createError({ statusCode: 400, message: 'Введите корректный номер телефона' })
    }
    const checkNumber = await User.findOne({ phoneNumber: normalized })
    if (checkNumber) {
      throw createError({ statusCode: 400, message: 'Пользователь с таким номером телефона уже существует.' })
    }
    savePhoneNumber = normalized
    saveEmail = `noemail_${uuid()}@noemail.local`
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
    MPTariffs: user.MPTariffs,
    phoneNumber: savePhoneNumber,
    email: saveEmail,
    phoneNumberConfirmed: !isEmail,
    emailConfirmed: isEmail,
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
