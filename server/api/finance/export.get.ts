import ExcelJS from 'exceljs'
import { DocuemntEnum } from '~/data/enums'
import { Buyout } from '~/server/lib/models/ozon/Buyout'
import { Delivery } from '~/server/lib/models/ozon/Delivery'
import expensesData from './expensesData'
import generalData from './generalData'
import partnerData from './partnerData'
import replenishmentData from './replenishmentData'
import genealogyData from './genealogyData'

function formatNumber(value: number): string {
  return value.toLocaleString('ru-RU')
}

const tableColumns = {
  general: [
    { header: 'Сумма', key: 'summ', width: 16, font: { bold: true } },
    { header: 'Дата', key: 'date', width: 16, font: { bold: true } },
    { header: 'Источник', key: 'source', width: 16, font: { bold: true } },
    { header: 'Услуга', key: 'service', width: 16, font: { bold: true } },
    { header: 'Артикул', key: 'article', width: 16, font: { bold: true } },
    { header: 'ID заказа', key: 'orderId', width: 46, font: { bold: true } },
    { header: 'Комментарий', key: 'comment', width: 16, font: { bold: true } },
  ],
  replenishment: [
    { header: 'Сумма', key: 'summ', width: 16, font: { bold: true } },
    { header: 'Дата', key: 'date', width: 16, font: { bold: true } },
    { header: 'Источник', key: 'source', width: 16, font: { bold: true } },
    { header: 'Услуга', key: 'service', width: 16, font: { bold: true } },
    { header: 'ID заказа', key: 'orderId', width: 46, font: { bold: true } },
    { header: 'Комментарий', key: 'comment', width: 16, font: { bold: true } },
  ],
  expenses: [
    { header: 'Сумма', key: 'summ', width: 16, font: { bold: true } },
    { header: 'Дата', key: 'date', width: 16, font: { bold: true } },
    { header: 'Источник', key: 'source', width: 16, font: { bold: true } },
    { header: 'Услуга', key: 'service', width: 16, font: { bold: true } },
    { header: 'Артикул', key: 'article', width: 16, font: { bold: true } },
    { header: 'ID заказа', key: 'orderId', width: 46, font: { bold: true } },
    { header: 'Комментарий', key: 'comment', width: 16, font: { bold: true } },
  ],
  partner: [
    { header: 'Сумма', key: 'summ', width: 16, font: { bold: true } },
    { header: 'Дата', key: 'date', width: 16, font: { bold: true } },
    { header: 'Источник', key: 'source', width: 16, font: { bold: true } },
    { header: 'Услуга', key: 'service', width: 16, font: { bold: true } },
  ],
  genealogy: [
    { header: 'Сумма', key: 'summ', width: 16, font: { bold: true } },
    { header: 'Дата', key: 'date', width: 16, font: { bold: true } },
    { header: 'Дата выполнения', key: 'executionDate', width: 16, font: { bold: true } },
    { header: 'Источник', key: 'mp', width: 16, font: { bold: true } },
    { header: 'Артикул', key: 'article', width: 16, font: { bold: true } },
    { header: 'Услуга', key: 'service', width: 16, font: { bold: true } },
    { header: 'ID заказа', key: 'orderId', width: 46, font: { bold: true } },
    { header: 'Комментарий', key: 'comment', width: 16, font: { bold: true } },
    { header: 'Пользователь', key: 'username', width: 16, font: { bold: true } },
    { header: 'Комиссионные', key: 'commission', width: 16, font: { bold: true } },

  ],
}

async function fetchData(type: string, user: any, dateRange?: any) {

  switch (type) {
    case 'general':
      return await generalData(user, 100000, 0, 0, dateRange)
    case 'replenishment':
      return await replenishmentData(user, 100000, 0, 0, dateRange)
    case 'expenses':
      return await expensesData(user, 100000, 0, 0, dateRange)
    case 'partner':
      return await partnerData(user, 100000, 0, 0, dateRange)
    case 'genealogy':
      return await genealogyData(user, 100000, 0, 0)
    default:
      return []
  }
}

export default defineEventHandler(async (event) => {
  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const { tableType, page = 1, dateRange }: any = getQuery(event)

  let trueDateRange = {}
  if (dateRange) {
    trueDateRange = {
      $or: [
        {
          dataoperation: {
            $gte: new Date(JSON.parse(dateRange[0])).setHours(0, 0, 0, 0),
            $lt: new Date(JSON.parse(dateRange[1])).setHours(23, 59, 0, 0),
          },
        },
        {
          date: {
            $gte: new Date(JSON.parse(dateRange[0])).setHours(0, 0, 0, 0),
            $lt: new Date(JSON.parse(dateRange[1])).setHours(23, 59, 0, 0),
          },
        },
      ],
    };

  }

  try {
    const data: any[] = await fetchData(tableType, user, trueDateRange)
    const columns: any = tableColumns[tableType] || tableColumns.general

    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('Таблица', {
      headerFooter: { firstHeader: `Всего записей: ${data.length}` },
    })

    sheet.columns = columns
    sheet.addRows(data)

    const buffer = await workbook.xlsx.writeBuffer()

    return buffer
  } catch (e) {
    throw createError({
      statusCode: 500,
      message: 'Не удалось создать таблицу',
    })
  }
})
