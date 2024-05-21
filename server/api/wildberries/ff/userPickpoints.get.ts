import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { FFPVZ } from '~/server/lib/models/wildberries/FFPVZS'

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const pvzs: any = await FFPVZ.findOne({ user })

  console.log(user._id);
  console.log(pvzs.pvzs);
  
  if (!pvzs || !pvzs.pvzs || !pvzs.pvzs.length) {
    return {
      status: 'ok',
      points: [],
    }
  }
  

  const format = pvzs.pvzs.map((item: any) => {
    return {
      id: item.id,
      a: item.address,
      lt: item.lt,
      lg: item.lg,
    }
  })

  return {
    status: 'ok',
    points: format,
  }
})
