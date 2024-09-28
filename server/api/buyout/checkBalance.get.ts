import { Buyout as wildberriesBuyout } from '@/server/lib/models/wildberries/Buyout'
import { Buyout as ozonBuyout } from '@/server/lib/models/ozon/Buyout'


export default eventHandler(async (event) => {

  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const { uuid } = getQuery(event)

  const ozon = await ozonBuyout.find({ user, status: {$in: ['work', 'active']} }).select('uuid product')
  const wildberries = await wildberriesBuyout.find({ user, status: {$in: ['work', 'active']} }).select('uuid product')

  const format = [...ozon.map((item: any) => ({ ...item.toObject(), mp: 'ozon' })), ...wildberries.map((item: any) => ({ ...item.toObject(), mp: 'wildberries' }))]

  return { buyouts: format, userBalance: user.balance }
})
