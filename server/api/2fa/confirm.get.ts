

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const { code }: any = getQuery(event)
  
  
  
  const isVerified = confirmTwoFaCode(code, user.twoFaSecret)

  return {
    status: isVerified,
  }
})
