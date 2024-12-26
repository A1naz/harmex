import { Service } from '~/server/lib/models/Service'

export default eventHandler(async (event) => {

  const user = await getAdminEntity(event)


  const { slug } = getQuery(event)
  if (!slug)
    throw createError({ statusCode: 400, statusMessage: 'Missing slug' })

  const service = await Service.findOne({ slug }).select('-_id -__v')

  if (!service)
    throw createError({ statusCode: 404, statusMessage: 'Service not found' })
  try {

    if (user && user.MPTariffs) {

      const isTariffExist: any = user.MPTariffs.find((item: any) => item.mp === service.slug)
      if (isTariffExist) {
        const prices = isTariffExist.prices ? isTariffExist.prices : []
        service.items.forEach((item: any) => {
          const isItemPrice = prices[item.slug ? item.slug : item.path]

          if (isItemPrice) {
            item.priceText = isItemPrice.type && isItemPrice.type === 'percent' ? `${isItemPrice.value} %` : `${isItemPrice.value} ₽`
          }

        })

      }
    }

  } catch (error) {
    console.log(error)
  }

  return {
    status: 'ok',
    service,
  }
})
