import bcrypt from 'bcryptjs'
import { User } from '@/server/lib/models/User'
import { ConfirmPhone } from '~~/server/lib/models/ConfirmPhone'

export default eventHandler(async (event) => {
  const { email, password, confirmPassword, verificationCode } = await readBody(event)

  if (email.length < 11) {
    throw createError({
      statusCode: 400,
      message: 'Телефон должен содержать 11 цифр',
    })
  }

  if (password !== confirmPassword) {
    throw createError({
      statusCode: 400,
      message: 'Пароли не совпадают',
    })
  }

  const phoneNumber = email.replace(/[\(\)\-\s]/g, '')
  
  const found = await User.findOne({ phoneNumber })
  const confirm = await ConfirmPhone.findOne({ phone: phoneNumber, code: verificationCode })

  if (!found || !confirm) {
    const errorConfirm = await ConfirmPhone.findOne({ phone: phoneNumber })
    if (errorConfirm) {
      errorConfirm.errorCount = (errorConfirm.errorCount || 0) + 1
      await errorConfirm.save()
    //Если 3 ошибки, то удалим код
      if (errorConfirm.errorCount >= 3) {
        await ConfirmPhone.deleteOne({ phone: phoneNumber })
      }
    }
    
    throw createError({
      statusCode: 404,
      message: 'Код подтверждения не найден',
    })
  }

  const confirmDate = new Date(confirm.date)
  const now = new Date()
  const difference = Math.abs(now.getTime() - confirmDate.getTime())
   
  if (difference > 300 * 1000) { 
    throw createError({
      statusCode: 400,
      message: 'Код подтверждения истек',
    })
  }

  const hash = bcrypt.hashSync(password, 7)
  found.password = hash
  found.forceLoginDate = new Date()
  await found.save()

  await ConfirmPhone.deleteOne({ phone: phoneNumber })

  return {
    status: 'ok',
  }
})
