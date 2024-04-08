import { QuestionLike } from '~/server/lib/models/ozon/QuestionLikes'

export default eventHandler(async (event) => {
    
    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

  const { string, type } = getQuery(event)

  const all = await QuestionLike.find({ user })
  let buyouts
 if (type === 'article') {
    buyouts = await QuestionLike.find({
      user,
      $or: [
        { article: { $regex: string, $options: 'i' } },
      ],
    })
  }
  else {
    buyouts = await QuestionLike.find({ user })
      .sort({ createdAt: -1 })
      .skip(0)
      .limit(50)
  }

  const format = buyouts.map((buyout, index) => {
    const place = all.findIndex(item => item.user === buyout.user)
    return {
      id: buyout._id,
      place: index + 1,
      image: buyout.image,
      article: buyout.article,
      likes: buyout.likes,
      dislikes: buyout.dislikes,
      status: buyout.status,
      total: buyout.total,
      createdDate: buyout.createdDate,
      endedDate: buyout.endedDate,
      dateStart: buyout.dateStart,
      dateEnd: buyout.dateEnd
    }
  })
  return format
})
