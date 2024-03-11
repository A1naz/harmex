import { ProductLike } from '~~/server/lib/models/ProductLike'
const config = useRuntimeConfig()
const organizationKey = config.ORGANIZATION_KEY

export default eventHandler(async (event) => {
  const { inn }: any = getQuery(event)

  if (inn.length < 10) {
    throw createError({
      statusCode: 400,
      message: 'ИНН должен содержать 10 цифр',
    })
  }

  const rawData: any = await $fetch(
    `https://api-fns.ru/api/multinfo?key=${organizationKey}&req=${inn}`
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
  const orgInn =
    orgKey === 'ИП'
      ? data.items[0][`${key}`]['ИННФЛ']
      : data.items[0][`${key}`]['ИНН'] || ''

  if (orgInn !== inn) {
    throw createError({
      statusCode: 404,
      statusMessage: 'ИНН не найден',
    })
  }
  const name =
    orgKey === 'ИП'
      ? data.items[0][`${key}`]['ФИОПолн'].split(' ')[1] || ''
      : ''
  const lastname =
    orgKey === 'ИП'
      ? data.items[0][`${key}`]['ФИОПолн'].split(' ')[0] || ''
      : ''
  const middleName =
    orgKey === 'ИП'
      ? data.items[0][`${key}`]['ФИОПолн'].split(' ')[2] || ''
      : ''
  const orgOgrn =
    orgKey === 'ИП'
      ? data.items[0][`${key}`]['ОГРНИП']
      : data.items[0][`${key}`]['ОГРН'] || ''
  const orgName =
    orgKey === 'ООО'
      ? data.items[0][`${key}`]['НаимПолнЮЛ']
      : `ИП ${lastname} ${name}`
  console.log(
    'ИМЯ',
    name,
    'ФАМИЛИЯ',
    lastname,
    'ОТЧЕСТВО',
    middleName,
    'ИНН',
    orgInn,
    'ОГРН',
    orgOgrn,
    'КЛЮЧ',
    key
  )

  return {
    orgKey,
    orgName,
    orgOgrn,
    orgInn,
    name,
    lastname,
    middleName,
  }
})
