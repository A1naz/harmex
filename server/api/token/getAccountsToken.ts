import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { tgBotOptions } from '~/server/lib/models/tgBotOptions'
import jwt from 'jsonwebtoken'
const runtimeConfig = useRuntimeConfig()
const nuxtAuthCookieName = runtimeConfig.SESSION_TOKEN


export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)
  
  const user = await User.findOne({ uuid: session.uuid })
  if (!user) return sendRedirect(event, '/auth', 302)
  
  const cookie = event.req.headers.cookie
  if (!cookie) return sendRedirect(event, '/auth', 302)

  const nuxtAuthToken = cookie?.replace(
    new RegExp(`(?:(?:^|.*;\\s*)${nuxtAuthCookieName}\\s*=\\s*([^;]*).*$)|^.*$`),
    '$1'
  )
    
    if (!nuxtAuthToken) return sendRedirect(event, '/auth', 302)
    
    let data: any[] = []
    let accounts: any[] = []
    let token: string = ''
        

    const accountsToken = decodeURIComponent(
      decodeURIComponent(
        cookie.replace(
          /(?:(?:^|.*;\s*)accountsSessionToken\s*=\s*([^;]*).*$)|^.*$/,
          '$1'
          )
          )
          )
          
  let accountsTokenArray: any[] = []

  if (!accountsToken) {
    data.push({
      token: nuxtAuthToken,
      uuid: user.uuid,
    })

    accounts.push({
      uuid: user.uuid,
      username: user.username,
    })
  } else {
    accountsTokenArray = JSON.parse(accountsToken)
    const findIndex = accountsTokenArray.findIndex((el: any) => {
      if (el.uuid === user.uuid) {
        return el
      }
    })

    if (findIndex !== -1) {
      accountsTokenArray[findIndex].token = nuxtAuthToken
    } else if (accountsTokenArray && accountsTokenArray.length < 5) {
      accountsTokenArray.push({
        token: nuxtAuthToken,
        uuid: user.uuid,
      })
    } else {
    }

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
  
  return {
    token: data,
    accounts,
  }
})
