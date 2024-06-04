import { User } from '@/server/lib/models/User'
import { Prices } from '~~/server/lib/models/Prices'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

  const data = await Prices.find({ })

  return data[0].tariffs
})
