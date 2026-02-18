import { ConfirmPhone } from '~~/server/lib/models/ConfirmPhone'
import { User } from '~~/server/lib/models/User'

export default eventHandler(async (event) => {
  const { phoneNumber, code }: any = getQuery(event)

  // Если пользователь авторизован — проверяем, что номер совпадает с его профилем
  const session = await getUserSession(event)
  if (session?.user?.uuid && session.user.phoneNumber !== phoneNumber) {
    throw createError({
      statusCode: 400,
      message: 'Номер телефона не совпадает с номером в вашем профиле',
    })
  }

  const confirm = await ConfirmPhone.findOne({ phone: phoneNumber, code })

  if (!confirm) {
    throw createError({
      statusCode: 404,
    })
  }

  // Помечаем телефон как подтверждённый
  if (session?.user?.uuid) {
    await User.findOneAndUpdate(
      { uuid: session.user.uuid },
      { phoneConfirmed: true }
    )
  } else {
    // На случай если звонок идёт без сессии (регистрация через SMS) — ищем по номеру
    await User.findOneAndUpdate(
      { phoneNumber },
      { phoneConfirmed: true }
    )
  }

  return { status: 'ok' }
})
