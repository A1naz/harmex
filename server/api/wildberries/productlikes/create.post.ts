import { ProductLike } from '~~/server/lib/models/wildberries/ProductLike'
import { DocuemntEnum } from '~/data/enums'
import { v4 as uuid } from 'uuid'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

  const { url, amount, period, productData } = await readBody(event)
  if (amount > 1000 || amount <= 0) {
    throw createError({
      statusCode: 400,
      message: 'Не больше 1000 лайков за один заказ',
    })
  }
  const { type, image, name } = productData
  const created = new ProductLike({
    user,
    url,
    amount,
    period,
    type,
    image,
    name,
    createdDate: new Date(),
    uuid: uuid(),
  })
  const res = await created.save()

  await userLog(event,
    {
        documentType: DocuemntEnum.ProductsLike,
        documentId: res.uuid,
    })

  return {
    status: 'ok',
  }
})
