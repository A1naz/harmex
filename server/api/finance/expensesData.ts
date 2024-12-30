import { paymenthistory } from '~/server/lib/models/Paymenthistory'
import historyType from './historyType'
import getMPLink from '~/server/utils/getExternalLink'
import getBuyoutLink from '~/server/utils/getBuyoutLink'

export default async function (user: any, itemsPerPage?: number, page?: number, skip?: number, dateRange?: any) {
  const limit = itemsPerPage ? itemsPerPage : 25
  const skipValue = skip ? skip : 25
  const res = await paymenthistory
    .find({ user: user._id, typeoperations: 'Расход', ...dateRange })
    .sort({ dataoperation: -1 })
    .skip(page ? (page - 1) * skipValue : 0)
    .limit(page ? limit : 100000)

  const format = res.map((el: any) => {
    return {
      summ: el.summ,
      date: el.dataoperation,
      source: el.mp,
      service: historyType(el.type),
      article: el.mp && el.article && (el.mp == 'ozon' || el.mp == 'wildberries') ? getMPLink(el.mp, el.article) + '||' + el.article : el.article ? el.article : '-',
      orderId: el.mp && el.basisoperation && el.basisoperation.includes('Выкуп #') && (el.mp == 'wildberries' || el.mp == 'ozon') ? getBuyoutLink(el.mp, el.basisoperation.replace('Выкуп #', '')) : el.basisoperation,
      comment: el.comment,
    }
  })

  return format
}
