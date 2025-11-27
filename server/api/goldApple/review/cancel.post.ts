import { Review } from '~/server/lib/models/goldApple/Review'
import {Delivery} from '~/server/lib/models/goldApple/Delivery'

export default eventHandler(async (event) => {
    const user = await getAdminEntity(event)
    if (!user) {
        return sendRedirect(event, '/auth', 302)
    }

    const { uuid } = await readBody(event)
    const review = await Review.findOne({ uuid })
    if (!review) {
        throw createError({
            statusCode: 404,
            message: 'Отзыв не найден',
        })
    }

    if (review.status !== 'waiting') {
        throw createError({
            statusCode: 400,
            message: 'Можно отменять только заявки на отзыв в статусе "waiting"',
        })
    }

    const delivery = await Delivery.findOne({ _id: review.delivery })
    if (!delivery) {
        throw createError({
            statusCode: 404,
            message: 'Доставка не найдена',
        })
    }

    delivery.reviewed = false
    await delivery.save()
    await Review.deleteOne({ uuid: review.uuid })

    return {
        message: 'Заявка на отзыв успешно отменена',
    }
})