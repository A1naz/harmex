import bcrypt from 'bcrypt'
import { User } from '@/server/lib/models/User'

export default eventHandler(async (event) => {
  const { email, password, confirmPassword } = await readBody(event)

  if (email.length < 11) {
    throw createError({
      statusCode: 400,
      message: 'Телефон должен содержать 11 цифр',
    })
  }

  if (password !== confirmPassword) {
    throw createError({
      statusCode: 400,
      message: 'Passwords do not match',
    })
  }
  
  const found = await User.findOne({ phoneNumber: email.replace(/[\(\)\-\s]/g, '') })
  
  if (!found) {
    throw createError({
      statusCode: 400,
      message: 'User not found',
    })
    return {
      status: 'error', error: 'user not found' 
    }
  } else{
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

  console.log('ok')
  return {
    status: 'ok',
  }
}
})
