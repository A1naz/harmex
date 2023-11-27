import { PartnerPaymentHistory } from '~/server/lib/models/PartnerPaymentHistory'

export default eventHandler(async (event) => {
    
  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const { skip, limit } = getQuery(event)

  const history = await PartnerPaymentHistory
                            .find({ user })
                            .sort({ date: -1 })
                            .limit(limit as number)
                            .skip(skip as number)

  if (!history) return []

  return history
})

