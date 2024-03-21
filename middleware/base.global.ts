import { defineNuxtRouteMiddleware } from 'nuxt/app'
export default defineNuxtRouteMiddleware(async (to, from) => {
  const store = useMainStore()
  const { status } = useAuth()

  if (status.value === 'authenticated') {
    // if (store.client.username !== 'test') {
    //   if (to.path.includes('/ozon')) {
    //     return navigateTo(to.path.replace('/ozon', '/wildberries'))
    //   }
    // }
    if (
      to.path === '/auth' ||
      to.path === '/register' ||
      to.path === '/' ||
      to.path === '/resetPassword'
    ) {
      return navigateTo('/buyouts')
    }
  } else {
    if (to.path === '/') return navigateTo('/auth')
  }
})
