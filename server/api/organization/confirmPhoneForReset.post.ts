import { ConfirmPhone } from '~/server/lib/models/ConfirmPhone'
import { User } from '~/server/lib/models/User'
import { confirmViaZvonokApi } from '~/server/utils/organization/confirmPhones'

const config = useRuntimeConfig()
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

  const isUserExist = await User.findOne({
    phoneNumber,
  })

  if (!isUserExist) {
    return {
      status: 'ok',
      message: 'Если номер зарегистрирован, код был отправлен',
    }
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
    data = await confirmViaZvonokApi(
      zvonokPublicKey,
      zvonokCampaignId,
      phoneNumber,
    )

    if (!data?.code) {
      // eslint-disable-next-line no-console
      console.error(`[confirmPhoneForReset] zvonok не вернул код для существующего номера ${phoneNumber}, ответ:`, JSON.stringify(data))
      return {
        status: 'error',
        message: 'Не удалось отправить код',
      }
    }

    isConfirmExist.code = data.code
    isConfirmExist.date = new Date()
    await isConfirmExist.save()

    return {
      status: 'ok',
    }
  }
  else {
    try {
      data = await confirmViaZvonokApi(
        zvonokPublicKey,
        zvonokCampaignId,
        phoneNumber,
      )

      if (!data?.code) {
        // eslint-disable-next-line no-console
        console.error(`[confirmPhoneForReset] zvonok не вернул код для нового номера ${phoneNumber}, ответ:`, JSON.stringify(data))
        return {
          status: 'error',
          message: 'Не удалось отправить код',
        }
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
    }
    catch (e: any) {
      // eslint-disable-next-line no-console
      console.error(`[confirmPhoneForReset] Необработанная ошибка для номера ${phoneNumber}:`, e?.message ?? e)
      return {
        status: 'error',
        message: 'Не удалось отправить код',
      }
    }
  }
})
