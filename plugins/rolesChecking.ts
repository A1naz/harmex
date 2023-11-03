
export default defineNuxtPlugin(async () => {

    addRouteMiddleware('roles', async(to) => {

console.log('middleware start')

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

    const allowedPathes = allowedPathesFetch ? allowedPathesFetch :allowedPathesStore

    if(to.path !== '/auth'){
        if(!allowedPathes) console.log('row: 23')
    }

    if (status.value === 'authenticated') {
        if (['/auth', '/register', '/'].includes(to.path)){
            if(!allowedPathes.includes(to.path)) {
                return console.log('row: 29')
            }
        }
        return console.log('row: 32')
    }
    else {
        if (to.path === '/')
          return console.log('row: 36')
    }

}
console.log('row: 45')

    }, { global: true })
  })
