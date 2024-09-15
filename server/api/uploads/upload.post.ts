import { getServerSession } from '#auth'
import axios from 'axios'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)

  const body = await readBody(event)
  const params = getQuery(event)

  return res
})
