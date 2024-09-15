import { Like } from '~/server/lib/models/ozon/Like'
import { DocuemntEnum } from '~/data/enums'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

  const { item } = await readBody(event)

  const like = await Like.findOne({ user, _id: item.id })
  if (!like) {
    throw createError({
      statusCode: 400,
      message: 'Лайк на отзыв не найден',
    })
  }
  like.status = 'work';
  const res = await like.save();
  await userLog(event,
    {
        documentType: DocuemntEnum.Like,
        documentId: item.uuid,
        comment: 'Возобновлен документ'
    })
  return {
    status: 'ok',
  }
})
