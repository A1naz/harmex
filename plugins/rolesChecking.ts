
export default defineNuxtPlugin(async () => {

    addRouteMiddleware('roles', async(to) => {

console.log('middleware start: ', to.path)

        const router = useRouter()
        const { status, signOut } = useAuth()
        const store = useMainStore()
        const data: any = await useFetch('api/user/client', {
            method: 'GET',
        })
// console.log('data: ', data )
        let allowedPathesFetch: any
        if(data.client) allowedPathesFetch = await data.client.allowedPathes
        
        let allowedPathesStore
        if(store.client) allowedPathesStore = store.client.allowedPathes

console.log('client fetch: ', allowedPathesFetch ? allowedPathesFetch : 'hz' )
console.log('client store: ', allowedPathesStore ? allowedPathesStore : 'hz' )

if(allowedPathesFetch || allowedPathesStore){

    const allowedPathes = await allowedPathesFetch ? allowedPathesFetch :allowedPathesStore
console.log('allowedPathes: ', allowedPathes)
    if(to.path !== '/auth'){
        if(!allowedPathes) console.log('trigger: allowedPathes are empty')
    }

    if (status.value === 'authenticated') {
        console.log('status.value: ', status.value)

        if (['/auth', '/register', '/'].includes(to.path)){
            console.log('/auth, ...')
        }

        console.log('allowedPathes.includes(to.path): ', allowedPathes.includes(to.path))
        if(await !allowedPathes.includes(to.path)) {
            console.log('trigger: forbiden')
            // return navigateTo('/stats?type=all&period=today')
            return
        }

        console.log('trigger: allowed')
        return 
    }
    else {
        if (to.path === '/')
console.log('trigger: 4')
          return 
    }

}
console.log('trigger: nothing')

    }, { global: true })
  })
