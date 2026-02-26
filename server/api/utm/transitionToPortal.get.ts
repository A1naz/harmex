import mongoose from 'mongoose'
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
    let utmTag = await UTMTag.findOne({ utmCode })

    if (!utmTag) {
      utmTag = await UTMTag.create({
        utmCode,
        name: utmCode,
        createdBy: new mongoose.Types.ObjectId(),
        createdByUsername: 'auto',
        transitionToPortal: 0,
      })
    }

    utmTag.transitionToPortal = (utmTag.transitionToPortal || 0) + 1
    await utmTag.save()

    // Создаем запись о клике для отслеживания даты
    await UTMClick.create({
      utmCode,
      type: 'portal',
      date: new Date(),
    })

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

