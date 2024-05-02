import ExcelJS from 'exceljs'
import { paymenthistory } from '~~/server/lib/models/Paymenthistory'
import { DocuemntEnum } from '~/data/enums'

function getHistoryType(type: string) {
  let result = ''
  switch (type) {
    case 'buyouts':
      result = 'Выкуп'
      break
    case 'review':
      result = 'Отзыв'
      break
    case 'likeProduct':
      result = 'Лайк на продукт'
      break
    case 'likeReview':
      result = 'Лайк на отзывы'
      break
    case 'productlikes':
      result = 'Лайк на товар / бренд'
      break
    case 'cart':
      result = 'Добавление в корзину'
      break
    case 'questionProduct':
      result = 'Вопрос'
      break
    case 'deliveryStorage':
      result = 'Штраф'
      break
    case 'reviewRemoving':
      result = 'Удаление отзыва'
      break
  }
  return result
}
export default eventHandler(async (event) => {
  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)
  const { mp } = getQuery(event)

  const { exportDates } = await readBody(event)

  const startDate = new Date(exportDates[0])
  const endDate = new Date(exportDates[1])
  const history = await paymenthistory
    .find({
      mp: mp === 'all' ? { $ne: false } : mp,
      user,
      dataoperation: {
        $gt: startDate,
        $lt: endDate,
      },
    })
    .sort({ _id: -1 })

  console.log(history.length)

  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('История платежей', {
    headerFooter: { firstHeader: `Всего записей: ${history.length}` },
  })
  const mapped = history.map((item, index) => ({
    number: index + 1,
    summ: item.summ,
    typeoperations: item.typeoperations,
    type: getHistoryType(item.type || ''),
    article: item.article,
    basisoperation: item.basisoperation,
    dataoperation: item.dataoperation,
    comment: item.comment,
    mp: item.mp,
  }))
  sheet.columns = [
    { header: 'Номер', key: 'index', font: { bold: true } },
    { header: 'Сумма', key: 'summ', font: { bold: true } },
    {
      header: 'Тип операции',
      key: 'typeoperations',
      width: 16,
      font: { bold: true },
    },
    { header: 'МП', key: 'mp', width: 16, font: { bold: true } },
    { header: 'Услуга', key: 'type', width: 32, font: { bold: true } },
    { header: 'Артикул', key: 'article', width: 16, font: { bold: true } },
    {
      header: 'Основание операции',
      key: 'basisoperation',
      width: 32,
      font: { bold: true },
    },
    { header: 'Дата', key: 'dataoperation', width: 16, font: { bold: true } },
    { header: 'Комментарий', key: 'comment', width: 16, font: { bold: true } },
  ]
  sheet.addRows(mapped)
  const buffer = await workbook.xlsx.writeBuffer()

  await userLog(event, {
    documentType: DocuemntEnum.PaymentHistory,
    documentId: '',
    comment: 'Экспорт истории платежей',
  })

  return buffer
})
