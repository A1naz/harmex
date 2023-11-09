import { paymenthistory } from '~~/server/lib/models/Paymenthistory'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

  const { type, string } = getQuery(event)

  let history = []
  if (type === 'uuid') {
    const uuid = string?.toString().replaceAll('#', '')
    history = await paymenthistory.find({ user, $text: { $search: string } }).sort({ _id: -1 })
  }
  else { history = await paymenthistory.find({ user }).sort({ _id: -1 }) }

  return history
})
