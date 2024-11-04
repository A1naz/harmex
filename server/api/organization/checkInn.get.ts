import { ConfirmInn } from '~/server/lib/models/ConfirmInn'

export default eventHandler(async (event) => {
  const { inn, phoneNumber }: any = getQuery(event)

  if (inn.length < 10) {
    throw createError({
      statusCode: 400,
      message: 'ИНН должен содержать 10 цифр',
    })
  }

  const confirm = await ConfirmInn.findOne({
    $or: [{ inn }, { phone: phoneNumber }],
  })

  if (confirm) {
    const lastDate = new Date(confirm.date)
    const currentDate = new Date()
    const difference = Math.abs(currentDate.getTime() - lastDate.getTime())

    if (difference < 60000) {
      return {
        status: 'error',
        error: 'С прошлого поиска прошло меньше минуты',
      }
    }

    confirm.date = new Date()
    await confirm.save()
  }
  else {
    const newConfirm = new ConfirmInn({
      inn,
      phone: phoneNumber,
      date: new Date(),
    })

    await newConfirm.save()
  }

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
})
