export default defineNuxtRouteMiddleware((to, from) => {
  const { loggedIn, user, session } = useUserSession();
  if (!loggedIn.value) {
    return to.path = '/auth?redirect=' + to.path;
  }

});
