import { log } from 'node:console'
import { Buyout } from '@/server/lib/models/yandexMarket/Buyout'
import { Delivery } from '@/server/lib/models/yandexMarket/Delivery'
import { Review } from '@/server/lib/models/yandexMarket/Review'
import { v4 as uuid } from 'uuid'
import { DocuemntEnum } from '~/data/enums'

const config = useRuntimeConfig()

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event)
  if (!user)
    return sendRedirect(event, '/auth', 302)

  const {
    buyoutuuid,
    deliveryid,
    rating,
    text,
    positive,
    negative,
    photos,
    date,
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

  const balanceIsExist = await checkBalance(user, {buyoutuuid, video, mp: 'wildberries'}, 'reviews')

  if(!balanceIsExist){
    throw createError({
      statusCode: 400,
      message:
        `Недостаточно средств для совершения отзыва`,
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
    reviewed: { $ne: true },
  })
  if (!delivery) {
    return createError({
      statusCode: 400,
      message: 'Доставка не найдена',
    })
  }


  const review = new Review({
    article: buyout.article,
    name: buyout.product.name,
    rating,
    text,
    positive,
    negative,
    date,
    publishDate: date,
    user,
    delivery,
    images: photos.map((photo: any) => photo.url),
    status: 'waiting',
    recipientphone: delivery.recipientphone,
    videoKey: videoKey !== 'reviewVideos/.' ? videoKey : '',
    originalVideoName: video,
    isVideoEnabled: video !== '',
    createdAt: Date.now(),
    uuid: uuid(),
  })
  const res = await review.save()
  delivery.reviewed = true
  await delivery.save()

  await userLog(event, {
    documentType: DocuemntEnum.Review,
    documentId: res._id,
  })

  return {
    message: 'Отзыв успешно добавлен',
  }
})
