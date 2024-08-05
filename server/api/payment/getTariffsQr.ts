import speakeasy from 'speakeasy'
import qrcode from 'qrcode'
import { v4 as uuid } from 'uuid'

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const { summ }: any = getQuery(event)

  const dates = new Date().toISOString().slice(0, 10).split('-')
  const purposeDate = `${dates[2]}.${dates[1]}.${dates[0]}`
  const paymentUuid = uuid()
  const purpose = `Оплата по счету ${paymentUuid} от ${purposeDate},  в пользу ИНН 5007123410, #32400. НДС не облагается`

  const data = `ST00012|Name=ООО "ФИНХАБ"|PersonalAcc=40702810701300038351|BankName=АО "АЛЬФА-БАНК"|BIC=044525593|CorrespAcc=30101810200000000593|Purpose=Оплата тарифа|Sum=${
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

  return {
    qrCode,
    uuid: paymentUuid,
    purpose,
  }
})
