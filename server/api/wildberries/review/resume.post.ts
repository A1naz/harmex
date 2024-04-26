import { Review } from '~~/server/lib/models/wildberries/Review'
import { DocuemntEnum } from '~/data/enums'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

  const { item } = await readBody(event)
  const review = await Review.findOne({ user, _id: item.id })
  if (!review) {
    throw createError({
      statusCode: 400,
      message: 'Отзыв не найден',
    })
  }
  review.status = 'waiting';
  const res = await review.save();
  return {
    status: 'ok',
  }
})
