import { getServerSession } from '#auth'

export default eventHandler(async (event) => {

    if(event.node.req.method !== 'GET'){
        const time = new Date().toISOString()
        try{
            const session = (await getServerSession(event)) as any
            const metPath = event.node.req.method + ': ' + event.path
            var logg = `${time} - userUuid: ${session.uuid} - api - ${metPath}`
            console.log(logg)
        }
        catch(e: any){
            console.log(time, 'logger error: ', e.message)
        }
    }

})

