import { PartnerWithdraw } from '~/server/lib/models/PartnerWithdraw'

export default async function (user: any, page?: number) {
  const res = await PartnerWithdraw.find({ user }).sort({ _id: -1 }).skip(page ? (page - 1) * 25 : 0).limit(page ? 25 : 1000)

  const format = res.map((el: any) => {
    return {
      summ: el.amount,
      date: el.date.toISOString().split('T')[0],
      source: el.type,
      service: 'Вывод с партнерки',
    }
  })

  return format
}
