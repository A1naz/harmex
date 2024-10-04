import { Service } from '~/server/lib/models/Service'

export default eventHandler(async (event) => {
  const { slug } = getQuery(event)
  if (!slug)
    throw createError({ statusCode: 400, statusMessage: 'Missing slug' })

  const service = await Service.findOne({ slug }).select('-_id -__v')

  if (!service)
    throw createError({ statusCode: 404, statusMessage: 'Service not found' })

  return {
    status: 'ok',
    service,
  }
})
