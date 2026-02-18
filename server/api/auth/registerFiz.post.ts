import MailService from '~~/server/lib/mailService.js'
import { HarmexReferrals } from '~/server/lib/models/HarmexReferrals'
import { User } from '~~/server/lib/models/User'
import bcrypt from 'bcryptjs'
import { v4 as uuid } from 'uuid'
import validator from 'validator'
import { createUsername } from '~/server/utils/createUsernameFromMail'

export default eventHandler(async (event) => {
  const body = await readBody(event)

  const {
    email,
    password,
    referral,
    phoneNumber,
    landing,
    utmCode,
  } = body

  if (!email || !password)
    return { status: 'error', error: 'missing email or password' }

  if (!validator.isEmail(email)) {
    return {
      status: 'error',
      error: 'Некорректный email.',
    }
  }

  if (password.length < 6 || password.length > 36) {
    return {
      status: 'error',
      error: 'Пароль должен быть от 6 до 36 символов.',
    }
  }

  const checkEmail = await User.findOne({
    email: { $regex: new RegExp(email, 'i') },
  })
  if (checkEmail) {
    return {
      status: 'error',
      error: 'Пользователь с таким email уже существует.',
    }
  }

  const checkNumber = await User.findOne({
    phoneNumber: phoneNumber.replace(/[()\-\s]/g, ''),
  })

  if (checkNumber) {
    return {
      status: 'error',
      error: 'Пользователь с таким номером телефона уже существует.',
    }
  }

  const hashedPassword = bcrypt.hashSync(password, 7)

  const newUsername = await createUsername(email)

  const user: IUser = new User({
    email,
    password: hashedPassword,
    username: newUsername,
    roles: ['user'],
    uuid: uuid(),
    orgInn: uuid(),
    lastname: '',
    name: '',
    middleName: '',
    phoneNumber: phoneNumber.replace(/[()\-\s]/g, ''),
    emailConfirmed: false,
    fizFace: true,
    landing,
    utmCode: utmCode || undefined,
  })
  const url = useRuntimeConfig().PUBLIC_SITE_URL
  const link = `${url}/api/auth/activate?uuid=${user.uuid}`
  try {
    await MailService.sendActivationMail(user.email, link)
  }

  catch (error) {
    return { status: 'error', error: 'Ошибка отправки письма.' }
  }
  await user.save()

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

      const referralFound = await HarmexReferrals.findOne({ user: inviter })
      if (referralFound) {
        referralFound.referrals.push({ user: user._id, date: new Date() })
        await referralFound.save()
      }
      else {
        await HarmexReferrals.create({
          user: inviter,
          referrals: [{ user: user._id, date: new Date() }],
        })
      }
      await inviter.save()
    }
  }

  return { status: 'ok', error: null }
})
