import { User } from '~/server/lib/models/User'
import { BuyoutTemplate } from '~/server/lib/models/avito/BuyoutTemplate'
import { DocuemntEnum } from '~/data/enums'


export default eventHandler(async (event) => {
  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)
  
  const query = getQuery(event)
  const uuid = query.uuid
  await BuyoutTemplate.deleteOne({ uuid })

  await userLog(event,
    {
        documentType: DocuemntEnum.Buyout,
        documentId: uuid,
        comment: 'удаление шаблона'
    })

  return { status: 'ok' }
})
