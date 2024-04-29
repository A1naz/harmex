import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { Cart } from '~~/server/lib/models/wildberries/Cart'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)
    
  const { dateFilter,string, type } = getQuery(event)

  const carts = await Cart.find({ user })
  let filter = carts

  if (type === 'article') {
    filter = await Cart.find({
      user,
      $or: [
        { article: { $regex: string, $options: 'i' } },
      ],
    })
  }
  else {
    filter = await Cart.find({ user })
      .sort({ createdAt: -1 })
      .skip(0)
      .limit(50)
  }

  const today = new Date(Date.now())
  today.setHours(0, 0, 0, 0)
  switch (dateFilter) {
    case 'completed':
      filter = await Cart.find({
        user,
        $or: [
          { status: { $regex: dateFilter, $options: 'i' } },
        ],
      })
      break
    case 'nofunds':
    filter = await Cart.find({
      user,
      $or: [
        { status: { $regex: dateFilter, $options: 'i' } },
      ],
    })
    break
    case 'work':
      filter = await Cart.find({
        user,
        $or: [
          { status: { $regex: dateFilter, $options: 'i' } },
        ],
      })
      break
    case 'today':
      filter = carts.filter(item => new Date(item.createdDate) > today)
      break
    case '3days':
      filter = carts.filter(item => new Date(item.createdDate) > new Date(Date.now() - 1000 * 60 * 60 * 24 * 3))
      break
    case '7days':
      filter = carts.filter(item => new Date(item.createdDate) > new Date(Date.now() - 1000 * 60 * 60 * 24 * 7))
      break
  }

  const format = (filter ? filter : carts).map((cart, index) => {
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
