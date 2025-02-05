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

  const found = await User.findOne({ phoneNumber: email.replace(/[\(\)\-\s]/g, '') })

  if (!found) {
    throw createError({
      statusCode: 400,
      message: 'User not found',
    })

  } else {

    const confirm = await ConfirmPhone.findOne({ phone: email.replace(/[\(\)\-\s]/g, ""), code: verificationCode })

    if (!confirm) {
      const errorConfirm = await ConfirmPhone.findOne({ phone: email.replace(/[\(\)\-\s]/g, "") })
      if (errorConfirm) {
        errorConfirm.errorCount ? errorConfirm.errorCount++ : errorConfirm.errorCount = 1
        await errorConfirm.save()
        if (errorConfirm.errorCount >= 3) {
          await ConfirmPhone.deleteOne({ phone: email.replace(/[\(\)\-\s]/g, "") })
        }
      }
      throw createError({
        statusCode: 404,
        message: 'Код подтверждения не найден',
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
    await found.save()
    //Не используется
    // const token = jwt.sign(
    // { email: found.email, id: found.id, password },
    // runtimeConfig.SECRET,
    // {
    // expiresIn: '10m',
    // },
    // )


    // const url = `${runtimeConfig.PUBLIC_SITE_URL}/api/user/changePassword/${token}`
    // await mailService.sendChangePasswordMail(
    //   found.email,
    //   url,
    //   found.firstName || found.username,
    // )

    return {
      status: 'ok',
    }
  }
})
