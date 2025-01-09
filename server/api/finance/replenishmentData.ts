import { paymenthistory } from '~/server/lib/models/Paymenthistory'

export default async function (user: any, itemsPerPage?: number, page?: number, skip?: number, dateRange?: any, searchInput?: any) {
  const limit = itemsPerPage ? itemsPerPage : 25
  const skipValue = skip ? skip : 25
  const res = await paymenthistory
    .find({
      user: user._id, type: 'deposit', ...dateRange,
      _id: searchInput ? searchInput : { $exists: true },
    })
    .sort({ dataoperation: -1 })
    .skip(page ? (page - 1) * skipValue : 0)
    .limit(page ? limit : 100000)

  const format = res.map((el: any) => {
    return {
      summ: el.summ,
      date: el.dataoperation,
      source: 'Пополнение',
      service: 'Кошелек ',
      article: el.article,
      orderId: el._id,
      comment: el.comment,
    }
  })

  return format
}
