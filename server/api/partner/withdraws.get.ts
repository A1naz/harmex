import { PartnerWithdraw } from '~/server/lib/models/PartnerWithdraw'

export default eventHandler(async (event) => {

  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const history = await PartnerWithdraw.find({ user }).sort({ _id: -1 }).limit(10)
  if (!history) return []

  return history
})
