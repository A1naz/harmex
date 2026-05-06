import { Buyout } from '@/server/lib/models/goldApple/Buyout'
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

  const found = await Buyout.findOne({ uuid: body.uuid, user: user._id })
  if (!found) {
    throw createError({
      statusCode: 400,
      message: 'Выкуп не найден',
    })
  }

  if (found.unArchived) {
    throw createError({
      statusCode: 400,
      message: 'Выкуп уже был разархивирован',
    })
  }

  found.status = 'active'
  found.unArchivedAt = new Date();
  found.unArchived = true;
  await found.save()

  await userLog(event, {
    documentType: DocuemntEnum.Buyout,
    documentId: found.uuid,
    comment: 'убран из архива',
  })

  return {
    status: 'ok',
  }
})
