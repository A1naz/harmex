import { PartnerWithdraw } from '~/server/lib/models/PartnerWithdraw'

export default async function (user: any, itemsPerPage?: number, page?: number, skip?: number) {
  const limit = itemsPerPage ? itemsPerPage : 25
  const skipValue = skip ? skip : 25
  const res = await PartnerWithdraw.find({ user }).sort({ _id: -1 }).skip(page ? (page - 1) * skipValue : 0).limit(page ? limit : 1000)

  const format = res.map((el: any) => {
    return {
      summ: el.amount,
      date: el.date,
      source: el.type,
      service: 'Вывод с партнерки',
    }
  })

  return format
}
