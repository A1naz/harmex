import { UTMTag } from '~/server/lib/models/UTMTag'

export default eventHandler(async (event) => {
  const { utmCode } = getQuery(event)

  if (!utmCode || typeof utmCode !== 'string') {
    throw createError({
      statusCode: 400,
      message: 'UTM код не указан',
    })
  }

  try {
    const utmTag = await UTMTag.findOne({ utmCode })

    if (!utmTag) {
      throw createError({
        statusCode: 404,
        message: 'UTM метка не найдена',
      })
    }

    utmTag.transitionToPortal = (utmTag.transitionToPortal || 0) + 1
    await utmTag.save()

    return {
      status: 'success',
      transitionToPortal: utmTag.transitionToPortal,
    }
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Ошибка при обновлении UTM метки',
    })
  }
})

