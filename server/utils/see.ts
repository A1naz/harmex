import { setHeaders, setResponseStatus } from 'h3';
import type { H3Event } from 'h3';

interface Client {
        id: string;
        event: H3Event;
}

export function useSSE() {
        let clients: Client[] = [];
        const addClient = (id: string, event: H3Event) => {
                setHeaders(event, {
                        'cache-control': 'no-cache',
                        connection: 'keep-alive',
                        'connect-type': 'text/event-stream'
                })

                setResponseStatus(event, 200)
                clients.push({ id, event })

        }

        const removeClient = (id: string) => {
                clients = clients.filter((c) => c.id !== id)
        }

        const test = (client: Client) => {
                client.event.node.res.write('data: test\n\n')
        }

        const broadcast = (client: Client, eventName: string, data: Record<string, any>) => {
                client.event.node.res.write(`id: ${client.id}\n`)
                client.event.node.res.write(`event: ${eventName}\n`)
                client.event.node.res.write(`data: ${JSON.stringify(data)}\n\n`)
        }

        const broadcasts = (eventName: string, data: Record<string, any>) => {
                clients.forEach((client) => broadcast(client, eventName, data))
        }

        return {
                clients,
                addClient,
                removeClient,
                broadcast,
                broadcasts
        }
}
