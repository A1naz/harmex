import { Like } from '~~/server/lib/models/wildberries/Like'
import { findImage } from '~~/server/lib/helpers'
import { DocuemntEnum } from '~/data/enums'

export default eventHandler(async (event) => {

  console.log('creating like');
  
    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

  const params = getQuery(event)
  const { userTimezoneOffsetHours, userOffsetMinutes } = params

  const body = await readBody(event)
  const article = body.article
  const reviews: any[] = body.reviews
  const dates: any[] = body.dates
  let likes = 0
  let dislikes = 0
  reviews.forEach((review: any) => {
    likes += review.likes
    dislikes += review.dislikes
  })
  if (!article || !reviews) {
    throw createError({
      statusCode: 400,
      message: 'no article or reviews',
    })
  }
  const image = findImage(Number(article))
  const created = new Like({
    user,
    article,
    reviews,
    likes,
    dislikes,
    total: likes + dislikes,
    image,
    createdDate: new Date(),
  })
  if (dates) {
    if (userTimezoneOffsetHours && userOffsetMinutes) {
      const date1 = new Date(dates[0])
      const date2 = new Date(dates[1])
      date1.setHours(date1.getHours() + Number(userTimezoneOffsetHours))
      date2.setHours(date2.getHours() + Number(userTimezoneOffsetHours))
      date1.setMinutes(date1.getMinutes() + Number(userOffsetMinutes))
      date2.setMinutes(date2.getMinutes() + Number(userOffsetMinutes))

      created.dateStart = date1
      created.dateEnd = date2
    }
  }
  const res = await created.save()

  await userLog(event,
    {
        documentType: DocuemntEnum.Like,
        documentId: res._id,
    })
console.log(created);

  return {
    status: 'ok',
  }
})
