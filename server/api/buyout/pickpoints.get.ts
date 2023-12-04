import { getServerSession } from '#auth'
import getPoints from '~/server/lib/getPoints'

export default eventHandler(async (event) => {
    
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)

    const points =  await getPoints()  

    return points

})
