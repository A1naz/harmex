import { v4 as uuid } from 'uuid'
import { BuyoutTemplate } from '~/server/lib/models/wildberries/BuyoutTemplate'
import { DocuemntEnum } from '~/data/enums'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

  const query = getQuery(event)
  
  const title: any = query.title
  const templateUuid = uuid()
  const templateTitle = title.length > 0 ? title : `Шаблон #${templateUuid}`
  const body = await readBody(event)
  const products: any = body

  await BuyoutTemplate.create({
    uuid: templateUuid,
    user: user._id,
    userUuid: user.uuid,
    title: templateTitle,
    buyoutsArray: products,
  })

  await userLog(event,
    {
        documentType: DocuemntEnum.Buyout,
        documentId: templateUuid,
        comment: 'создание шаблона'
    })

  return {
    status: 'ok',
  }
})
