export async function logger(event: any, msg?: string) {
  try {
    let logg = ''
    const user = await getAdminEntity(event)
    if (user && user.uuid)
      logg += ` - userUuid: ${user.uuid}`
    // eslint-disable-next-line unused-imports/no-unused-vars
    logg += `- api - ${event.node.req.method}: ${event.path}`
    // console.log(logg) // timestamp automaticaly adding in captain logs
  }
  // eslint-disable-next-line unused-imports/no-unused-vars
  catch (e: any) {

  }
}
