import { Question } from '~/server/lib/models/ozon/Question'
import { DocuemntEnum } from '~/data/enums'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

  const { productData, article, publishDate, gender, questionText } = await readBody(event)
  const { image } = productData
  console.log(productData, article, publishDate, gender, questionText, image)

  if (questionText.length < 10 || questionText.length > 1000) {
    throw createError({
      statusCode: 400,
      message: 'Текст вопроса должен быть длиннее 10 символов и меньше 1000',
    })
  }
  const date = new Date(publishDate) < new Date() ? new Date() : publishDate
  const created = new Question({
    user,
    article: Number(article),
    publishDate: date,
    createdDate: new Date(),
    gender,
    text: questionText,
    image,
  })
  const res = await created.save()

  await userLog(event,
    {
        documentType: DocuemntEnum.Question,
        documentId: res._id,
    })

  return {
    status: 'ok',
  }
})
