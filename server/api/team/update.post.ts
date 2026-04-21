import validator from 'validator'
import { User } from '@/server/lib/models/User'
import bcrypt from 'bcryptjs'

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10) return '+7' + digits
  if (digits.length === 11 && digits[0] === '8') return '+7' + digits.slice(1)
  if (digits.length === 11 && digits[0] === '7') return '+' + digits
  return '+' + digits
}
import { DocuemntEnum } from '~/data/enums'

export default eventHandler(async (event) => {

  const body = await readBody(event)

  const { uuid, contact, username, firstName, lastName, password, allowedPathes, post } = body

  if (!contact) {
    throw createError({ statusCode: 400, message: 'Введите номер телефона или email' })
  }

  if (allowedPathes == '') {
    throw createError({
      statusCode: 400,
      message: 'Выберите разрешения для сохранения данных сотрудника',
    })
  }

  if (post == '') {
    throw createError({
      statusCode: 400,
      message: 'Выберите должность для сохранения данных сотрудника',
    })
  }

  if (!username || !/^[a-zA-Z0-9_-]{4,14}$/.test(username)) {
    throw createError({
      statusCode: 400,
      message: 'Имя пользователя должно быть длиной от 4 до 14 символов',
    })
  }

  const user = await User.findOne({ uuid })
  if (!user) {
    throw createError({ statusCode: 400, message: 'Такого пользователя не существует' })
  }

  const isEmail = contact.includes('@')

  if (isEmail) {
    if (!validator.isEmail(contact)) {
      throw createError({ statusCode: 400, message: 'Некорректный email' })
    }
    const checkEmail = await User.findOne({ email: contact })
    if (checkEmail && checkEmail.uuid !== uuid) {
      throw createError({ statusCode: 400, message: 'Пользователь с таким email уже существует.' })
    }
    user.email = contact
    if (!user.phoneNumber || !user.phoneNumber.startsWith('nophone_')) {
      user.phoneNumber = `nophone_${user.uuid}`
    }
    user.emailConfirmed = true
    user.phoneConfirmed = false
  } else {
    const normalized = normalizePhone(contact)
    if (normalized.replace(/\D/g, '').length < 11) {
      throw createError({ statusCode: 400, message: 'Введите корректный номер телефона' })
    }
    const checkNumber = await User.findOne({ phoneNumber: normalized })
    if (checkNumber && checkNumber.uuid !== uuid) {
      throw createError({ statusCode: 400, message: 'Пользователь с таким номером телефона уже существует.' })
    }
    user.phoneNumber = normalized
    if (!user.email || !user.email.startsWith('noemail_')) {
      user.email = `noemail_${user.uuid}@noemail.local`
    }
    user.phoneConfirmed = true
    user.emailConfirmed = false
  }

  if (password) {
    const hash = bcrypt.hashSync(password, 7)
    user.password = hash
  }

  user.username = username
  user.firstName = firstName
  user.lastName = lastName
  user.acesses = allowedPathes
  user.post = post

  await user.save()

  await userLog(event,
    {
        documentType: DocuemntEnum.User,
        documentId: user.uuid,
        comment: `Изменение данных пользователя ${username}`
    })

  return {
    status: 'ok',
  }
})
