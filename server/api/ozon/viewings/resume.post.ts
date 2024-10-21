import { DocuemntEnum } from '~/data/enums'
import { View } from '~/server/lib/models/ozon/View'

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event)
  if (!user)
    return sendRedirect(event, '/auth', 302)

  const { item } = await readBody(event)
  const question = await View.findOne({ user, uuid: item.uuid })
  if (!question) {
    throw createError({
      statusCode: 400,
      message: 'Вопрос не найден',
    })
  }
  question.status = 'created'
  await question.save()
  await userLog(event, {
    documentType: DocuemntEnum.Question,
    documentId: item.uuid,
    comment: 'Возобновлен документ',
  })
  return {
    status: 'ok',
  }
})
