import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import speakeasy from 'speakeasy'
import qrcode from 'qrcode'

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const query = getQuery(event)
  const { refUrl }: any = query
  
  const qrCode = await new Promise((resolve, reject) => {
    qrcode.toDataURL(refUrl, (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })

  return {
    qrCode,
  }
  
})
