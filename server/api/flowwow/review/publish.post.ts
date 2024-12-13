import { Delivery } from '@/server/lib/models/flowwow/Delivery'
import { Buyout } from '@/server/lib/models/flowwow/Buyout'
import { Review } from '@/server/lib/models/flowwow/Review'
import { DocuemntEnum } from '~/data/enums'
import { v4 as uuid } from 'uuid'
const config = useRuntimeConfig()

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const {
    buyoutuuid,
    deliveryid,
    serviceRating,
    deliveryRating,
    valuePerMoneyRating,
    conformityRating,
    publicComment,
    hiddenComment,
    date,
  } = await readBody(event)

  if (publicComment) {
    if (publicComment.length < 10 || publicComment.length > 1000) {
      throw createError({
        statusCode: 400,
        message:
          'Публичный отзыв должен быть длиннее 10 символов и не больше 1000',
      })
    }
  }
  if (hiddenComment) {
    if (hiddenComment.length < 10 || hiddenComment.length > 1000) {
      throw createError({
        statusCode: 400,
        message:
          'Скрытый комментарий должен быть длиннее 10 символов и не больше 1000',
      })
    }
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

  // const images = photos.map((photo: any) =>
  //   photo.public.replace(
  //     config.public.DOMAIN_API_IMAGES_URL + 'reviewImages/',
  //     ''
  //   )
  // )

  const review = new Review({
    article: buyout.article,
    name: buyout.product.name,
    serviceRating,
    deliveryRating,
    valuePerMoneyRating,
    conformityRating,
    publicComment,
    hiddenComment,
    date,
    user,
    delivery,
    idDelivery: delivery.idDelivery,
    status: 'waiting',
    recipientphone: delivery.recipientphone,
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
