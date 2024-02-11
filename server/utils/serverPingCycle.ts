const sleep = (ms: any) => new Promise((r) => setTimeout(r, ms))
const api_key = useRuntimeConfig().serverLoadApiKey || ''
const server_ip = useRuntimeConfig().server_ip || ''
const service_id = useRuntimeConfig().service_id || ''

export async function serverPingCycle() {
  if (!api_key || !server_ip || !service_id) {
    return
  }
  try {
    const data = await $fetch(
      'http://api.topvtop.pro/api/servers/pingService',
      {
        method: 'POST',
        body: {
          api_key,
          server_ip,
          service_id,
        },
      }
    )

    console.log('Сервис пингуется: ', data)
  } catch (error: any) {
    console.log('Ошибка пинга: ', error)
  }

  await sleep(60 * 1000)
  serverPingCycle()
}
