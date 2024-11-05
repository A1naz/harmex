import { VerificationCode } from '~/server/lib/models/VerificationCode'

export default defineEventHandler(async (event) => {
  const { phoneNumber, password, repeatPassword, code } = await readBody(event)
  const verificationCodeDoc: typeof VerificationCode | null = await VerificationCode.findOne({ phoneNumber, verificationCode: code, type: 'register' })
  if (!verificationCodeDoc) {
    throw createError({ status: 400, message: 'Неверный  код подтверждения' })
  }
  if (password !== repeatPassword) {
    throw createError({ status: 400, message: 'Пароли не совпадают' })
  }
  await auth.registerUser(event, { phoneNumber, password })

  return 'success'
})
