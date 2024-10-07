import type { EventHandler, H3Event } from 'h3'



export async function getIp(event: H3Event): Promise<string> {
  try {
    const ip = event.node.req.headers['x-forwarded-for'] || event.node.req.socket.remoteAddress;
    return ip as string
  } catch (error) {
    console.error(error);
    return '';
  }
}
