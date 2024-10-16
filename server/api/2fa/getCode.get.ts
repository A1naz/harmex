import { User } from '@/server/lib/models/User'
import qrcode from 'qrcode'
import speakeasy from 'speakeasy'

export default eventHandler(async (event) => {
  const userAuth = await getUserSession(event)
  if (!userAuth)
    return sendRedirect(event, '/auth', 302)
  const userFound = await User.findOne({ uuid: userAuth.user?.uuid })
  if (!userFound)
    return sendRedirect(event, '/auth', 302)

  if (userFound.twoFaQR) {
    return {
      qrCode: userFound.twoFaQR,
      secret: userFound.twoFaSecret,
    }
  }
  else {
    const secret: any = speakeasy.generateSecret({
      length: 10,
      name: `HARMEX: ${userFound.phoneNumber.replace(/[()\-\s]/g, '')}`,
    })

    const qrCode: string = await new Promise((resolve, reject) => {
      qrcode.toDataURL(secret.otpauth_url, (err: any, data: any) => {
        if (err) {
          reject(err)
        }
        else {
          resolve(data)
        }
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
