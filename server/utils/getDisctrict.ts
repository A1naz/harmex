const config = useRuntimeConfig()

export async function getDisctrict(address: string) {
  const url = 'https://cleaner.dadata.ru/api/v1/clean/address'
  const token = `Token ${config.DADATA_TOKEN}`
  const secret = config.DADATA_SECRET

  const options: any = {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
      'X-Secret': secret,
    },
    body: JSON.stringify([address]),
  }

  let data: any = {}
  try {
    data = await new Promise((resolve, reject) =>
      fetch(url, options)
        .then(res => resolve(res.json()))
        .catch(err => reject(err)),
    )
  }
  // eslint-disable-next-line unused-imports/no-unused-vars
  catch (error) {
    return {
      pointDistrict: '',
      pointRegion: '',
    }
  }

  if (!data || !data[0] || !data[0].federal_district) {
    return {
      pointDistrict: '',
      pointRegion: '',
    }
  }

  return {
    pointRegion: data[0].region,
    pointDistrict: data[0].federal_district,
  }
}
