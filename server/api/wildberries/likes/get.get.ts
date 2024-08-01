import { Like } from '~~/server/lib/models/wildberries/Like'

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

    const { dateFilter, statusQuery, string, type, skip = 0, limit = 50 } = getQuery(event)

  let likes = []

  let searchQuery: { status?: any, $or?: any, createdDate?: any } = {};
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
        $lt: new Date().setHours(23, 59, 59, 999)
      };
      break;
    case '3days':
      searchQuery.createdDate = {
        $gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        $lt: new Date().setHours(23, 59, 59, 999)
      };
      break;
    case '7days':
      searchQuery.createdDate = {
        $gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        $lt: new Date().setHours(23, 59, 59, 999)
      };
      break;
  }
  
  likes = await Like.find({
    user,
    ...searchQuery,
  }).sort({ _id: -1 })
  .skip(skip as number)
  .limit(limit as number)

  const format = likes.map((review, index) => {
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
      dateEnd: review.dateEnd,
      uuid: review.uuid,
      period: review.period,
    }
  })
  return format
})
