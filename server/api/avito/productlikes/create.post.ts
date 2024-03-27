// import { ProductLike } from '~/server/lib/models/ozon/ProductLike'
import { ProductLike } from '~/server/lib/models/avito/ProductLike'
import { DocuemntEnum } from '~/data/enums'

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
  })
  const res = await created.save()

  await userLog(event,
    {
        documentType: DocuemntEnum.ProductsLike,
        documentId: res._id,
    })

  return {
    status: 'ok',
  }
})
