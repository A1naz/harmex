import { VerificationCode } from '~/server/lib/models/VerificationCode'

export default defineEventHandler(async (event) => {
  const { phoneNumber, type } = await readBody(event)
  const found = await VerificationCode.findOne({ phoneNumber, type })

  if (found) {
    const timeDiff = (new Date().getTime() - found.createdAt.getTime()) / 1000
    if (timeDiff < 60) {
      throw createError({ status: 400, message: 'Вы можете отправлять новый код каждую минуту.' })
    }
    await found.deleteOne()
  }
  const verificationCode: string = Math.floor(1000 + Math.random() * 9000).toString()

  const verificationCodeDoc = new VerificationCode({ phoneNumber, verificationCode, type })
  await verificationCodeDoc.save()

  // Send code to phone logic
  console.log(verificationCodeDoc.verificationCode)
  return verificationCodeDoc.verificationCode
  // return 'Код отправлен';
})
