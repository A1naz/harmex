import { User } from '@/server/lib/models/User'
import speakeasy from 'speakeasy'
import qrcode from 'qrcode'

export default eventHandler(async (event) => {
  const userAuth = await getUserSession(event)
  if (!userAuth?.user?.uuid) {
    throw createError({ statusCode: 401, message: 'Не авторизован' })
  }
  const userFound = await User.findOne({ uuid: userAuth.user.uuid })
  if (!userFound) {
    throw createError({ statusCode: 401, message: 'Пользователь не найден' })
  }

  if (userFound.twoFaQR) {
    if (userFound.isTwoFaEnabled) {
      throw createError({
        statusCode: 400,
        message: '2FA уже включена',
      })
    }

    return {
      qrCode: userFound.twoFaQR,
      secret: userFound.twoFaSecret,
    }
  } else {
    const secret: any = speakeasy.generateSecret({
      length: 10,
      name: 'HARMEX: ' + userFound.username.replace(/[\(\)\-\s]/g, ''),
    })

    const qrCode: string = await new Promise((resolve, reject) => {
      qrcode.toDataURL(secret.otpauth_url, (err: any, data: any) => {
        if (err) reject(err)
        else resolve(data)
      })
    })

    userFound.twoFaQR = qrCode
    userFound.twoFaSecret = secret.base32
    await userFound.save()

    return {
      qrCode,
      secret: secret.base32,
    }
  }
})
