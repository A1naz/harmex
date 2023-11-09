import { defineNuxtRouteMiddleware } from 'nuxt/app'

export default defineNuxtRouteMiddleware(async(to, from) => {

    const { status } = useAuth()

    if (status.value === 'authenticated') {
        const { data } = await useFetch('/api/user/client', {headers: useRequestHeaders(['cookie']) as HeadersInit})
        const accesses = data.value?.client.allowedPathes
    if (to.path === '/auth' || to.path === '/register' || to.path === '/'){
        return navigateTo(accesses[0].value)
    } else {
        if(!accesses.find((acc: MultiOptions) => acc.value == to.path)){
            return navigateTo(accesses[0].value)
        }
    }
  }
  else {
    if (to.path === '/')
      return navigateTo('/auth')
  }
})
