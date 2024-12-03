import qrcode from 'qrcode'
import { User } from '~~/server/lib/models/User'
// import { PaymentIntend } from '~~/server/lib/models/PaymentIntend'
import { v4 as uuid } from 'uuid'

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const userFromDB = await User.findOne({ uuid: user.uuid })

  if (!userFromDB) {
    return sendRedirect(event, '/auth', 302)
  }

  const { summ, faceType, email }: any = getQuery(event)

  const dates = new Date().toISOString().slice(0, 10).split('-')
  const purposeDate = `${dates[2]}.${dates[1]}.${dates[0]}`
  const paymentUuid = uuid()
  const purpose = `Пополнение баланса личного кабинета - "${user.username}", по договору "${user.uuid}" от ${purposeDate}г.`
  const data = `ST00012|Name=ИП БАЛАШОВ АНДРЕЙ ЭДУАРДОВИЧ|PersonalAcc=40802810903000164001|BankName=ПРИВОЛЖСКИЙ Ф-Л ПАО "ПРОМСВЯЗЬБАНК"|BIC=042202803|CorrespAcc=30101810700000000803|Purpose=${purpose}|Sum=${summ}|PayeeINN=644651000810`

  const qrCode = await new Promise((resolve, reject) => {
    qrcode.toDataURL(data, (err: any, data: any) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })

  // await PaymentIntend.create({
  //   user: user._id,
  //   summ: Number(summ),
  //   email: email,
  //   paymentUuid,
  //   type: 'balance',
  //   dataoperation: new Date(),
  //   comment: purpose,
  //   faceType,
  // })

  userFromDB.paymentEmail = email
  await userFromDB.save()

  return {
    qrCode,
    uuid: paymentUuid,
    purpose,
  }
})
