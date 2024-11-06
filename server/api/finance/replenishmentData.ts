import { paymenthistory } from '~/server/lib/models/Paymenthistory'

export default async function (page: number, user: any) {
  const res = await paymenthistory
    .find({ user: user._id, type: 'deposit' })
    .sort({ dataoperation: -1 })
    .skip((page - 1) * 25)
    .limit(25)

  const format = res.map((el: any) => {
    return {
      summ: el.summ,
      date: el.dataoperation.toISOString().split('T')[0],
      source: 'Баланс',
      service: el.type,
      article: el.article,
      orderId: el.basisoperation,
      comment: el.comment,
    }
  })

  return format
}
