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
  }
  catch (e) {
    // eslint-disable-next-line no-console
    console.log(e)

    throw createError(e as string)
  }
})
