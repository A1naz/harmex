import { Delivery } from '~~/server/lib/models/wildberries/Delivery'
import { Buyout } from '~~/server/lib/models/wildberries/Buyout'
import { DeliveryScreenshotRequest } from '~~/server/lib/models/DeliveryScreenshotRequest'
import { v4 as uuid } from 'uuid'
const config = useRuntimeConfig()

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const { article, mp, deliveryUuid } = await readBody(event)

  const account = user.phoneNumber
  const found: any = await Delivery.findOne({ uuidbuyout: deliveryUuid })
  if (!found) {
    throw createError({
      statusCode: 404,
      message: 'Доставка не найдена',
    })
  }

  const uuidRequest = uuid()

  let foundRequest: any = await DeliveryScreenshotRequest.findOne({
    account: user.phoneNumber,
  }).sort({ _id: -1 })

  if (foundRequest && foundRequest.status === 'created') {
    foundRequest.status = 'rejected'
    await foundRequest.save()
  }

  await DeliveryScreenshotRequest.create({
    uuid: uuidRequest,
    uuidbuyout: deliveryUuid,
    requireDate: new Date(),
    screenshot: '',
    account,
    article,
    mp,
    status: 'created',
  })

  let cycleCount = 0
  while (true) {
    cycleCount++
    
    if (cycleCount > 590) {
      throw createError({
        statusCode: 404,
        message: 'Не удалось получить скриншот',
      })
    }

    foundRequest = await DeliveryScreenshotRequest.findOne({
      uuid: uuidRequest,
    })

    if (foundRequest && foundRequest.status === 'accepted') {
      return config.public.DOMAIN_API_IMAGES_URL +foundRequest.screenshot
    }
    if (foundRequest && foundRequest.status === 'rejected') {
      throw createError({
        statusCode: 404,
        message: 'Не удалось получить скриншот',
      })
    }

    await new Promise((resolve) => setTimeout(resolve, 10000))
  }
})
