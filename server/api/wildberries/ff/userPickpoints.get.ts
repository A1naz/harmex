import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { FFPVZ } from '~/server/lib/models/wildberries/FFPVZS'

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const pvzs: any = await FFPVZ.findOne({ user })

  if (!pvzs || !pvzs.pvzs || !pvzs.pvzs.length) {
    return {
      status: 'ok',
      points: [],
    }
  }

  const trueDate = new Date(new Date().setHours(0, 0, 0, 0))
  const minDate = new Date(new Date().setHours(trueDate.getHours() - 6))
  const maxDate = new Date(new Date().setHours(trueDate.getHours() + 6))

  const format = pvzs.pvzs.map((item: any) => {
    if (new Date(item.date) >= minDate && new Date(item.date) <= maxDate) {
      return {
        id: item.id,
        a: item.address,
        lt: item.lt,
        lg: item.lg,
      }
    }
  }).filter((item: any) => item !== undefined)
  
  return {
    status: 'ok',
    points: format,
  }
})
