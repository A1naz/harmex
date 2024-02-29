import { User } from '~/server/lib/models/User'
import { BuyoutTemplate } from '~/server/lib/models/BuyoutTemplate'
import { getServerSession } from '#auth'

export default eventHandler(async (event) => {

  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid })
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
