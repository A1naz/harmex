import jwt from 'jsonwebtoken'
import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { tgBotOptions } from '~/server/lib/models/tgBotOptions'
import { getToken } from '#auth'

const runtimeConfig = useRuntimeConfig()
const nuxtAuthCookieName = runtimeConfig.SESSION_TOKEN

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid })
  if (!user) return sendRedirect(event, '/auth', 302)

  let cookie = event.req.headers.cookie
  if (!cookie) return sendRedirect(event, '/auth', 302)

  const accountsToken = decodeURIComponent(
    decodeURIComponent(
      cookie.replace(
        /(?:(?:^|.*;\s*)accountsSessionToken\s*=\s*([^;]*).*$)|^.*$/,
        '$1'
      )
    )
  )
  if (!accountsToken) {
    return {
      status: 'ok',
    }
  }

  const accountsTokenArray = JSON.parse(accountsToken)
  let tokenTest

  for (const token of accountsTokenArray) {
    if (event.req.headers.cookie) {
      event.req.headers.cookie = event.req.headers.cookie.replace(
        new RegExp(`${nuxtAuthCookieName}=[^;]*`),
        `${nuxtAuthCookieName}=${token.token}`
      )
    }

    tokenTest = (await getToken({ event })) as any
    if (tokenTest) {
      await getServerSession(event)
      return {
        status: 'logined',
      }
    }
  }



  return {
    status: 'ok',
  }
})
