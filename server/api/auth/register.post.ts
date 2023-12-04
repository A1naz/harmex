import bcrypt from 'bcrypt'
import { v4 as uuid } from 'uuid'
import validator from 'validator'
import { getServerSession } from '#auth'
import { User } from '~~/server/lib/models/User'
import { Plans } from '~/server/lib/models/Plans'
import { Referral } from '~~/server/lib/models/Referral'
import MailService from '~~/server/lib/mailService.js'
import { createUsername } from '~/server/utils/createUsername'

function hasWhiteSpace(s: string) {
  return s.includes(' ') || !/^[a-zA-Z0-9_-]{4,14}$/.test(s)
}
export default eventHandler(async (event) => {
  const body = await readBody(event)

  const { email, password, referral } = body

  if (!email || !password)
    return { status: 'error', error: 'missing email or password' }

  if (!validator.isEmail(email)) {
    return {
      status: 'error',
      error: 'Некорректный email.',
    }
  }

  // if (hasWhiteSpace(password)) {
  //   return {
  //     status: 'error',
  //     error:
  //       'Пароль не должен содержать пробелов, и состоять только из английских букв и цифр.',
  //   }
  // }
  if (password.length < 6 || password.length > 36) {
    return {
      status: 'error',
      error: 'Пароль должен быть от 6 до 36 символов.',
    }
  }
  const session = await getServerSession(event)
  if (session) return { status: 'error', error: 'Вы уже авторизованы.' }

  const checkEmail = await User.findOne({
    email: { $regex: new RegExp(email, 'i') },
  })
  if (checkEmail) {
    return {
      status: 'error',
      error: 'Пользователь с таким email уже существует.',
    }
  }

  const hash = bcrypt.hashSync(password, 7)

  const plan = await Plans.findOne({ name: 'Standart' })
  if (!plan)
    return {
      status: 'error',
      error:
        'Ошибка при регистрации. Тариф не найден, отправьте пожалуйста это сообщение в техподдержку',
    }

  const newUsername = await createUsername(email)

  const user: IUser = new User({
    email,
    password: hash,
    username: newUsername,
    roles: ['user'],
    tariff: plan.tariff,
    uuid: uuid(),
  })
  await user.save()
  const url = useRuntimeConfig().PUBLIC_SITE_URL
  const link = `${url}/api/auth/activate?uuid=${user.uuid}`
  try {
    await MailService.sendActivationMail(user.email, link)
  } catch (error) {
    return { status: 'error', error: 'Ошибка отправки письма.' }
  }

  if (referral) {
    let inviter = await User.findOne({ uuid: referral })
    if (!inviter) {
      inviter = await User.findOne({ username: referral })
      if (!inviter) {
        return
      }
    }
    if (inviter.partner) {
      const refCount = inviter?.partner.refCount ?? 0
      inviter.partner.refCount = refCount + 1

      const referralFound = await Referral.findOne({ user: inviter })
      if (referralFound) {
        referralFound.referrals.push({ user: user._id, date: new Date() })
        await referralFound.save()
      } else {
        await Referral.create({
          user: inviter,
          referrals: [{ user: user._id, date: new Date() }],
        })
      }
      await inviter.save()
    }
  }
  return { status: 'ok', error: null }
})
