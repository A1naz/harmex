import request from 'request'

export async function confirmViaHiCall(hiCallKey: string, phoneNumber: string) {
  try {
    const data: any = await $fetch(
      `https://a.hi-call.ru/voice/${hiCallKey}/${phoneNumber.replace('+', '')}`,
    )

    if (!data || !data.code) {
      // eslint-disable-next-line no-console
      console.error(`[confirmViaHiCall] Неожиданный ответ от hi-call.ru для номера ${phoneNumber}:`, JSON.stringify(data))
      return { status: 'error', message: 'Не удалось отправить код' }
    }

    return data
  }
  catch (e: any) {
    // eslint-disable-next-line no-console
    console.error(`[confirmViaHiCall] Ошибка запроса к hi-call.ru для номера ${phoneNumber}:`, e?.message ?? e)
    return { status: 'error', message: 'Не удалось отправить код' }
  }
}

export async function confirmViaZvonokApi(
  publicKey: string,
  campaignId: string,
  phoneNumber: string,
) {
  try {
    const data: any = await new Promise((resolve, reject) => {
      request.get(
        {
          url: `https://zvonok.com/manager/cabapi_external/api/v1/phones/tellcode/?campaign_id=${campaignId}&phone=${phoneNumber}&public_key=${publicKey}`,
        },
        (error, response, body) => {
          if (!error) {
            try {
              resolve(JSON.parse(body))
            }
            catch (parseError) {
              reject(new Error(`Ошибка парсинга ответа`))
            }
          }
          else {
            reject(error)
          }
        },
      )
    })

    if (!data || !data.data || !data.data.pincode || data.status === 'error') {
      // eslint-disable-next-line no-console
      console.error(`[confirmViaZvonokApi] Неожиданный ответ от zvonok.com для номера ${phoneNumber}:`, JSON.stringify(data))
      return { status: 'error', message: 'Не удалось отправить код' }
    }

    return {
      status: data.status,
      code: data.data.pincode,
    }
  }
  catch (e: any) {
    // eslint-disable-next-line no-console
    console.error(`[confirmViaZvonokApi] Ошибка запроса к zvonok.com для номера ${phoneNumber}:`, e?.message ?? e)
    return { status: 'error', message: 'Не удалось отправить код' }
  }
}
