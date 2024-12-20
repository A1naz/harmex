import MenuBuilder from '~/server/utils/menuBuilder'

export default eventHandler(async (event) => {
  const session = await getUserSession(event);
  if(!session) {
    return sendRedirect(event, '/auth', 302)
  }
  
  // if (
  //   session.user?.isTwoFaEnabled && session.twoFaNeeded && !event._path?.includes('/2fa') && !event._path?.includes('/session')
  // ) {
  //   return sendRedirect(event, '/2fa', 302)
  // }
  // const accesses = MenuBuilder.filteredAccess(session.user?.acesses || []).allowedPathes.map((path) => path.value)
  // if(accesses.length === 0) return 

  // const controlPaths = MenuBuilder.pathOptions().map((path) => path.value)

  // const currentPath = event._path;

  // if (currentPath && controlPaths.some((control) => currentPath.includes(control))) {

  //   if (!accesses.some((control) => currentPath.includes(control))) {
  //     return sendRedirect(event, '/catalog', 302);
  //   }

  // } else {
  //   return
  // }
})
