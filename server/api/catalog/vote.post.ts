import { disables } from '@antfu/eslint-config'
import { Service } from '~/server/lib/models/Service'
import { User } from '~/server/lib/models/User'

export default eventHandler(async (event) => {
  const userAuth = await getAdminEntity(event)

  if (!userAuth)
    return sendRedirect(event, '/auth', 302)
  const { slug }: any = getQuery(event)

  if (!slug)
    throw createError({ statusCode: 400, statusMessage: 'Missing slug' })

  const user = await User.findOne({ uuid: userAuth.uuid })

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  const votedFor = user.votedFor || []
  if (votedFor.includes(slug)) {
    return { message: 'Вы уже голосовали за данный маркетплейс' }
  }

  const services = await Service.findOne({ slug })

  if (!services) {
    return {
      status: 'error',
      error: [],
    }
  }
  user.votedFor = votedFor
  user.votedFor.push(slug)

  await user.save()

  services.votes += 1

  await services.save()

  return {
    status: 'ok',
    services,
  }
})
