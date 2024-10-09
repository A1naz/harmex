import user from '~~/server/utils/auth'; 
import confirmTwoFaCode from '~~/server/utils/confirmTwoFaCode';
import { User } from '~~/server/lib/models/User'


export default eventHandler(async (event) => {
  const userIsAuth = await user.user(event)
  if (!userIsAuth) return sendRedirect(event, '/auth', 302)

  const { code }: any = getQuery(event)
  
  const isVerified = confirmTwoFaCode(code, userIsAuth.twoFaSecret)

  return {
    status: isVerified,
  }
})
