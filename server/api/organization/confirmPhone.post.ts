import { ConfirmPhone } from '~/server/lib/models/ConfirmPhone'
import {
  confirmViaHiCall,
  confirmViaZvonokApi,
} from '~/server/utils/organization/confirmPhones'

const config = useRuntimeConfig()
const hiCallKey = config.HI_CALL_KEY
const zvonokCampaignId = config.ZVONOK_CAMPAIGN_ID
const zvonokPublicKey = config.ZVONOK_PUBLIC_KEY

export default eventHandler(async (event) => {
  const { phoneNumber }: any = await readBody(event)

  if (phoneNumber.length < 11) {
    throw createError({
      statusCode: 400,
      message: 'Телефон должен содержать 11 цифр',
    })
  }

  let data: any = null

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

    if (!isConfirmExist.count) {
      isConfirmExist.count = 1
    }

    if (isConfirmExist.count > 2) {
      data = await confirmViaHiCall(hiCallKey, phoneNumber)
    } else {
      data = await confirmViaZvonokApi(
        zvonokPublicKey,
        zvonokCampaignId,
        phoneNumber
      )
    }

    if (isConfirmExist.count >= 3) {
      isConfirmExist.count = 0
    }

    if (!data) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Не удалось отправить код',
      })
    }

    isConfirmExist.count++
    isConfirmExist.code = data.code
    isConfirmExist.date = new Date()
    isConfirmExist.save()

    return {
      status: 'ok',
    }
  } else {
    data = await confirmViaZvonokApi(
      zvonokPublicKey,
      zvonokCampaignId,
      phoneNumber
    )

    if (!data) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Не удалось отправить код',
      })
    }

    const newConfirm = new ConfirmPhone({
      phone: phoneNumber,
      code: data.code,
      date: new Date(),
    })

    console.log(data);
    
    await newConfirm.save()

    return {
      status: 'ok',
    }
  }
})
