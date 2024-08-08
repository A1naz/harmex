import speakeasy from 'speakeasy'
import qrcode from 'qrcode'
import { PaymentIntend } from '@/server/lib/models/PaymentIntend'

import { v4 as uuid } from 'uuid'

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const { summ, faceType }: any = getQuery(event)

  const dates = new Date().toISOString().slice(0, 10).split('-')
  const purposeDate = `${dates[2]}.${dates[1]}.${dates[0]}`
  const paymentUuid = uuid()
  const purpose = `Пополнение баланса личного кабинета - "${user.username}", по агентскому договору "${user.uuid}" от ${purposeDate}г.`

  const data = `ST00012|Name=ИП Новиков Андрей Валерьевич|PersonalAcc=40802810401300014591|BankName=АО "АЛЬФА-БАНК"|BIC=044525593|CorrespAcc=30101810200000000593|Purpose=${purpose}|Sum=${
    summ * 100
  }|PayeeINN=713602742755`

  const qrCode = await new Promise((resolve, reject) => {
    qrcode.toDataURL(data, (err: any, data: any) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })

  await PaymentIntend.create({
    user: user._id,
    summ: Number(summ),
    paymentUuid,
    type: 'balance',
    dataoperation: new Date(),
    comment: purpose,
    faceType,
  })

  return {
    qrCode,
    uuid: paymentUuid,
    purpose,
  }
})
