import { disables } from '@antfu/eslint-config'
import { Service } from '~/server/lib/models/Service'
import { User } from '~/server/lib/models/User'

export default eventHandler(async (event) => {
  const session = await getAdminEntity(event)

  if (!session)
    return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)

  const { slug, mp }: any = getQuery(event)

  if (!slug)
    throw createError({ statusCode: 400, statusMessage: 'Missing slug' })

  if (user.votedForService.find((item: any) => item.mp === mp && item.slug === slug)) {
    return { message: 'Вы уже голосовали за данный маркетплейс' }
  }

  const services = await Service.findOne({ slug: mp })

  if (!services) {
    return {
      status: 'error',
      error: [],
    }
  }

  user.votedForService.push({
    mp,
    slug
  })


  await user.save()
  const index = services.items.findIndex((item: any) => item.path === slug)

  if (index === -1) {
    return { message: 'Не удалось найти услугу' }
  }

 const votes = services.items[index].votes ? services.items[index].votes + 1 :  1

 await Service.updateOne(
  { slug: mp },
  {
    $set: {
      [`items.${index}.votes`]: votes,
    },
  }
);
 
  return {
    status: 'ok'
  }
})
