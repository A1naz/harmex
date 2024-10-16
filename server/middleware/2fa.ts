export default eventHandler(async (event) => {
  const session = await getUserSession(event);
  if(!session) {
    return sendRedirect(event, '/auth', 302)
  }
  
  if (
    session.user?.isTwoFaEnabled && session.twoFaNeeded && !event._path?.includes('/2fa') && !event._path?.includes('/session')
  ) {
    return sendRedirect(event, '/2fa', 302)
  }
})
