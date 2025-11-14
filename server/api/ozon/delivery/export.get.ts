import { Buyoutlog } from '~~/server/lib/models/wildberries/Buyoutlog'
import ExcelJS from 'exceljs'
import { DocuemntEnum } from '~/data/enums'
import { Buyout } from '~/server/lib/models/ozon/Buyout'
import { Delivery } from '~/server/lib/models/ozon/Delivery'

const keys = Object.keys as <T>(obj: T) =>
(keyof T extends infer U ? U extends string ? U : U extends number ? `${U}` : never : never)[]

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user)
      return sendRedirect(event, '/auth', 302)

    const { dateRange }: any = getQuery(event)

    let trueDateRange = {}
    if (dateRange) {
      trueDateRange = {
        updatedAt: {
          $gte: new Date(JSON.parse(dateRange[0])).setHours(0, 0, 0, 0),
          $lt: new Date(JSON.parse(dateRange[1])).setHours(23, 59, 0, 0),
        },
      }
    }

    const runtimeConfig = useRuntimeConfig()
    const deliveries = await Delivery.find({ user, ...trueDateRange }).sort({ _id: -1 })

    if (!deliveries.length) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Нет доставок для экспорта',
      })
    }
    const buyoutsId = deliveries.map(item => item.idbuyout)
    const buyouts = await Buyout.find({ _id: { $in: buyoutsId } })
    const logs = await Buyoutlog.find({ _id: { $in: buyoutsId } })

    const format = await Promise.all(
      deliveries.map(async (delivery, index) => {
        const buyout = buyouts.find(buyout => buyout._id.valueOf() === delivery.idbuyout.valueOf())
        if (!buyout)
          return undefined

        const phone = delivery.recipientphone
        const replaced = `+${phone[0]} (***) *** ${phone.slice(7)}`
        const currentstatus = delivery.statusdelivery?.length ? delivery.statusdelivery[delivery.statusdelivery.length - 1].status : 'Неизвестно'

        const statusDelivery = delivery.statusdelivery

        const arrivedDate = statusDelivery.find(item => item.status.includes('Ожидает получения до'))
        const receivedDate = statusDelivery.find(item => item.status === 'Получен')

        const foundLog = logs.find(
          item =>
            item.buyout.valueOf() === buyout._id.valueOf()
            && item.text.includes('Выкуп выполнен'),
        )
        const finishDate = new Date(foundLog ? foundLog.date : buyout.createdAt)
        const place = index + 1
        const finishDateHours = finishDate.getHours()
        const finishDateMinutes = finishDate.getMinutes()
        const finishTime = `${finishDateHours
          .toString()
          .padStart(2, '0')}:${finishDateMinutes.toString().padStart(2, '0')}`
        const deliveryCreatedAt = new Date(delivery.date)
        const deliveryCreatedAtHours = deliveryCreatedAt.getHours()
        const deliveryCreatedAtMinutes = deliveryCreatedAt.getMinutes()
        const deliveryCreatedAtTime = `${deliveryCreatedAtHours
          .toString()
          .padStart(2, '0')}:${deliveryCreatedAtMinutes.toString().padStart(2, '0')}`

        return {
          receiptcodeqr: delivery.receiptcodeqr
            ? delivery.receiptcodeqr
            : undefined,
          receiptcode: delivery.receiptcode ? delivery.receiptcode : '',
          currentstatus,
          article: delivery.article,
          size: buyout.sizeparam == '0' ? 'Нет' : buyout.sizeparam,
          productname: buyout.product.name,
          finishDate,
          finishTime,
          deliveryCreatedAt,
          deliveryCreatedAtTime,
          uuid: `#${buyout.uuid}`,
          seachquery: buyout.searchQuery,
          point: delivery.point,
          recipient: delivery.recipient,
          recipientphone: replaced,
          pricebuy: delivery.pricebuy,
          arrivedDate: arrivedDate ? new Date(arrivedDate.date) : '-',
          receivedDate: receivedDate ? new Date(receivedDate.date) : '-',
          place: index + 1,
          fio: buyout.FIO,
        }
      }),
    )

    const workbook = new ExcelJS.Workbook()
    const ready = format.filter(item => item)
    const sheet = workbook.addWorksheet('Общая таблица', {
      headerFooter: { firstHeader: `Всего доставок: ${ready.length}` },
    })

    sheet.columns = [
      { header: 'Штрих-код', key: 'receiptcode', width: 48, font: { bold: true } },
      { header: 'Артикул', key: 'article', width: 16, font: { bold: true } },
      { header: 'Размер', key: 'size', width: 16, font: { bold: true } },
      { header: 'Название товара', key: 'productname', width: 48, font: { bold: true } },
      {
        header: 'Дата заказа(UTC+00)',
        key: 'finishDate',
        width: 16,
        font: { bold: true },
      },
      {
        header: 'Время заказа(UTC+00)',
        key: 'finishTime',
        width: 16,
        font: { bold: true },
      },
      {
        header: 'Дата последнего обновления(UTC+00)',
        key: 'deliveryCreatedAt',
        width: 16,
        font: { bold: true },
      },
      {
        header: 'Время выкупа(UTC+00)',
        key: 'deliveryCreatedAtTime',
        width: 16,
        font: { bold: true },
      },
      {
        header: 'Дата прибытия(UTC+00)',
        key: 'arrivedDate',
        width: 16,
        font: { bold: true },
      },
      {
        header: 'Дата забора(UTC+00)',
        key: 'receivedDate',
        width: 16,
        font: { bold: true },
      },
      { header: 'Статус', key: 'currentstatus', width: 24, font: { bold: true } },
      { header: 'Сумма заказа', key: 'pricebuy', width: 16, font: { bold: true } },
      { header: 'ID заказа', key: 'uuid', width: 40, font: { bold: true } },
      { header: 'Поисковый запрос', key: 'seachquery', width: 32, font: { bold: true } },
      { header: 'Адрес', key: 'point', width: 64, font: { bold: true } },
      { header: 'Имя', key: 'recipient', width: 16, font: { bold: true } },
      { header: 'Телефон', key: 'recipientphone', width: 16, font: { bold: true } },
      { header: 'Код выдачи', key: 'receiptcode', width: 16, font: { bold: true } },
      { header: 'ФИО', key: 'fio', width: 32, font: { bold: true } },
    ]
    sheet.addRows(ready)

    for (const item of ready) {
      if (
        !item?.receiptcodeqr
        || item?.receiptcodeqr?.length < 40
        || item?.receiptcodeqr === 'undefined'
      ) {
        continue
      }

      if (
        item.receiptcodeqr.includes(
          'data:image/png;base64,data:image/png;base64,',
        )
      ) {
        item.receiptcodeqr = item.receiptcodeqr.replace(
          'data:image/png;base64,',
          '',
        )
      }

      const image = workbook.addImage({
        base64: item?.receiptcodeqr,
        extension: 'png',
      })
      sheet.addImage(image, {
        tl: { col: 0.3, row: item!.place + 0.8 },
        ext: { width: 280, height: 78 },
      })
      sheet.getRow(item!.place + 1).height = 100
    }

    const idCol = sheet.getColumn('uuid')

    idCol.eachCell((cell, rowNumber) => {
      cell.value = {
        text: cell.value!.toString(),
        hyperlink: `${runtimeConfig.PUBLIC_SITE_URL}/buyouts?uuid=${cell.value?.toString()}`,
      }
    })
    // export table
    const buffer = await workbook.xlsx.writeBuffer()

    // await userLog(event,
    //     {
    //         documentType: DocuemntEnum.Delivery,
    //         documentId: '',
    //         comment: 'Экспорт всех доставок XLS'
    //     })

    return buffer
  
})
