import speakeasy from 'speakeasy'
import qrcode from 'qrcode'

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const { summ }: any = getQuery(event)

  const data = `ST00012|Name=ООО "ФИНХАБ"|PersonalAcc=40702810701300038351|BankName=АО "АЛЬФА-БАНК"|BIC=044525593|CorrespAcc=30101810200000000593|Purpose=Пополнение баланса|Sum=${
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
  console.log(qrCode)

  return { qrCode }
})
