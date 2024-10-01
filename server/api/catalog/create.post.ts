import { Service } from '~/server/lib/models/Service'
import { v4 } from 'uuid'

export default eventHandler(async (event) => {
  const body = await readBody(event)

  await Service.create({
    uuid: v4(),
    name: body.name,
    items: body.items,
    mainImage: body.mainImage,
    images: [],
    video: 'null',
    price: body.price,
  })

  return {
    status: 'ok',
  }
})
