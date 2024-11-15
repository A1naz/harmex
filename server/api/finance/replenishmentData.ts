import { paymenthistory } from '~/server/lib/models/Paymenthistory'

export default async function (user: any, itemsPerPage?: number, page?: number) {
  const limit = itemsPerPage ? itemsPerPage : 25
  const res = await paymenthistory
    .find({ user: user._id, type: 'deposit' })
    .sort({ dataoperation: -1 })
    .skip(page ? (page - 1) * limit : 0)
    .limit(page ? limit : 1000)

  const format = res.map((el: any) => {
    return {
      summ: el.summ,
      date: el.dataoperation.toISOString().split('T')[0],
      source: 'Пополнение',
      service: 'Кошелек ',
      article: el.article,
      orderId: el._id,
      comment: el.comment,
    }
  })

  return format
}
