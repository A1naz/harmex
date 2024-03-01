import { BuyoutTemplate } from '~/server/lib/models/ozon/BuyoutTemplate'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

  const templates: any = await BuyoutTemplate.find({ user }).sort({ _id: -1 })
  const format =  templates.map((item: any) => {
    return {
      uuid: item.uuid,
      title: item.title,
      buyoutsArray: item.buyoutsArray,
    }
  })

  return { templates: format }
})
