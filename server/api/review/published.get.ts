import { Review } from '~~/server/lib/models/Review'
import { Delivery } from '~/server/lib/models/Delivery'
import { ObjectId } from 'mongodb'

export default eventHandler(async (event) => {

  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const { skip, limit, tab, search } = getQuery(event)
  let searchParse = search ? JSON.parse(search?.toString()) : {}

  if(Object.keys(searchParse)[0] == 'id' && searchParse.id.length > 0 ){
    searchParse = {_id: new ObjectId(searchParse.id)}
  }

  let reviews: any = []

  if (tab === 'all')
    reviews = await Review.find({ user })
      .sort({ _id: -1 })
      .skip((skip as number) || 0)
      .limit((limit as number) || 0)
      
  else if (tab === 'work')
    reviews = await Review.find({
      user,
      status: { $in: ['created', 'working', 'waiting', 'work'] },
    })
      .sort({ _id: -1 })
      .skip((skip as number) || 0)
      .limit((limit as number) || 0)

  else if (tab)
    reviews = await Review.find({ user, status: tab.toString(), ...searchParse })
      .sort({ _id: -1 })
      .skip((skip as number) || 0)
      .limit((limit as number) || 0)

  const format = await Promise.all(
    reviews.map(async (review: any) => {
      const format: any = {
        uuid: review._id,
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
  return format
})
