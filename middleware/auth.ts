export default defineNuxtRouteMiddleware((to, from) => {
  const { loggedIn } = useUserSession();
  if (!loggedIn.value) {
    return to.path = '/auth?redirect=' + to.path;
  }
  // if the user is logged in, redirect them to the home page
});
