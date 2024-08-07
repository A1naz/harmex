import speakeasy from 'speakeasy'
import qrcode from 'qrcode'
import { v4 as uuid } from 'uuid'
import { PaymentIntend } from '@/server/lib/models/PaymentIntend'

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const { summ }: any = getQuery(event)

  const dates = new Date().toISOString().slice(0, 10).split('-')
  const purposeDate = `${dates[2]}.${dates[1]}.${dates[0]}`
  const paymentUuid = uuid()
  const purpose = `Покупка тарифного плана для личного кабинета - "${user.username}", по агентскому договору "${user.uuid}" от ${purposeDate}г.`

  const data = `ST00012|Name=ООО "ФИНХАБ"|PersonalAcc=40702810701300038351|BankName=АО "АЛЬФА-БАНК"|BIC=044525593|CorrespAcc=30101810200000000593|Purpose=Покупка тарифного плана|Sum=${
    summ * 100
  }|PayeeINN=5007123410|KPP=500701001`

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
    summ,
    paymentUuid,
    type: 'balance',
    dataoperation: new Date(),
    comment: purpose,
  })

  return {
    qrCode,
    uuid: paymentUuid,
    purpose,
  }
})
