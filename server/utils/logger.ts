export async function logger(event: any, msg?: string) {
  try {
    let logg = ''
    const session = await getAdminEntity(event)
    if (session && session.uuid)
      logg += ` - userUuid: ${session.uuid}`
    logg += `- api - ${event.node.req.method}: ${event.path}`
  }

  // eslint-disable-next-line unused-imports/no-unused-vars
  catch (e: any) {

  }
}
