export default defineNuxtRouteMiddleware((to, from) => {
  const { loggedIn } = useUserSession();
  if (!loggedIn.value) {
    return navigateTo("/auth");
  }
  // if the user is logged in, redirect them to the home page
});
