import { findPositionByQuery } from '@/server/lib/helpers'
import { ProxySearchQuery } from '~/server/lib/models/ProxySearchQuery'

export default eventHandler(async (event) => {
  try {
    const session = (await getAdminEntity(event)) as any
    if (!session)
      return sendRedirect(event, '/auth', 302)

    const { article, query } = getQuery(event)
    if (!article || !query)
      return { found: false, page: -1, advert: false }

    return {
      found: false,
      page: -1,
      advert: false,
    }

    const allProxies: any = await ProxySearchQuery.find()
    const proxies: string[] = allProxies[0].proxies

    const result: any = await findPositionByQuery(
      query.toString().replaceAll(' ', '%20'),
      Number(article),
      proxies,
    )
    return result
  }
  catch (e) {
    console.log(e)

    throw createError(e as string)
  }
})
