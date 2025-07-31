import MenuBuilder from '~/server/utils/menuBuilder'
import { User } from '~~/server/lib/models/User'

export default eventHandler(async (event) => {
  const session = await getUserSession(event);

  if(!session) {
    return sendRedirect(event, '/auth', 302)
  }
  
  const user = await User.findOne({ uuid: session.user?.uuid })
  console.log("middleware", user?.needVerification)

  if (
    session.user?.isTwoFaEnabled && session.twoFaNeeded && !event._path?.includes('/2fa') && !event._path?.includes('/session')
  ) {
    return sendRedirect(event, '/2fa', 302)
  }
   else if (!session.twoFaNeeded && event._path?.includes('/2fa') && !event._path?.includes('/session')) {
    return sendRedirect(event, '/profile', 302)
  }
  if (user?.needVerification && !event._path?.includes('/verify') && !event._path?.includes('/session') && !event._path?.includes('/2fa')) {
    
    return sendRedirect(event, '/verify', 302)
  } 
  else if (!user?.needVerification &&event._path?.includes('/verify') && !event._path?.includes('/session')) {
    return sendRedirect(event, '/profile', 302)
  }
  const accesses = MenuBuilder.filteredAccess(session.user?.acesses || []).allowedPathes.map((path) => path.value)
  if(accesses.length === 0) return 

  const controlPaths = MenuBuilder.pathOptions().map((path) => path.value)

  const currentPath = event._path;

  if (currentPath && controlPaths.some((control) => currentPath.includes(control))) {

    if (!accesses.some((control) => currentPath.includes(control))) {
      return sendRedirect(event, '/catalog', 302);
    }

  } else {
    return
  }
})
