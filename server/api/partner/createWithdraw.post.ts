import { PartnerWithdraw } from '~/server/lib/models/PartnerWithdraw'

export default eventHandler(async (event) => {

  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const { amount, card, fio, withdrawType } = await readBody(event)

  if (withdrawType === 'card') {
    if (!amount || !card || !fio) {
      throw createError({
        statusCode: 400,
        message: 'Заполните все данные',
      })
    }
    }
    if (Number(amount) < 5000) {
      return {
        status: 'error',
        message: 'Минимальная сумма вывода - 5000 руб.',
      }
  }
  const balance = user.partner?.balance

  if (!balance || Number(amount) > balance) {
    return {
      status: 'error',
      message: 'Сумма вывода не должна быть больше доступного баланса',
    }
  }
  
  const withdraw = await PartnerWithdraw.create({
    userUuid: user.uuid,
    user,
    amount: Number(amount),
    status: 'created',
    type: withdrawType,
    details: {
      card,
      fio,
    },
  })

  if (withdraw) {
    user.partner.balance -= Number(amount)
    await user.save()
    return { status: 'ok', document: withdraw, message: 'success' }
  }
  else { return { status: 'error', message: 'Не удалось создать вывод' } }
})
