import { ConfirmPhone } from '~/server/lib/models/ConfirmPhone'
const config = useRuntimeConfig()
const hiCallKey = config.HI_CALL_KEY


export default eventHandler(async (event) => {
  const { phoneNumber }: any = await readBody(event)

  console.log(hiCallKey);
  
  console.log(phoneNumber);
  
  if (phoneNumber.length < 11) {
    throw createError({
      statusCode: 400,
      message: 'Телефон должен содержать 11 цифр',
    })
  }

  const isConfirmExist = await ConfirmPhone.findOne({
    phone: phoneNumber,
  })

  if (isConfirmExist) {
    const lastDate = new Date(isConfirmExist.date)
    const currentDate = new Date()
    const difference = Math.abs(currentDate.getTime() - lastDate.getTime())

    if (difference < 60000) {
      return {
        status: 'error',
        message: 'С прошлого запроса прошло меньше минуты',
      }
    }
  }

  const data: any = await $fetch(
    `https://a.hi-call.ru/voice/${hiCallKey}/${phoneNumber.replace('+', '')}`
  )

  if (!data) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Не удалось отправить код',
    })
  }

  if (!isConfirmExist) {
    const newConfirm = new ConfirmPhone({
      phone: phoneNumber,
      code: data.code,
      date: new Date(),
    })

    await newConfirm.save()

    return {
      status: 'ok',
    }
  }

  isConfirmExist.code = data.code
  isConfirmExist.date = new Date()
  isConfirmExist.save()

  return {
    status: 'ok',
  }
})
