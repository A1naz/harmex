import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import speakeasy from 'speakeasy'
import qrcode from 'qrcode'

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  if (user.twoFaQR) {
    
    return {
      qrCode: user.twoFaQR,
      secret: user.twoFaSecret,
    }
  } else {
    const secret: any = speakeasy.generateSecret({
      length: 8,
      name: 'TOPVTOP',
    })

    const qrCode = await new Promise((resolve, reject) => {
      qrcode.toDataURL(secret.otpauth_url, (err: any, data: any) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })

    user.twoFaQR = qrCode
    user.twoFaSecret = secret.hex
    await user.save()

    return {
      qrCode,
      secret: secret.hex,
    }
  }
})
