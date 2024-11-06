import { Service } from '~/server/lib/models/Service'

export default eventHandler(async (event) => {
  const { searchQuery } = getQuery(event)

  const query = searchQuery
    ? {
        $or: [
          { items: { $elemMatch: { title: { $regex: searchQuery, $options: 'i' } } } },
          { name: { $regex: searchQuery, $options: 'i' } },
        ],
        disabled: { $ne: true },
      }
    : { }

  let services: any = await Service.find(query)
    .select('-_id name items.slug path items.title items.path path')
    .sort({ disabled: 1 })

  if (searchQuery) {
    services = services.map((service: any) => {
      const filteredItems = service.items.filter((item: any) =>
        item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase()),
      )

      return {
        ...service.toObject(),
        items: filteredItems.length > 0 ? filteredItems : service.items,
      }
    })
  }

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
