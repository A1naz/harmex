import { User } from '~~/server/lib/models/User'
import axios from 'axios'

export default eventHandler(async (event) => {
  let cookie = event.req.headers.cookie
  
  if (!cookie) {
    return
  }
  
  const accessToken = decodeURIComponent(
    decodeURIComponent(
      cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, '$1')
      )
      )
      
      const refreshToken = decodeURIComponent(
        decodeURIComponent(
          cookie.replace(/(?:(?:^|.*;\s*)refresh\s*=\s*([^;]*).*$)|^.*$/, '$1')
          )
          )
          
          const rawData: any = await axios.get(
            'https://auth.anykey.group/api/auth/users/me',
            {
              headers: {
                Cookie: `token=${accessToken};refresh=${refreshToken}`,
              },
            }
            )
            
            if (!rawData || !rawData.data.uuid) {
              throw createError({
                statusCode: 401,
                statusMessage: 'Сессия истекла',
              })
            }
            
  if (!rawData.headers['set-cookie'] || !rawData.headers['set-cookie'][0]) {
    return { status: 'ok' }
  }
  

  const rawCookie = rawData.headers['set-cookie'][0]
  const rawAccessToken = decodeURIComponent(
    decodeURIComponent(
      rawCookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, '$1')
    )
  )

  
  setCookie(event, 'token', rawAccessToken, { httpOnly: true, secure: true })

  return { status: 'refreshed' }

  //   setCookie(event, 'ffasfsafasf', 'sdadasd232sd', {httpOnly: true, secure: true})
})
