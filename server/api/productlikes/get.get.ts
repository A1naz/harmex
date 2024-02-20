import { ProductLike } from '~~/server/lib/models/ProductLike'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

  const { dateFilter } = getQuery(event)

  const likes = await ProductLike.find({ user })
  let buyouts
  if(dateFilter === 'all' || 'undefined') {
    buyouts = likes 
  }
  const today = new Date(Date.now())
  today.setHours(0, 0, 0, 0)
  switch (dateFilter) {
    case 'completed':
      buyouts = await ProductLike.find({
        user,
        $or: [
          { status: { $regex: dateFilter, $options: 'i' } },
        ],
      })
      break
    case 'work':
      buyouts = await ProductLike.find({
        user,
        $or: [
          { status: { $regex: dateFilter, $options: 'i' } },
        ],
      })
      break
    case 'today':
      buyouts = likes.filter(item => new Date(item.createdDate) > today)
      break
    case '3days':
      buyouts = likes.filter(item => new Date(item.createdDate) > new Date(Date.now() - 1000 * 60 * 60 * 24 * 3))
      break
    case '7days':
      buyouts = likes.filter(item => new Date(item.createdDate) > new Date(Date.now() - 1000 * 60 * 60 * 24 * 7))
      break
  }
  const format = buyouts?.map((like, index) => {
    return {
      id: like._id,
      place: index + 1,
      name: like.name,
      url: like.url,
      type: like.type,
      status: like.status,
      amount: like.amount,
      image: like.image,
      createdDate: like.createdDate,
      endedDate: like.endedDate || null,
    }
  })
  return format
})
