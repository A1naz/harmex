import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import speakeasy from 'speakeasy'
import qrcode from 'qrcode'
import jwt from 'jsonwebtoken'
import { getToken } from '#auth'
const runtimeConfig = useRuntimeConfig()
const nuxtAuthCookieName = runtimeConfig.SESSION_TOKEN
const jwtSecret = runtimeConfig.SECRET

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const { code }: any = getQuery(event)
  console.log(typeof code);
  
  // const verified = speakeasy.totp.verify({
  //   secret: user.secret,
  //   encoding: 'base32',
  //   token: code,
  // })

  let cookie = event.req.headers.cookie
  if (!cookie) return sendRedirect(event, '/auth', 302)

const token = await getToken({ event })
if (!token) return sendRedirect(event, '/auth', 302)  

token.twoFaNeeded = 'none'

  return {
    status: 'ok',
  }
})
