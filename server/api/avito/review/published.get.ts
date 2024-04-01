import { Review } from '~~/server/lib/models/avito/Review'
import { Delivery } from '~/server/lib/models/avito/Delivery'
import { ObjectId } from 'mongodb'
import { SelectOptionsReviews } from '@/data/enums'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

    const { skip, limit, tab, search } = getQuery(event)

    let searchParse = search ? JSON.parse(search?.toString()) : {}

    if (Object.values(searchParse)[0] !== '') {
        if (Object.keys(searchParse)[0] == SelectOptionsReviews.idReview) {
            searchParse = { _id: new ObjectId(searchParse[SelectOptionsReviews.idReview]) }
        }
    }

    let reviews: any = []
    let query: any = { user }

    if (Object.keys(searchParse)[0] !== SelectOptionsReviews.uuidBuyout) {
        query = Object.assign(query, searchParse)
    }

    if (tab === 'all') {
        reviews = await Review.find(query)
            .sort({ _id: -1 })
            .skip((skip as number) || 0)
            .limit((limit as number) || 0)
    } else if (tab === 'work') {
        query = Object.assign(query, { status: { $in: ['created', 'working', 'waiting', 'work'] } })
        reviews = await Review.find(query)
            .sort({ _id: -1 })
            .skip((skip as number) || 0)
            .limit((limit as number) || 0)
    } else if (tab) {
        query = Object.assign(query, { status: tab.toString() })
        reviews = await Review.find(query)
            .sort({ _id: -1 })
            .skip((skip as number) || 0)
            .limit((limit as number) || 0)
    }

    let format = await Promise.all(
        reviews.map(async (review: any) => {
            const format: any = {
                id: review._id,
                article: review.article,
                name: review.name,
                text: review.text,
                rating: review.rating,
                images: review.images,
                date: review.date,
                status: review.status,
            }

            const delivery = await Delivery.findOne({ _id: review.delivery })
            if (delivery) {
                format['buyoutuuid'] = delivery.uuidbuyout
            }

            return format
        })
    )

    if (Object.keys(searchParse)[0] == SelectOptionsReviews.uuidBuyout) {
        format = format.filter(rev => rev.buyoutuuid == searchParse[SelectOptionsReviews.uuidBuyout])
    }

    return format
})




// refactor all this
