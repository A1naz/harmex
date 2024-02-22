import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { tgBotOptions } from '~/server/lib/models/tgBotOptions'
import jwt from 'jsonwebtoken'
import { setCookie } from 'h3'

const runtimeConfig = useRuntimeConfig()
const nuxtAuthCookieName = runtimeConfig.SESSION_TOKEN

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid })
  if (!user) return sendRedirect(event, '/auth', 302)

  const cookie = event.req.headers.cookie
  if (!cookie) return sendRedirect(event, '/auth', 302)

  const { uuid } = getQuery(event)

  const nuxtAuthToken = cookie?.replace(
    new RegExp(`(?:(?:^|.*;\\s*)${nuxtAuthCookieName}\\s*=\\s*([^;]*).*$)|^.*$`),
    '$1'
  )

  if (!nuxtAuthToken) return sendRedirect(event, '/auth', 302)

  let data: any[] = []
  let accounts: any[] = []
  const accountsToken = decodeURIComponent(
    decodeURIComponent(
      cookie.replace(
        /(?:(?:^|.*;\s*)accountsSessionToken\s*=\s*([^;]*).*$)|^.*$/,
        '$1'
      )
    )
  )

  if (!accountsToken) throw new Error('неизвестная ошибка')

  let accountsTokenArray: any[] = []
  accountsTokenArray = JSON.parse(accountsToken)

  if (!accountsToken) {
    throw new Error('no accounts token')
  } else {

    const findIndex = accountsTokenArray.findIndex((el: any) => {
      if (el.uuid === uuid) {
        return el
      }
    })

    if (findIndex !== -1) {
      accountsTokenArray.splice(findIndex, 1)
      data = accountsTokenArray
      const users = await User.find({
        uuid: { $in: data.map((el) => el.uuid) },
      })

      accounts = users.map((el: any) => {
        return {
          uuid: el.uuid,
          username: el.username,
        }
      })
    }
  }

  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + 32)
  const expiresString = expiryDate.toUTCString()
  const jsonString = JSON.stringify(data);
  event.res.setHeader(
    'Set-Cookie',
    `accountsSessionToken=${encodeURIComponent(jsonString)}; HttpOnly; expires=${expiresString}`
  )
  setCookie(event, 'accountsSessionToken', encodeURIComponent(jsonString), {
      httpOnly: true,
      expires: expiryDate,
  })


  return {
    token: [],
    accounts,
  }
})
