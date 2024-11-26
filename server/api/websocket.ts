const room = 'ROOM';
const peers = new Map<string, any>();

export default defineWebSocketHandler({
  open(peer) {
    const userId = peer.id || Math.random().toString(36).substr(2, 9); // Генерируем уникальный ID, если его нет

    peers.set(userId, peer);

    console.log(`User connected: ${userId}`);
    peer.subscribe(room);
    peer.publish(room, `User ${userId} joined the chat`);
  },

  close(peer) {
    const userId = peer.id;
    if (userId) {
      peers.delete(userId);
      console.log(`User disconnected: ${userId}`);
      peer.publish(room, `User ${userId} left the chat`);
    }
  },

  error(peer, error) {
    console.error('WebSocket error:', error);
  },

  message(peer, message) {
    const payload = JSON.parse(message.text());
    const { targetUserId, content } = payload;

    if (targetUserId) {
      const targetPeer = peers.get(targetUserId);
      if (targetPeer) {
        targetPeer.send(JSON.stringify({ from: peer.id, content }));
        console.log(`Message sent from ${peer.id} to ${targetUserId}`);
      } else {
        console.log(`User ${targetUserId} not found`);
      }
    } else {
      // Отправляем сообщение всем пользователям
      peer.publish(room, JSON.stringify({ from: peer.id, content }));
    }
  },
});
