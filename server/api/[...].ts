import { useBase, createRouter, defineEventHandler } from 'h3'
import { useSSE } from '~/server/utils/see'
import { randomUUID } from 'node:crypto'

const router = createRouter()

const sse = useSSE()

router.get(
        '/sse',
        defineEventHandler((event: any) => {
                const client: any = { id: randomUUID(), event }
                
 sse.addClient(client.id, event)       
 sse.broadcast(client, 'connected', { message: 'connection established' })

 event.node.res.on('close', () => sse.removeClient(client.id))
}))

export default useBase('/api', router.handler)