import WebSocket, { WebSocketServer } from "ws"

type Client = {
  id: string
  send: (message: string) => void
  readyState: number
}

declare global {
  var wss: WebSocketServer
  var clients: Client[]
}

let wss: WebSocketServer
let clients: Client[] = []

export default defineEventHandler((event) => {
  
  if (!global.wss) {
    wss = new WebSocketServer()
    console.log( wss.clients)
    
    
    wss.on("connection", function (socket: WebSocket) {
  
      socket.send("connected")

      socket.on("message", function (message: WebSocket.Data) {
        wss.clients.forEach(function (client: WebSocket) {
          if (client == socket && client.readyState === WebSocket.OPEN) {
            clients.push({
              id: message.toString(),
              send: (data: string) => client.send(data),
              readyState: client.readyState,
            })
            global.clients = clients
          }
        })
      })
      global.wss = wss
    })
  }
})