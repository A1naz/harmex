import { Payment } from '~~/server/lib/models/Payment'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

  const payment = await Payment.findOne({ user }).sort({ _id: -1 })
  if (!payment)
    return { status: 'error', message: 'Payment not found' }
  if (payment.details.url) {
    const data = {
      status: 'ok',
      url: payment.details.url,
    }
    return data
  }
  else {
    return { status: 'wait' }
  }
})
