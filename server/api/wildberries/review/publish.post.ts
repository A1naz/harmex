import { Delivery } from '@/server/lib/models/wildberries/Delivery'
import { Buyout } from '@/server/lib/models/wildberries/Buyout'
import { Review } from '@/server/lib/models/wildberries/Review'
import { DocuemntEnum } from '~/data/enums'
import { log } from 'console'
const config = useRuntimeConfig()

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const { buyoutuuid, deliveryid, rating, text, photos, date } = await readBody(
    event
  )

  if (text) {
    if (text.length < 10 || text.length > 1000) {
      throw createError({
        statusCode: 400,
        message:
          'Текст отзыва должен быть длиннее 10 символов и не больше 1000',
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
    reviewed: false,
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
