import { PartnerWithdraw } from '~/server/lib/models/PartnerWithdraw'
import { DocuemntEnum } from '~/data/enums'

export default eventHandler(async (event) => {

  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const { amount } = await readBody(event)

    if (Number(amount) < 5000) {
      return {
        status: 'error',
        message: 'Минимальная сумма вывода - 5000 руб.',
      }
  }
  const balance = user.partner?.balance

  if (!balance || Number(amount) > balance) {
    return {
      status: 'error',
      message: 'Сумма вывода не должна быть больше доступного баланса',
    }
  }
  
  const withdraw = await PartnerWithdraw.create({
    userUuid: user.uuid,
    user,
    amount: Number(amount),
    status: 'created',
    type: 'account',
  })

  if (withdraw) {
    user.partner.balance -= Number(amount)
    const res: any = await user.save()

    await userLog(event,
        {
            documentType: DocuemntEnum.Partners,
            documentId: res._id,
            comment: 'вывод средств'
        })

    return { status: 'ok', document: withdraw, message: 'success' }
  }
  else { return { status: 'error', message: 'Не удалось создать вывод' } }
})
