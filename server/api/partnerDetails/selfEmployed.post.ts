import { User } from '~~/server/lib/models/User'

export default eventHandler(async (event) => {
  const session: any = await getUserSession(event)
  if (!session)
    return sendRedirect(event, '/auth', 302)
  const user = await User.findOne({ uuid: session.user.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)

  const { firstName, lastName, middleName, inn, ks, rs, bik } = await readBody(event)

  if (!firstName || !lastName || !inn || !ks || !rs || !bik) {
    throw createError({
      statusCode: 200,
      message: 'Заполните все данные',
    })
  }

  const bankInfo: any = await $fetch(`https://bik-info.ru/api.html?type=json`, {
    method: 'GET',
    params: {
      bik,
    },
  })

  if (!bankInfo || !bankInfo.bik) {
    throw createError({
      statusCode: 400,
      statusMessage:
                'Не удалось получить информацию о банке, проверьте правильность БИК',
    })
  }

  user.bankInfo = { ...bankInfo, rs, ks, bik }
  user.firstName = firstName
  user.lastName = lastName
  user.middleName = middleName
  user.orgInn = inn
  user.ks = ks
  user.rs = rs
  user.bik = bik
  user.isPartnerWithdrawAvailable = true

  await user.save()

  return { status: 'success' }
})
