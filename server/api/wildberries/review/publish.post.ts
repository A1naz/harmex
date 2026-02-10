import { log } from 'node:console'
import { Buyout } from '@/server/lib/models/wildberries/Buyout'
import { Delivery } from '@/server/lib/models/wildberries/Delivery'
import { Review } from '@/server/lib/models/wildberries/Review'
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
    randomTag,
    pvz
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

  // const balanceIsExist = await checkBalance(user, {buyoutuuid, video, mp: 'wildberries'}, 'reviews')

  // if(!balanceIsExist){
  //   throw createError({
  //     statusCode: 400,
  //     message:
  //       `Недостаточно средств для совершения отзыва`,
  //   })
  // }

  const buyout = await Buyout.findOne({ uuid: buyoutuuid })

  if (!buyout) {
    return createError({
      statusCode: 400,
      message: 'Не удалось найти выкуп',
    })
  }

  const deliveryQuery: any = {
    _id: deliveryid,
    idbuyout: buyout._id,
  }

  if (pvz === true) {
    deliveryQuery.reviewedPVZ = { $ne: true }
  } else {
    deliveryQuery.reviewed = { $ne: true }
  }

  const delivery = await Delivery.findOne(deliveryQuery)

  if (!delivery) {
    return createError({
      statusCode: 400,
      message: 'Доставка не найдена',
    })
  }

  let isPhotoEnabled = false
  photos.forEach((photo: any) => {
    if (photo.url && photo.url !== '') {
      isPhotoEnabled = true
    }
  })

  const allowedExtensions = ['.png', '.gif', '.pjpeg', '.jpeg', '.jpg']
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
    isPhotoEnabled,
    rating,
    text,
    positive,
    negative,
    date,
    pvz,
    publishDate: date,
    user,
    delivery,
    randomTag,
    images: photos.map((photo: any) => photo.url),
    status: 'waiting',
    recipientphone: delivery.recipientphone,
    videoKey: videoKey !== 'reviewVideos/.' ? videoKey : '',
    originalVideoName: video,
    isVideoEnabled: video !== '',
    createdAt: Date.now(),
    uuid: uuid(),
    point: buyout.point,

  })


  const res = await review.save()



  if (pvz === true) {
    delivery.reviewedPVZ = true
  } else {
    delivery.reviewed = true
  }
  await delivery.save()

  await userLog(event, {
    documentType: DocuemntEnum.Review,
    documentId: res._id,
  })

  return {
    message: 'Отзыв успешно добавлен',
  }
})
