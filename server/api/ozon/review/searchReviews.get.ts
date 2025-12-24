import { Delivery } from '@/server/lib/models/ozon/Delivery'
import { Review } from '@/server/lib/models/ozon/Review'

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event)
  if (!user)
    return sendRedirect(event, '/auth', 302)

  const { type, status, string } = getQuery(event)

  let reviews: any = []

  if (type === 'article') {
    if (!Number(string))
      return []
    reviews = await Review.find({
      user: user._id,
      status,
      article: string,
    }).sort({
      createdAt: -1,
    })
    if (!reviews)
      return []
  }

  if (type === 'uuidReview') {
    reviews = await Review.find({ _id: string }).sort({ createdAt: -1 })
    if (!reviews)
      return []
  }

  if (type === 'uuid') {
    const uuid = string?.toString().replaceAll('#', '')

    const deliveries = await Delivery.findOne({
      user,
      uuidbuyout: uuid,
    })

    reviews = await Review.find({
      user,
      status,
      delivery: { $in: deliveries },
    }).sort({
      createdAt: -1,
    })
  }

  if (!reviews)
    return []

  const format = await Promise.all(
    reviews.map(async (review: any) => {
      const format: any = {
        article: review.article,
        name: review.name,
        text: review.text,
        rating: review.rating,
        images: review.images,
        date: review.publishDate ? review.publishDate : review.date,
        status: review.status,
        createdAt: review.createdAt,
        // Измененные поля
        textEdited: review.textEdited,
        ratingEdited: review.ratingEdited,
        imagesEdited: review.imagesEdited,
        videoKeyEdited: review.videoKeyEdited,
        originalVideoNameEdited: review.originalVideoNameEdited,
        isPhotoEnabledEdited: review.isPhotoEnabledEdited,
        isVideoEnabledEdited: review.isVideoEnabledEdited,
        publishDateEdited: review.publishDateEdited,
        editedAt: review.editedAt,
      }

      const delivery = await Delivery.findOne({ _id: review.delivery })
      if (delivery) {
        format.buyoutuuid = delivery.uuidbuyout
      }

      return format
    }),
  )
  return format.filter(item => item !== undefined)
})
