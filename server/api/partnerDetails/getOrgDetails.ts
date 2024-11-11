export default async function (inn: string) {
  const rawData: any = await $fetch(
    `https://app.marketmonstr.pro/api/organization/getData?inn=${inn}`,
  )

  const data = rawData.data

  if (!data || !data.items || !data.items.length) {
    throw createError({
      statusCode: 404,
      statusMessage: 'ИНН не найден',
    })
  }

  const orgKey = data.items[0]['ИП'] ? 'ИП' : 'ООО'
  const key = data.items[0]['ИП'] ? 'ИП' : 'ЮЛ'
  const orgInn
        = orgKey === 'ИП'
          ? data.items[0][`${key}`]['ИННФЛ']
          : data.items[0][`${key}`]['ИНН'] || ''

  if (orgInn !== inn) {
    throw createError({
      statusCode: 404,
      statusMessage: 'ИНН не найден',
    })
  }
  const name
        = orgKey === 'ИП'
          ? data.items[0][`${key}`]['ФИОПолн'].split(' ')[1] || ''
          : ''
  const lastname
        = orgKey === 'ИП'
          ? data.items[0][`${key}`]['ФИОПолн'].split(' ')[0] || ''
          : ''
  const middleName
        = orgKey === 'ИП'
          ? data.items[0][`${key}`]['ФИОПолн'].split(' ')[2] || ''
          : ''
  const orgOgrn
        = orgKey === 'ИП'
          ? data.items[0][`${key}`]['ОГРНИП']
          : data.items[0][`${key}`]['ОГРН'] || ''
  const orgName
        = orgKey === 'ООО'
          ? data.items[0][`${key}`]['НаимПолнЮЛ']
          : `ИП ${lastname} ${name}`

  return {
    orgKey,
    orgName,
    orgOgrn,
    orgInn,
  }
}
