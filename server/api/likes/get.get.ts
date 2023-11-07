import { Like } from '~~/server/lib/models/Like'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

  const likes = await Like.find({ user }).sort({ _id: -1 })
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
      dateEnd: review.dateEnd
    }
  })
  return format
})
