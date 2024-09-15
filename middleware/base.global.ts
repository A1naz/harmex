import { defineNuxtRouteMiddleware } from 'nuxt/app'
export default defineNuxtRouteMiddleware(async (to, from) => {
  const store = useMainStore()
  const { status } = useAuth()

  if (status.value === 'authenticated') {

    if (
      to.path === '/auth' ||
      to.path === '/register' ||
      to.path === '/' ||
      to.path === '/resetPassword'
    ) {
      return navigateTo('/main')
    }
  }
})
