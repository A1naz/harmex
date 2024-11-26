import { useSSE } from "~/server/utils/see"

export default eventHandler(async (event) => {
        const sse = useSSE()
        const user = await getAdminEntity(event)
        if (!user) return sendRedirect(event, '/auth', 302)

        const client = {
                id: user.uuid,
                event
        }

        sse.addClient(user.uuid, event)

        sse.broadcast(client, 'connected', { message: 'connection established' })

        event.node.res.on('close', () => sse.removeClient(user.uuid))

        event._handled = true

})