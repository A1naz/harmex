import { getServerSession } from '#auth'

export const logger = async (event: any, msg?: string) =>{
    try{
        var logg = ''
        const session = (await getServerSession(event)) as any
        if(session && session.uuid) logg += ` - userUuid: ${session.uuid }`
        logg += `- api - ${event.node.req.method}: ${event.path}`
        console.log(logg) // timestamp automaticaly adding in captain logs
    }
    catch(e: any){
        console.log('logger error: ', e.message, ` - path: ${event.node.req.method}: ${event.path}`)
    }
}
