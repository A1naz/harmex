import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { Review } from '~~/server/lib/models/Review'
import { Buyout } from '@/server/lib/models/Buyout'
import { Delivery } from '~/server/lib/models/Delivery'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  const { skip, limit } = getQuery(event)

  if (!session) return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid })
  if (!user) return sendRedirect(event, '/auth', 302)
  const { status } = getQuery(event)
  let reviews: any = []
  if (status === 'all')
    reviews = await Review.find({ user })
      .sort({ _id: -1 })
      .skip((skip as number) || 0)
      .limit((limit as number) || 0)
  else if (status === 'work')
    reviews = await Review.find({
      user,
      status: { $in: ['created', 'working', 'waiting', 'work'] },
    })
      .sort({ _id: -1 })
      .skip((skip as number) || 0)
      .limit((limit as number) || 0)
  else if (status)
    reviews = await Review.find({ user, status: status.toString() })
      .sort({ _id: -1 })
      .skip((skip as number) || 0)
      .limit((limit as number) || 0)
  const format = await Promise.all(
    reviews.map(async (review: any) => {
      const format: any = {
        uuid: review._id,
        article: review.article,
        name: review.name,
        text: review.text,
        rating: review.rating,
        images: review.images,
        date: review.date,
        status: review.status,
      }

      const delivery = await Delivery.findOne({ _id: review.delivery })
      if (delivery) {
        format['buyoutuuid'] = delivery.uuidbuyout
      }

      return format
    })
  )
  return format
})
