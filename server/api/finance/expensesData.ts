import { paymenthistory } from '~/server/lib/models/Paymenthistory'
import historyType from './historyType'

export default async function (user: any, itemsPerPage?: number, page?: number, skip?: number) {
  const limit = itemsPerPage ? itemsPerPage : 25
  const skipValue = skip ? skip : 25
  const res = await paymenthistory
    .find({ user: user._id, typeoperations: 'Расход' })
    .sort({ dataoperation: -1 })
    .skip(page ? (page - 1) * skipValue : 0)
    .limit(page ? limit : 1000)

  const format = res.map((el: any) => {
    return {
      summ: el.summ,
      date: el.dataoperation,
      source: el.mp,
      service: historyType(el.type),
      article: el.article,
      orderId: el.basisoperation,
      comment: el.comment,
    }
  })

  return format
}
