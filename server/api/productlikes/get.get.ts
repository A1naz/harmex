import { ProductLike } from '~~/server/lib/models/ProductLike'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

  const likes = await ProductLike.find({ user })
  const format = likes.map((like, index) => {
    return {
      id: like._id,
      place: index + 1,
      name: like.name,
      url: like.url,
      type: like.type,
      status: like.status,
      amount: like.amount,
      image: like.image,
      createdDate: like.createdDate,
      endedDate: like.endedDate || null,
    }
  })
  return format
})
