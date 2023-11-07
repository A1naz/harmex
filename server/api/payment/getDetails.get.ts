import { Payment } from '~~/server/lib/models/Payment'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

  const payment = await Payment.findOne({ user }).sort({ _id: -1 })
  if (!payment)
    return { status: 'error', message: 'Payment not found' }
  if (payment.details.transferCard && payment.details.transferSum) {
    return {
      status: 'ok',
      transferCard: payment.details.transferCard,
      transferSum: payment.details.transferSum,
    }
  }
  else {
    return { status: 'wait' }
  }
})
