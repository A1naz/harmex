import { Buyout } from '@/server/lib/models/ozonHotels/Buyout'
import { Delivery } from '@/server/lib/models/ozonHotels/Delivery'
import { User } from '@/server/lib/models/User'
import { DocuemntEnum } from '~/data/enums'

export default eventHandler(async (event) => {
  const session = (await getAdminEntity(event)) as any
  if (!session)
    return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)

  const body = await readBody(event)

  const found: any = await Buyout.findOne({ uuid: body.uuid })
  if (!found) {
    throw createError({
      statusCode: 404,
      message: 'Выкуп не найден',
    })
  }

  if (found.completed > 0) {
    throw createError({
      statusCode: 400,
      message: 'Нельзя удалить выкуп с оформленным заказом',
    })
  }

  if (found.status === 'work') {
    throw createError({
      statusCode: 404,
      message: 'Выкуп, принятый в работу удалить нельзя.',
    })
  }
  const delivery = await Delivery.findOne({ idbuyout: found._id })
  if (delivery) {
    throw createError({
      statusCode: 400,
      message: 'Нельзя удалить заказ, который оплачен',
    })
  }

  const deleted = await Buyout.deleteOne({ uuid: body.uuid })
  if (deleted) {
    await userLog(event, {
      documentType: DocuemntEnum.Buyout,
      documentId: body.uuid,
    })

    return {
      status: 'ok',
    }
  }
  throw createError({
    statusCode: 500,
    message: 'Не удалось удалить заказ',
  })
})
