import validator from 'validator'
import { User } from '@/server/lib/models/User'
import MailService from '~~/server/lib/mailService.js'
import bcrypt from 'bcryptjs'
import { DocuemntEnum } from '~/data/enums'

export default eventHandler(async (event) => {

  const body = await readBody(event)

  const { uuid, phoneNumber, username, firstName, lastName, password, allowedPathes, post } = body

  if (phoneNumber.replace(/[\(\)\-\s]/g, '').length < 12) {
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
    phoneNumber: phoneNumber.replace(/[\(\)\-\s]/g, ''),
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

  // let phoneNumberUpdated = false
  // if (phoneNumber !== user.phoneNumber) {
  //   user.newphoneNumber = phoneNumber
  //   const url = useRuntimeConfig().PUBLIC_SITE_URL
  //   await MailService.sendNewphoneNumberActivationMail(
  //     phoneNumber,
  //     `${url}/api/auth/activate?uuid=${user.uuid}`
  //   )
  //   phoneNumberUpdated = true
  // }

  if(password){
    const hash = bcrypt.hashSync(password, 7)
    user.password = hash
  }

  user.username = username
  user.firstName = firstName
  user.lastName = lastName
  user.acesses = allowedPathes
  user.post = post
  user.phoneNumber = phoneNumber.replace(/[\(\)\-\s]/g, '')

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
