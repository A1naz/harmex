import { User } from '@/server/lib/models/User'
import { Review } from '~~/server/lib/models/sutochno/Review'
import { DocuemntEnum } from '~/data/enums'

export default eventHandler(async (event) => {
  const session = (await getAdminEntity(event)) as any
  if (!session)
    return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)

  const { id } = getQuery(event)

  const found = await Review.findById(id)
  if (!found) {
    throw createError({
      statusCode: 404,
      message: 'Отзыв не найден',
    })
  }

  if (found.status !== 'published') {
    throw createError({
      statusCode: 400,
      message: 'Можно удалять только опубликованные отзывы',
    })
  }

  found.status = 'deleting'
  await found.save()

  await userLog(event, {
    documentType: DocuemntEnum.Review,
    documentId: found._id,
    comment: 'Статус: удаление',
  })

  return { status: 'ok' }
})
