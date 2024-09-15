import { Buyout } from '~/server/lib/models/Buyout'

export default eventHandler(async (event) => {

  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const buyouts = await Buyout.find({ user }).sort({ createdAt: -1 }).limit(10)
  const lastElements: any[] = []
  buyouts.forEach((item: any) => {
    lastElements.push({
      article: item.article,
      searchQuery: item.searchQuery,
      pvz: item.point,
    })
  })

  return lastElements
})
