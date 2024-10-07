import { Service } from '~/server/lib/models/Service'

export default eventHandler(async (event) => {
  const services = await Service.find().select('-_id -__v')

  if (!services || !services.length)
    return {
      status: 'error',
      error: [],
    }
    
    console.log(services);
    
  return {
    status: 'ok',
    services,
  }
})
