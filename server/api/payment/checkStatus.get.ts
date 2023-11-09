import { Payment } from '~~/server/lib/models/Payment'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

  const { id } = getQuery(event)
  const payment = await Payment.findOne({ _id: id, user }).sort({ _id: -1 })
  if (!payment)
    return { status: 'error', message: 'Payment not found' }

  const data = {
    status: payment.status,
  }

  return data
})
