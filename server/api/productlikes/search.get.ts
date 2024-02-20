import { ProductLike } from '~~/server/lib/models/ProductLike'

export default eventHandler(async (event) => {
    
    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

  const { string, type }: any = getQuery(event)

  const all = await ProductLike.find({ user })
  let buyouts
 if (type === 'name') {
    buyouts = await ProductLike.find({
      user,
      $or: [
        { name: { $regex: string, $options: 'i' } },
      ],
    })
  }
  else {
    buyouts = await ProductLike.find({ user })
      .sort({ createdAt: -1 })
      .skip(0)
      .limit(50)
  }

  const format = buyouts.map((buyout, index) => {
    const place = all.findIndex(item => item.name === buyout.name)
    return {
      id: buyout._id,
      place: index + 1,
      name: buyout.name,
      url: buyout.url,
      type: buyout.type,
      status: buyout.status,
      amount: buyout.amount,
      image: buyout.image,
      createdDate: buyout.createdDate,
      endedDate: buyout.endedDate || null,
    }
  })
  return format
})
