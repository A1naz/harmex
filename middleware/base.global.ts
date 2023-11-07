import { defineNuxtRouteMiddleware } from 'nuxt/app'

export default defineNuxtRouteMiddleware(async(to, from) => {

  const { status } = useAuth()

  if (status.value === 'authenticated') {
    if (to.path === '/auth' || to.path === '/register' || to.path === '/')
      return navigateTo('/stats?type=all&period=today')
  }
  else {
    if (to.path === '/')
      return navigateTo('/auth')
  }
})
