import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import speakeasy from 'speakeasy'
import qrcode from 'qrcode'
import jwt from 'jsonwebtoken'
import { getToken } from '#auth'

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const { code }: any = getQuery(event)
  console.log(typeof code);
  
  const verified = speakeasy.totp.verify({
    secret: user.secret,
    encoding: 'base32',
    token: code,
  })


  return {
    status: 'ok',
  }
})
