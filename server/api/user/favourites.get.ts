import { User } from '~~/server/lib/models/User'
import { Service } from '~/server/lib/models/Service'

export default defineEventHandler(async (event) => {
  const isAuth = await getUserSession(event)

  const services = await Service.find().select('-_id -__v').sort({ disabled: 1 })

  if (!services || !services.length) {
    return {
      status: 'error',
      error: [],
    }
  }

  if (!isAuth) {
    return { favourites: [], favouritesPaths: [], services }
  }

  const user = await User.findOne({ uuid: isAuth.user?.uuid }).select('uuid favourites services')

  if (!user) {
    return { favourites: [], favouritesPaths: [], services }
  }

  const favouritesList = user.favourites || []
  const resultMap: Record<string, { path: string, title: string, image: string }> = {}

  services.forEach((service) => {
    if (service.slug && favouritesList.some(fav => fav.includes(`/catalog/${service.slug}`))) {
      const servicePath = `/catalog/${service.slug}`
      resultMap[servicePath] = {
        path: servicePath,
        title: service.name,
        image: service.mainImage,
        backgroundColor: service.backgroundColor
      }
    }

    service.items.forEach((item) => {
      const itemPath = `/${service.slug}${item.path}`

      if (favouritesList.includes(itemPath)) {
        resultMap[itemPath] = {
          path: itemPath,
          title: item.title,
          image: service.mainImage,
          name: service.name,
          backgroundColor: service.backgroundColor
        }
      }
    })
  })

  // Сортируем result по порядку из favouritesList
  const result = favouritesList
    .filter(path => resultMap[path]) // отфильтровываем те, которые есть в resultMap
    .map(path => resultMap[path]) // преобразуем к массиву объектов в нужном порядке

  return { favourites: result, favouritesPaths: favouritesList, services: user.services }
})
