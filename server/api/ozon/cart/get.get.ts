import { User } from '@/server/lib/models/User'
import { Cart } from '~/server/lib/models/ozon/Cart'

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

  let carts = []
  let searchQuery: { status?: any, $or?: any, createdDate?: any } = {}
  if (type === 'article') {
    searchQuery = {
      $or: [{ article: { $regex: string, $options: 'i' } }],
    }
  }

  switch (statusQuery) {
    case 'completed':
    case 'nofunds':
    case 'work':
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

  carts = await Cart.find({
    user,
    ...searchQuery,
  })
    .sort({ _id: -1 })
    .skip(skip as number)
    .limit(limit as number)

  const format = carts.map((cart, index) => {
    return {
      id: cart._id,
      place: index + 1,
      name: cart.name,
      status: cart.status,
      article: cart.article,
      amount: cart.amount,
      image: cart.image,
      size: cart.size,
      query: cart.query,
      createdDate: cart.createdDate,
      endedDate: cart.endedDate || null,
      uuid: cart.uuid,
    }
  })
  return format
})
