import { User } from '~~/server/lib/models/User'
import { DocuemntEnum } from '~/data/enums'

import { ProductLike } from '~/server/lib/models/ozon/ProductLike'

export default eventHandler(async (event) => {
  const session = ((await getUserSession(event)).user) as any
  if (!session)
    return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)

  const body = await readBody(event)
  const id = body.id
  const like = await ProductLike.findById(id)

  if (!like) {
    throw createError({
      statusCode: 400,
      message: 'Услуга не найдена',
    })
  }

  if (like.status !== 'created') {
    throw createError({
      statusCode: 400,
      message: 'Услугу в работе нельзя удалить',
    })
  }

  await like.deleteOne()

  await userLog(event, {
    documentType: DocuemntEnum.ProductsLike,
    documentId: like._id,
  })

  return {
    status: 'ok',
  }
})
