import { paymenthistory } from '~/server/lib/models/Paymenthistory'
import { ObjectId } from 'mongodb'
import { BankInfo } from "~/server/lib/models/BankInfo"

export default async function (user: any, itemsPerPage?: number, page?: number, skip?: number, dateRange?: any, searchInput?: any) {
  const limit = itemsPerPage ? itemsPerPage : 25
  const skipValue = skip ? skip : 25

  const foundIP: any = searchInput ? await BankInfo.find({
    portal: true,
    "bankDetails.IP": { $regex: searchInput, $options: 'i' }
  }) : []

  const res = await paymenthistory
    .find({
      user: user._id,
      type: 'deposit',
      ...dateRange,
      $or: [
        // Проверяем, является ли searchInput допустимым ObjectId
        ObjectId.isValid(searchInput) ?
          { _id: searchInput } :
          // Если searchInput пустой, включаем все записи
          (searchInput ?
            { nameOrganization: foundIP ? { $in: foundIP.map((el: any) => el.nameOrganization) } : { $exists: true } } :
            { $or: [{ nameOrganization: { $exists: true } }, { nameOrganization: { $exists: false } }] }
          ),
      ],
    })
    .sort({ dataoperation: -1 })
    .skip(page ? (page - 1) * skipValue : 0)
    .limit(page ? limit : 100000);


  const format = res.map((el: any) => {

    return {
      summ: el.summ,
      commission: el.nds ? el.nds.toString() : " - ",
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
