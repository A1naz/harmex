import { Service } from '~/server/lib/models/Service'

export default eventHandler(async (event) => {
  const { type } = getQuery(event)

  const services: any = await Service.find({ type })
    .select('-_id -__v')
    .sort({ disabled: 1 })

  if (!services || !services.length) {
    return {
      status: 'error',
      error: [],
    }
  }

  return {
    status: 'ok',
    services,
  }

})
