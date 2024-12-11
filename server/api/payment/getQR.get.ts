import qrcode from 'qrcode'
import { BankInfo } from '~~/server/lib/models/BankInfo'
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

  const bank = await BankInfo.findOne({ portal: true }).sort({ balance: 1 })
  if (!bank) {
    throw createError({
      statusCode: 400,
      message: 'Банк не найден',
    })
  }

  const dates = new Date().toISOString().slice(0, 10).split('-')
  const purposeDate = `${dates[2]}.${dates[1]}.${dates[0]}`
  const paymentUuid = uuid()
  const purpose = `Пополнение баланса личного кабинета - "${user.username}", по договору "${user.uuid}" от ${purposeDate}г.`
  const data = `ST00012|Name=${bank.bankDetails.IP}|PersonalAcc=${bank.bankDetails.RS}|BankName=${bank.bankDetails.NameBank}|BIC=${bank.bankDetails.BIC}|CorrespAcc=${bank.bankDetails.CS}|Purpose=${purpose}|Sum=${summ * 100}|PayeeINN=${bank.bankDetails.INN}`

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
    bankDetails: bank.bankDetails,
    qrCode,
    uuid: paymentUuid,
    purpose,
  }
})
