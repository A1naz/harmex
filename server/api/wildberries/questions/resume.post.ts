import { Question } from '~~/server/lib/models/wildberries/Question'
import { DocuemntEnum } from '~/data/enums'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

  const { item } = await readBody(event)
  const question = await Question.findOne({ user, _id: item.id })
  if (!question) {
    throw createError({
      statusCode: 400,
      message: 'Вопрос не найден',
    })
  }
  question.status = 'created';
  const res = await question.save();
  return {
    status: 'ok',
  }
})
