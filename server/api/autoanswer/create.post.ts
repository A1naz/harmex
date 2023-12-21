import { Autoanswer } from '@/server/lib/models/Autoanswer'
import { findImage } from '@/server/lib/helpers'
import { DocuemntEnum } from '~/data/enums'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

  const body = await readBody(event)
  const { article, ratingFilterFrom, ratingFilterTo, text, product, apiKey } = body
  if (!article || !ratingFilterFrom || !ratingFilterTo || !text || !product || !apiKey) {
    throw createError({
      statusCode: 400,
      message: 'Некорректный запрос',
    })
  }
  if (!user.wbApiKeys) {
    throw createError({
      statusCode: 400,
      message: 'Добавьте апи ключ Wildberries для работы автоответчика!',
    })
  }

  const image = findImage(Number(article))
  product.image = image
  const found = await Autoanswer.findOne({ user, article, ratingFilterFrom, ratingFilterTo })

  if (found) {
    throw createError({
      statusCode: 400,
      message: 'Автоответчик с таким фильтром оценок уже существует.',
    })
  }
  const created = new Autoanswer({
    user,
    ratingFilterFrom: parseInt(ratingFilterFrom),
    ratingFilterTo: parseInt(ratingFilterTo),
    text,
    article,
    wbApiKey: apiKey,
    product,
  })
  const res = await created.save()

  await userLog(event,
    {
        documentType: DocuemntEnum.Autoanswer,
        documentId: res._id,
    })

  return {
    status: 'ok',
  }
})
