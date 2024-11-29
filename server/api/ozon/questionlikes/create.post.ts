import { QuestionLike } from '~/server/lib/models/ozon/QuestionLikes'
import { findImage } from '~~/server/lib/helpers'
import { DocuemntEnum } from '~/data/enums'
import { v4 as uuid } from 'uuid'

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const params = getQuery(event)
  const { userTimezoneOffsetHours, userOffsetMinutes } = params

  const body = await readBody(event)

  const { period, article, reviews, dates, comments }: any = body

  let likes = 0
  let dislikes = 0
  reviews.forEach((review: any) => {
    likes += review.likes
    dislikes += review.dislikes
    review.type = 'main';
  })


  if (!article || (!reviews && !comments)) {
    throw createError({
      statusCode: 400,
      message: 'no article or reviews',
    })
  }
  const balanceIsExist = await checkBalance(user, {article, amount: likes + dislikes,mp: 'ozon'}, 'likes')

  if(!balanceIsExist){
    throw createError({
      statusCode: 400,
      message:
        `Недостаточно средств для публикаций лайков на отзывы`,
    })
  }
  // const image = findImage(Number(article))

  comments.forEach((comment: any) => {
    likes += comment.likes
    dislikes += comment.dislikes
    comment.type = 'comment';
  })

  const created = new QuestionLike({
    user,
    article,
    reviews,
    period,
    likes,
    dislikes,
    questions: [...reviews, ...comments],
    total: likes + dislikes,
    image: 'null',
    createdDate: new Date(),
    uuid: uuid(),
  })

  
  const res = await created.save()
  
  await userLog(event, {
    documentType: DocuemntEnum.QuestionLikes,
    documentId: res._id,
  })

  return {
    status: 'ok',
  }
})
