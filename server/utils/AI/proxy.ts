/**
 * Возвращает объект proxy для axios, читая PROXY_URL из переменных окружения.
 * Формат: http://user:pass@host:port
 */
export function getAxiosProxy() {
  const proxyUrl = process.env.PROXY_URL

  if (!proxyUrl) return undefined
  try {
    return undefined
    const url = new URL(proxyUrl)
    console.log({
      protocol: url.protocol.replace(':', ''),
      host: url.hostname,
      port: Number(url.port),
      auth: url.username
        ? { username: url.username, password: url.password }
        : undefined,
    })
    return {
      protocol: url.protocol.replace(':', ''),
      host: url.hostname,
      port: Number(url.port),
      auth: url.username
        ? { username: url.username, password: url.password }
        : undefined,
    }
  } catch {
    console.warn('[proxy] Невалидный PROXY_URL:', proxyUrl)
    return undefined
  }
}
