import { Autoanswer } from '~~/server/lib/models/Autoanswer'

export default eventHandler(async (event) => {

  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const body = await readBody(event)
  const { id } = body
  const found = await Autoanswer.findById(id)
  if (!found) {
    throw createError({
      statusCode: 400,
      message: 'Не найден автоответчик',
    })
  }
  await found?.deleteOne()

  await userLog(event,
    {
        documentType: DocuemntEnum.Autoanswer,
        documentId: found._id,
    })

  return {
    status: 'ok',
  }
})
