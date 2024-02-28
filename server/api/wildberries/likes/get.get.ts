import { Like } from '~~/server/lib/models/wildberries/Like'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

  const { dateFilter } = getQuery(event)

  const likes = await Like.find({ user }).sort({ _id: -1 })

  let filter = likes

  const today = new Date(Date.now())
  today.setHours(0, 0, 0, 0)
  switch (dateFilter) {
    case 'completed':
      filter = await Like.find({
        user,
        $or: [
          { status: { $regex: dateFilter, $options: 'i' } },
        ],
      })
      break
    case 'work':
      filter = await Like.find({
        user,
        $or: [
          { status: { $regex: dateFilter, $options: 'i' } },
        ],
      })
      break
    case 'today':
      filter = likes.filter(item => new Date(item.createdDate) > today)
      break
    case '3days':
      filter = likes.filter(item => new Date(item.createdDate) > new Date(Date.now() - 1000 * 60 * 60 * 24 * 3))
      break
    case '7days':
      filter = likes.filter(item => new Date(item.createdDate) > new Date(Date.now() - 1000 * 60 * 60 * 24 * 7))
      break
  }

  const format = (filter ? filter : likes).map((review, index) => {
    return {
      id: review._id,
      place: index + 1,
      image: review.image,
      article: review.article,
      likes: review.likes,
      dislikes: review.dislikes,
      status: review.status,
      total: review.total,
      createdDate: review.createdDate,
      endedDate: review.endedDate,
      dateStart: review.dateStart,
      dateEnd: review.dateEnd
    }
  })
  return format
})
