import freekassa from '@/server/lib/freekassa'
import { DocuemntEnum } from '~/data/enums'

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const { fkSecret1, fkID } = useRuntimeConfig()
  const { amount } = await readBody(event)
  if (!amount) {
    throw createError({
      statusCode: 400,
      message: 'Укажите сумму платежа',
    })
  }
  const { signature, url } = freekassa(
    {
      m: fkID,
      oa: amount,
      o: user.username,
      currency: 'RUB',
    },
    fkSecret1
  )

  await userLog(event, {
    documentType: DocuemntEnum.Payment,
    documentId: '',
    comment: 'счет',
  })

  return {
    payUrl: url as string,
    status: 'ok',
  }
})
