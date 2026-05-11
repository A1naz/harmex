import user from '~~/server/utils/auth'
import confirmTwoFaCode from '~~/server/utils/confirmTwoFaCode'

export default eventHandler(async (event) => {
  const userIsAuth = await user.user(event)
  if (!userIsAuth) {
    throw createError({ statusCode: 401, message: 'Не авторизован' })
  }

  const { code }: any = getQuery(event)
  console.log(code)
  console.log(userIsAuth.twoFaSecret)
  const isVerified = confirmTwoFaCode(code, userIsAuth.twoFaSecret)

  return {
    status: isVerified,
  }
})
