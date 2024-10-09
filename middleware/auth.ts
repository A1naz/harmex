export default defineNuxtRouteMiddleware((to, from) => {
  const { loggedIn, user, session } = useUserSession();
  if (!loggedIn.value) {
    return to.path = '/auth?redirect=' + to.path;
  }

  const userSession = session.value;

  if (
    userSession.user?.isTwoFaEnabled && userSession.twoFaNeeded) {
    return to.path = '/2fa'
  }
});
