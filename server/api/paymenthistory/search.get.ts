import { paymenthistory } from '~~/server/lib/models/Paymenthistory'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

  const { type, string } = getQuery(event)

  // const query: { user: any; mp?: string; $text?: any } = { user };

  // if (mp && mp !== 'all') {
  //     query.mp = mp;
  // }
  // if (type === 'uuid') {
  //   const uuid = string?.toString().replaceAll('#', '')
  //   query.$text = { $search: string };
  // } 

  // history = await paymenthistory.find(query).sort({ _id: -1 });

  let history = []
  if (type === 'uuid') {
    const uuid = string?.toString().replaceAll('#', '')
    history = await paymenthistory.find({ user, $text: { $search: string } }).sort({ _id: -1 })
  }
  else { history = await paymenthistory.find({ user }).sort({ _id: -1 }) }

  return history
})
