import { paymenthistory } from '~~/server/lib/models/Paymenthistory'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

  const { skip, limit, type, dateFilter, mp } = getQuery(event)

  let history = []
  const query = { user };


  if (type && type !== 'all') {
      query.type = type;
  }
  if (mp && mp !== 'all') {
      query.mp = mp;
  }

  history = await paymenthistory.find(query).sort({ _id: -1 }).skip(skip as number).limit(limit as number);
    const today = new Date(Date.now())
  today.setHours(0, 0, 0, 0)
  switch (dateFilter) {
    case 'today':
      history = history.filter(item => new Date(item.dataoperation as Date) > today)
      break
    case '3days':
      history = history.filter(item => new Date(item.dataoperation as Date) > new Date(Date.now() - 1000 * 60 * 60 * 24 * 3))
      break
    case '7days':
      history = history.filter(item => new Date(item.dataoperation as Date) > new Date(Date.now() - 1000 * 60 * 60 * 24 * 7))
      break
  }
  return history
})
