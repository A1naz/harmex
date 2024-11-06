import { Service } from '~/server/lib/models/Service'

export default eventHandler(async (event) => {
  const { type } = getQuery(event)

  if (type === 'Отели') {
    return {
      status: 'ok',
      services: [],
    }
  }
  else if (type === 'Маркетплейсы') {
    const services: any = await Service.find({})
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
  }
})
