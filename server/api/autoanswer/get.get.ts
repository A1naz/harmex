import { Autoanswer } from '~~/server/lib/models/Autoanswer'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

  const autoanswers = await Autoanswer.find({ user }).sort({ _id: -1 })
  const format = autoanswers.map((item, index) => {
    return {
      place: index + 1,
      rating: [item.ratingFilterFrom, item.ratingFilterTo],
      product: item.product,
      text: item.text,
      article: item.article,
      status: item.status,
      id: item._id,
    }
  })
  return format
})
