import { UTMTag } from '~/server/lib/models/UTMTag'
import { UTMClick } from '~/server/lib/models/UTMClick'

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

    utmTag.transitionToLanding = (utmTag.transitionToLanding || 0) + 1
    await utmTag.save()

    // Создаем запись о клике для отслеживания даты
    await UTMClick.create({
      utmCode,
      type: 'landing',
      date: new Date(),
    })

    return {
      status: 'success',
      transitionToLanding: utmTag.transitionToLanding,
    }
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Ошибка при обновлении UTM метки',
    })
  }
})

