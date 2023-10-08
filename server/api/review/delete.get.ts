import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { Review } from '~~/server/lib/models/Review'
import { Buyout } from '@/server/lib/models/Buyout'
import { Delivery } from '~/server/lib/models/Delivery'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  const { id } = getQuery(event)

  if (!session) return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid })
  if (!user) return sendRedirect(event, '/auth', 302)

  const found = await Review.findById(id)
  if (!found) {
    throw createError({
      statusCode: 404,
      message: 'Отзыв не найден',
    })
  }

  if (found.status !== 'published') {
    throw createError({
      statusCode: 400,
      message: 'Можно удалять только опубликованные отзывы',
    })
  }

  found.status = 'deleting'
  await found.save()

  return { status: 'ok' }
})
