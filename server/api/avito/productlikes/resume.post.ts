import { ProductLike } from '~/server/lib/models/avito/ProductLike'
import { DocuemntEnum } from '~/data/enums'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

  const { item } = await readBody(event)
  const productLike = await ProductLike.findOne({ user, _id: item.id })
  if (!productLike) {
    throw createError({
      statusCode: 400,
      message: 'Вопрос не найден',
    })
  }
  productLike.status = 'work';
  const res = await productLike.save();
  await userLog(event,
    {
        documentType: DocuemntEnum.ProductsLike,
        documentId: item.uuid ,
        comment: 'Возобновлен документ'
    })
  return {
    status: 'ok',
  }
})
