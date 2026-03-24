import { paymenthistory } from '~/server/lib/models/Paymenthistory'
import historyType from '../historyType'
import getMPLink from '~/server/utils/getExternalLink'
import getBuyoutLink from '~/server/utils/getBuyoutLink'

export default async function (user: any, itemsPerPage?: number, page?: number, skip?: number, dateRange?: any, searchInput?: any) {

  const limit = itemsPerPage ? itemsPerPage : 25
  const skipValue = skip ? skip : 25
  const res = await paymenthistory
    .find({
      user: user._id, ...dateRange,
      $or: [
        { basisoperation: { $regex: searchInput, $options: 'i' } },
        { article: Number.isNaN(Number(searchInput)) ? 0 : Number(searchInput) },
      ]
    })
    .sort({ dataoperation: -1 })
    .skip(page ? (page - 1) * limit : 0)
    .limit(page ? limit : 100000)


  const format = await Promise.all(
    res.map(async (el: any) => {
      return {
        summ: el.summ ? el.summ : 0,
        date: el.dataoperation,
        source: el.mp ? el.mp : '-',
        service: historyType(el.type),
        article:
          el.article ?
            el.article :
            '-',
        orderId: el.basisoperation,
        comment: el.comment,
      }
    })
  )


  return format
}
