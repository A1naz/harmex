import { DocuemntEnum } from '~/data/enums'
import { BuyoutTemplate } from '~/server/lib/models/flowwow/BuyoutTemplate'
import { User } from '~/server/lib/models/User'

export default eventHandler(async (event) => {
  const user = (await getAdminEntity(event)) as any

  if (!user)
    return sendRedirect(event, '/auth', 302)

  const query = getQuery(event)
  const uuid = query.uuid
  await BuyoutTemplate.deleteOne({ uuid })

  await userLog(event, {
    documentType: DocuemntEnum.Buyout,
    documentId: uuid,
    comment: 'удаление шаблона',
  })

  return { status: 'ok' }
})
