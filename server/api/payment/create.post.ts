import { Payment } from '~~/server/lib/models/Payment'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

  const { amount, paymentType } = await readBody(event)
  if (!paymentType) {
    throw createError({
      statusCode: 400,
      message: 'paymentType is missing',
    })
  }
  if (amount > 100000) {
    throw createError({
      statusCode: 400,
      message: 'Сумма платежа не может превышать 100 000 рублей',
    })
  }
  const details = paymentType === 'fast' ? { url: null } : paymentType === 'transfer' ? { transferCard: null, transferSum: null } : undefined
  const payment = new Payment({
    user,
    amount,
    details,
    status: 'created',
    type: paymentType === 'fast' ? 0 : paymentType === 'transfer' ? 1 : undefined,
  })
  await payment.save()
  return {
    type: paymentType as string,
    id: payment._id,
    status: 'ok',
  }
})
