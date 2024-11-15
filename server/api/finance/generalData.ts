import { paymenthistory } from '~/server/lib/models/Paymenthistory'
import historyType from './historyType'

export default async function(user: any, itemsPerPage?: number, page?: number) {
  const limit = itemsPerPage ? itemsPerPage : 25
  const res = await paymenthistory
    .find({ user: user._id })
    .sort({ dataoperation: -1 })
    .skip(page ? (page - 1) * limit : 0)
    .limit(page ? limit : 1000)

  const format = res.map((el: any) => {
    return {
      summ: el.summ ? el.summ : 0,
      date: el.dataoperation.toISOString().split('T')[0],
      source: el.mp ? el.mp : '-',
      service: historyType(el.type),
      article: el.article ? el.article : '-',
      orderId: el.basisoperation,
      comment: el.comment,
    }
  })
  

  return format
}
