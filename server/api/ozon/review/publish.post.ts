import { Delivery } from '@/server/lib/models/ozon/Delivery'
import { Buyout } from '@/server/lib/models/ozon/Buyout'
import { Review } from '@/server/lib/models/ozon/Review'
import { DocuemntEnum } from '~/data/enums'
import { v4 as uuid } from 'uuid'

const config = useRuntimeConfig()

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const {
    buyoutuuid,
    deliveryid,
    rating,
    text,
    photos,
    date,
    positive,
    negative,
    videoKey,
    video,
  } = await readBody(event)

  if (text) {
    if (text.length < 10 || text.length > 1000) {
      throw createError({
        statusCode: 400,
        message:
          'Текст отзыва должен быть длиннее 10 символов и не больше 1000',
      })
    }
  }
  if (rating < 4) {
    throw createError({
      statusCode: 400,
      message:
        'В настоящее время нет возможности публикации отзыва с рейтингом менее 4 звезд',
    })
  }
  const buyout = await Buyout.findOne({ uuid: buyoutuuid })
  if (!buyout) {
    return createError({
      statusCode: 400,
      message: 'Выкуп не найден',
    })
  }
  const delivery = await Delivery.findOne({
    _id: deliveryid,
    idbuyout: buyout._id,
    reviewed: {$ne: true},
  })
  if (!delivery) {
    return createError({
      statusCode: 400,
      message: 'Доставка не найдена',
    })
  }

  const images = photos.map((photo: any) =>
    photo.public.replace(
      config.public.DOMAIN_API_IMAGES_URL + 'reviewImages/',
      ''
    )
  )

  const review = new Review({
    article: buyout.article,
    name: buyout.product.name,
    rating,
    text,
    date,
    user,
    delivery,
    images,
    status: 'waiting',
    recipientphone: delivery.recipientphone,
    positive,
    negative,
    videoKey: videoKey !== 'reviewVideos/.' ? videoKey : '',
    originalVideoName: video,
    isVideoEnabled: video !== '',
    createdAt: Date.now(),
    uuid: uuid(),
  })

  const res = await review.save()
  delivery.reviewed = true

  const saved = await delivery.save()

  await userLog(event, {
    documentType: DocuemntEnum.Review,
    documentId: res._id,
  })

  return {
    message: 'Отзыв успешно добавлен',
  }
})
