import { Buyout } from '@/server/lib/models/Buyout'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

    const body = await readBody(event)

  const found = await Buyout.findOne({ user, uuid: body.uuid })
  if (!found) {
    throw createError({
      statusCode: 404,
      message: 'not found',
    })
  }
  if (found.status === 'paused' || found.status === 'nofunds')
    found.status = 'active'
  await found.save()
  return {
    status: 'ok',
  }
})
