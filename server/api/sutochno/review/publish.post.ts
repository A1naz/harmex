import { Delivery } from '@/server/lib/models/sutochno/Delivery'
import { Buyout } from '@/server/lib/models/sutochno/Buyout'
import { Review } from '@/server/lib/models/sutochno/Review'
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
    videoKey,
    video,
  } = await readBody(event)



  const balanceIsExist = await checkBalance(user, { buyoutuuid, video: false, mp: 'flowwow' }, 'reviews')

  if (!balanceIsExist) {
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

  // const images = photos.map((photo: any) =>
  //   photo.public.replace(
  //     config.public.DOMAIN_API_IMAGES_URL + 'reviewImages/',
  //     ''
  //   )
  // )

  const allowedExtensions = ['.png', '.gif', '.jfif', '.pjpeg', '.jpeg', '.pjp', '.jpg']
  for (const photo of photos) {
    if (!photo.url) {
      continue
    }
    const extension = photo.url.substring(photo.url.lastIndexOf('.')).toLowerCase()
    if (!allowedExtensions.includes(extension)) {
      throw createError({
        statusCode: 400,
        message: 'Неверный формат файла',
      })
    }
  }

  const review = new Review({
    article: buyout.article,
    name: buyout.product.name,
    uuidbuyout: buyout.uuid,
    images: photos.map((photo: any) => photo.url),
    rating,
    text,
    date,
    publishDate: date,
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
