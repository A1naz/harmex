import { getToken } from '#auth'
import { User } from '../lib/models/User'

export default eventHandler(async (event) => {
  const token: any = await getToken({ event })

  console.log(token);
  

  if (
    token &&
    token.twoFaNeeded &&
    !token.twoFaConfirmed &&
    event._path !== '/api/user/client' &&
    event._path !== '/api/token/getAccountsToken' &&
    !event._path?.includes('/2fa') &&
    !event._path?.includes('/auth') &&
    !event._path?.includes('/register')
    ) {
      return sendRedirect(event, '/2fa', 302)
  }

  

})
