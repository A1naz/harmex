export default defineNuxtRouteMiddleware((to, from) => {
  const { loggedIn } = useUserSession();

  if (to.path === "/auth" || to.path === "/register") {
    if (loggedIn.value) {
      return navigateTo("/");
    }
  }
});
