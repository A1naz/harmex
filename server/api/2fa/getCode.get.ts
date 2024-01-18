import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import speakeasy from 'speakeasy'
import qrcode from 'qrcode'

export default eventHandler(async (event) => {
  // const user = await getAdminEntity(event)
  // if (!user) return sendRedirect(event, '/auth', 302)

  const secret: any = speakeasy.generateSecret({
    length: 10,
    name: 'TOPVTOP',
  })

  const code = await new Promise((resolve, reject) => {
    qrcode.toDataURL(secret.otpauth_url, (err: any, data: any) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })

  
  return {
    code,
    secret,
  }
})
