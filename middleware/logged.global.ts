export default defineNuxtRouteMiddleware((to, from) => {
  const { loggedIn } = useUserSession();
  console.log(to.path);
  if (to.path === "/auth" || to.path === "/register" || to.path === "/") {
    if (loggedIn.value) {
      return to.path = '/profile'
    }
  }

});
