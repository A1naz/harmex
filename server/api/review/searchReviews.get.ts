import { Delivery } from '@/server/lib/models/Delivery'
import { Review } from '@/server/lib/models/Review'
export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)
    
    const { status, type, string } = getQuery(event)

  let reviews: any = []

  if (type === 'article') {
    if (!Number(string)) {
      return []
    }
    reviews = await Review.find({
      user: user._id,
      status: status,
      article: string,
    }).sort({
      createdAt: -1,
    })

    if (!reviews) return []
  } else if (type === 'uuid') {
    const uuid = string?.toString().replaceAll('#', '')

    const deliveries = await Delivery.findOne({
      user,
      uuidbuyout: uuid,
    })

    reviews = await Review.find({
      user,
      status: status,
      delivery: { $in: deliveries },
    }).sort({
      createdAt: -1,
    })
  }

  if (!reviews) return []

  const format = await Promise.all(
    reviews.map(async (review: any) => {
      const format: any = {
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
  return format.filter((item) => item !== undefined)
})
