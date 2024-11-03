import { PartnerWithdraw } from '~/server/lib/models/PartnerWithdraw'

export default async function (page: number, user: any) {
  const res = await PartnerWithdraw.find({ user }).sort({ _id: -1 }).skip((page - 1) * 25).limit(25)

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
