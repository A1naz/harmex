import { View } from '~/server/lib/models/wildberries/View'
import { v4 as uuid } from 'uuid'
import { DocuemntEnum } from '~/data/enums'

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const {
    article,
    dateStart,
    dateEnd,
    searchType,
    productData,
    searchQuery,
    amount,
  } = await readBody(event)
  const { image } = productData

  const created = new View({
    user,
    dateStart,
    dateEnd,
    searchText: searchQuery,
    image,
    uuid: uuid(),
    article: Number(article),
    createdDate: new Date(),
    amount,
    searchType,
  })
  const res = await created.save()

  await userLog(event, {
    documentType: DocuemntEnum.Question,
    documentId: res.uuid,
  })

  return {
    status: 'ok',
  }
})
