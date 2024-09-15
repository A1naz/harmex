import validator from 'validator'
import { User } from '@/server/lib/models/User'
import MailService from '~~/server/lib/mailService.js'
import bcrypt from 'bcrypt'
import { DocuemntEnum } from '~/data/enums'

export default eventHandler(async (event) => {

  const body = await readBody(event)

  const { uuid, email, username, firstName, lastName, newPassword, allowedPathes, post } = body

  if (email.replace(/[\(\)\-\s]/g, '').length < 12) {
    throw createError({
      statusCode: 400,
      message: 'Введите корректный номер телефона',
    })
  }
  if(allowedPathes == '') {
    throw createError({
      statusCode: 400,
      message: 'Выберите разрешения для сохранения данных сотрудника',
    })
  }

  if(post == '') {
    throw createError({
      statusCode: 400,
      message: 'Выберите должность для сохранения данных сотрудника',
    })
  }

  const checkNumber = await User.findOne({
    phoneNumber: email.replace(/[\(\)\-\s]/g, ''),
  })

  if (checkNumber && checkNumber.uuid !== uuid) {
    throw createError({
      statusCode: 400,
      message: 'Пользователь с таким номером телефона уже существует.',
    })
  }

  if (!username || !/^[a-zA-Z0-9_-]{4,14}$/.test(username)) {
    throw createError({
      statusCode: 400,
      message: 'Имя пользователя должно быть длиной от 4 до 14 символов',
    })
  }
  const user = await User.findOne({ uuid: uuid })
  if (!user) {
    throw createError({
    statusCode: 400,
    message: 'Такого пользователя не существует',
  })
}

  // let emailUpdated = false
  // if (email !== user.email) {
  //   user.newEmail = email
  //   const url = useRuntimeConfig().PUBLIC_SITE_URL
  //   await MailService.sendNewEmailActivationMail(
  //     email,
  //     `${url}/api/auth/activate?uuid=${user.uuid}`
  //   )
  //   emailUpdated = true
  // }

  if(newPassword){
    const hash = bcrypt.hashSync(newPassword, 7)
    user.password = hash
  }
  
  user.username = username
  user.firstName = firstName
  user.lastName = lastName
  user.acesses = allowedPathes
  user.post = post
  user.phoneNumber = email.replace(/[\(\)\-\s]/g, '')

  await user.save()

  await userLog(event,
    {
        documentType: DocuemntEnum.User,
        documentId: user.uuid,
        comment: `Изменение данных пользователя ${username}`
    })

  return {
    status: 'ok',
  }
})
