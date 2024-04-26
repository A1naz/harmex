import { ProductLike } from '~~/server/lib/models/wildberries/ProductLike'
import { DocuemntEnum } from '~/data/enums'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

  const { item } = await readBody(event)
  const productLike = await ProductLike.findOne({ user, _id: item.id })
  if (!productLike) {
    throw createError({
      statusCode: 400,
      message: 'Лайк на товар/бренд не найден',
    })
  }
  productLike.status = 'work';
  const res = await productLike.save();
  return {
    status: 'ok',
  }
})
