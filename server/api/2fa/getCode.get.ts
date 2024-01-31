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
      length: 10,
      name: 'TOPVTOP: ' + user.username,
    })

    console.log(secret);
    

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
    user.twoFaSecret = secret.base32
    await user.save()

    return {
      qrCode,
      secret: secret.base32,
    }
  }
})
