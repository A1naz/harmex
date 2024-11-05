import { User } from '@/server/lib/models/User'
import { Buyoutlog } from '@/server/lib/models/wildberries/Buyoutlog'

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event)
  if (!user)
    return sendRedirect(event, '/auth', 302)

  const { lt, lg } = getQuery(event)

  const data: any = await $fetch(
    `https://opp-api.ozon.ru/task/creation-availability?location.lat=${lt}&location.lon=${lg}&layer=PvzGroup`,
  )

  return data.geocode.fullText || 'Не удалось определить адрес'
})
