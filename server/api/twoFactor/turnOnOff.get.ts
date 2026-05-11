import { User } from '@/server/lib/models/User'
import confirmTwoFaCode from '~~/server/utils/confirmTwoFaCode'

export default eventHandler(async (event) => {
  const userAuth = await getUserSession(event)
  if (!userAuth?.user?.uuid) {
    throw createError({ statusCode: 401, message: 'Не авторизован' })
  }
  console.log(userAuth)
  const foundedUser = await User.findOne({ uuid: userAuth.user.uuid })
  if (!foundedUser) {
    throw createError({ statusCode: 401, message: 'Пользователь не найден' })
  }

  const { changeTo, code } = getQuery(event)
  const shouldEnable = changeTo === true || changeTo === 'true'

  if (foundedUser.isTwoFaEnabled && !shouldEnable) {
    if (!code || typeof code !== 'string' || !confirmTwoFaCode(code, foundedUser.twoFaSecret)) {
      throw createError({
        statusCode: 400,
        message: 'Для отключения 2FA подтвердите код',
      })
    }

    foundedUser.isTwoFaEnabled = false
  } else {
    if (!foundedUser.twoFaSecret) {
      throw createError({
        statusCode: 400,
        message: 'Сначала настройте 2FA',
      })
    }

    foundedUser.isTwoFaEnabled = shouldEnable
  }

  await foundedUser.save()

  return {
    status: 'ok',
  }
})
