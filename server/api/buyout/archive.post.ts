import { Buyout } from '@/server/lib/models/Buyout'
import { Delivery } from '~~/server/lib/models/Delivery'
import { DocuemntEnum } from '~/data/enums'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

    const body = await readBody(event)

  const found = await Buyout.findOne({ uuid: body.uuid })
  if (!found) {
    throw createError({
      statusCode: 404,
      message: 'not found',
    })
  }
  if (found.status === 'work') {
    throw createError({
      statusCode: 404,
      message: 'Выкуп, принятый в работу архивировать нельзя.',
    })
  }
  const delivery = await Delivery.findOne({ idbuyout: found })
  if (delivery) {
    throw createError({
      statusCode: 400,
      message: 'Нелья архивировать выкуп, который уже оплачен',
    })
  }
  found.status = 'archived'
  await found.save()

  await userLog(event,
    {
        documentType: DocuemntEnum.Buyout,
        documentId: found._id,
        comment: 'помещен в архив'
    })

  return {
    status: 'ok',
  }
})
