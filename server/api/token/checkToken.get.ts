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

  const { uuid } = getQuery(event)

  const user = await User.findOne({ uuid })
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
  if (!accountsToken) throw new Error('неизвестная ошибка')

  const accountsTokenArray = JSON.parse(accountsToken)
  const found = accountsTokenArray.find((el: any) => {
    if (el.uuid === user.uuid) {
      return el
    }
  })
  if (!found) throw new Error('неизвестная ошибка')

  if (event.req.headers.cookie) {
    event.req.headers.cookie = event.req.headers.cookie.replace(
      new RegExp(`${nuxtAuthCookieName}=[^;]*`),
      `${nuxtAuthCookieName}=${found.token}`
    )
  }
  let tokenTest

  tokenTest = (await getToken({ event })) as any

  if (!tokenTest) {
    const userWithoutToken = await User.findOne({ uuid })
    return {
      status: 'error',
      message: 'Сессия истекла, пожалуйста переавторизуйтесь',
      email: userWithoutToken
        ? userWithoutToken.email
          ? userWithoutToken.email
          : ''
        : '',
    }
  }

  (await getServerSession(event)) as any

  return {
    status: 'ok',
    token: found.token,
  }
})
