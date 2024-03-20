import request from 'request'

export async function confirmViaHiCall(hiCallKey: string, phoneNumber: string) {

  const data: any = await $fetch(
    `https://a.hi-call.ru/voice/${hiCallKey}/${phoneNumber.replace('+', '')}`
  )

  if (!data) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Не удалось отправить код',
    })
  }
  
  return data
}

export async function confirmViaZvonokApi(
  publicKey: string,
  campaignId: string,
  phoneNumber: string
) {

  const data: any = await new Promise((resolve, reject) => {
    request.get(
      {
        url: `https://zvonok.com/manager/cabapi_external/api/v1/phones/tellcode/?campaign_id=${campaignId}&phone=${phoneNumber}&public_key=${publicKey}`,
      },
      function (error, response, body) {
        if (!error) {
          resolve(JSON.parse(body))
        } else {
          console.log(error)

          reject(new Error(`Не удалось отправить код`))
        }
      }
    )
    console.log(data);
  })

  if (!data) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Не удалось отправить код',
    })
  }

  return {
    status: 'ok',
    code: data.data.pincode,
  }
}
