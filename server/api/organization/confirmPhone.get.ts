import { ConfirmPhone } from '~~/server/lib/models/ConfirmPhone'

export default eventHandler(async (event) => {
  const { phoneNumber, code }: any = getQuery(event)

  const confirm = await ConfirmPhone.findOne({ phone: phoneNumber, code })

  if (!confirm) {
    throw createError({
      statusCode: 404,
    })
  }

  
  return { status: 'ok' }
})
