import { QuestionLike } from '~/server/lib/models/ozon/QuestionLikes'
import { DocuemntEnum } from '~/data/enums'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

  const { item } = await readBody(event)
  const questionLike = await QuestionLike.findOne({ user, _id: item.id })
  if (!questionLike) {
    throw createError({
      statusCode: 400,
      message: 'Лайк на вопрос не найден',
    })
  }
  questionLike.status = 'work';
  const res = await questionLike.save();
  await userLog(event,
    {
        documentType: DocuemntEnum.QuestionLikes,
        documentId: item.uuid ,
        comment: 'Возобновлен документ'
    })
  return {
    status: 'ok',
  }
})
