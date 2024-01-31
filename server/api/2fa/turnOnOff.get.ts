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

  const { changeTo } = getQuery(event)

  user.isTwoFaEnabled = changeTo
  await user.save()

  return {
    status: 'ok',
  }
})
