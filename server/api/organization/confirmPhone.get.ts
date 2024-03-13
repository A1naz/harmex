import { ConfirmPhone } from '~~/server/lib/models/ConfirmPhone'
function addZeros(inputStr: string) {
  const numZeros = 3 - inputStr.length;
  if (numZeros > 0) {
      return '0'.repeat(numZeros) + inputStr;
  } else {
      return inputStr;
  }
}


export default eventHandler(async (event) => {
  const { phoneNumber, code }: any = getQuery(event)

  const trueCode = addZeros(code)  

  const confirm = await ConfirmPhone.findOne({ phone: phoneNumber, code: trueCode })

  if (!confirm) {
    throw createError({
      statusCode: 404,
    })
  }

  
  return { status: 'ok' }
})
