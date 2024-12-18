import { VerificationCode } from "~/server/lib/models/VerificationCode";

export default defineEventHandler(async (event) => {
  const { phoneNumber, newPassword, repeatPassword, code } = await readBody(event)
  return
  
  const verificationCodeDoc: typeof VerificationCode | null = await VerificationCode.findOne({ phoneNumber, verificationCode: code, type: 'resetPassword' });
  if (!verificationCodeDoc) {
    throw createError({ status: 400, message: 'Неверный код подтверждения' });
  }
  if (newPassword !== repeatPassword) {
    throw createError({ status: 400, message: 'Пароли не совпадают' })
  }
  await auth.changePassword(event, { phoneNumber, newPassword })
  return 'success'
})
