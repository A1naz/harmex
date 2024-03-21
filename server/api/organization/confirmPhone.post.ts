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
    if (!isConfirmExist.count) {
      isConfirmExist.count = 1
    }

    if (isConfirmExist.count >= 4) {
      isConfirmExist.count = 1
    }
    isConfirmExist.count++

    const lastDate = new Date(isConfirmExist.date)
    const currentDate = new Date()
    const difference = Math.abs(currentDate.getTime() - lastDate.getTime())

    if (difference < 60000) {
      return {
        status: 'error',
        message: 'С прошлого запроса прошло меньше минуты',
      }
    }

    isConfirmExist.date = new Date()
    await isConfirmExist.save()
    if (isConfirmExist.count > 2) {
      data = await confirmViaHiCall(hiCallKey, phoneNumber)
    } else {
      data = await confirmViaZvonokApi(
        zvonokPublicKey,
        zvonokCampaignId,
        phoneNumber
      )
    }

    if (!data) {
      isConfirmExist.save()
    }

    isConfirmExist.code = data.code
    isConfirmExist.date = new Date()
    isConfirmExist.save()

    return {
      status: 'ok',
    }
  } else {
    try {
      data = await confirmViaZvonokApi(
        zvonokPublicKey,
        zvonokCampaignId,
        phoneNumber
      )

      if (!data || !data.code || data.status === 'error') {
        data = await confirmViaHiCall(hiCallKey, phoneNumber)
      }

      const newConfirm = new ConfirmPhone({
        phone: phoneNumber,
        code: data.code,
        date: new Date(),
      })

      await newConfirm.save()

      return {
        status: 'ok',
      }
    } catch (e) {
      console.log(e)

      return {
        status: 'error',
        message: 'Не удалось отправить код',
      }
    }
  }
})
