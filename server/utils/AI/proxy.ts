/**
 * Возвращает объект proxy для axios, читая PROXY_URL из переменных окружения.
 * Формат: http://user:pass@host:port
 */
import { HttpsProxyAgent } from "https-proxy-agent"


export function getAxiosProxy() {
  const proxyUrl: any = process.env.PROXY_URL

  const agent = new HttpsProxyAgent(proxyUrl)
    return agent
    
}
