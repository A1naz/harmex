import { View } from '~/server/lib/models/ozon/View'

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event)
  if (!user)
    return sendRedirect(event, '/auth', 302)

  const {
    dateFilter,
    statusQuery,
    string,
    type,
    skip = 0,
    limit = 50,
  } = getQuery(event)

  let searchQuery: { status?: any, $or?: any, createdDate?: any } = {}
  if (type === 'article') {
    searchQuery = {
      $or: [{ article: { $regex: string, $options: 'i' } }],
    }
  }

  switch (statusQuery) {
    case 'completed':
    case 'nofunds':
    case 'created':
    case 'archived':
      searchQuery.status = { $regex: statusQuery, $options: 'i' }
      break
  }

  switch (dateFilter) {
    case 'today':
      searchQuery.createdDate = {
        $gte: new Date().setHours(0, 0, 0, 0),
        $lt: new Date().setHours(23, 59, 59, 999),
      }
      break
    case '3days':
      searchQuery.createdDate = {
        $gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        $lt: new Date().setHours(23, 59, 59, 999),
      }
      break
    case '7days':
      searchQuery.createdDate = {
        $gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        $lt: new Date().setHours(23, 59, 59, 999),
      }
      break
  }

  const views: any = await View.find({
    user,
    ...searchQuery,
  })
    .sort({ _id: -1 })
    .skip(skip as number)
    .limit(limit as number)

  const format = views.map((view: any, index: any) => {
    return {
      id: view._id,
      place: index + 1,
      status: view.status,
      article: view.article,
      image: view.image,
      amount: view.amount,
      createdDate: view.createdDate,
      text: view.searchText,
      dateStart: view.dateStart,
      dateEnd: view.dateEnd,
      anonim: view.anonim,
      uuid: view.uuid,
    }
  })
  return format
})
