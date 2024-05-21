import { Delivery } from '~~/server/lib/models/wildberries/Delivery'
import { Buyout } from '~~/server/lib/models/wildberries/Buyout'
import { DeliveryScreenshotRequest } from '~~/server/lib/models/DeliveryScreenshotRequest'
import { v4 as uuid } from 'uuid'

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

  let foundRequest: any = await DeliveryScreenshotRequest.findOne({ uuid: uuidRequest })

  await DeliveryScreenshotRequest.create({
    uuid: uuidRequest,
    uuidbuyout: deliveryUuid,
    requireDate: new Date(),
    screenshots: '',
    account,
    article,
    mp,
    status: 'created',
  })


  while (true) {
    foundRequest = await DeliveryScreenshotRequest.findOne({ uuid: uuidRequest })
    
    if (foundRequest && foundRequest.status === 'accepted') {
      return foundRequest.screenshots
    }
    if (foundRequest && foundRequest.status === 'rejected') {
      throw createError({
        statusCode: 404,
        message: 'Не удалось получить скриншот',
      })
    }
    await new Promise(resolve => setTimeout(resolve, 10000))
  }
})
