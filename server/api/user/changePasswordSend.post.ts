import bcrypt from 'bcryptjs'
import { User } from '@/server/lib/models/User'
import { ConfirmPhone } from '~~/server/lib/models/ConfirmPhone'
import { ReturnCallConfirm } from '~~/server/lib/models/ReturnCallConfirm'

export default eventHandler(async (event) => {
  const { email, password, confirmPassword, verificationCode, callId } = await readBody(event)

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

  if (!found) {
    throw createError({
      statusCode: 404,
      message: 'Пользователь не найден',
    })
  }

  // Верификация через обратный звонок
  if (callId) {
    const callConfirm = await ReturnCallConfirm.findOne({ callId })

    if (!callConfirm || callConfirm.dialStatus !== 'confirmed') {
      throw createError({
        statusCode: 400,
        message: 'Обратный звонок не подтверждён',
      })
    }

    const callDate = new Date(callConfirm.updatedAt || callConfirm.createdAt)
    const now = new Date()
    if (Math.abs(now.getTime() - callDate.getTime()) > 300 * 1000) {
      throw createError({
        statusCode: 400,
        message: 'Сессия подтверждения истекла',
      })
    }
  }
  // Верификация через SMS-код
  else {
    const confirm = await ConfirmPhone.findOne({ phone: phoneNumber, code: verificationCode })

    if (!confirm) {
      const errorConfirm = await ConfirmPhone.findOne({ phone: phoneNumber })
      if (errorConfirm) {
        errorConfirm.errorCount = (errorConfirm.errorCount || 0) + 1
        await errorConfirm.save()
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
    if (Math.abs(now.getTime() - confirmDate.getTime()) > 300 * 1000) {
      throw createError({
        statusCode: 400,
        message: 'Код подтверждения истек',
      })
    }

    await ConfirmPhone.deleteOne({ phone: phoneNumber })
  }

  const hash = bcrypt.hashSync(password, 7)
  found.password = hash
  found.forceLoginDate = new Date()
  await found.save()

  return {
    status: 'ok',
  }
})
