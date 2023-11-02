import { defineNuxtRouteMiddleware } from 'nuxt/app'

export default defineNuxtRouteMiddleware((to) => {

    const store = useMainStore()
    const allowedPathes = store.getAllowedPathes

    if(allowedPathes){
        if(!allowedPathes.includes(to.path)) {
            return navigateTo(store.getFirstPath, {external: true })
        }
    }

})