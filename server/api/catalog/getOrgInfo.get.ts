import { disables } from '@antfu/eslint-config'
import { Service } from '~/server/lib/models/Service'

export default eventHandler(async (event) => {
  const { serviceType, mp } = getQuery(event)

  const services = await Service.findOne({ slug: mp })
    .select('-_id -__v')
    .sort({ disabled: 1 })

  if (!services || !services.items || !services.items.length) {
    return {
      status: 'error',
      error: [],
    }
  }

  const orgInfo = services.items.find(item => item.path === serviceType).orgInfo || {}

  return {
    status: 'ok',
    orgInfo,
  }
})
